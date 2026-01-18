/**
 * Isometric Math Service
 * 
 * Handles coordinate conversions between:
 * - Grid Coordinates (x, y) - Logical game position (e.g., Region index, Base location)
 * - Isometric Coordinates (isoX, isoY) - Screen rendering position
 * 
 * Projection: 2:1 Dimetric (Standard Pixel Art Iso)
 * Angle: ~26.565 degrees (atan(0.5))
 */

export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;
export const ORIGIN_X = 0; // Will be offset by camera
export const ORIGIN_Y = 0;

/**
 * Convert Grid coordinates to Isometric Screen coordinates
 * @param gridX Logical X
 * @param gridY Logical Y
 * @returns {x, y} Screen position relative to map origin
 */
export function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
    return {
        x: (gridX - gridY) * (TILE_WIDTH / 2),
        y: (gridX + gridY) * (TILE_HEIGHT / 2)
    };
}

/**
 * Convert Isometric Screen coordinates to Grid coordinates
 * @param screenX Screen X relative to map origin
 * @param screenY Screen Y relative to map origin
 * @returns {x, y} Approximate Grid position (floats)
 */
export function isoToGrid(screenX: number, screenY: number): { x: number; y: number } {
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    // Algebra to solve for gridX/gridY:
    // x = (gX - gY) * hW  =>  x/hW = gX - gY
    // y = (gX + gY) * hH  =>  y/hH = gX + gY
    // 
    // y/hH + x/hW = 2*gX  => gX = (y/hH + x/hW) / 2
    // y/hH - x/hW = 2*gY  => gY = (y/hH - x/hW) / 2

    return {
        x: (screenY / halfH + screenX / halfW) / 2,
        y: (screenY / halfH - screenX / halfW) / 2
    };
}

/**
 * Calculate Z-Index for depth sorting
 * In isometric, depth depends on X + Y (lower on screen = closer)
 */
export function getDepth(gridX: number, gridY: number): number {
    return gridX + gridY;
}
