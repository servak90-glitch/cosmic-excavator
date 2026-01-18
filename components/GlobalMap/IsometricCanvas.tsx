import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { gridToIso, TILE_WIDTH, TILE_HEIGHT } from '../../services/isometricMath';
import { RegionId, PlayerBase, Caravan } from '../../types';
import { TextureGenerator } from '../../services/TextureGenerator';

// --- TEXTURE GENERATORS ---
// Moved to services/TextureGenerator.ts

interface IsometricCanvasProps {
    regions: RegionId[];
    activeRegion: RegionId;
    bases: PlayerBase[];     // Prop for Bases
    caravans: Caravan[];     // Prop for Caravans
    onRegionSelect: (id: RegionId) => void;
}

const REGION_POSITIONS: Record<RegionId, { x: number, y: number }> = {
    [RegionId.RUST_VALLEY]: { x: 0, y: 0 },
    [RegionId.CRYSTAL_WASTES]: { x: -2, y: -2 },
    [RegionId.IRON_GATES]: { x: 2, y: -2 },
    [RegionId.MAGMA_CORE]: { x: -2, y: 2 },
    [RegionId.VOID_CHASM]: { x: 2, y: 2 }
};

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({ regions, activeRegion, bases, caravans, onRegionSelect }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const spritesRef = useRef<{
        bases: PIXI.Container,
        caravans: PIXI.Container,
        map: PIXI.Container
    } | null>(null);

    // Refs for data access in loop
    const dataRef = useRef({ bases, caravans });
    useEffect(() => { dataRef.current = { bases, caravans }; }, [bases, caravans]);

    useEffect(() => {
        if (!containerRef.current) return;

        const initApp = async () => {
            const app = new PIXI.Application();
            await app.init({
                resizeTo: containerRef.current!,
                backgroundAlpha: 0,
                antialias: true
            });

            if (!containerRef.current) { app.destroy(); return; }
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Generate Textures
            const generator = new TextureGenerator(app);
            const tileTextures: Record<string, PIXI.Texture> = {};
            const baseTextures: Record<string, PIXI.Texture> = {
                outpost: generator.generateBaseTexture('outpost'),
                camp: generator.generateBaseTexture('camp'),
                station: generator.generateBaseTexture('station'),
            };

            // Generate Region Textures
            Object.keys(REGION_POSITIONS).forEach((id) => {
                tileTextures[id] = generator.generateRegionTexture(id as RegionId);
            });

            // Containers
            const mapContainer = new PIXI.Container();
            const terrainLayer = new PIXI.Container();
            const objLayer = new PIXI.Container(); // Bases
            const unitLayer = new PIXI.Container(); // Caravans

            mapContainer.addChild(terrainLayer);
            mapContainer.addChild(objLayer);
            mapContainer.addChild(unitLayer);

            // Enable Depth Sorting
            objLayer.sortableChildren = true;
            unitLayer.sortableChildren = true;

            mapContainer.x = app.screen.width / 2 - TILE_WIDTH / 2;
            mapContainer.y = app.screen.height / 2;
            app.stage.addChild(mapContainer);

            // --- INTERACTION: PAN & ZOOM ---
            app.stage.eventMode = 'static';
            app.stage.hitArea = app.screen;

            let isDragging = false;
            let lastPos = { x: 0, y: 0 };

            app.stage.on('pointerdown', (e) => {
                isDragging = true;
                lastPos = { x: e.global.x, y: e.global.y };
            });

            app.stage.on('pointermove', (e) => {
                if (isDragging) {
                    const dx = e.global.x - lastPos.x;
                    const dy = e.global.y - lastPos.y;
                    mapContainer.x += dx;
                    mapContainer.y += dy;
                    lastPos = { x: e.global.x, y: e.global.y };
                }
            });

            app.stage.on('pointerup', () => { isDragging = false; });
            app.stage.on('pointerupoutside', () => { isDragging = false; });

            // Zoom (Wheel)
            const wheelHandler = (e: WheelEvent) => {
                e.preventDefault();
                const scaleFactor = 1.1;
                const newScale = e.deltaY < 0 ? mapContainer.scale.x * scaleFactor : mapContainer.scale.x / scaleFactor;
                // Clamp Zoom
                if (newScale > 0.5 && newScale < 3.0) {
                    mapContainer.scale.set(newScale);
                }
            };
            app.canvas.addEventListener('wheel', wheelHandler, { passive: false });

            spritesRef.current = { bases: objLayer, caravans: unitLayer, map: mapContainer };

            // Render Static Terrain (Regions)
            Object.entries(REGION_POSITIONS).forEach(([id, pos]) => {
                const regionId = id as RegionId;
                const iso = gridToIso(pos.x, pos.y);
                const sprite = new PIXI.Sprite(tileTextures[regionId]);
                sprite.x = iso.x;
                sprite.y = iso.y;
                sprite.interactive = true;
                sprite.cursor = 'pointer';
                sprite.label = regionId;

                sprite.on('pointerdown', () => onRegionSelect(regionId));
                sprite.on('pointerover', () => {
                    sprite.alpha = 1.0;
                    sprite.scale.set(1.05);
                    sprite.tint = 0xFFFFFF;
                });
                sprite.on('pointerout', () => {
                    sprite.alpha = 1.0;
                    sprite.scale.set(1.0);
                    // Dim inactive regions slightly
                    // sprite.tint = activeRegion === regionId ? 0xFFFFFF : 0xAAAAAA;
                });

                terrainLayer.addChild(sprite);

                // Region Label (High Tech Look)
                const labelContainer = new PIXI.Container();
                labelContainer.x = iso.x + TILE_WIDTH / 2;
                labelContainer.y = iso.y - 10;

                const text = new PIXI.Text({
                    text: regionId.replace('_', ' '),
                    style: {
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fill: 0x00FFFF,
                        dropShadow: {
                            color: 0x000000,
                            distance: 2,
                            blur: 2,
                            alpha: 0.5
                        }
                    }
                });
                text.anchor.set(0.5); // Center text
                labelContainer.addChild(text);

                terrainLayer.addChild(labelContainer);
            });

            // Game Loop
            app.ticker.add(() => {
                const { bases, caravans } = dataRef.current;
                const now = Date.now();

                // --- RENDER BASES ---
                objLayer.removeChildren();
                bases.forEach(base => {
                    const regPos = REGION_POSITIONS[base.regionId];
                    if (regPos) {
                        const iso = gridToIso(regPos.x, regPos.y);
                        // Center on tile
                        const centerX = iso.x + TILE_WIDTH / 2;
                        const centerY = iso.y + TILE_HEIGHT / 2;

                        let tex = baseTextures[base.type] || baseTextures['outpost'];
                        const sprite = new PIXI.Sprite(tex);

                        sprite.anchor.set(0.5, 1.0); // Bottom center anchor for buildings
                        sprite.x = centerX;
                        sprite.y = centerY + 10; // Adjust for 3D depth

                        // Z-Index based on Y position for depth sorting
                        sprite.zIndex = centerY;

                        // Add Base Label
                        const label = new PIXI.Text({
                            text: `BASE (${base.type})`,
                            style: {
                                fontSize: 10,
                                fill: 0xFFFF00,
                                dropShadow: {
                                    color: 0x000000,
                                    distance: 1,
                                    alpha: 0.8
                                }
                            }
                        });
                        label.anchor.set(0.5, 1);
                        label.y = -40;
                        sprite.addChild(label);

                        objLayer.addChild(sprite);
                    }
                });

                // --- RENDER CARAVANS ---
                unitLayer.removeChildren();
                caravans.forEach(caravan => {
                    if (caravan.status !== 'in_transit') return;

                    const fromBase = bases.find(b => b.id === caravan.fromBaseId);
                    const toBase = bases.find(b => b.id === caravan.toBaseId);

                    if (fromBase && toBase) {
                        const fromPos = REGION_POSITIONS[fromBase.regionId];
                        const toPos = REGION_POSITIONS[toBase.regionId];

                        if (fromPos && toPos) {
                            const totalTime = caravan.arrivalTime - caravan.departureTime;
                            const elapsed = now - caravan.departureTime;
                            const progress = Math.min(1, Math.max(0, elapsed / totalTime));

                            // Lerp Grid Coords
                            const curX = fromPos.x + (toPos.x - fromPos.x) * progress;
                            const curY = fromPos.y + (toPos.y - fromPos.y) * progress;

                            const iso = gridToIso(curX, curY);

                            // Enhanced Caravan Sprite (Wobble Effect for Movement)
                            const bounce = Math.sin(now / 100 * Math.PI) * 2;

                            const sprite = new PIXI.Graphics();
                            // Body
                            sprite.rect(-12, -8, 24, 12);
                            sprite.fill(0x00FF00); // Green Truck
                            sprite.stroke({ width: 1, color: 0xFFFFFF });
                            // Wheels
                            sprite.circle(-8, 4, 3);
                            sprite.circle(8, 4, 3);
                            sprite.fill(0x000000);

                            sprite.x = iso.x + TILE_WIDTH / 2;
                            sprite.y = iso.y + TILE_HEIGHT / 2 + bounce - 5; // -5 to float slightly above ground

                            // Depth Sort
                            sprite.zIndex = sprite.y;

                            // Label
                            // const label = new PIXI.Text({ text: '🚛', style: { fontSize: 10 } });
                            // label.y = -15;
                            // label.x = -5;
                            // sprite.addChild(label);

                            unitLayer.addChild(sprite);
                        }
                    }
                });

                // Pixi sort
                objLayer.sortChildren();
                unitLayer.sortChildren();

                // Floating Animation for whole map
                mapContainer.y = app.screen.height / 2 + Math.sin(now / 2000) * 5;
            });
        };

        if (!appRef.current) initApp();

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full relative" />;
};
