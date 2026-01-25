
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Application, Container, Graphics, Sprite, Texture, Circle } from 'pixi.js';
import { CRTFilter, RGBSplitFilter, BloomFilter, AdjustmentFilter } from 'pixi-filters';
import { useGameStore } from '../store/gameStore';
import { DroneType } from '../types'; // [DEV_CONTEXT: HARDENING]
import { tunnelAtmosphere } from '../services/systems/TunnelAtmosphere'; // [DEV_CONTEXT: ATMOSPHERE]

// [DEV_CONTEXT: PATTERN] Persistent Singleton for PixiJS v8
let globalApp: Application | null = null;
let initPromise: Promise<Application | null> | null = null;
let activeComponentsCount = 0;

// Global refs to access Pixi objects from imperative handle
let globalTextures: { debris: Texture; spark: Texture; smoke: Texture; dust: Texture } | null = null;
let globalParticleLayer: Container | null = null;
const globalParticles: Particle[] = [];
let globalDroneTextures: Map<string, Texture> | null = null;
let globalObjectTextures: Map<string, Texture> | null = null;

// Global refs for filters to ensure reactivity and persistency
let globalCRTFilter: CRTFilter | null = null;
let globalRGBSplitFilter: RGBSplitFilter | null = null;
let globalBloomFilter: BloomFilter | null = null;
let globalAdjustmentFilter: AdjustmentFilter | null = null;

// [DEV_CONTEXT: OPTIMIZATION] Removed globalPropsRef. The ticker now accesses the store directly.

export interface PixiOverlayHandle {
    emitParticle: (x: number, y: number, color: string, type: 'DEBRIS' | 'SPARK' | 'SMOKE', count: number) => void;
}

interface PixiOverlayProps {
    // Callbacks remain as they are functional and stable
    onObjectClick: (id: string, x: number, y: number) => void;
    onDrillClick: () => void;
    visualEffect?: string;
}

interface Particle {
    sprite: Sprite;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    type: 'DEBRIS' | 'SPARK' | 'SMOKE';
}

interface DustParticle {
    sprite: Sprite;
    x: number;
    y: number;
    z: number;
    speed: number;
}

// [DEV_CONTEXT: GRAPHICS] Centralized quality application function
function applyQualitySettings(app: Application, quality: 'low' | 'medium' | 'high') {
    if (!app || !app.stage) return;

    const isMobile = window.innerWidth < 768;
    console.log(`[PixiOverlay] FORCE APPLY QUALITY: ${quality} (isMobile: ${isMobile})`);

    // Sync Atmosphere
    tunnelAtmosphere.setQuality(quality);

    if (quality === 'low') {
        app.stage.filters = [];
    } else if (quality === 'medium') {
        // Apply basic filters on desktop only
        const suite = [];
        if (!isMobile) {
            if (globalRGBSplitFilter) suite.push(globalRGBSplitFilter);
            if (globalCRTFilter) suite.push(globalCRTFilter);
        }
        app.stage.filters = suite as any;
    } else {
        // HIGH - Full effect suite, ignore mobile restriction
        const suite = [];
        if (globalAdjustmentFilter) suite.push(globalAdjustmentFilter);
        if (globalRGBSplitFilter) suite.push(globalRGBSplitFilter);
        if (globalCRTFilter) suite.push(globalCRTFilter);
        if (globalBloomFilter) suite.push(globalBloomFilter);
        app.stage.filters = suite as any;
    }
}

const PixiOverlay = forwardRef<PixiOverlayHandle, PixiOverlayProps>(({ onObjectClick, onDrillClick, visualEffect }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Ref to hold stable callbacks and props for the ticker
    const propsRef = useRef({ onObjectClick, onDrillClick, visualEffect });
    useEffect(() => {
        propsRef.current = { onObjectClick, onDrillClick, visualEffect };
    }, [onObjectClick, onDrillClick, visualEffect]);

    useEffect(() => {
        let isMounted = true;

        const initPixi = async () => {
            activeComponentsCount++;

            if (!globalApp) {
                if (!initPromise) {
                    initPromise = (async () => {
                        const app = new Application();
                        try {
                            await app.init({
                                // [DEV_CONTEXT: STABILITY] Removed resizeTo: window to prevent race conditions during init
                                backgroundAlpha: 0,
                                antialias: false,
                                resolution: Math.min(window.devicePixelRatio || 1, 2),
                                autoDensity: true,
                                preference: 'webgl',
                            });
                        } catch (e) {
                            console.warn("Pixi Init Warning:", e);
                            return null;
                        }

                        if (!app.ticker || !app.stage) return null;

                        // [DEV_CONTEXT: FIX] Instantiate Layers & Graphics INSIDE init to bind to active Context
                        const objectLayer = new Container();
                        const droneLayer = new Container();
                        const particleLayer = new Container();
                        const dustLayer = new Container();

                        const droneGraphicsMap = new Map<number, Sprite>();
                        const objectGraphicsMap = new Map<string, Sprite>();
                        const dustParticles: DustParticle[] = [];

                        // Expose particle layer to global scope for Imperative Handle
                        globalParticleLayer = particleLayer;

                        // [DEV_CONTEXT: FILTERS] Using pixi-filters library - Global Singletons
                        if (!globalCRTFilter) {
                            globalCRTFilter = new CRTFilter({
                                curvature: 1,
                                lineWidth: 1,
                                lineContrast: 0.3,
                                noise: 0.1
                            });
                        }

                        if (!globalRGBSplitFilter) {
                            globalRGBSplitFilter = new RGBSplitFilter({
                                red: { x: 0, y: 0 },
                                green: { x: 0, y: 0 },
                                blue: { x: 0, y: 0 }
                            });
                        }

                        if (!globalBloomFilter) {
                            globalBloomFilter = new BloomFilter({
                                strength: 3.0,
                                quality: 5,
                                kernelSize: 15
                            });
                        }

                        if (!globalAdjustmentFilter) {
                            globalAdjustmentFilter = new AdjustmentFilter({
                                gamma: 1.3,
                                contrast: 1.3,
                                saturation: 2.0,
                                brightness: 1.2
                            });
                        }

                        // [DEV_CONTEXT: GRAPHICS] Initial quality setup
                        const initialQuality = useGameStore.getState().settings.graphicsQuality || 'high';
                        tunnelAtmosphere.setQuality(initialQuality);

                        tunnelAtmosphere.init(app.stage, {
                            screenWidth: app.screen.width,
                            screenHeight: app.screen.height
                        });

                        app.stage.addChild(dustLayer);
                        app.stage.addChild(objectLayer);
                        app.stage.addChild(droneLayer);
                        app.stage.addChild(particleLayer);

                        const generateTexture = (draw: (ctx: CanvasRenderingContext2D) => void, w: number, h: number) => {
                            const canvas = document.createElement('canvas');
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            if (ctx) draw(ctx);
                            return Texture.from(canvas);
                        };

                        globalTextures = {
                            debris: generateTexture(c => { c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4); }, 4, 4),
                            spark: generateTexture(c => { c.fillStyle = '#fff'; c.beginPath(); c.arc(2, 2, 2, 0, Math.PI * 2); c.fill(); }, 4, 4),
                            smoke: generateTexture(c => { c.fillStyle = '#888'; c.fillRect(0, 0, 8, 8); }, 8, 8),
                            dust: generateTexture(c => {
                                const grd = c.createRadialGradient(2, 2, 0, 2, 2, 2);
                                grd.addColorStop(0, 'rgba(255,255,255,0.8)');
                                grd.addColorStop(1, 'rgba(255,255,255,0)');
                                c.fillStyle = grd;
                                c.fillRect(0, 0, 4, 4);
                            }, 4, 4),
                        };

                        // [OPTIMIZATION] Pre-generate textures for drones to avoid Graphics.clear() every frame
                        const generateDroneTextures = () => {
                            const textures = new Map<string, Texture>();
                            const droneTypes = [DroneType.COLLECTOR, DroneType.COOLER, DroneType.BATTLE, DroneType.REPAIR, DroneType.MINER];

                            droneTypes.forEach(type => {
                                const size = 16;
                                const tex = generateTexture(ctx => {
                                    const centerX = size;
                                    const centerY = size;
                                    const s = 10;
                                    ctx.strokeStyle = '#ffffff';
                                    ctx.lineWidth = 2;

                                    if (type === DroneType.COLLECTOR) {
                                        ctx.strokeRect(centerX - s / 2, centerY - s / 2, s, s);
                                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                                        ctx.fillRect(centerX - s / 4, centerY - s / 4, s / 2, s / 2);
                                    } else if (type === DroneType.COOLER) {
                                        ctx.beginPath();
                                        ctx.arc(centerX, centerY, s / 3, 0, Math.PI * 2);
                                        ctx.stroke();
                                        ctx.fillStyle = '#00ffff';
                                        ctx.fill();
                                    } else if (type === DroneType.BATTLE) {
                                        ctx.beginPath();
                                        ctx.moveTo(centerX, centerY - s / 2);
                                        ctx.lineTo(centerX + s / 2, centerY + s / 2);
                                        ctx.lineTo(centerX - s / 2, centerY + s / 2);
                                        ctx.closePath();
                                        ctx.stroke();
                                        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                                        ctx.fill();
                                    } else if (type === DroneType.REPAIR) {
                                        ctx.fillStyle = '#FFD700';
                                        ctx.fillRect(centerX - 2, centerY - s / 2, 4, s);
                                        ctx.fillRect(centerX - s / 2, centerY - 2, s, 4);
                                    } else if (type === DroneType.MINER) {
                                        ctx.beginPath();
                                        ctx.moveTo(centerX - s / 3, centerY - s / 2);
                                        ctx.lineTo(centerX + s / 3, centerY - s / 2);
                                        ctx.lineTo(centerX, centerY + s / 2);
                                        ctx.closePath();
                                        ctx.fillStyle = '#FF00FF';
                                        ctx.fill();
                                    }
                                }, size * 2, size * 2);
                                textures.set(type, tex);
                            });
                            return textures;
                        };

                        const generateObjectTextures = () => {
                            const textures = new Map<string, Texture>();
                            const types = ['GEODE_SMALL', 'GEODE_LARGE', 'SCRAP'];

                            types.forEach(type => {
                                const size = 32;
                                const tex = generateTexture(ctx => {
                                    const cx = size;
                                    const cy = size;
                                    if (type === 'GEODE_SMALL') {
                                        ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
                                        ctx.strokeStyle = '#00ffaa';
                                        ctx.lineWidth = 2;
                                        ctx.beginPath();
                                        for (let i = 0; i < 8; i++) {
                                            const a = i * Math.PI / 4;
                                            const r = i % 2 === 0 ? 12 : 8;
                                            ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
                                        }
                                        ctx.closePath();
                                        ctx.fill(); ctx.stroke();
                                    } else if (type === 'GEODE_LARGE') {
                                        ctx.fillStyle = 'rgba(170, 68, 255, 0.4)';
                                        ctx.strokeStyle = '#cc66ff';
                                        ctx.lineWidth = 2;
                                        ctx.strokeRect(cx - 12, cy - 12, 24, 24);
                                        ctx.fillRect(cx - 10, cy - 10, 20, 20);
                                    } else {
                                        ctx.fillStyle = 'rgba(255, 136, 0, 0.4)';
                                        ctx.fillRect(cx - 10, cy - 4, 20, 8);
                                        ctx.fillRect(cx - 4, cy - 10, 8, 20);
                                    }
                                }, size * 2, size * 2);
                                textures.set(type, tex);
                            });
                            return textures;
                        };

                        globalDroneTextures = generateDroneTextures();
                        globalObjectTextures = generateObjectTextures();

                        for (let i = 0; i < 60; i++) {
                            const sprite = new Sprite(globalTextures.dust);
                            sprite.anchor.set(0.5);
                            sprite.alpha = Math.random() * 0.5 + 0.1;
                            dustLayer.addChild(sprite);
                            dustParticles.push({
                                sprite,
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                z: Math.random() * 0.8 + 0.2,
                                speed: Math.random() * 2 + 1
                            });
                        }

                        app.ticker.add((ticker) => {
                            // [DEV_CONTEXT: SAFETY] Check if app or components are still active
                            // Fix: Use renderer check separately to avoid TS errors
                            const isRenderDestroyed = app.renderer ? (app.renderer as any).destroyed : false;
                            if (activeComponentsCount <= 0 || !app.screen || isRenderDestroyed) return;

                            try {
                                const dt = ticker.deltaTime;
                                const time = performance.now() / 1000;

                                const screenW = app.screen.width;
                                const screenH = app.screen.height;
                                const cx = screenW / 2;
                                const cy = screenH * 0.35;

                                const state = useGameStore.getState();
                                const { activeDrones, droneLevels, flyingObjects, heat, integrity, depth, settings } = state;
                                const quality = settings?.graphicsQuality || 'high';

                                // [OPTIMIZATION] Early exit if nothing rendering-intensive is active
                                const hasParticles = globalParticles.length > 0;
                                const hasDrones = activeDrones.length > 0;
                                const hasObjects = flyingObjects.length > 0;

                                // [DEV_CONTEXT: GRAPHICS] Update particles per frame budget
                                const frameMaxParticles = quality === 'low' ? 50 : (quality === 'medium' ? 150 : 300);
                                if (globalParticles.length > frameMaxParticles) {
                                    const removed = globalParticles.splice(0, globalParticles.length - frameMaxParticles);
                                    removed.forEach(p => p.sprite.destroy());
                                }
                                if (!hasParticles && !hasDrones && !hasObjects && !tunnelAtmosphere.hasActiveHazard()) {
                                    // We can skip most of the logic if nothing is happening, but we still update dust for ambiance
                                }

                                const isDrillingActive = hasParticles;
                                const atmosphereShake = tunnelAtmosphere.update(dt, depth, isDrillingActive);
                                if (app.stage) {
                                    app.stage.x = atmosphereShake.shakeX;
                                    app.stage.y = atmosphereShake.shakeY;
                                }

                                const heatRatio = heat / 100;
                                const glitchIntensity = Math.max(0, (heatRatio - 0.6) * 2.5);

                                // FORCE VISUAL EFFECTS
                                const currentEffect = propsRef.current.visualEffect;
                                if ((currentEffect === 'GLITCH_RED' || currentEffect === 'RAID_ALARM') && globalCRTFilter) {
                                    globalCRTFilter.vignetting = 0.6;
                                    globalCRTFilter.vignettingAlpha = 0.8;
                                }

                                if (glitchIntensity > 0 && globalRGBSplitFilter) {
                                    const offset = glitchIntensity * (quality === 'high' ? 8 : 5);
                                    globalRGBSplitFilter.red = { x: offset * Math.sin(time * 20), y: 0 };
                                    globalRGBSplitFilter.blue = { x: -offset * Math.cos(time * 15), y: 0 };

                                    if (currentEffect === 'GLITCH_RED') {
                                        globalRGBSplitFilter.red = { x: 15 * (quality === 'high' ? 1.5 : 1), y: 0 };
                                    }
                                } else if (globalRGBSplitFilter) {
                                    // High quality ALWAYS has tiny chromatic aberration for "analog" feel
                                    if (quality === 'high') {
                                        globalRGBSplitFilter.red = { x: 1.5 * Math.sin(time * 2), y: 0 };
                                        globalRGBSplitFilter.blue = { x: -1.5 * Math.cos(time * 1.5), y: 0 };
                                    } else {
                                        globalRGBSplitFilter.red = { x: 0, y: 0 };
                                        globalRGBSplitFilter.blue = { x: 0, y: 0 };
                                    }
                                }

                                if (globalCRTFilter) {
                                    if (quality === 'low') {
                                        globalCRTFilter.vignetting = 0;
                                        globalCRTFilter.noise = 0;
                                    } else {
                                        const damageRatio = (100 - integrity) / 100;
                                        globalCRTFilter.noise = (quality === 'high' ? 0.15 : 0.05) + (damageRatio * 0.4);
                                        globalCRTFilter.curvature = (quality === 'high' ? 1.2 : 1.0) + (damageRatio > 0.8 ? Math.sin(time * 10) * 0.5 : 0);
                                        globalCRTFilter.vignetting = quality === 'high' ? 0.3 : 0.1;
                                        globalCRTFilter.time = time;
                                    }
                                }

                                const warpSpeed = isDrillingActive ? 25 : 1;

                                dustParticles.forEach(p => {
                                    p.y -= p.speed * p.z * warpSpeed * dt;
                                    if (p.y < -10) {
                                        p.y = screenH + 10;
                                        p.x = Math.random() * screenW;
                                    }
                                    p.sprite.x = p.x;
                                    p.sprite.y = p.y;
                                    const targetScaleY = 1 + (warpSpeed - 1) * 0.2 * p.z;
                                    p.sprite.scale.y += (targetScaleY - p.sprite.scale.y) * 0.1;
                                    p.sprite.scale.x = Math.max(0.4, 1 - (targetScaleY - 1) * 0.15);
                                    p.sprite.alpha = p.z * 0.5;
                                });

                                for (let i = globalParticles.length - 1; i >= 0; i--) {
                                    const p = globalParticles[i];
                                    if (p.sprite.destroyed) { globalParticles.splice(i, 1); continue; }
                                    p.life -= dt;
                                    p.sprite.x += p.vx * dt;
                                    p.sprite.y += p.vy * dt;
                                    if (p.type === 'DEBRIS') {
                                        p.vy += 0.2 * dt; // Gravity (downwards)
                                        p.sprite.rotation += 0.1 * dt;
                                    }
                                    else if (p.type === 'SMOKE') {
                                        p.sprite.alpha = (p.life / p.maxLife) * 0.5;
                                        p.sprite.scale.x += 0.01 * dt;
                                        p.sprite.scale.y += 0.01 * dt;
                                    }
                                    else { p.sprite.alpha = p.life / p.maxLife; }
                                    if (p.life <= 0) { p.sprite.destroy(); globalParticles.splice(i, 1); }
                                }

                                activeDrones.forEach((type, i) => {
                                    let sprite = droneGraphicsMap.get(i);
                                    if (!sprite || sprite.destroyed) {
                                        const tex = globalDroneTextures?.get(type) || globalTextures?.debris;
                                        sprite = new Sprite(tex);
                                        sprite.anchor.set(0.5);
                                        droneLayer.addChild(sprite);
                                        droneGraphicsMap.set(i, sprite);
                                    }

                                    const level = droneLevels[type] || 1;
                                    const scale = 1 + (level * 0.1);
                                    const radius = 90 + i * 35;
                                    const speed = (1 + (i % 3) * 0.3) * (i % 2 === 0 ? 1 : -1);
                                    const angle = time * speed + (i * 1.5);

                                    sprite.x = cx + Math.cos(angle) * radius;
                                    sprite.y = cy + Math.sin(angle) * (radius * 0.3);
                                    sprite.scale.set(scale);

                                    // Pulse effect for variety
                                    const pulse = 1 + Math.sin(time * 3 + i) * 0.05;
                                    sprite.scale.set(scale * pulse);
                                });

                                const currentIds = new Set(flyingObjects.map(o => o.id));
                                objectGraphicsMap.forEach((g, id) => {
                                    if (!currentIds.has(id)) { g.destroy(); objectGraphicsMap.delete(id); }
                                });

                                flyingObjects.forEach(obj => {
                                    let sprite = objectGraphicsMap.get(obj.id);
                                    if (!sprite || sprite.destroyed) {
                                        const texType = obj.type === 'GEODE_SMALL' ? 'GEODE_SMALL' : (obj.type === 'GEODE_LARGE' ? 'GEODE_LARGE' : 'SCRAP');
                                        const tex = globalObjectTextures?.get(texType) || globalTextures?.debris;
                                        sprite = new Sprite(tex);
                                        sprite.anchor.set(0.5);
                                        sprite.eventMode = 'static';
                                        sprite.cursor = 'pointer';
                                        sprite.on('pointerdown', (e) => {
                                            e.stopPropagation();
                                            propsRef.current.onObjectClick(obj.id, e.global.x, e.global.y);
                                        });
                                        objectLayer.addChild(sprite);
                                        objectGraphicsMap.set(obj.id, sprite);
                                    }

                                    const pulse = 1 + Math.sin(time * 5) * 0.15;
                                    let rarityScale = 1;
                                    if (obj.rarity === 'RARE') rarityScale = 1.2;
                                    else if (obj.rarity === 'EPIC') rarityScale = 1.5;

                                    sprite.x = (obj.x / 100) * screenW;
                                    sprite.y = (obj.y / 100) * screenH;
                                    sprite.scale.set(rarityScale * pulse);
                                    sprite.rotation = time * 0.5;
                                    sprite.alpha = 0.4 + (obj.hp / obj.maxHp) * 0.6;
                                });
                            } catch (error) {
                                console.error("Pixi Ticker Error:", error);
                            }
                        });

                        globalApp = app;

                        // [DEV_CONTEXT: GRAPHICS] Force initial settings application
                        applyQualitySettings(app, initialQuality);

                        return app;
                    })();
                }
                await initPromise;
            }

            // [DEV_CONTEXT: STABILITY] Safety check before DOM manipulation
            if (!isMounted) {
                activeComponentsCount--;
                return;
            }

            if (containerRef.current && globalApp && globalApp.canvas) {
                try {
                    while (containerRef.current.firstChild) {
                        containerRef.current.removeChild(containerRef.current.firstChild);
                    }
                    containerRef.current.appendChild(globalApp.canvas);

                    // Explicit resize instead of auto-resize to window to avoid race conditions
                    globalApp.renderer.resize(window.innerWidth, window.innerHeight);
                    tunnelAtmosphere.resize(globalApp.screen.width, globalApp.screen.height);
                } catch (e) {
                    console.error("Pixi Setup Error:", e);
                }
            }

            const isAppActive = globalApp && globalApp.renderer && !(globalApp.renderer as any).destroyed;
            if (activeComponentsCount > 0 && isAppActive) {
                globalApp!.ticker.start();
            }
        };

        initPixi();

        return () => {
            isMounted = false;
            activeComponentsCount--;
            const isAppActive = globalApp && globalApp.renderer && !(globalApp.renderer as any).destroyed;
            if (activeComponentsCount <= 0 && isAppActive) {
                globalApp!.ticker.stop();
            }
        };
    }, []);

    // [DEV_CONTEXT: REACTIVITY] New Effect to handle graphics quality changes
    const graphicsQuality = useGameStore(state => state.settings.graphicsQuality);
    useEffect(() => {
        if (globalApp) {
            applyQualitySettings(globalApp, graphicsQuality);
        }
    }, [graphicsQuality]);

    useImperativeHandle(ref, () => ({
        emitParticle: (x, y, colorStr, type, count) => {
            if (!globalApp || !globalTextures || !globalParticleLayer) return;
            const isMobile = window.innerWidth < 768;
            const quality = useGameStore.getState().settings.graphicsQuality || 'high';

            // [DEV_CONTEXT: GRAPHICS] Particle count scale
            let countMultiplier = quality === 'low' ? 0.2 : (quality === 'medium' ? 0.6 : 1.0);
            const actualCount = Math.max(1, Math.floor(count * countMultiplier * (isMobile ? 0.5 : 1.0)));

            let color = 0xffffff;
            if (colorStr.startsWith('#')) color = parseInt(colorStr.replace('#', ''), 16);

            const adjustedCount = Math.max(1, Math.floor(count * countMultiplier * (isMobile ? 0.5 : 1.0)));
            const maxParticles = quality === 'low' ? 100 : (quality === 'medium' ? 250 : 500);

            for (let i = 0; i < adjustedCount; i++) {
                let tex = globalTextures.debris;
                let life = 0, vx = 0, vy = 0;

                if (type === 'DEBRIS') {
                    const ang = (Math.random() - 0.5) * Math.PI;
                    const spd = Math.random() * 5 + 2;
                    vx = Math.sin(ang) * spd;
                    vy = -Math.abs(Math.cos(ang) * spd) - 2; // Fly UP
                    life = 40 + Math.random() * 20;
                } else if (type === 'SPARK') {
                    tex = globalTextures.spark;
                    const ang = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 8 + 4;
                    vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd;
                    life = 10 + Math.random() * 10;
                } else if (type === 'SMOKE') {
                    tex = globalTextures.smoke;
                    vx = (Math.random() - 0.5) * 1;
                    vy = -1 - Math.random(); // Drift UP
                    life = 50 + Math.random() * 30;
                }

                const sprite = new Sprite(tex);
                sprite.x = x; sprite.y = y; sprite.tint = color; sprite.anchor.set(0.5);
                if (type === 'SPARK') sprite.blendMode = 'add';
                globalParticleLayer.addChild(sprite);
                globalParticles.push({ sprite, vx, vy, life, maxLife: life, type });
            }

            if (globalParticles.length > maxParticles) {
                const removed = globalParticles.splice(0, globalParticles.length - maxParticles);
                removed.forEach(p => p.sprite.destroy());
            }
        }
    }));

    // Wrap in simple div, memoization handled by React.memo
    return <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-auto cursor-crosshair" />;
});

// [DEV_CONTEXT: PERFORMANCE] Memoize to prevent re-renders when parent state changes
export default React.memo(PixiOverlay);
