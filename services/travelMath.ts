/**
 * Travel System — константы и утилиты для перемещения между регионами
 * 
 * Fuel efficiency, затраты топлива, формулы расчёта
 */

import { ResourceType } from '../types';

/**
 * FUEL EFFICIENCY TABLE
 * Множители эффективности для разных типов топлива
 * 
 * Формула: actualDistance = baseDistance / efficiency
 * Пример: 1000 единиц пути с oil (×1.5) = 667 единиц топлива
 */
export const FUEL_EFFICIENCY: Record<ResourceType, number> = {
    // Углеводороды (MVP)
    coal: 1.0,      // Базовая эффективность
    oil: 1.5,       // +50% дальность
    gas: 2.0,       // +100% дальность (самый чистый)

    // Ядерное топливо (уже есть в игре)
    uranium: 5.0,   // ×5 дальность

    // Остальные ресурсы не используются как топливо
    clay: 0,
    stone: 0,
    copper: 0,
    iron: 0,
    silver: 0,
    gold: 0,
    titanium: 0,
    nanoSwarm: 0,
    ancientTech: 0,
    rubies: 0,
    emeralds: 0,
    diamonds: 0
};

/**
 * Список доступных видов топлива для UI dropdown
 */
export const FUEL_TYPES = ['coal', 'oil', 'gas', 'uranium'] as const;
export type FuelType = typeof FUEL_TYPES[number];

/**
 * Базовый множитель расхода топлива (калибровка баланса)
 * 1.0 = 1 единица топлива на 1 единицу расстояния для coal
 */
export const FUEL_BASE_COST_MULTIPLIER = 0.1;  // 0.1 coal per unit distance

/**
 * Рассчитывает затраты топлива для перемещения
 * 
 * @param distance - Расстояние между регионами
 * @param fuelType - Тип используемого топлива
 * @param cargoRatio - Отношение текущего груза к максимальной вместимости (0.0 - 1.0)
 * @returns Количество единиц топлива
 * 
 * @example
 * calculateFuelCost(1000, 'coal', 0.5)
 * // Base: 1000 × 0.1 = 100
 * // Efficiency: 100 / 1.0 = 100
 * // Cargo penalty: 100 × (1 + 0.5 × 0.5) = 125 coal
 */
export function calculateFuelCost(
    distance: number,
    fuelType: ResourceType,
    cargoRatio: number = 0
): number {
    const efficiency = FUEL_EFFICIENCY[fuelType] || 0;

    if (efficiency === 0) {
        console.warn(`[travelMath] Invalid fuel type: ${fuelType}`);
        return Infinity;  // Невозможно использовать
    }

    // Базовая стоимость
    const baseCost = distance * FUEL_BASE_COST_MULTIPLIER;

    // Делим на efficiency (чем выше efficiency, тем меньше топлива нужно)
    const costAfterEfficiency = baseCost / efficiency;

    // Штраф за груз: +50% при полном грузе
    const cargoPenalty = 1 + (cargoRatio * 0.5);

    return Math.ceil(costAfterEfficiency * cargoPenalty);
}

/**
 * Проверяет, достаточно ли топлива для перемещения
 * 
 * @param availableFuel - Доступное количество топлива
 * @param requiredFuel - Требуемое количество
 * @returns true если достаточно
 */
export function hasSufficientFuel(availableFuel: number, requiredFuel: number): boolean {
    return availableFuel >= requiredFuel;
}

/**
 * Получает локализованное название типа топлива
 */
export function getFuelLabel(fuelType: ResourceType): string {
    switch (fuelType) {
        case 'coal': return 'Уголь';
        case 'oil': return 'Нефть';
        case 'gas': return 'Газ';
        case 'uranium': return 'Уран';
        default: return fuelType;
    }
}
