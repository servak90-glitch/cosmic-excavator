/**
 * DrillSystem — управление бурением и добычей
 * 
 * Отвечает за:
 * - Увеличение глубины
 * - Добыча ресурсов по биому
 * - Эффективность бурения
 * - Разблокировка контента по глубине
 * - **[NEW v4.0]** Потребление топлива при бурении
 */

import { GameState, VisualEvent, Stats, ResourceType, Resources } from '../../types';
import { BIOMES } from '../../constants';
import { ResourceChanges } from './types';

// === ТОПЛИВНАЯ СИСТЕМА ===

/**
 * Скорость потребления топлива (% от drillPower)
 * 0.01 = 1% drillPower расходуется как топливо каждый тик
 */
const FUEL_CONSUMPTION_RATE = 0.01;

/**
 * Эффективность топлива (как долго 1 единица топлива работает)
 * Чем выше значение, тем МЕНЬШЕ расходуется топлива
 */
const FUEL_EFFICIENCY: Partial<Record<ResourceType, number>> = {
    [ResourceType.COAL]: 1.0,  // Базовая эффективность
    [ResourceType.OIL]: 1.5,   // На 50% эффективнее угля
    [ResourceType.GAS]: 2.0,   // В 2 раза эффективнее угля
};

/**
 * Выбор лучшего доступного топлива (приоритет: gas > oil > coal)
 * Возвращает { fuelType, efficiency } или null если топливо закончилось
 */
function selectBestAvailableFuel(resources: Resources): { fuelType: ResourceType; efficiency: number } | null {
    if (resources[ResourceType.GAS] > 0) {
        return { fuelType: ResourceType.GAS, efficiency: FUEL_EFFICIENCY[ResourceType.GAS]! };
    }
    if (resources[ResourceType.OIL] > 0) {
        return { fuelType: ResourceType.OIL, efficiency: FUEL_EFFICIENCY[ResourceType.OIL]! };
    }
    if (resources[ResourceType.COAL] > 0) {
        return { fuelType: ResourceType.COAL, efficiency: FUEL_EFFICIENCY[ResourceType.COAL]! };
    }
    return null; // Топливо закончилось
}


export interface DrillUpdate {
    depth: number;
    forgeUnlocked: boolean;
    cityUnlocked: boolean;
    skillsUnlocked: boolean;
    storageLevel: number;
}

/**
 * Обработка бурения
 */
export function processDrilling(
    state: GameState,
    stats: Stats,
    activeEffects: GameState['activeEffects'],
    isDrilling: boolean,
    isOverheated: boolean,
    dt: number,
    activePerks: string[] = []
): { update: DrillUpdate; resourceChanges: ResourceChanges; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    const resourceChanges: ResourceChanges = {};

    let depth = state.depth;
    let { forgeUnlocked, cityUnlocked, skillsUnlocked, storageLevel } = state;

    // Разблокировка контента по глубине
    if (!forgeUnlocked && depth >= 50) forgeUnlocked = true;
    if (!cityUnlocked && depth >= 200) cityUnlocked = true;
    if (!skillsUnlocked && depth >= 400) skillsUnlocked = true;
    if (storageLevel === 0 && depth >= 600) storageLevel = 1;
    if (storageLevel === 1 && Object.keys(state.inventory).length > 0) storageLevel = 2;

    // Бурение активно
    if (isDrilling && !isOverheated && !state.isBroken && !state.currentBoss) {
        // === ПРОВЕРКА ТОПЛИВА ===
        const fuel = selectBestAvailableFuel(state.resources);
        const isInfiniteFuel = (globalThis as any).gameStore?.getState?.().isInfiniteFuel;

        if (!fuel && !isInfiniteFuel) {
            // Топливо закончилось - блокируем бурение
            events.push({
                type: 'LOG',
                msg: '⚠️ ТОПЛИВО ЗАКОНЧИЛОСЬ! Бурение остановлено. Необходимо coal/oil/gas.',
                color: 'text-red-500 font-bold'
            });

            // Не выполнять бурение
            return {
                update: {
                    depth,
                    forgeUnlocked,
                    cityUnlocked,
                    skillsUnlocked,
                    storageLevel
                },
                resourceChanges,
                events
            };
        }

        // Лог предупреждения при низкой эффективности
        if (stats.drillingEfficiency < 0.5 && Math.random() < 0.02 * dt * 60) {
            events.push({
                type: 'LOG',
                msg: `ОШИБКА: ПЛОТНОСТЬ ПОРОДЫ > ТВЕРДОСТЬ БУРА. ТРЕБУЕТСЯ TIER ${stats.requiredTier}.`,
                color: "text-orange-500 font-mono"
            });
        }

        // Расчёт скорости с учётом твёрдости породы
        const hardness = Math.min(1.0, (depth / 10000));
        const torque = stats.torque / 100;
        const effHardness = Math.max(0, hardness - torque);
        const speedPenalty = Math.max(0.1, 1.0 - effHardness);

        // Модификаторы от эффектов
        let speedMult = 1;
        let resMult = 1;
        activeEffects.forEach(e => {
            if (e.modifiers.drillSpeedMultiplier) speedMult *= e.modifiers.drillSpeedMultiplier;
            if (e.modifiers.resourceMultiplier) resMult *= e.modifiers.resourceMultiplier;
        });

        // Perk: Executive (Corporate Level 10) - Passive generation/extraction x2
        if (activePerks.includes('EXECUTIVE')) {
            resMult *= 2;
        }

        // Итоговая мощность бурения
        let drillPower = stats.totalSpeed * speedPenalty * speedMult;
        if (state.isOverdrive) drillPower *= 100;

        // === ПОТРЕБЛЕНИЕ ТОПЛИВА ===
        // Балансировка: 1 единица угля на 1 метр бурения при базовой эффективности
        const fuelCost = (drillPower * FUEL_CONSUMPTION_RATE * dt * 10) / (fuel?.efficiency || 1);

        if (!isInfiniteFuel && fuel) {
            resourceChanges[fuel.fuelType] = (resourceChanges[fuel.fuelType] || 0) - fuelCost;
        }

        // Увеличение глубины (только если не выбран конкретный биом)
        if (!state.selectedBiome) {
            depth += drillPower * dt;
        }

        // Добыча ресурсов
        const currentBiome = state.selectedBiome
            ? BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === state.selectedBiome) || BIOMES[0]
            : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

        const resToAdd = drillPower * 1.0 * resMult * dt; // Увеличено с 0.3 до 1.0
        resourceChanges[currentBiome.resource] = (resourceChanges[currentBiome.resource] || 0) + resToAdd;

        // [VISUALS] Mining Effects
        if (Math.random() < (0.3 + (drillPower > 10 ? 0.2 : 0)) * dt * 60) {
            events.push({
                type: 'PARTICLE',
                position: 'DRILL_TIP',
                kind: Math.random() > 0.7 ? 'SPARK' : 'DEBRIS',
                color: currentBiome.color,
                count: Math.floor(Math.random() * 3) + 1
            });
        }

        // Floating Text - показываем даже малые значения для фидбека
        if (resToAdd > 0 && Math.random() < 0.2 * dt * 60) {
            events.push({
                type: 'TEXT',
                position: 'CENTER',
                text: `+${resToAdd < 1 ? resToAdd.toFixed(2) : resToAdd < 10 ? resToAdd.toFixed(1) : Math.floor(resToAdd)} ${currentBiome.resource.toUpperCase()}`,
                style: 'RESOURCE'
            });
        }
    }

    return {
        update: {
            depth,
            forgeUnlocked,
            cityUnlocked,
            skillsUnlocked,
            storageLevel
        },
        resourceChanges,
        events
    };
}
