/**
 * CitySlice — действия связанные с городом
 */

import { SetState, GetState, SliceCreator, pushLog } from './types';
import { Resources, ResourceType, VisualEvent, InventoryItem } from '../../types';
import { calculateStats, getResourceLabel, calculateRepairCost, recalculateCargoWeight } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { createEffect } from '../../services/eventRegistry';
import { generateQuestBatch } from '../../services/questRegistry';

export interface CityActions {
    tradeCity: (cost: Partial<Resources>, reward: Partial<Resources>) => void;
    healCity: () => void;
    repairHull: () => void;
    buyCityBuff: (cost: number, res: ResourceType, effectId: string) => void;
    gambleResources: (res: ResourceType, amount: number) => void;
    completeQuest: (questId: string) => void;
    refreshQuests: () => void;
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
        set({ heat: 0 });
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
            newRes[res] -= amount;
            if (win) {
                newRes[res] += amount * 2;
                const event: VisualEvent = { type: 'LOG', msg: `ВЫИГРЫШ! +${amount}`, color: 'text-green-500' };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    actionLogQueue: pushLog(s, event)
                });
                audioEngine.playAchievement();
            } else {
                const event: VisualEvent = { type: 'LOG', msg: `ПРОИГРЫШ...`, color: 'text-red-500' };
                set({
                    resources: newRes,
                    currentCargoWeight: recalculateCargoWeight(newRes),
                    actionLogQueue: pushLog(s, event)
                });
            }
        }
    },

    completeQuest: (id) => {
        const s = get();
        const quest = s.activeQuests[id];
        if (quest) {
            const newRes = { ...s.resources };
            let xpGain = 0;
            quest.rewards.forEach(r => {
                if (r.type === 'RESOURCE' || r.type === 'TECH') newRes[r.target as ResourceType] += r.amount;
                if (r.type === 'XP') xpGain += r.amount;
                // REPUTATION REWARD
                if (r.type === 'REPUTATION') {
                    // Since we can't easily access another slice's action directly (unless we use get().addReputation),
                    // and addReputation is part of the store now.
                    // But we are INSIDE the citySlice.
                    // IMPORTANT: We need to check if FactionActions are mixed in before calling.
                    // However, at runtime 's' (GameStore) has all methods.
                    // Logic:
                    // We can manually update reputation state here or call the action.
                    // Calling action is cleaner for side effects (logs).
                    const factionAction = (get() as any).addReputation;
                    if (factionAction) factionAction(r.target, r.amount);
                }
            });

            // Legacy support if reputationReward field is used
            if (quest.reputationReward) {
                const factionMap: Record<string, string> = { 'CORP': 'CORPORATE', 'SCIENCE': 'SCIENCE', 'REBELS': 'REBELS' };
                const factionId = factionMap[quest.issuer] || quest.issuer;
                (get() as any).addReputation?.(factionId, quest.reputationReward);
            }

            const newQuests = { ...s.activeQuests };
            delete newQuests[id];

            const event: VisualEvent = { type: 'LOG', msg: `КОНТРАКТ ВЫПОЛНЕН`, color: 'text-green-500' };
            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                xp: s.xp + xpGain,
                activeQuests: newQuests,
                actionLogQueue: pushLog(s, event)
            });
            audioEngine.playAchievement();
        }
    },

    refreshQuests: () => {
        const s = get();
        if (s.resources.clay >= 100) {
            const quests = generateQuestBatch(s.depth, s.level);
            const questMap = quests.reduce((acc, q) => ({ ...acc, [q.id]: q }), {});
            const newRes = { ...s.resources, clay: s.resources.clay - 100 };
            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                activeQuests: questMap
            });
        }
    },
});
