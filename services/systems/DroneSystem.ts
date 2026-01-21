/**
 * DroneSystem — управление дронами
 * 
 * Отвечает за:
 * - Ремонтный дрон
 * - Охлаждающий дрон
 */

import { GameState, Stats, DroneType } from '../../types';

export interface DroneUpdate {
    integrity?: number;
    heat?: number;
}

/**
 * Обработка активных дронов
 */
export function processDrones(
    state: GameState,
    stats: Stats,
    currentIntegrity: number,
    currentHeat: number
): DroneUpdate {
    let integrity = currentIntegrity;
    let heat = currentHeat;
    let hasChanges = false;

    // Ремонтный дрон
    if (state.activeDrones.includes(DroneType.REPAIR)) {
        const lvl = state.droneLevels[DroneType.REPAIR] || 0;
        const baseRepair = 0.05 * lvl;
        const repairAmount = baseRepair * stats.droneEfficiency; // Применяем droneEfficiency
        if (integrity < stats.integrity) {
            integrity = Math.min(stats.integrity, integrity + repairAmount);
            hasChanges = true;
        }
    }

    // Охлаждающий дрон
    if (state.activeDrones.includes(DroneType.COOLER) && heat > stats.ambientHeat) {
        const lvl = state.droneLevels[DroneType.COOLER] || 0;
        const baseCool = 0.1 * lvl;
        const coolAmount = baseCool * stats.droneEfficiency; // Применяем droneEfficiency
        heat = Math.max(stats.ambientHeat, heat - coolAmount);
        hasChanges = true;
    }

    return hasChanges
        ? { integrity, heat }
        : {};
}

/**
 * Пассивная регенерация HP
 */
export function processRegeneration(
    state: GameState,
    stats: Stats,
    currentIntegrity: number
): number {
    if (stats.regen > 0 && currentIntegrity < stats.integrity && !state.isBroken) {
        return Math.min(stats.integrity, currentIntegrity + (stats.regen * 0.4));
    }
    return currentIntegrity;
}
