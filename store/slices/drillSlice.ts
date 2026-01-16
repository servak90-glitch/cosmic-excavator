/**
 * DrillSlice — действия связанные с бурением
 */

import { SliceCreator, pushLog } from './types';
import { VisualEvent } from '../../types';
import { calculateStats, getResourceLabel, calculateShieldRechargeCost } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';

export interface DrillActions {
    setDrilling: (isDrilling: boolean) => void;
    manualClick: () => void;
    manualRechargeShield: () => void;
}

export const createDrillSlice: SliceCreator<DrillActions> = (set, get) => ({
    setDrilling: (isDrilling) => set({ isDrilling }),

    manualClick: () => {
        const s = get();
        if (s.isOverheated || s.isBroken || s.currentBoss?.isInvulnerable) return;

        const now = Date.now();
        if (now - s.lastInteractTime < 50) return;

        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);

        // [BALANCING] Overload Damage Buff (+100%)
        const isOverloadActive = s.activeAbilities.find(a => a.id === 'OVERLOAD')?.isActive;
        const overloadMult = isOverloadActive ? 2.0 : 1.0;

        const damage = 10 * stats.clickMult * overloadMult;

        let newHeat = s.heat;
        if (!s.isInfiniteCoolant) {
            newHeat += 0.50 * (1 - (stats.skillMods.heatGenReductionPct + stats.artifactMods.heatGenPct) / 100);
        }

        let newBoss = s.currentBoss;
        if (newBoss) {
            newBoss = { ...newBoss, currentHp: Math.max(0, newBoss.currentHp - damage) };
            const hitEvent: VisualEvent = {
                type: 'TEXT',
                x: (typeof window !== 'undefined' ? window.innerWidth : 800) / 2 + (Math.random() - 0.5) * 50,
                y: (typeof window !== 'undefined' ? window.innerHeight : 600) / 2 - 100,
                text: `-${Math.floor(damage)}`,
                style: 'CRIT'
            };
            set({
                heat: Math.min(100, newHeat),
                currentBoss: newBoss,
                lastInteractTime: now,
                actionLogQueue: pushLog(s, hitEvent)
            });
            audioEngine.playClick();
        } else {
            set({ heat: Math.min(100, newHeat), lastInteractTime: now });
            audioEngine.playClick();
        }
    },

    manualRechargeShield: () => {
        const s = get();
        const { resource, cost } = calculateShieldRechargeCost(s.depth);

        if (s.resources[resource] >= cost) {
            const newRes = { ...s.resources, [resource]: s.resources[resource] - cost };
            const event: VisualEvent = {
                type: 'TEXT',
                x: (typeof window !== 'undefined' ? window.innerWidth : 800) / 2,
                y: (typeof window !== 'undefined' ? window.innerHeight : 600) - 200,
                text: 'SHIELD CHARGED',
                style: 'INFO'
            };
            set({
                resources: newRes,
                shieldCharge: 100,
                actionLogQueue: pushLog(s, event)
            });
            audioEngine.playLog();
        } else {
            const errorEvent: VisualEvent = {
                type: 'LOG',
                msg: `НЕТ РЕСУРСОВ: ${getResourceLabel(resource)}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, errorEvent) });
        }
    },
});
