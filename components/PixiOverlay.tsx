
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Application, Container, Graphics, Sprite, Texture, Circle } from 'pixi.js';
import { CRTFilter, RGBSplitFilter } from 'pixi-filters';
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

                        const droneGraphicsMap = new Map<number, Graphics>();
                        const objectGraphicsMap = new Map<string, Graphics>();
                        const dustParticles: DustParticle[] = [];

                        // Expose particle layer to global scope for Imperative Handle
                        globalParticleLayer = particleLayer;

                        // [DEV_CONTEXT: FILTERS] Using pixi-filters library
                        const crtFilter = new CRTFilter({
                            curvature: 1,
                            lineWidth: 1,
                            lineContrast: 0.3,
                            noise: 0.1
                        });

                        const rgbSplitFilter = new RGBSplitFilter(
                            { x: 0, y: 0 },
                            { x: 0, y: 0 },
                            { x: 0, y: 0 }
                        );

                        app.stage.filters = [rgbSplitFilter, crtFilter];

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
                                const cy = screenH * 0.4;

                                const state = useGameStore.getState();
                                const { activeDrones, droneLevels, flyingObjects, heat, integrity, depth } = state;

                                // [OPTIMIZATION] Early exit if nothing rendering-intensive is active
                                const hasParticles = globalParticles.length > 0;
                                const hasDrones = activeDrones.length > 0;
                                const hasObjects = flyingObjects.length > 0;
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
                                let glitchIntensity = Math.max(0, (heatRatio - 0.6) * 2.5);

                                // FORCE VISUAL EFFECTS
                                const currentEffect = propsRef.current.visualEffect;
                                if (currentEffect === 'GLITCH_RED' || currentEffect === 'RAID_ALARM') {
                                    glitchIntensity = 0.8;
                                    crtFilter.vignetting = 0.6;
                                    crtFilter.vignettingAlpha = 0.8; // Red tint handled? No, CRT v5 maybe not.
                                    // Use RGB split for Red effect
                                }

                                if (glitchIntensity > 0) {
                                    const offset = glitchIntensity * 5;
                                    rgbSplitFilter.red = { x: offset * Math.sin(time * 20), y: 0 };
                                    rgbSplitFilter.blue = { x: -offset * Math.cos(time * 15), y: 0 };

                                    if (currentEffect === 'GLITCH_RED') {
                                        // Extra Red Shift
                                        rgbSplitFilter.red = { x: 10, y: 0 };
                                        rgbSplitFilter.green = { x: 0, y: 0 };
                                        rgbSplitFilter.blue = { x: 0, y: 0 };
                                    }
                                } else {
                                    rgbSplitFilter.red = { x: 0, y: 0 };
                                    rgbSplitFilter.blue = { x: 0, y: 0 };
                                }

                                const damageRatio = (100 - integrity) / 100;
                                crtFilter.noise = 0.1 + (damageRatio * 0.4);
                                crtFilter.curvature = 1 + (damageRatio > 0.8 ? Math.sin(time * 10) * 0.5 : 0);
                                crtFilter.time = time;

                                const warpSpeed = isDrillingActive ? 25 : 1;

                                dustParticles.forEach(p => {
                                    p.y -= p.speed * p.z * warpSpeed * dt;
                                    if (p.y < -10) {
                                        p.y = screenH + 10;
                                        p.x = Math.random() * screenW;
                                    }
                                    p.sprite.x = p.x;
                                    p.sprite.y = p.y;
                                    const targetScaleY = 1 + (warpSpeed - 1) * 0.1 * p.z;
                                    p.sprite.scale.y += (targetScaleY - p.sprite.scale.y) * 0.1;
                                    p.sprite.scale.x = Math.max(0.5, 1 - (targetScaleY - 1) * 0.1);
                                    p.sprite.alpha = p.z * 0.6;
                                });

                                for (let i = globalParticles.length - 1; i >= 0; i--) {
                                    const p = globalParticles[i];
                                    if (p.sprite.destroyed) { globalParticles.splice(i, 1); continue; }
                                    p.life -= dt;
                                    p.sprite.x += p.vx * dt;
                                    p.sprite.y += p.vy * dt;
                                    if (p.type === 'DEBRIS') { p.vy += 0.2 * dt; p.sprite.rotation += 0.1 * dt; }
                                    else if (p.type === 'SMOKE') { p.sprite.alpha = (p.life / p.maxLife) * 0.5; p.sprite.scale.x += 0.01 * dt; p.sprite.scale.y += 0.01 * dt; }
                                    else { p.sprite.alpha = p.life / p.maxLife; }
                                    if (p.life <= 0) { p.sprite.destroy(); globalParticles.splice(i, 1); }
                                }

                                droneGraphicsMap.forEach((g, idx) => {
                                    if (idx >= activeDrones.length) {
                                        g.destroy();
                                        droneGraphicsMap.delete(idx);
                                    }
                                });

                                activeDrones.forEach((type, i) => {
                                    let g = droneGraphicsMap.get(i);
                                    if (!g || g.destroyed) {
                                        g = new Graphics();
                                        droneLayer.addChild(g);
                                        droneGraphicsMap.set(i, g);
                                    }

                                    g.clear();
                                    const level = droneLevels[type] || 1;
                                    const scale = 1 + (level * 0.1);

                                    const radius = 90 + i * 35;
                                    const speed = (1 + (i % 3) * 0.3) * (i % 2 === 0 ? 1 : -1);
                                    const angle = time * speed + (i * 1.5);

                                    const dx = Math.cos(angle) * radius;
                                    const dy = Math.sin(angle) * (radius * 0.3);

                                    const droneX = cx + dx;
                                    const droneY = cy + dy;

                                    g.ellipse(cx, cy, radius, radius * 0.3)
                                        .stroke({ width: 1, color: 0xffffff, alpha: 0.05 });

                                    const size = 6 * scale;

                                    switch (type) {
                                        case DroneType.COLLECTOR: {
                                            const color = 0x00FF00;
                                            g.poly([
                                                droneX - size, droneY - size,
                                                droneX + size, droneY - size,
                                                droneX + size, droneY + size,
                                                droneX - size, droneY + size
                                            ]).stroke({ width: 2, color: color });
                                            g.rect(droneX - size / 2, droneY - size / 2, size, size)
                                                .fill({ color: color, alpha: 0.3 + Math.sin(time * 5) * 0.2 });
                                            const open = Math.abs(Math.sin(time * 3)) * 3;
                                            g.moveTo(droneX - size, droneY + size);
                                            g.lineTo(droneX - size - 2, droneY + size + 4 + open);
                                            g.moveTo(droneX + size, droneY + size);
                                            g.lineTo(droneX + size + 2, droneY + size + 4 + open);
                                            g.stroke({ width: 1, color: color });
                                            break;
                                        }
                                        case DroneType.COOLER: {
                                            const color = 0x00FFFF;
                                            const rot = time * 10;
                                            g.circle(droneX, droneY, size / 2).fill({ color });
                                            for (let k = 0; k < 3; k++) {
                                                const bladeAng = rot + (k * (Math.PI * 2 / 3));
                                                const bx = droneX + Math.cos(bladeAng) * size * 1.5;
                                                const by = droneY + Math.sin(bladeAng) * size * 1.5;
                                                g.moveTo(droneX, droneY).lineTo(bx, by).stroke({ width: 2 * scale, color });
                                            }
                                            if (level >= 5) {
                                                g.circle(droneX, droneY, size * 2)
                                                    .stroke({ width: 1, color, alpha: 0.2 });
                                            }
                                            break;
                                        }
                                        case DroneType.BATTLE: {
                                            const color = 0xFF0000;
                                            const headAng = angle + (speed > 0 ? Math.PI / 2 : -Math.PI / 2);
                                            const p1x = droneX + Math.cos(headAng) * size * 1.5;
                                            const p1y = droneY + Math.sin(headAng) * size * 1.5;
                                            const p2x = droneX + Math.cos(headAng + 2.5) * size;
                                            const p2y = droneY + Math.sin(headAng + 2.5) * size;
                                            const p3x = droneX + Math.cos(headAng - 2.5) * size;
                                            const p3y = droneY + Math.sin(headAng - 2.5) * size;
                                            g.poly([p1x, p1y, p2x, p2y, p3x, p3y])
                                                .fill({ color, alpha: 0.8 })
                                                .stroke({ width: 1, color: 0xffffff });
                                            if (level >= 3) {
                                                g.circle(p1x, p1y, 2).fill({ color: 0xffff00 });
                                            }
                                            break;
                                        }
                                        case DroneType.REPAIR: {
                                            const color = 0xFFD700;
                                            g.rect(droneX - size / 3, droneY - size, size * 0.66, size * 2).fill({ color });
                                            g.rect(droneX - size, droneY - size / 3, size * 2, size * 0.66).fill({ color });
                                            g.ellipse(droneX, droneY, size * 1.5, size * 0.5)
                                                .stroke({ width: 1, color, alpha: 0.5 });
                                            break;
                                        }
                                        case DroneType.MINER: {
                                            const color = 0xFF00FF;
                                            g.poly([
                                                droneX - size / 2, droneY - size,
                                                droneX + size / 2, droneY - size,
                                                droneX, droneY + size * 1.5
                                            ]).fill({ color });
                                            const offset = (time * 5) % size;
                                            g.moveTo(droneX - size / 2, droneY - size + offset)
                                                .lineTo(droneX + size / 2, droneY - size + offset + 2)
                                                .stroke({ width: 1, color: 0xffffff });
                                            break;
                                        }
                                    }
                                });

                                const currentIds = new Set(flyingObjects.map(o => o.id));
                                objectGraphicsMap.forEach((g, id) => {
                                    if (!currentIds.has(id)) { g.destroy(); objectGraphicsMap.delete(id); }
                                });

                                flyingObjects.forEach(obj => {
                                    let g = objectGraphicsMap.get(obj.id);
                                    if (!g || g.destroyed) {
                                        g = new Graphics();
                                        g.eventMode = 'static';
                                        g.cursor = 'pointer';
                                        g.hitArea = new Circle(0, 0, 30);
                                        g.on('pointerdown', (e) => {
                                            e.stopPropagation();
                                            g.on('pointerdown', (e) => {
                                                e.stopPropagation();
                                                propsRef.current.onObjectClick(obj.id, e.global.x, e.global.y);
                                            });
                                        });
                                        objectLayer.addChild(g);
                                        objectGraphicsMap.set(obj.id, g);
                                    }

                                    g.clear();

                                    const pulse = 1 + Math.sin(time * 5) * 0.15; // Increased pulse speed
                                    const healthPercent = obj.hp / obj.maxHp;

                                    let rarityScale = 1;
                                    let rarityGlowColor = 0x000000;
                                    let rarityGlowAlpha = 0;

                                    if (obj.rarity === 'RARE') {
                                        rarityScale = 1.2;
                                        rarityGlowColor = 0x00FFFF;
                                        rarityGlowAlpha = 0.3;
                                    } else if (obj.rarity === 'EPIC') {
                                        rarityScale = 1.5;
                                        rarityGlowColor = 0xFFD700;
                                        rarityGlowAlpha = 0.5;
                                    }

                                    if (obj.rarity !== 'COMMON') {
                                        g.circle(0, 0, 25 * rarityScale * pulse)
                                            .fill({ color: rarityGlowColor, alpha: rarityGlowAlpha * 0.5 + Math.sin(time * 10) * 0.1 });
                                    }

                                    if (obj.type === 'GEODE_SMALL') {
                                        const r = 12 * pulse * rarityScale;
                                        const path: number[] = [];
                                        for (let k = 0; k < 8; k++) {
                                            const ang = (k * Math.PI) / 4;
                                            const rad = k % 2 === 0 ? r : r * 0.6;
                                            path.push(Math.cos(ang) * rad, Math.sin(ang) * rad);
                                        }
                                        g.drawPolygon(path.map((v, i) => v * 1.3))
                                            .fill({ color: 0x00ff88, alpha: 0.15 });
                                        g.drawPolygon(path)
                                            .fill({ color: 0x00ff88, alpha: 0.4 * healthPercent + 0.2 })
                                            .stroke({ width: 2, color: 0x00ffaa });
                                        g.circle(0, -r * 0.3, r * 0.2)
                                            .fill({ color: 0xffffff, alpha: 0.5 });

                                    } else if (obj.type === 'GEODE_LARGE') {
                                        const s = 15 * pulse * rarityScale;
                                        g.rect(-s * 1.4, -s * 1.4, s * 2.8, s * 2.8)
                                            .fill({ color: 0x9900ff, alpha: 0.1 });
                                        g.rect(-s, -s, s * 2, s * 2)
                                            .fill({ color: 0xaa44ff, alpha: 0.35 * healthPercent + 0.15 })
                                            .stroke({ width: 2, color: 0xcc66ff });
                                        const sparkX = Math.sin(time * 5) * s * 0.5;
                                        const sparkY = Math.cos(time * 4) * s * 0.5;
                                        g.circle(sparkX, sparkY, 3).fill({ color: 0xffffff, alpha: 0.8 });

                                    } else {
                                        const baseAlpha = 0.6 * healthPercent + 0.2;
                                        g.rect(-10 * pulse * rarityScale, -4 * pulse * rarityScale, 20 * pulse * rarityScale, 8 * pulse * rarityScale)
                                            .fill({ color: 0xff8800, alpha: baseAlpha });
                                        g.rect(-3 * pulse * rarityScale, -10 * pulse * rarityScale, 6 * pulse * rarityScale, 20 * pulse * rarityScale)
                                            .fill({ color: 0xffaa00, alpha: baseAlpha });
                                        for (let sp = 0; sp < 4; sp++) {
                                            const sparkAngle = time * 2 + sp * (Math.PI / 2);
                                            const sparkDist = 15 * rarityScale + Math.sin(time * 8 + sp) * 3;
                                            g.circle(
                                                Math.cos(sparkAngle) * sparkDist,
                                                Math.sin(sparkAngle) * sparkDist,
                                                2
                                            ).fill({ color: 0xffff00, alpha: 0.7 });
                                        }
                                        g.circle(0, 0, 4 * pulse * rarityScale).fill({ color: 0xffcc00, alpha: 0.9 });
                                    }

                                    g.x = (obj.x / 100) * screenW;
                                    g.y = (obj.y / 100) * screenH;
                                    g.rotation = time * 0.5;
                                });
                            } catch (error) {
                                console.error("Pixi Ticker Error:", error);
                            }
                        });

                        globalApp = app;
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

    useImperativeHandle(ref, () => ({
        emitParticle: (x, y, colorStr, type, count) => {
            if (!globalApp || !globalTextures || !globalParticleLayer) return;
            let color = 0xffffff;
            if (colorStr.startsWith('#')) color = parseInt(colorStr.replace('#', ''), 16);

            for (let i = 0; i < count; i++) {
                let tex = globalTextures.debris;
                let life = 0, vx = 0, vy = 0;

                if (type === 'DEBRIS') {
                    const ang = (Math.random() - 0.5) * Math.PI;
                    const spd = Math.random() * 5 + 2;
                    vx = Math.sin(ang) * spd; vy = -Math.abs(Math.cos(ang) * spd) - 2;
                    life = 40 + Math.random() * 20;
                } else if (type === 'SPARK') {
                    tex = globalTextures.spark;
                    const ang = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 8 + 4;
                    vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd;
                    life = 10 + Math.random() * 10;
                } else if (type === 'SMOKE') {
                    tex = globalTextures.smoke;
                    vx = (Math.random() - 0.5) * 1; vy = -1 - Math.random();
                    life = 50 + Math.random() * 30;
                }

                const sprite = new Sprite(tex);
                sprite.x = x; sprite.y = y; sprite.tint = color; sprite.anchor.set(0.5);
                if (type === 'SPARK') sprite.blendMode = 'add';
                globalParticleLayer.addChild(sprite);
                globalParticles.push({ sprite, vx, vy, life, maxLife: life, type });
            }
            if (globalParticles.length > 300) {
                const removed = globalParticles.splice(0, globalParticles.length - 300);
                removed.forEach(p => p.sprite.destroy());
            }
        }
    }));

    // Wrap in simple div, memoization handled by React.memo
    return <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-auto cursor-crosshair" />;
});

// [DEV_CONTEXT: PERFORMANCE] Memoize to prevent re-renders when parent state changes
export default React.memo(PixiOverlay);
