import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { motion, AnimatePresence } from 'framer-motion';
import { RegionId, PlayerBase, Caravan, ResourceType } from '../../types';
import { REGIONS, REGION_IDS } from '../../constants/regions';
import { t } from '../../services/localization';
import { useGameStore } from '../../store/gameStore';
import { ObjectPool } from '../../services/ObjectPool';

interface ScannerCanvasProps {
    regions: RegionId[];
    activeRegion: RegionId;
    bases: PlayerBase[];
    caravans: Caravan[];
    onRegionSelect: (id: RegionId) => void;
}

export const ScannerCanvas: React.FC<ScannerCanvasProps> = ({
    activeRegion,
    bases,
    caravans,
    onRegionSelect
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const indicatorPoolRef = useRef<ObjectPool<PIXI.Graphics> | null>(null);
    const indicatorRef = useRef<PIXI.Graphics | null>(null);
    const texturesRef = useRef<Record<string, PIXI.Texture>>({});
    const lang = useGameStore(s => s.settings.language);

    const dataRef = useRef({ bases, caravans, activeRegion });
    useEffect(() => { dataRef.current = { bases, caravans, activeRegion }; }, [bases, caravans, activeRegion]);

    useEffect(() => {
        let isMounted = true;

        const initApp = async () => {
            const app = new PIXI.Application();
            try {
                await app.init({
                    resizeTo: containerRef.current!,
                    backgroundAlpha: 0,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true
                });
            } catch (e) {
                console.error("Scanner Pixi Init Error:", e);
                return;
            }

            if (!isMounted || !containerRef.current) {
                app.destroy(true);
                return;
            }

            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Load Assets
            try {
                const assetMap: Record<string, string> = {};
                REGION_IDS.forEach(id => {
                    assetMap[id] = `/assets/regions/${id}.webp`;
                });

                for (const [id, url] of Object.entries(assetMap)) {
                    const tex = await PIXI.Assets.load(url);
                    texturesRef.current[id] = tex;
                }
            } catch (e) {
                console.warn("Satellite images loading failed, falling back to blueprint only:", e);
            }

            // Pools
            indicatorPoolRef.current = new ObjectPool(() => {
                const g = new PIXI.Graphics();
                g.setStrokeStyle({ width: 2, color: 0xFFFFFF });
                g.beginFill(0x38BDF8, 0.5);
                g.drawCircle(0, 0, 10);
                g.endFill();
                g.stroke();
                return g;
            }, 1);

            // Layers
            const mainScrollContainer = new PIXI.Container();
            const backgroundLayer = new PIXI.Container();
            const regionsLayer = new PIXI.Container();
            const interactiveLayer = new PIXI.Container();
            const overlayLayer = new PIXI.Container();

            mainScrollContainer.addChild(backgroundLayer);
            mainScrollContainer.addChild(regionsLayer);
            mainScrollContainer.addChild(interactiveLayer);
            mainScrollContainer.addChild(overlayLayer);
            app.stage.addChild(mainScrollContainer);

            const sortedRegionIds = [...REGION_IDS].sort((a, b) => REGIONS[a].tierLimit - REGIONS[b].tierLimit);

            // Адаптивная высота регионов для мобильных устройств
            const calculateRegionHeight = () => {
                const screenHeight = app.screen.height;
                const availableHeight = screenHeight - 200; // отступы сверху/снизу
                const calculatedHeight = Math.floor(availableHeight / sortedRegionIds.length);
                return Math.max(150, Math.min(400, calculatedHeight)); // мин 150px, макс 400px
            };

            let REGION_HEIGHT = calculateRegionHeight();
            const isMobile = () => app.screen.width < 768;

            const redrawAll = () => {
                const width = app.screen.width;
                REGION_HEIGHT = calculateRegionHeight(); // Пересчитываем при resize
                backgroundLayer.removeChildren();

                const grid = new PIXI.Graphics();
                grid.setStrokeStyle({ width: 0.5, color: 0x38BDF8, alpha: 0.1 });
                const totalHeight = REGION_IDS.length * REGION_HEIGHT + 1000;
                for (let i = 0; i < totalHeight; i += 50) {
                    grid.moveTo(0, i).lineTo(width, i);
                }
                for (let i = 0; i < width; i += 50) {
                    grid.moveTo(i, 0).lineTo(i, totalHeight);
                }
                grid.stroke();
                backgroundLayer.addChild(grid);

                const drawRegionContent = (g: PIXI.Graphics, id: RegionId, x: number, y: number, w: number, h: number, color: number) => {
                    const cx = x + w / 2;
                    const cy = y + h / 2;
                    const now = Date.now();

                    // --- 1. Background Grid / Decorative elements ---
                    g.setStrokeStyle({ width: 1, color: color, alpha: 0.05 });
                    for (let i = 0; i < h; i += 40) g.moveTo(x + 50, y + i).lineTo(x + w - 50, y + i);
                    for (let i = 0; i < w; i += 40) g.moveTo(x + i, y + 20).lineTo(x + i, y + h - 20);
                    g.stroke();

                    // --- 2. Scanning Beam Animation ---
                    const beamY = y + 20 + ((now / 20) % (h - 40));
                    g.setStrokeStyle({ width: 2, color: 0xFFFFFF, alpha: 0.15 });
                    g.moveTo(x + 50, beamY).lineTo(x + w - 50, beamY).stroke();
                    // Glow under beam
                    g.setStrokeStyle({ width: 8, color: color, alpha: 0.05 });
                    g.moveTo(x + 60, beamY).lineTo(x + w - 60, beamY).stroke();

                    // --- 4. Technical Labels ---
                    const tierText = new PIXI.Text({
                        text: `SYST_LVL::00${REGIONS[id].tierLimit}`,
                        style: { fontFamily: 'Share Tech Mono, monospace', fontSize: isMobile() ? 8 : 10, fill: color }
                    });
                    tierText.alpha = 0.4;
                    tierText.x = x + 15;
                    tierText.y = y + h - 25;
                    regionsLayer.addChild(tierText);

                    const coordText = new PIXI.Text({
                        text: `COORD::${REGIONS[id].coordinates.x}.${REGIONS[id].coordinates.y}`,
                        style: { fontFamily: 'Share Tech Mono, monospace', fontSize: isMobile() ? 8 : 10, fill: color }
                    });
                    coordText.alpha = 0.4;
                    coordText.x = x + w - 120;
                    coordText.y = y + h - 25;
                    regionsLayer.addChild(coordText);
                };

                regionsLayer.removeChildren();
                sortedRegionIds.forEach((id, index) => {
                    const region = REGIONS[id];
                    const spacing = isMobile() ? 50 : 100; // Уменьшенные отступы на мобильных
                    const y = index * REGION_HEIGHT + spacing;
                    const color = id === RegionId.RUST_VALLEY ? 0x38BDF8 :
                        id === RegionId.CRYSTAL_WASTES ? 0xA855F7 :
                            id === RegionId.IRON_GATES ? 0xEAB308 :
                                id === RegionId.MAGMA_CORE ? 0xEF4444 : 0x8B5CF6;

                    // Primary Frame
                    const area = new PIXI.Graphics();
                    area.setStrokeStyle({ width: 2, color: color, alpha: 0.3 });
                    area.rect(50, y, width - 100, REGION_HEIGHT - 20);
                    area.fill({ color: 0x000000, alpha: 0.01 });
                    area.stroke();

                    // Clip Mask to prevent overflow (v8 syntax)
                    const mask = new PIXI.Graphics();
                    mask.rect(50, y, width - 100, REGION_HEIGHT - 20);
                    mask.fill(0xFFFFFF);
                    area.mask = mask;
                    regionsLayer.addChild(mask);

                    // Technical Corners
                    area.setStrokeStyle({ width: 3, color: color, alpha: 0.8 });
                    const gap = 20;
                    // Top-left
                    area.moveTo(50, y + gap).lineTo(50, y).lineTo(50 + gap, y).stroke();
                    // Top-right
                    area.moveTo(width - 50 - gap, y).lineTo(width - 50, y).lineTo(width - 50, y + gap).stroke();
                    // Bottom-left
                    area.moveTo(50, y + REGION_HEIGHT - 20 - gap).lineTo(50, y + REGION_HEIGHT - 20).lineTo(50 + gap, y + REGION_HEIGHT - 20).stroke();
                    // Bottom-right
                    area.moveTo(width - 50 - gap, y + REGION_HEIGHT - 20).lineTo(width - 50, y + REGION_HEIGHT - 20).lineTo(width - 50, y + REGION_HEIGHT - 20 - gap).stroke();

                    // Render Satellite Image (if loaded)
                    const texture = texturesRef.current[id];
                    if (texture) {
                        const sprite = new PIXI.Sprite(texture);
                        sprite.anchor.set(0.5);
                        sprite.x = 50 + (width - 100) / 2;
                        sprite.y = y + (REGION_HEIGHT - 20) / 2;

                        // Cover scaling logic (3:2 source aspect ratio)
                        const targetW = width - 100;
                        const targetH = REGION_HEIGHT - 20;
                        const scale = Math.max(targetW / texture.width, targetH / texture.height);
                        sprite.scale.set(scale);
                        sprite.alpha = 0.8; // High visibility for satellite data

                        area.addChild(sprite);
                    }

                    // Render Dynamic Content
                    drawRegionContent(area, id, 50, y, width - 100, REGION_HEIGHT - 20, color);

                    area.interactive = true;
                    area.cursor = 'pointer';
                    area.on('pointerup', () => onRegionSelect(id));

                    const labelText = new PIXI.Text({
                        text: `${t(region.name, lang).toUpperCase()}`,
                        style: {
                            fontFamily: 'Share Tech Mono, monospace',
                            fontSize: isMobile() ? 14 : 18, // Уменьшенный шрифт на мобильных
                            fill: color,
                            fontWeight: '900',
                            letterSpacing: isMobile() ? 2 : 4, // Уменьшенный letter-spacing на мобильных
                            dropShadow: { color: 0x000000, alpha: 0.8, distance: 2, blur: 4 }
                        }
                    });
                    labelText.x = 80;
                    labelText.y = y + 30;

                    regionsLayer.addChild(area);
                    regionsLayer.addChild(labelText);
                });
            };

            redrawAll();
            app.renderer.on('resize', redrawAll);

            // Interaction
            let isDragging = false;
            let lastY = 0;
            let scrollY = 0;

            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;

            app.stage.on('pointerdown', (e) => {
                isDragging = true;
                lastY = e.global.y;
            });

            app.stage.on('pointermove', (e) => {
                if (isDragging) {
                    const dy = e.global.y - lastY;
                    scrollY += dy;
                    const maxScroll = -(sortedRegionIds.length * REGION_HEIGHT - app.screen.height + 200);
                    scrollY = Math.min(0, Math.max(maxScroll, scrollY));
                    mainScrollContainer.y = scrollY;
                    lastY = e.global.y;
                }
            });

            app.stage.on('pointerup', () => isDragging = false);
            app.stage.on('pointerupoutside', () => isDragging = false);

            const wheelHandler = (e: WheelEvent) => {
                e.preventDefault();
                scrollY -= e.deltaY;
                const maxScroll = -(sortedRegionIds.length * REGION_HEIGHT - app.screen.height + 200);
                scrollY = Math.min(0, Math.max(maxScroll, scrollY));
                mainScrollContainer.y = scrollY;
            };
            app.canvas.addEventListener('wheel', wheelHandler, { passive: false });

            // Ticker: Sync Indicator
            app.ticker.add(() => {
                if (!isMounted || !app.renderer) return;
                const { activeRegion } = dataRef.current;
                const activeIdx = sortedRegionIds.indexOf(activeRegion);

                if (activeIdx !== -1) {
                    if (!indicatorRef.current) {
                        indicatorRef.current = indicatorPoolRef.current!.get();
                        interactiveLayer.addChild(indicatorRef.current);
                    }
                    const y = activeIdx * REGION_HEIGHT + 100 + (REGION_HEIGHT / 2);
                    indicatorRef.current.x = app.screen.width / 2;
                    indicatorRef.current.y = y;
                    indicatorRef.current.scale.set(1 + Math.sin(Date.now() / 200) * 0.1);
                } else if (indicatorRef.current) {
                    interactiveLayer.removeChild(indicatorRef.current);
                    indicatorPoolRef.current!.release(indicatorRef.current);
                    indicatorRef.current = null;
                }
            });
        };

        initApp();

        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.destroy(true, { children: true });
                appRef.current = null;
                indicatorPoolRef.current?.destroy();
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-900/40">
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10" />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-cyan-400/50 uppercase tracking-widest">
                System_Link_Active // Lithosphere_Ver_5.1
            </div>
        </div>
    );
};
