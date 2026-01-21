/**
 * UpgradeSlice — действия связанные с улучшениями
 */

import { SliceCreator, pushLogs } from './types';
import { Resources, ResourceType, DrillSlot, DroneType, VisualEvent, BaseDrillPart } from '../../types';
import {
    BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS, DRONES, FUSION_RECIPES
} from '../../constants';
import { SKILLS, getSkillCost } from '../../services/skillRegistry';
import { audioEngine } from '../../services/audioEngine';
import { recalculateCargoWeight } from '../../services/gameMath';

export interface UpgradeActions {
    buyUpgrade: (slot: DrillSlot) => void;
    fusionUpgrade: (recipeId: string) => void;
    buyDrone: (droneId: DroneType) => void;
    upgradeSkill: (skillId: string) => void;
    unlockBlueprint: (id: string) => void;
}

export const createUpgradeSlice: SliceCreator<UpgradeActions> = (set, get) => ({
    buyUpgrade: (slot) => {
        const s = get();
        const part = s.drill[slot];
        const list = slot === DrillSlot.BIT ? BITS :
            slot === DrillSlot.ENGINE ? ENGINES :
                slot === DrillSlot.COOLING ? COOLERS :
                    slot === DrillSlot.HULL ? HULLS :
                        slot === DrillSlot.LOGIC ? LOGIC_CORES :
                            slot === DrillSlot.CONTROL ? CONTROL_UNITS :
                                slot === DrillSlot.GEARBOX ? GEARBOXES :
                                    slot === DrillSlot.POWER ? POWER_CORES :
                                        slot === DrillSlot.ARMOR ? ARMORS : CARGO_BAYS;

        const idx = list.findIndex(p => p.id === part.id);
        if (idx === -1 || idx === list.length - 1) return;
        const nextPart = list[idx + 1];

        // Проверка наличия чертежа
        if (nextPart.blueprintId && !s.unlockedBlueprints.includes(nextPart.blueprintId)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ ТРЕБУЕТСЯ ЧЕРТЕЖ: ${nextPart.blueprintId}`,
                color: 'text-red-400'
            };
            set({ actionLogQueue: pushLogs(s, [event]) });
            audioEngine.playUIError();
            return;
        }

        const cost = nextPart.cost as Partial<Resources>;
        const canAfford = Object.entries(cost).every(([k, v]) => s.resources[k as ResourceType] >= v);

        if (canAfford) {
            const newRes = { ...s.resources };
            Object.entries(cost).forEach(([k, v]) => newRes[k as ResourceType] -= (v as number));

            const events: VisualEvent[] = [
                { type: 'LOG', msg: `УЛУЧШЕНИЕ: ${nextPart.name}`, color: 'text-green-400' },
                { type: 'SOUND', sfx: 'ACHIEVEMENT' }
            ];

            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                drill: { ...s.drill, [slot]: nextPart },
                actionLogQueue: pushLogs(s, events)
            });
        }
    },

    fusionUpgrade: (recipeId) => {
        const s = get();
        const recipe = FUSION_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return;

        const lists = [BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS];
        let resultPart: BaseDrillPart | null = null;
        let slot: DrillSlot | null = null;

        for (const list of lists) {
            const found = list.find(p => p.id === recipe.resultId);
            if (found) {
                resultPart = found;
                if (list === BITS) slot = DrillSlot.BIT;
                else if (list === ENGINES) slot = DrillSlot.ENGINE;
                else if (list === COOLERS) slot = DrillSlot.COOLING;
                else if (list === HULLS) slot = DrillSlot.HULL;
                else if (list === LOGIC_CORES) slot = DrillSlot.LOGIC;
                else if (list === CONTROL_UNITS) slot = DrillSlot.CONTROL;
                else if (list === GEARBOXES) slot = DrillSlot.GEARBOX;
                else if (list === POWER_CORES) slot = DrillSlot.POWER;
                else if (list === ARMORS) slot = DrillSlot.ARMOR;
                else if (list === CARGO_BAYS) slot = DrillSlot.CARGO_BAY;
                break;
            }
        }

        if (!resultPart || !slot) return;

        // Проверка наличия чертежа для fusion
        if (resultPart.blueprintId && !s.unlockedBlueprints.includes(resultPart.blueprintId)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ СИНТЕЗ ЗАБЛОКИРОВАН: Нужен ${resultPart.blueprintId}`,
                color: 'text-red-400'
            };
            set({ actionLogQueue: pushLogs(s, [event]) });
            audioEngine.playUIError();
            return;
        }

        if (s.resources[recipe.catalyst.resource] >= recipe.catalyst.amount) {
            const newRes = { ...s.resources };
            newRes[recipe.catalyst.resource] -= recipe.catalyst.amount;

            const events: VisualEvent[] = [
                { type: 'LOG', msg: `СИНТЕЗ ЗАВЕРШЕН: ${resultPart.name}`, color: 'text-purple-400 font-bold' },
                { type: 'SOUND', sfx: 'ACHIEVEMENT' }
            ];

            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                drill: { ...s.drill, [slot]: resultPart },
                actionLogQueue: pushLogs(s, events)
            });
            audioEngine.playFusion();
        }
    },

    buyDrone: (droneId) => {
        const s = get();
        const drone = DRONES.find(d => d.id === droneId);
        if (!drone) return;

        const lvl = s.droneLevels[droneId] || 0;
        if (lvl >= drone.maxLevel) return;

        const costMultiplier = Math.pow(drone.costMultiplier, lvl);
        const cost = drone.baseCost;

        const canAfford = Object.entries(cost).every(([k, v]) =>
            s.resources[k as ResourceType] >= Math.floor((v as number) * costMultiplier)
        );

        if (canAfford) {
            const newRes = { ...s.resources };
            Object.entries(cost).forEach(([k, v]) =>
                newRes[k as ResourceType] -= Math.floor((v as number) * costMultiplier)
            );

            const newLevels = { ...s.droneLevels, [droneId]: lvl + 1 };
            const newActive = [...s.activeDrones];
            if (!newActive.includes(droneId)) newActive.push(droneId);

            const events: VisualEvent[] = [
                { type: 'LOG', msg: `ДРОН СОЗДАН: ${drone.name} MK-${lvl + 1}`, color: 'text-cyan-400' },
                { type: 'SOUND', sfx: 'LOG' }
            ];

            set({
                resources: newRes,
                currentCargoWeight: recalculateCargoWeight(newRes),
                droneLevels: newLevels,
                activeDrones: newActive,
                actionLogQueue: pushLogs(s, events)
            });
        }
    },

    upgradeSkill: (skillId) => {
        const s = get();
        const currentLevel = s.skillLevels[skillId] || 0;
        const skillDef = SKILLS.find(sk => sk.id === skillId);

        if (!skillDef) return;
        if (currentLevel >= skillDef.maxLevel) return;

        const cost = getSkillCost(skillDef, currentLevel);

        if (s.xp >= cost) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `НАВЫК УЛУЧШЕН: ${skillDef.name}`,
                color: 'text-purple-400'
            };
            set(state => ({
                xp: state.xp - cost,
                skillLevels: {
                    ...state.skillLevels,
                    [skillId]: (state.skillLevels[skillId] || 0) + 1
                },
                actionLogQueue: [...state.actionLogQueue, event]
            }));
            audioEngine.playClick();
        }
    },

    unlockBlueprint: (id) => {
        const s = get();
        if (s.unlockedBlueprints.includes(id)) return;

        const event: VisualEvent = {
            type: 'LOG',
            msg: `🎉 ПОЛУЧЕН НОВЫЙ ЧЕРТЕЖ: ${id.replace('blueprint_', '').replace(/_/g, ' ').toUpperCase()}`,
            color: 'text-purple-400 font-bold'
        };

        set({
            unlockedBlueprints: [...s.unlockedBlueprints, id],
            actionLogQueue: pushLogs(s, [event, { type: 'SOUND', sfx: 'ACHIEVEMENT' }])
        });
    }
});
