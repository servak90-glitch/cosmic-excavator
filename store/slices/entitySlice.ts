/**
 * EntitySlice — действия связанные с летающими объектами
 */

import { SetState, GetState, SliceCreator, pushLog, pushLogs } from './types';
import { ResourceType, VisualEvent } from '../../types';
import { BIOMES } from '../../constants';
import { getResourceLabel } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { t } from '../../services/localization';

export interface EntityActions {
    clickFlyingObject: (id: string, x: number, y: number) => void;
}

export const createEntitySlice: SliceCreator<EntityActions> = (set, get) => ({
    clickFlyingObject: (id, x, y) => {
        const s = get();
        const objIndex = s.flyingObjects.findIndex(o => o.id === id);
        if (objIndex === -1) return;

        const objects = [...s.flyingObjects];
        const obj = { ...objects[objIndex] };
        obj.hp -= 1;

        const logs: VisualEvent[] = [{ type: 'PARTICLE', x, y, color: '#FFF', kind: 'SPARK', count: 3 }];

        if (obj.hp <= 0) {
            objects.splice(objIndex, 1);
            if (obj.type === 'SATELLITE_DEBRIS') {
                audioEngine.playSatelliteCollect();
            } else {
                audioEngine.playGeodeCollect(obj.rarity);
            }

            const newRes = { ...s.resources };
            const currentBiome = s.selectedBiome
                ? BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === s.selectedBiome) || BIOMES[0]
                : BIOMES.slice().reverse().find(b => s.depth >= b.depth) || BIOMES[0];

            // Rarity Multiplier
            let multiplier = 1;
            if (obj.rarity === 'RARE') multiplier = 2;
            if (obj.rarity === 'EPIC') multiplier = 5;

            // REWARDS BY TYPE
            const lang = s.settings.language;
            if (obj.type === 'SATELLITE_DEBRIS') {
                // Metals
                const metalAmount = (Math.floor(Math.random() * 5) + 3) * multiplier;
                newRes.iron += metalAmount;
                logs.push({ type: 'TEXT', x, y, text: `+${metalAmount} ${t(getResourceLabel('iron'), lang)}`, style: 'RESOURCE' });

                if (Math.random() < 0.5) {
                    const copperAmount = (Math.floor(Math.random() * 4) + 2) * multiplier;
                    newRes.copper += copperAmount;
                    logs.push({ type: 'TEXT', x, y: y - 20, text: `+${copperAmount} ${t(getResourceLabel('copper'), lang)}`, style: 'RESOURCE' });
                }
            } else if (obj.type === 'GEODE_SMALL') {
                // Gems & Stone
                const stoneAmount = (Math.floor(Math.random() * 10) + 5) * multiplier;
                newRes.stone += stoneAmount;
                logs.push({ type: 'TEXT', x, y, text: `+${stoneAmount} ${t(getResourceLabel('stone'), lang)}`, style: 'RESOURCE' });

                if (Math.random() < 0.3 * multiplier) {
                    newRes.rubies += 1 * multiplier;
                    logs.push({ type: 'TEXT', x, y: y - 20, text: `+${1 * multiplier} ${t(getResourceLabel('rubies'), lang)}`, style: 'CRIT' });
                }
            } else if (obj.type === 'GEODE_LARGE') {
                // Rare Gems & Tech
                const rareAmount = Math.floor(Math.random() * 2) + 1;
                newRes.diamonds += rareAmount; // Guaranteed diamond for Large
                logs.push({ type: 'TEXT', x, y, text: `+${rareAmount} ${t(getResourceLabel('diamonds'), lang)}`, style: 'CRIT' });

                if (Math.random() < 0.4) {
                    const techAmount = 1 * multiplier;
                    newRes.ancientTech += techAmount;
                    logs.push({ type: 'TEXT', x, y: y - 20, text: `+${techAmount} ${t(getResourceLabel('ancientTech'), lang)}`, style: 'CRIT' });
                }
            }

            // XP Gain
            const xpGain = (Math.floor(Math.random() * 11) + 10) * multiplier;
            logs.push({ type: 'TEXT', x, y: y - 40, text: `+${xpGain} XP`, style: 'INFO' });

            set({
                flyingObjects: objects,
                resources: newRes,
                xp: s.xp + xpGain,
                actionLogQueue: pushLogs(s, logs)
            });
        } else {
            objects[objIndex] = obj;
            audioEngine.playClick();
            set({ flyingObjects: objects, actionLogQueue: pushLogs(s, logs) });
        }
    },
});
