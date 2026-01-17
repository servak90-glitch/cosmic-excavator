/**
 * Utility функции для работы с регионами Global Map
 * 
 * - Расчёт расстояний между регионами
 * - Динамические цвета зон (зависят от player level)
 * - Получение региона по ID
 */

import { Region, RegionId, ZoneColor } from '../types';
import { REGIONS } from '../constants/regions';

/**
 * Рассчитывает расстояние между двумя регионами
 * Использует формулу Евклидова расстояния: √((x2-x1)² + (y2-y1)²)
 * 
 * @param from - ID начального региона
 * @param to - ID конечного региона
 * @returns Расстояние в единицах карты
 * 
 * @example
 * calculateDistance(RegionId.RUST_VALLEY, RegionId.CRYSTAL_WASTES)
 * // returns 1000 (прямое расстояние на север)
 */
export function calculateDistance(from: RegionId, to: RegionId): number {
    const regionFrom = REGIONS[from];
    const regionTo = REGIONS[to];

    if (!regionFrom || !regionTo) {
        console.warn(`[regionMath] Invalid region ID: from=${from}, to=${to}`);
        return 0;
    }

    const dx = regionTo.coordinates.x - regionFrom.coordinates.x;
    const dy = regionTo.coordinates.y - regionFrom.coordinates.y;

    return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/**
 * Определяет динамический цвет зоны региона на основе player level
 * 
 * Логика:
 * - playerLevel >= recommended + 20 → GREEN (легко)
 * - playerLevel >= recommended → YELLOW (умеренно)
 * - playerLevel < recommended → RED (опасно)
 * 
 * @param region - Регион для проверки
 * @param playerLevel - Текущий уровень игрока
 * @returns Цвет зоны (green/yellow/red)
 * 
 * @example
 * const magmaCore = REGIONS[RegionId.MAGMA_CORE]; // recommended level: 50
 * getRegionColor(magmaCore, 30); // returns 'red' (опасно!)
 * getRegionColor(magmaCore, 50); // returns 'yellow' (умеренно)
 * getRegionColor(magmaCore, 70); // returns 'green' (легко)
 */
export function getRegionColor(region: Region, playerLevel: number): ZoneColor {
    const { recommendedLevel } = region;

    // Игрок на 20+ уровней выше → зелёная
    if (playerLevel >= recommendedLevel + 20) return 'green';

    // Игрок на рекомендуемом уровне → жёлтая
    if (playerLevel >= recommendedLevel) return 'yellow';

    // Игрок ниже рекомендуемого → красная
    return 'red';
}

/**
 * Получает регион по ID (с проверкой существования)
 * 
 * @param id - ID региона
 * @returns Объект региона или null если не найден
 */
export function getRegionById(id: RegionId): Region | null {
    const region = REGIONS[id];

    if (!region) {
        console.warn(`[regionMath] Region not found: ${id}`);
        return null;
    }

    return region;
}

/**
 * Получает эмодзи-иконку цвета зоны для UI
 * 
 * @param color - Цвет зоны
 * @returns Эмодзи иконка
 */
export function getZoneColorEmoji(color: ZoneColor): string {
    switch (color) {
        case 'green': return '🟢';
        case 'yellow': return '🟡';
        case 'red': return '🔴';
    }
}

/**
 * Получает локализованное название цвета зоны
 * 
 * @param color - Цвет зоны
 * @returns Название на русском
 */
export function getZoneColorLabel(color: ZoneColor): string {
    switch (color) {
        case 'green': return 'ЛЕГКО';
        case 'yellow': return 'УМЕРЕННО';
        case 'red': return 'ОПАСНО';
    }
}
