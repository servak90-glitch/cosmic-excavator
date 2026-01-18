
import * as PIXI from 'pixi.js';
import { RegionId, PlayerBase, Caravan } from '../types';
import { TILE_WIDTH, TILE_HEIGHT } from './isometricMath';

// Colors
const PALETTES: Record<RegionId, { base: number, light: number, dark: number, detail: number }> = {
    [RegionId.RUST_VALLEY]: { base: 0xA0522D, light: 0xCD853F, dark: 0x8B4513, detail: 0xD2691E },
    [RegionId.CRYSTAL_WASTES]: { base: 0x248f8f, light: 0x00CED1, dark: 0x008B8B, detail: 0xE0FFFF },
    [RegionId.IRON_GATES]: { base: 0x708090, light: 0x778899, dark: 0x2F4F4F, detail: 0xB0C4DE },
    [RegionId.MAGMA_CORE]: { base: 0x8B0000, light: 0xFF4500, dark: 0x800000, detail: 0xFFD700 }, // Gold for lava glow
    [RegionId.VOID_CHASM]: { base: 0x4B0082, light: 0x8A2BE2, dark: 0x191970, detail: 0x9370DB }
};

interface TextureOptions {
    width: number;
    height: number;
}

export class TextureGenerator {
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public generateRegionTexture(regionId: RegionId): PIXI.Texture {
        const graphics = new PIXI.Graphics();
        const palette = PALETTES[regionId];

        // Base Tile (Diamond)
        const w = TILE_WIDTH;
        const h = TILE_HEIGHT;

        // Draw Thickness (Sides) - creates 3D effect
        const thickness = 10;

        // 1. Sidewalls (Darker)
        graphics.beginPath();
        graphics.moveTo(0, h / 2);
        graphics.lineTo(w / 2, h);
        graphics.lineTo(w / 2, h + thickness);
        graphics.lineTo(0, h / 2 + thickness);
        graphics.closePath();
        graphics.fill(palette.dark);

        graphics.beginPath();
        graphics.moveTo(w / 2, h);
        graphics.lineTo(w, h / 2);
        graphics.lineTo(w, h / 2 + thickness);
        graphics.lineTo(w / 2, h + thickness);
        graphics.closePath();
        graphics.fill(palette.dark);

        // 2. Top Surface (Base Color)
        graphics.beginPath();
        graphics.moveTo(0, h / 2);
        graphics.lineTo(w / 2, 0);
        graphics.lineTo(w, h / 2);
        graphics.lineTo(w / 2, h);
        graphics.closePath();
        graphics.fill(palette.base);

        // 3. Details based on Region
        this.drawRegionDetails(graphics, regionId, palette, w, h);

        // 4. Highlight Edge
        graphics.beginPath();
        graphics.moveTo(0, h / 2);
        graphics.lineTo(w / 2, 0);
        graphics.lineTo(w, h / 2);
        graphics.stroke({ width: 2, color: 0xFFFFFF, alpha: 0.2 });

        return this.app.renderer.generateTexture(graphics);
    }

    private drawRegionDetails(g: PIXI.Graphics, id: RegionId, palette: { light: number, dark: number, detail: number }, w: number, h: number) {
        switch (id) {
            case RegionId.RUST_VALLEY:
                // Craters and Rocks
                for (let i = 0; i < 5; i++) {
                    const cx = w * 0.2 + Math.random() * w * 0.6;
                    const cy = h * 0.2 + Math.random() * h * 0.6;
                    const size = 2 + Math.random() * 4;

                    // Crater
                    g.circle(cx, cy, size);
                    g.fill(palette.dark);
                }
                break;
            case RegionId.CRYSTAL_WASTES:
                // Crystals (Triangles)
                for (let i = 0; i < 6; i++) {
                    const cx = w * 0.2 + Math.random() * w * 0.6;
                    const cy = h * 0.2 + Math.random() * h * 0.6;
                    const hSize = 4 + Math.random() * 8;

                    g.beginPath();
                    g.moveTo(cx, cy);
                    g.lineTo(cx - 3, cy - 2);
                    g.lineTo(cx, cy - hSize);
                    g.lineTo(cx + 3, cy - 2);
                    g.closePath();
                    g.fill(palette.detail);
                }
                break;
            case RegionId.MAGMA_CORE:
                // Lava Cracks
                g.moveTo(w * 0.3, h * 0.5);
                g.lineTo(w * 0.7, h * 0.5);
                g.stroke({ width: 2, color: palette.detail });
                break;
            case RegionId.IRON_GATES:
                // Metal Plates
                g.rect(w * 0.3, h * 0.3, w * 0.2, h * 0.2);
                g.fill(palette.light);
                g.rect(w * 0.5, h * 0.5, w * 0.2, h * 0.2);
                g.fill(palette.light);
                break;
            case RegionId.VOID_CHASM:
                // Void Particles
                for (let i = 0; i < 8; i++) {
                    const cx = w * 0.1 + Math.random() * w * 0.8;
                    const cy = h * 0.1 + Math.random() * h * 0.8;
                    g.circle(cx, cy, 2);
                    g.fill(palette.detail);
                }
                break;
        }
    }

    public generateBaseTexture(type: 'outpost' | 'station' | 'camp' | 'citadel'): PIXI.Texture {
        const graphics = new PIXI.Graphics();
        const w = 40;
        const h = 40; // visual height

        // Shadow using ellipse
        graphics.ellipse(0, 0, 20, 10);
        graphics.fill({ color: 0x000000, alpha: 0.4 });

        // Building Offset
        const yOff = -10;

        switch (type) {
            case 'outpost':
                // Dome shape
                graphics.beginPath();
                graphics.arc(0, yOff - 10, 15, Math.PI, 0); // Top dome
                graphics.lineTo(15, yOff);
                graphics.lineTo(-15, yOff);
                graphics.closePath();
                graphics.fill(0xCCCCCC);
                graphics.stroke({ width: 1, color: 0x666666 });
                // Door
                graphics.rect(-4, yOff - 8, 8, 8);
                graphics.fill(0x444444);
                break;

            case 'camp':
                // Tents
                graphics.beginPath();
                graphics.moveTo(-10, yOff);
                graphics.lineTo(0, yOff - 20);
                graphics.lineTo(10, yOff);
                graphics.closePath();
                graphics.fill(0xD2B48C);
                break;

            case 'station':
                // Tower
                graphics.rect(-10, yOff - 40, 20, 40);
                graphics.fill(0x708090);
                graphics.stroke({ width: 1, color: 0x00FFFF }); // Sci-fi outline
                // Antenna
                graphics.moveTo(0, yOff - 40);
                graphics.lineTo(0, yOff - 55);
                graphics.stroke({ width: 2, color: 0xAAAAAA });
                // Light
                graphics.circle(0, yOff - 55, 2);
                graphics.fill(0xFF0000);
                break;
        }

        return this.app.renderer.generateTexture(graphics);
    }
}
