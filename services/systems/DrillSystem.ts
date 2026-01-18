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
const FUEL_EFFICIENCY: Record<string, number> = {
    coal: 1.0,  // Базовая эффективность
    oil: 1.5,   // На 50% эффективнее угля
    gas: 2.0,   // В 2 раза эффективнее угля
};

/**
 * Выбор лучшего доступного топлива (приоритет: gas > oil > coal)
 * Возвращает { fuelType, efficiency } или null если топливо закончилось
 */
function selectBestAvailableFuel(resources: Resources): { fuelType: keyof Resources; efficiency: number } | null {
    if (resources.gas > 0) {
        return { fuelType: 'gas', efficiency: FUEL_EFFICIENCY.gas };
    }
    if (resources.oil > 0) {
        return { fuelType: 'oil', efficiency: FUEL_EFFICIENCY.oil };
    }
    if (resources.coal > 0) {
        return { fuelType: 'coal', efficiency: FUEL_EFFICIENCY.coal };
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
    dt: number
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

        if (!fuel) {
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

        // Итоговая мощность бурения
        let drillPower = stats.totalSpeed * speedPenalty * speedMult;
        if (state.isOverdrive) drillPower *= 100;

        // === ПОТРЕБЛЕНИЕ ТОПЛИВА ===
        // Балансировка: 1 единица угля на 1 метр бурения при базовой эффективности
        const fuelCost = (drillPower * FUEL_CONSUMPTION_RATE * dt * 10) / fuel.efficiency;
        resourceChanges[fuel.fuelType] = (resourceChanges[fuel.fuelType] || 0) - fuelCost;

        // Увеличение глубины (только если не выбран конкретный биом)
        if (!state.selectedBiome) {
            depth += drillPower * dt;
        }

        // Добыча ресурсов
        const currentBiome = state.selectedBiome
            ? BIOMES.find(b => b.name === state.selectedBiome) || BIOMES[0]
            : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

        const resToAdd = drillPower * 0.3 * resMult * dt;
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

        // Floating Text - ограничиваем частоту появления через dt
        if (resToAdd >= 1 || (resToAdd > 0 && Math.random() < 0.1 * dt * 60)) {
            events.push({
                type: 'TEXT',
                position: 'CENTER',
                text: `+${resToAdd >= 10 ? Math.floor(resToAdd) : resToAdd.toFixed(1)} ${currentBiome.resource.toUpperCase()}`,
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
