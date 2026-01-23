/**
 * CitySlice — действия связанные с городом
 */

import { SliceCreator, pushLog } from './types';
import { Resources, ResourceType, VisualEvent } from '../../types';
import { calculateStats, getResourceLabel, calculateRepairCost, recalculateCargoWeight } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { createEffect } from '../../services/eventRegistry';
import { canCraftRecipe, getRecipeById } from '../../constants/fuelRecipes';

export interface CityActions {
    tradeCity: (cost: Partial<Resources>, reward: Partial<Resources>) => void;
    healCity: () => void;
    repairHull: () => void;
    buyCityBuff: (cost: number, res: ResourceType, effectId: string) => void;
    gambleResources: (res: ResourceType, amount: number) => boolean;
    craftFuel: (recipeId: string) => void;  // NEW: Crafting топлива
}

export const createCitySlice: SliceCreator<CityActions> = (set, get) => ({
    tradeCity: (cost, reward) => {
        const s = get();
        const canAfford = Object.entries(cost).every(([k, v]) => s.resources[k as ResourceType] >= (v as number));
        if (canAfford) {
            const newRes = { ...s.resources };
            Object.entries(cost).forEach(([k, v]) => newRes[k as ResourceType] -= (v as number));
            Object.entries(reward).forEach(([k, v]) => {
                if (k === 'XP') set({ xp: s.xp + (v as number) });
                else newRes[k as ResourceType] += (v as number);
            });
            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes)
            });
            audioEngine.playClick();
        }
    },

    healCity: () => {
        const s = get();

        // Проверка кулдауна для бесплатного охлаждения (глубина < 1000м)
        const isPaidCooling = s.depth >= 1000;  // CITY_SERVICE.PAID_COOLING_DEPTH

        if (!isPaidCooling) {
            const now = Date.now();
            const timeSinceLastUse = now - (s.freeCoolingLastUsed || 0);
            const cooldownRemaining = 150000 - timeSinceLastUse;  // CITY_SERVICE.FREE_COOLING_COOLDOWN_MS

            if (cooldownRemaining > 0) {
                // На кулдауне - показать ошибку
                const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
                const minutes = Math.floor(secondsRemaining / 60);
                const seconds = secondsRemaining % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                const errorEvent: VisualEvent = {
                    type: 'LOG',
                    msg: `⏱️ ОХЛАЖДЕНИЕ НА КУЛДАУНЕ: ${timeStr}`,
                    color: 'text-yellow-500'
                };
                set({ actionLogQueue: pushLog(s, errorEvent) });
                audioEngine.playUIError();
                return;
            }

            // Обновить timestamp последнего использования
            set({ heat: 0, freeCoolingLastUsed: now });
        } else {
            // Платное охлаждение - просто сбросить heat
            set({ heat: 0 });
        }

        audioEngine.playLog();
    },

    repairHull: () => {
        const s = get();
        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const { resource, cost } = calculateRepairCost(s.depth, s.integrity, stats.integrity);

        if (cost <= 0) return;

        if (s.resources[resource] >= cost) {
            const newRes = { ...s.resources, [resource]: s.resources[resource] - cost };
            set({
                integrity: stats.integrity,
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes)
            });
            audioEngine.playLog();
        } else {
            const errorEvent: VisualEvent = {
                type: 'LOG',
                msg: `НЕДОСТАТОЧНО РЕСУРСОВ: ${getResourceLabel(resource)}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, errorEvent) });
        }
    },

    buyCityBuff: (cost, res, effectId) => {
        const s = get();
        if (s.resources[res] >= cost) {
            const newRes = { ...s.resources, [res]: s.resources[res] - cost };
            const effect = createEffect(effectId);
            if (effect) {
                const event: VisualEvent = {
                    type: 'LOG',
                    msg: `ЭФФЕКТ: ${effect.name}`,
                    color: 'text-cyan-400'
                };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    activeEffects: [...s.activeEffects, effect],
                    actionLogQueue: pushLog(s, event)
                });
            }
        }
    },

    gambleResources: (res, amount) => {
        const s = get();
        if (s.resources[res] >= amount) {
            const win = Math.random() < 0.45;
            const newRes = { ...s.resources };

            if (win) {
                // Выигрыш: +ставка (итого +amount)
                newRes[res] += amount;
                const event: VisualEvent = { type: 'LOG', msg: `ВЫИГРЫШ! +${amount} ${getResourceLabel(res)}`, color: 'text-green-500' };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    actionLogQueue: pushLog(s, event)
                });
                audioEngine.playAchievement();
                return true;
            } else {
                // Проигрыш: -ставка
                newRes[res] -= amount;
                const event: VisualEvent = { type: 'LOG', msg: `ПРОИГРЫШ... -${amount} ${getResourceLabel(res)}`, color: 'text-red-500' };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    actionLogQueue: pushLog(s, event)
                });
                return false;
            }
        }
        return false;
    },

    // === FUEL CRAFTING ===
    craftFuel: (recipeId) => {
        const s = get();
        const recipe = getRecipeById(recipeId);

        if (!recipe) return;

        // Проверка ресурсов
        if (!canCraftRecipe(recipe, s.resources)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `НЕДОСТАТОЧНО ${getResourceLabel(recipe.input.resource).toUpperCase()}!`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Крафт
        const newRes = { ...s.resources };
        newRes[recipe.input.resource] -= recipe.input.amount;
        newRes[recipe.output.resource] += recipe.output.amount;

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `⚗️ ${recipe.name}: +${recipe.output.amount} ${getResourceLabel(recipe.output.resource).toUpperCase()}`,
            color: 'text-cyan-400'
        };

        set({
            resources: newRes,
            currentCargoWeight: recalculateCargoWeight(newRes),
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playClick();
    }
});
