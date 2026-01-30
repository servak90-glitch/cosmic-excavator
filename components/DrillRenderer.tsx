import React, { useEffect, useRef } from 'react';
import { VisualEffectType, ResourceType } from '../types';
import { TUNNEL_PROPS, BIOMES } from '../constants';
import { useGameStore } from '../store/gameStore';
import { ARTIFACTS } from '../services/artifactRegistry';
import { calculateStats, RESOURCE_WEIGHTS } from '../services/gameMath';
import { performanceMonitor } from '../services/performanceMonitor';


interface DrillRendererProps {
    // No data props, component reads directly from store for performance
    activeBuffIds?: string[];
}

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Common': return '#64748b'; // Slate
        case 'Rare': return '#3b82f6';   // Blue
        case 'Epic': return '#a855f7';   // Purple
        case 'Legendary': return '#f59e0b'; // Amber
        case 'Godly': return '#ef4444';  // Red
        default: return '#64748b';
    }
};

const RESOURCE_COLORS: Record<string, string> = {
    clay: '#8B4513',
    stone: '#555555',
    copper: '#B87333',
    iron: '#A19D94',
    silver: '#ced4da',
    gold: '#ffd700',
    titanium: '#212529',
    uranium: '#70e000',
    nanoSwarm: '#ff006e',
    ancientTech: '#00f5d4',
    rubies: '#ef233c',
    emeralds: '#008000',
    diamonds: '#caf0f8',
    coal: '#1b263b',
    oil: '#333533',
    gas: '#00b4d8',
    ice: '#ade8f4',
    scrap: '#5c2e14',
    repairKit: '#4cc9f0',
    coolantPaste: '#4361ee',
    advancedCoolant: '#3a0ca3'
};

const getPropAtDepth = (depthIndex: number) => {
    // Simple hash function for deterministic prop placement
    const sin = Math.sin(depthIndex * 12.9898);
    const random = sin - Math.floor(sin);
    const meters = depthIndex * 50;
    const eligible = TUNNEL_PROPS.filter(p => meters >= p.minDepth && meters <= p.maxDepth);
    if (eligible.length === 0) return null;
    if (random < 0.2) {
        const prop = eligible[Math.floor(Math.random() * eligible.length)];
        if (random < prop.chance) return prop;
    }
    return null;
};

// --- VISUAL THEMES ENGINE ---
interface TierTheme {
    metal: string;
    darkMetal: string;
    rust?: string;
    highlight: string;
    accent: string;
    glow: string;
    detallLevel: number; // 0-4
}

const THEMES: Record<string, TierTheme> = {
    scrap: { metal: '#34251e', darkMetal: '#1a1412', rust: '#5c2e14', highlight: '#555', accent: '#a52a2a', glow: 'transparent', detallLevel: 0 },
    iron: { metal: '#555555', darkMetal: '#2a2a2e', rust: '#444', highlight: '#888', accent: '#ccc', glow: 'rgba(255,255,255,0.05)', detallLevel: 1 },
    heavy: { metal: '#2a2a2e', darkMetal: '#0f0f12', highlight: '#555', accent: '#1e1e21', glow: 'rgba(50,50,60,0.2)', detallLevel: 2 },
    tech: { metal: '#1a1a1f', darkMetal: '#050508', highlight: '#00f5d4', accent: '#00b4d8', glow: 'rgba(0,245,212,0.3)', detallLevel: 3 },
    energy: { metal: '#1c1917', darkMetal: '#0c0a09', highlight: '#ff9100', accent: '#fbbf24', glow: 'rgba(251,191,36,0.4)', detallLevel: 3 },
    void: { metal: '#0a0510', darkMetal: '#020104', highlight: '#ff006e', accent: '#7000ff', glow: 'rgba(112,0,255,0.5)', detallLevel: 4 },
    divine: { metal: '#f8fafc', darkMetal: '#cbd5e1', highlight: '#fbbf24', accent: '#fff', glow: 'rgba(251,191,36,0.6)', detallLevel: 4 },
};

const getThemeForTier = (tier: number): TierTheme => {
    if (tier <= 1) return THEMES.scrap;
    if (tier <= 3) return THEMES.iron;
    if (tier <= 5) return THEMES.heavy;
    if (tier <= 7) return THEMES.tech;
    if (tier <= 9) return THEMES.energy;
    if (tier <= 12) return THEMES.void;
    return THEMES.divine;
};

// [DEV_CONTEXT: PERFORMANCE] Using React.memo to prevent re-renders from parent
const DrillRenderer: React.FC<DrillRendererProps> = React.memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef(0);
    const prevDepthRef = useRef(0);

    // Pre-calculated noise buffer to avoid Math.random() in render loop
    const noiseBufferRef = useRef<Float32Array | null>(null);

    useEffect(() => {
        // Init static noise buffer (Performance Optimization)
        if (!noiseBufferRef.current) {
            noiseBufferRef.current = new Float32Array(200); // 200 segments is enough for any screen height
            for (let i = 0; i < 200; i++) {
                noiseBufferRef.current[i] = Math.random();
            }
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on canvas bg
        if (!ctx) return;

        let frameId = 0;
        let tick = 0;

        // [DEV_CONTEXT: OPTIMIZATION v5.2] Кэш для статов и state - обновляется не каждый кадр
        let cachedState = useGameStore.getState();
        let cachedStats = calculateStats(
            cachedState.drill,
            cachedState.skillLevels,
            cachedState.equippedArtifacts,
            cachedState.inventory,
            cachedState.depth,
            cachedState.activeEffects
        );
        let lastStatsUpdate = 0;

        const render = () => {
            frameId = requestAnimationFrame(render);
            tick++;

            // [DEV_CONTEXT: OPTIMIZATION v5.2] Адаптивный интервал обновления на основе FPS
            const statsInterval = performanceMonitor.getStatsUpdateInterval();

            // Обновляем state и stats только раз в N кадров
            if (tick - lastStatsUpdate >= statsInterval) {
                cachedState = useGameStore.getState();
                cachedStats = calculateStats(
                    cachedState.drill,
                    cachedState.skillLevels,
                    cachedState.equippedArtifacts,
                    cachedState.inventory,
                    cachedState.depth,
                    cachedState.activeEffects
                );
                lastStatsUpdate = tick;
            }

            // Быстрые поля — читаем каждый кадр (дёшево)
            const liveState = useGameStore.getState();
            const heat = liveState.heat;
            const isDrilling = liveState.isDrilling;
            const depth = liveState.depth;
            const isShielding = liveState.isShielding;
            const shieldCharge = liveState.shieldCharge;

            // Медленные поля — из кэша
            const { drill, activeEffects, selectedBiome, inventory, equippedArtifacts, resources, skillLevels } = cachedState;
            const stats = cachedStats;

            // [DEV_CONTEXT: WARP SYNC] Detect large depth changes (admin jump) and sync visuals
            if (Math.abs(depth - prevDepthRef.current) > 500) {
                scrollRef.current = depth * 4;
            }
            prevDepthRef.current = depth;

            const spinning = isDrilling;

            const activeBuffIds = activeEffects.map(e => e.id.split('_')[1] || e.id);


            const activeVisualEffects: VisualEffectType[] = [];
            equippedArtifacts.forEach(id => {
                const item = inventory[id];
                if (item) {
                    const def = ARTIFACTS.find(a => a.id === item.defId);
                    if (def?.visualEffect) activeVisualEffects.push(def.visualEffect);
                }
            });

            // Calculate Biome Color
            let currentBiome = BIOMES[0];
            if (selectedBiome) {
                currentBiome = BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === selectedBiome) || BIOMES[0];
            } else {
                currentBiome = BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];
            }
            const biomeColor = currentBiome.color;

            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;

            const scale = Math.min(w / 400, h / 800);
            const cy = h * 0.35;

            // Scroll Physics (Vertical)
            const baseSpeed = spinning ? (heat >= 100 ? 0 : (20 + (drill.engine.tier * 2))) : 0;
            scrollRef.current += baseSpeed;

            // Clear Canvas
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);

            // --- 1. TUNNEL BACKGROUND RENDERING (Vertical) ---
            const drawTunnel = () => {
                // Background Gradient
                const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                bgGrad.addColorStop(0, '#000');

                // [DEV_CONTEXT: SHIELD LIGHTING]
                const shieldLuminance = isShielding ? (shieldCharge / 100) * 0.3 : 0;
                const baseOpacity1 = (0.05 + shieldLuminance).toFixed(2);
                const baseOpacity2 = (0.11 + shieldLuminance).toFixed(2);

                bgGrad.addColorStop(0.3, `${biomeColor}${Math.floor(parseFloat(baseOpacity1) * 255).toString(16).padStart(2, '0')}`);
                bgGrad.addColorStop(0.7, `${biomeColor}${Math.floor(parseFloat(baseOpacity2) * 255).toString(16).padStart(2, '0')}`);
                bgGrad.addColorStop(1, '#000');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w, h);
                // ... rest of drawTunnel as is ...

                const segmentHeight = 200;
                const scrollY = scrollRef.current % segmentHeight;
                const segmentsInView = Math.ceil(h / segmentHeight) + 1;

                // Strata Lines (Horizontal)
                for (let i = -1; i < segmentsInView; i++) {
                    const drawY = (i * segmentHeight) - scrollY;
                    ctx.fillStyle = `${biomeColor}15`;
                    ctx.fillRect(0, drawY, w, segmentHeight * 0.4);
                    ctx.fillStyle = `${biomeColor}33`;
                    ctx.fillRect(0, drawY, w, 2);
                }

                // Walls (Left & Right)
                const wallWidth = w * 0.15;
                const wallSegHeight = 40;
                const wallScroll = scrollRef.current % wallSegHeight;
                const noiseOffset = Math.floor(scrollRef.current / wallSegHeight);
                const noiseArr = noiseBufferRef.current!;
                const noiseLen = noiseArr.length;

                ctx.fillStyle = '#000';
                // Left Wall
                ctx.beginPath(); ctx.moveTo(0, 0);
                for (let i = -1; i < segmentsInView * (segmentHeight / wallSegHeight); i++) {
                    const y = (i * wallSegHeight) - wallScroll;
                    const noiseIdx = Math.abs((noiseOffset + i) % noiseLen);
                    ctx.lineTo(wallWidth + noiseArr[noiseIdx] * 35, y);
                }
                ctx.lineTo(0, h); ctx.lineTo(0, 0); ctx.fill();

                // Right Wall
                ctx.beginPath(); ctx.moveTo(w, 0);
                for (let i = -1; i < segmentsInView * (segmentHeight / wallSegHeight); i++) {
                    const y = (i * wallSegHeight) - wallScroll;
                    const noiseIdx = Math.abs((noiseOffset + i + 50) % noiseLen);
                    ctx.lineTo(w - wallWidth - noiseArr[noiseIdx] * 35, y);
                }
                ctx.lineTo(w, h); ctx.lineTo(w, 0); ctx.fill();
            };
            drawTunnel();

            // --- 2. DRILL RENDERING (Reference-Based Detailed View) ---
            let shakeX = 0, shakeY = 0;
            if (spinning) {
                const intensity = (heat / 50) + 0.8;
                shakeX = (Math.random() - 0.5) * intensity;
                shakeY = (Math.random() - 0.5) * intensity;
            }

            ctx.save();
            ctx.translate(cx + shakeX, cy + shakeY);
            ctx.scale(scale * 0.45, scale * 0.45);

            // COLOR PALETTE (Reference Match)
            const cMetal = '#2a2a2e';
            const cDarkMetal = '#1a1a1b';
            const cRust = '#5c2e14';
            const cLightRust = '#8b4513';
            const cHighlight = '#8e8e93';
            const cLight = '#fff7ad';

            // UTILS: Texture & Detail
            const drawWeathering = (x: number, y: number, w: number, h: number, seed: number) => {
                ctx.save();
                ctx.rect(x, y, w, h); ctx.clip();
                const noise = noiseBufferRef.current!;
                for (let i = 0; i < 40; i++) {
                    const nx = x + noise[(seed + i) % 200] * w;
                    const ny = y + noise[(seed + i * 2) % 200] * h;
                    const size = 1 + noise[(seed + i * 3) % 200] * 3;
                    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(92, 46, 20, 0.3)';
                    ctx.fillRect(nx, ny, size, size);
                }
                ctx.restore();
            };

            const drawRivets = (pts: { x: number, y: number }[]) => {
                ctx.fillStyle = '#111';
                pts.forEach(p => {
                    ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.beginPath(); ctx.arc(p.x - 0.5, p.y - 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#111';
                });
            };

            // 2.0 CHASSIS / MAIN FRAME (Connects all modules - Tiered)
            const drawChassis = () => {
                const tier = drill.hull.tier;
                const theme = getThemeForTier(tier);
                const fw = 140; const fh = 600;

                const gFrame = ctx.createLinearGradient(-fw / 2, 0, fw / 2, 0);
                gFrame.addColorStop(0, theme.darkMetal);
                gFrame.addColorStop(0.5, theme.metal);
                gFrame.addColorStop(1, theme.darkMetal);

                ctx.fillStyle = gFrame;
                ctx.beginPath(); ctx.roundRect(-fw / 2, -350, fw, fh + 150, 10); ctx.fill();

                // Vertical structure lines - more detailed for high tiers
                const lines = tier <= 5 ? 1 : (tier <= 12 ? 2 : 3);
                ctx.strokeStyle = tier >= 6 ? theme.highlight : 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;

                for (let i = 0; i < lines; i++) {
                    const offset = (i + 1) * (fw / (lines + 1)) - fw / 2;
                    ctx.beginPath(); ctx.moveTo(offset, -350); ctx.lineTo(offset, fh); ctx.stroke();
                }
            };
            drawChassis();

            // 2.1 TREADS (Dual Track System - Tiered)
            const drawTreads = () => {
                const tier = drill.engine.tier;
                const theme = getThemeForTier(tier);

                const trackWidth = tier >= 13 ? 40 : 80;
                const trackGap = tier >= 13 ? 160 : 120;
                const th = 600;
                const treadSpeed = spinning ? (10 + tier * 2) : 0;
                const offset = (tick * treadSpeed) % 40;

                const drawTrack = (x: number) => {
                    ctx.save();
                    ctx.translate(x, 0);

                    if (tier >= 13) {
                        // Anti-gravity pods for Divine tier
                        ctx.fillStyle = theme.metal;
                        ctx.shadowBlur = 15; ctx.shadowColor = theme.glow;
                        ctx.beginPath(); ctx.roundRect(-trackWidth / 2, -th / 2 + 100, trackWidth, th - 200, 20); ctx.fill();
                        ctx.shadowBlur = 0;

                        // Pulsing core
                        const pulse = Math.sin(tick * 0.1) * 0.5 + 0.5;
                        ctx.fillStyle = theme.highlight;
                        ctx.globalAlpha = pulse;
                        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
                        ctx.globalAlpha = 1;
                    } else {
                        ctx.fillStyle = theme.darkMetal; ctx.strokeStyle = theme.highlight; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.roundRect(-trackWidth / 2, -th / 2, trackWidth, th, 15); ctx.fill(); ctx.stroke();

                        // Tread Detail (Links)
                        ctx.save(); ctx.beginPath(); ctx.roundRect(-trackWidth / 2, -th / 2, trackWidth, th, 15); ctx.clip();
                        for (let i = -40; i < th + 40; i += 40) {
                            const y = -th / 2 + i - offset;
                            ctx.fillStyle = theme.metal; ctx.fillRect(-trackWidth / 2, y, trackWidth, 12);
                            if (tier >= 6) {
                                ctx.fillStyle = theme.highlight; ctx.fillRect(-trackWidth / 2, y + 12, trackWidth, 2);
                            }
                        }
                        ctx.restore();
                    }
                    ctx.restore();
                };

                drawTrack(-(trackGap + trackWidth) / 2);
                drawTrack((trackGap + trackWidth) / 2);
            };
            drawTreads();

            // 2.2 TOP ENGINE & COOLING (Tiered)
            const drawEngine = () => {
                const tier = drill.engine.tier;
                const theme = getThemeForTier(tier);
                const ey = -290;

                // Radiator Box
                ctx.fillStyle = theme.metal; ctx.strokeStyle = theme.highlight; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.roundRect(-70, ey - 60, 140, 70, 5); ctx.fill(); ctx.stroke();

                // Tiered Details: Exhausts
                const numPipes = tier <= 1 ? 2 : (tier <= 5 ? 4 : (tier <= 9 ? 6 : 8));
                const pipeStep = 140 / (numPipes + 1);

                for (let i = 0; i < numPipes; i++) {
                    const px = -70 + (i + 1) * pipeStep;
                    const py = ey - 30;
                    ctx.fillStyle = theme.darkMetal; ctx.fillRect(px - 6, py - 55, 12, 65);

                    const gPipe = ctx.createLinearGradient(px - 6, py, px + 6, py);
                    gPipe.addColorStop(0, '#000');
                    gPipe.addColorStop(0.5, theme.rust || theme.accent);
                    gPipe.addColorStop(1, '#000');
                    ctx.fillStyle = gPipe; ctx.fillRect(px - 5, py - 53, 10, 61);

                    if (spinning) {
                        ctx.save();
                        ctx.globalAlpha = 0.3;
                        const smokeColor = tier >= 6 ? theme.glow : 'rgba(50,50,50,0.4)';
                        ctx.fillStyle = smokeColor;
                        for (let k = 0; k < 2; k++) {
                            const sy = py - 70 - (tick * 3 + k * 15) % 80;
                            const sx = px + Math.sin(tick * 0.1 + k) * 5;
                            ctx.beginPath(); ctx.arc(sx, sy, 5 + (py - sy) * 0.1, 0, Math.PI * 2); ctx.fill();
                        }
                        ctx.restore();
                    }
                }

                // Tiered Cooling Fans
                const numFans = tier < 10 ? 2 : 4;
                for (let i = 0; i < numFans; i++) {
                    const fx = numFans === 2 ? (i === 0 ? -35 : 35) : (-50 + i * 33);
                    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(fx, ey - 45, 20, 0, Math.PI * 2); ctx.fill();
                    ctx.save(); ctx.translate(fx, ey - 45); ctx.rotate(tick * (0.1 + tier * 0.02));
                    ctx.strokeStyle = theme.highlight; ctx.lineWidth = 3;
                    const blades = tier <= 3 ? 3 : (tier <= 7 ? 4 : 6);
                    for (let f = 0; f < blades; f++) {
                        ctx.rotate((Math.PI * 2) / blades);
                        ctx.moveTo(0, 0); ctx.lineTo(0, 18); ctx.stroke();
                    }
                    ctx.restore();
                }

                // Add Energy Rings for T10+
                if (tier >= 10) {
                    ctx.strokeStyle = theme.highlight;
                    const pulse = Math.sin(tick * 0.1) * 5;
                    ctx.beginPath(); ctx.ellipse(0, ey - 20, 80 + pulse, 15 + pulse / 2, 0, 0, Math.PI * 2); ctx.stroke();
                }
            };
            drawEngine();

            // 2.2.1 CARGO BAY (Between Engine and Cabin)
            const drawCargoBay = () => {
                const by = -180;
                const bw = 150; const bh = 160;
                const gCargo = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
                gCargo.addColorStop(0, cDarkMetal); gCargo.addColorStop(0.5, cMetal); gCargo.addColorStop(1, cDarkMetal);
                ctx.fillStyle = gCargo; ctx.strokeStyle = '#111';
                ctx.beginPath(); ctx.roundRect(-bw / 2, by - bh / 2, bw, bh, 5); ctx.fill(); ctx.stroke();

                // --- RENDER CARGO CONTENTS ---
                const maxCap = stats.totalCargoCapacity || 5000;
                const innerX = -bw / 2 + 5;
                const innerW = bw - 10;
                const innerH = bh - 10;
                const floorY = by + bh / 2 - 5;

                let currentYOffset = 0;

                // Sort resources to always draw them in same order (important for visual stability)
                const resourceTypes = Object.keys(resources).sort() as ResourceType[];

                resourceTypes.forEach(resType => {
                    const amount = resources[resType] || 0;
                    const unitWeight = RESOURCE_WEIGHTS[resType] || 0;
                    if (amount <= 0 || unitWeight <= 0) return;

                    const resWeight = amount * unitWeight;
                    const layerHeight = (resWeight / maxCap) * innerH;

                    if (layerHeight < 0.5) return; // Don't draw tiny slivers

                    const color = RESOURCE_COLORS[resType] || '#fff';

                    ctx.fillStyle = color;
                    // Layer with slight gradient for depth
                    const layerGrad = ctx.createLinearGradient(innerX, 0, innerX + innerW, 0);
                    layerGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
                    layerGrad.addColorStop(0.2, color);
                    layerGrad.addColorStop(0.8, color);
                    layerGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
                    ctx.fillStyle = layerGrad;

                    ctx.fillRect(innerX, floorY - currentYOffset - layerHeight, innerW, layerHeight);

                    // Top edge of layer
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(innerX, floorY - currentYOffset - layerHeight, innerW, 1);

                    currentYOffset += layerHeight;
                });

                // Add "pile" effect at the very top if there is any cargo
                if (currentYOffset > 0) {
                    ctx.save();
                    ctx.translate(0, floorY - currentYOffset);
                    ctx.beginPath();
                    ctx.moveTo(-innerW / 2 + 10, 0);
                    ctx.quadraticCurveTo(0, -10, innerW / 2 - 10, 0);
                    ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Shadow of the top of the pile
                    ctx.fill();
                    ctx.restore();
                }

                drawWeathering(-bw / 2, by - bh / 2, bw, bh, 40);

                // Ribs/Details (drawn over cargo for depth)
                ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
                for (let i = 1; i < 4; i++) {
                    const ry = by - bh / 2 + (i * bh / 4);
                    ctx.beginPath(); ctx.moveTo(-bw / 2 + 15, ry); ctx.lineTo(bw / 2 - 15, ry); ctx.stroke();
                }
                drawRivets([{ x: -bw / 2 + 10, y: by }, { x: bw / 2 - 10, y: by }]);
            };
            drawCargoBay();

            // 2.3 MAIN CABIN (HULL - Tiered)
            const drawCabin = () => {
                const tier = drill.hull.tier;
                const theme = getThemeForTier(tier);
                const cy = 10;
                const cw = 160; const ch = 180;

                const gHull = ctx.createLinearGradient(-cw / 2, 0, cw / 2, 0);
                gHull.addColorStop(0, theme.darkMetal);
                gHull.addColorStop(0.5, theme.metal);
                gHull.addColorStop(1, theme.darkMetal);

                ctx.fillStyle = gHull; ctx.strokeStyle = theme.highlight; ctx.lineWidth = 2;

                if (tier <= 5) {
                    // Blocky / Industrial
                    ctx.beginPath(); ctx.roundRect(-cw / 2, cy - ch / 2, cw, ch, 8); ctx.fill(); ctx.stroke();
                } else if (tier <= 12) {
                    // Sleek / Aerodynamic
                    ctx.beginPath();
                    ctx.moveTo(-cw / 2, cy + ch / 2);
                    ctx.lineTo(-cw * 0.4, cy - ch / 2);
                    ctx.lineTo(cw * 0.4, cy - ch / 2);
                    ctx.lineTo(cw / 2, cy + ch / 2);
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                } else {
                    // Celestial / Artifact
                    ctx.beginPath();
                    ctx.moveTo(0, cy - ch / 2 - 20);
                    ctx.lineTo(cw / 2 + 10, cy);
                    ctx.lineTo(0, cy + ch / 2 + 20);
                    ctx.lineTo(-cw / 2 - 10, cy);
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                }

                if (theme.rust) drawWeathering(-cw / 2, cy - ch / 2, cw, ch, 10);

                // Tiered Hatch/Window
                const hSize = tier >= 13 ? 10 : 45;
                ctx.fillStyle = theme.darkMetal; ctx.beginPath(); ctx.arc(0, cy - 30, hSize, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = theme.accent; ctx.lineWidth = tier >= 6 ? 2 : 4; ctx.stroke();

                if (tier >= 6) {
                    // Glow effect for advanced tech
                    ctx.shadowBlur = 10; ctx.shadowColor = theme.highlight;
                    ctx.fillStyle = theme.highlight; ctx.beginPath(); ctx.arc(0, cy - 30, hSize * 0.8, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Armor Plates / Rivets Detail
                if (tier >= 3 && tier <= 5) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.strokeRect(-cw / 2 + 10, cy - ch / 2 + 10, cw - 20, ch - 20);
                    drawRivets([{ x: -cw / 2 + 15, y: cy + 40 }, { x: cw / 2 - 15, y: cy + 40 }]);
                }
            };
            drawCabin();

            // 2.4 MECHANICAL CORE (Tiered)
            const drawMechanicals = () => {
                const tier = drill.power.tier; // Use power tier for the core
                const theme = getThemeForTier(tier);
                const my = 130;
                const mw = 140; const mh = 110;

                // Background
                ctx.fillStyle = theme.darkMetal; ctx.fillRect(-mw / 2, my - mh / 2, mw, mh);
                ctx.strokeStyle = theme.highlight; ctx.strokeRect(-mw / 2, my - mh / 2, mw, mh);

                if (tier >= 10) {
                    // Quantum Reactor for high tiers
                    const pulse = Math.sin(tick * 0.05) * 10;
                    ctx.shadowBlur = 20; ctx.shadowColor = theme.glow;
                    ctx.fillStyle = theme.highlight;
                    ctx.beginPath(); ctx.arc(0, my, 30 + pulse, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;

                    // Rotating rings
                    ctx.strokeStyle = theme.accent; ctx.lineWidth = 2;
                    ctx.save(); ctx.translate(0, my); ctx.rotate(tick * 0.1);
                    ctx.beginPath(); ctx.ellipse(0, 0, 50, 20, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.rotate(Math.PI / 2);
                    ctx.beginPath(); ctx.ellipse(0, 0, 50, 20, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.restore();
                } else {
                    // Mechanical Gears
                    const numGears = tier >= 6 ? 2 : 1;
                    for (let g = 0; g < numGears; g++) {
                        const gx = numGears === 1 ? -35 : (g === 0 ? -40 : 30);
                        const gy = numGears === 1 ? my : (g === 0 ? my - 20 : my + 20);
                        const size = numGears === 1 ? 35 : 25;

                        ctx.save(); ctx.translate(gx, gy); if (spinning) ctx.rotate(tick * (g === 0 ? 0.05 : -0.07));
                        ctx.fillStyle = theme.metal; ctx.strokeStyle = theme.highlight; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                        for (let i = 0; i < 8; i++) {
                            ctx.rotate(Math.PI / 4);
                            ctx.fillRect(size - 5, -4, 10, 8);
                        }
                        ctx.restore();
                    }

                    // Pistons
                    const pistonOffset = spinning ? Math.sin(tick * 0.2) * 15 : 0;
                    ctx.fillStyle = theme.darkMetal; ctx.fillRect(20, my - 40, 25, 80);
                    ctx.fillStyle = theme.highlight; ctx.fillRect(25, my - 35 + pistonOffset, 15, 30);
                }
            };
            drawMechanicals();

            // 2.5 SHROUD (Skirt - Tiered)
            const drawShroud = () => {
                const tier = drill.hull.tier;
                const theme = getThemeForTier(tier);
                const sy = 185;
                const sw1 = 160; const sw2 = 220; const sh = 80;

                const gShroud = ctx.createLinearGradient(0, sy, 0, sy + sh);
                gShroud.addColorStop(0, theme.metal);
                gShroud.addColorStop(1, theme.rust || theme.darkMetal);

                ctx.fillStyle = gShroud; ctx.strokeStyle = theme.darkMetal;
                ctx.beginPath(); ctx.moveTo(-sw1 / 2, sy); ctx.lineTo(sw1 / 2, sy);
                ctx.lineTo(sw2 / 2, sy + sh); ctx.lineTo(-sw2 / 2, sy + sh); ctx.closePath(); ctx.fill(); ctx.stroke();

                // Tiered Ribs / Energy Lines
                const numRibs = tier <= 5 ? 7 : (tier <= 12 ? 11 : 15);
                ctx.strokeStyle = tier >= 10 ? theme.highlight : 'rgba(0,0,0,0.3)';
                ctx.lineWidth = tier >= 10 ? 2 : 1;

                for (let i = 0; i < numRibs; i++) {
                    const t = i / (numRibs - 1);
                    const xTop = -sw1 / 2 + t * sw1;
                    const xBot = -sw2 / 2 + t * sw2;
                    ctx.beginPath(); ctx.moveTo(xTop, sy); ctx.lineTo(xBot, sy + sh); ctx.stroke();
                }
            };
            drawShroud();

            // 2.6 HEAVY BIT (Tiered)
            const drawBitRef = () => {
                const tier = drill.bit.tier;
                const theme = getThemeForTier(tier);
                const by = 265;

                // Define layers based on tier theme
                let layers = [
                    { w: 200, h: 40, teeth: 12 },
                    { w: 150, h: 50, teeth: 10 },
                    { w: 100, h: 60, teeth: 8 },
                    { w: 50, h: 70, teeth: 4 }
                ];

                if (tier >= 10) {
                    // More complex layers for high tier
                    layers.push({ w: 30, h: 40, teeth: 2 });
                }

                let currY = by;
                layers.forEach((l, idx) => {
                    ctx.save(); ctx.translate(0, currY);
                    if (spinning) ctx.translate((Math.random() - 0.5) * 3, 0);

                    const bGrad = ctx.createLinearGradient(-l.w / 2, 0, l.w / 2, 0);
                    bGrad.addColorStop(0, theme.darkMetal);
                    bGrad.addColorStop(0.5, theme.metal);
                    bGrad.addColorStop(1, theme.darkMetal);

                    ctx.fillStyle = bGrad; ctx.strokeStyle = tier >= 6 ? theme.highlight : '#111';
                    ctx.lineWidth = tier >= 6 ? 2 : 1;

                    // Layer Body
                    ctx.beginPath(); ctx.moveTo(-l.w / 2, 0); ctx.lineTo(l.w / 2, 0);
                    ctx.lineTo(l.w / 2 * (0.7 - idx * 0.1), l.h); ctx.lineTo(-l.w / 2 * (0.7 - idx * 0.1), l.h); ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Teeth Logic
                    ctx.fillStyle = tier >= 13 ? theme.highlight : '#111';
                    const bottomW = l.w * (0.7 - idx * 0.1);
                    const toothW = bottomW / l.teeth;
                    const spinPhase = spinning ? (tick * 0.3) % toothW : 0;

                    ctx.save();
                    ctx.beginPath(); ctx.rect(-bottomW / 2, l.h, bottomW, 20); ctx.clip();

                    for (let i = -1; i <= l.teeth; i++) {
                        const tx = -bottomW / 2 + i * toothW + spinPhase;
                        ctx.beginPath();
                        ctx.moveTo(tx, l.h);
                        ctx.lineTo(tx + toothW / 2, l.h + 12 + theme.detallLevel * 2);
                        ctx.lineTo(tx + toothW, l.h);
                        ctx.closePath(); ctx.fill();

                        if (tier >= 6) {
                            ctx.strokeStyle = theme.highlight;
                            ctx.beginPath(); ctx.moveTo(tx + 2, l.h + 2); ctx.lineTo(tx + toothW / 2, l.h + 8); ctx.stroke();
                        }
                    }
                    ctx.restore();
                    ctx.restore();
                    currY += l.h;
                });

                // Final Tip (Laser/Plasma for High Tiers)
                if (tier >= 13) {
                    ctx.shadowBlur = 20; ctx.shadowColor = theme.glow;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.moveTo(-5, currY); ctx.lineTo(5, currY); ctx.lineTo(0, currY + 120); ctx.closePath(); ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = theme.darkMetal; ctx.beginPath();
                    ctx.moveTo(-15, currY); ctx.lineTo(15, currY); ctx.lineTo(0, currY + 40); ctx.closePath(); ctx.fill();
                }

                // Heat (Tip) - Enhanced for tiers
                if (heat > 5 || tier >= 8) {
                    const heatVal = Math.max(heat, tier >= 8 ? 20 : 0);
                    ctx.globalCompositeOperation = 'lighter';
                    const hGrad = ctx.createRadialGradient(0, currY + 20, 0, 0, currY + 20, (60 + theme.detallLevel * 20) * (heatVal / 100));
                    hGrad.addColorStop(0, heatVal > 80 ? '#fff' : theme.highlight); hGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = hGrad; ctx.beginPath(); ctx.arc(0, currY + 20, 100, 0, Math.PI * 2); ctx.fill();
                    ctx.globalCompositeOperation = 'source-over';
                }
            };
            drawBitRef();

            // 2.7 LIGHTS (Lamps - Tiered)
            const drawLights = () => {
                const tier = drill.control.tier;
                const theme = getThemeForTier(tier);
                const ly = 20;
                const lx = 65;
                const numLights = tier <= 9 ? 2 : 4;

                for (let i = 0; i < numLights; i++) {
                    const x = numLights === 2 ? (i === 0 ? -lx : lx) : (-lx - 15 + i * 45);
                    const y = ly;

                    // Lamp Body
                    ctx.fillStyle = theme.darkMetal; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();

                    // Glow / Beam
                    const gLight = ctx.createRadialGradient(x, y, 0, x, y + 120, 250);
                    const beamColor = tier <= 5 ? '255, 247, 173' : (tier <= 9 ? '0, 245, 212' : '255, 0, 110');
                    gLight.addColorStop(0, `rgba(${beamColor}, 0.5)`);
                    gLight.addColorStop(1, `rgba(${beamColor}, 0)`);

                    ctx.fillStyle = gLight;
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 80, y + 300); ctx.lineTo(x + 80, y + 300); ctx.closePath(); ctx.fill();

                    // Bulb
                    ctx.fillStyle = theme.highlight; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
                }
            };
            drawLights();

            // [PHASE 6] OVERLOAD RADIANCE
            const drawOverloadEffect = () => {
                const isOverloadActive = activeEffects.some(e => e.id === 'OVERLOAD' || e.id.startsWith('ability_OVERLOAD'));
                if (!isOverloadActive) return;

                const pulse = Math.sin(tick * 0.15) * 0.5 + 0.5;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const gOverload = ctx.createRadialGradient(0, 0, 100, 0, 0, 400);
                gOverload.addColorStop(0, `rgba(239, 35, 60, ${0.4 * pulse})`); // Red-ish glow
                gOverload.addColorStop(1, 'transparent');
                ctx.fillStyle = gOverload;
                ctx.beginPath();
                ctx.arc(0, 0, 400, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };
            drawOverloadEffect();

            // 2.8 ENERGY SHIELD (Phase 4.2 Professional 3D Visuals)
            const drawShield = () => {
                if (!isShielding) return;

                const shieldAlpha = Math.min(1, (shieldCharge / 100) * 1.5); // Boost alpha for better visibility
                const pulse = Math.sin(tick * 0.08) * 4;
                const shieldWidth = 260 + pulse;
                const shieldHeight = 600 + pulse;
                const shieldY = 80; // Stretched and lowered to cover the drill bit tip

                ctx.save();

                // --- A. BACK GLOW (Aura around the shield) ---
                ctx.globalCompositeOperation = 'screen';
                const backGlow = ctx.createRadialGradient(0, shieldY, 50, 0, shieldY, 350);
                backGlow.addColorStop(0, `rgba(34, 211, 238, ${0.15 * shieldAlpha})`);
                backGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = backGlow;
                ctx.beginPath();
                ctx.ellipse(0, shieldY, shieldWidth * 1.4, shieldHeight * 1.2, 0, 0, Math.PI * 2);
                ctx.fill();

                // --- B. 3D SPHERE VOLUME (Inner Gradient) ---
                // We use a radial gradient shifted top-left to simulate a light source
                const volumeGrad = ctx.createRadialGradient(-30, shieldY - 100, 20, 0, shieldY, 300);
                volumeGrad.addColorStop(0, `rgba(165, 243, 252, ${0.4 * shieldAlpha})`); // Highlight color
                volumeGrad.addColorStop(0.4, `rgba(34, 211, 238, ${0.15 * shieldAlpha})`); // Main color
                volumeGrad.addColorStop(1, `rgba(8, 51, 68, ${0.05 * shieldAlpha})`); // Dark side

                ctx.fillStyle = volumeGrad;
                ctx.beginPath();
                ctx.ellipse(0, shieldY, shieldWidth, shieldHeight, 0, 0, Math.PI * 2);
                ctx.fill();

                // --- C. RIM LIGHTING (Fresnel Effect) ---
                ctx.strokeStyle = `rgba(165, 243, 252, ${0.8 * shieldAlpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(0, shieldY, shieldWidth, shieldHeight, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Inner soft rim
                ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 * shieldAlpha})`;
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.ellipse(0, shieldY, shieldWidth - 8, shieldHeight - 8, 0, 0, Math.PI * 2);
                ctx.stroke();

                // --- D. HEXAGONAL STRETCHED GRID (3D Masked) ---
                ctx.save();
                // Clip to the shield shape
                ctx.beginPath();
                ctx.ellipse(0, shieldY, shieldWidth, shieldHeight, 0, 0, Math.PI * 2);
                ctx.clip();

                const hexSize = 25;
                const gridScroll = (tick * 0.5) % 80;
                ctx.strokeStyle = `rgba(165, 243, 252, ${0.15 * shieldAlpha})`;
                ctx.lineWidth = 1;

                // Draw hexagons
                for (let r = -12; r < 12; r++) {
                    for (let c = -8; c < 8; c++) {
                        const hx = c * hexSize * 1.5;
                        const hy = shieldY + r * hexSize * 1.73 + (c % 2 ? hexSize * 0.86 : 0) + gridScroll;

                        ctx.beginPath();
                        for (let s = 0; s < 6; s++) {
                            const angle = (Math.PI / 3) * s;
                            const px = hx + Math.cos(angle) * hexSize * 0.6;
                            const py = hy + Math.sin(angle) * hexSize * 0.6;
                            if (s === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                ctx.restore();

                // --- E. SPECULAR HIGHLIGHT (Glass Look) ---
                const specular = ctx.createLinearGradient(0, shieldY - shieldHeight * 0.8, 0, shieldY);
                specular.addColorStop(0, `rgba(255, 255, 255, ${0.2 * shieldAlpha})`);
                specular.addColorStop(1, 'transparent');
                ctx.fillStyle = specular;
                ctx.beginPath();
                ctx.ellipse(0, shieldY - shieldHeight * 0.5, shieldWidth * 0.7, shieldHeight * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();

                // --- F. ELECTRICAL DISCHARGES (Lightning) ---
                ctx.globalCompositeOperation = 'lighter';
                ctx.strokeStyle = `rgba(207, 250, 254, ${0.6 * shieldAlpha})`;
                ctx.lineWidth = 1.5;
                if (tick % 10 < 3) { // Occasional jumps
                    ctx.beginPath();
                    let lx = (Math.random() - 0.5) * shieldWidth;
                    let ly = shieldY - shieldHeight;
                    ctx.moveTo(lx, ly);
                    for (let i = 0; i < 8; i++) {
                        lx += (Math.random() - 0.5) * 60;
                        ly += shieldHeight / 4;
                        ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }

                ctx.restore();
            };
            drawShield();

            ctx.restore();
        };

        // Initial render call
        render();

        const handleResize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
        };
    }, []); // Dependencies empty: updates happen via store subscription inside RAF

    return <canvas ref={canvasRef} className="w-full h-full block" />;
});

export default DrillRenderer;
