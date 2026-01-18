import { SliceCreator } from './types';
import { FactionId, FactionPerk } from '../../types';
import { FACTIONS, REPUTATION_TIERS } from '../../constants/factions';

export interface FactionActions {
    addReputation: (faction: FactionId, amount: number) => void;
    getReputationLevel: (faction: FactionId) => number;
    getReputationTierName: (faction: FactionId) => string;
    getActivePerks: (faction: FactionId) => FactionPerk[];
    getAllActivePerks: () => FactionPerk[];
    hasPerk: (perkId: string) => boolean;
}

export const createFactionSlice: SliceCreator<FactionActions> = (set, get) => ({
    addReputation: (faction, amount) => {
        set(state => {
            const current = state.reputation[faction] || 0;
            // Cap at 10000 for new Legend tier
            const newRep = Math.min(10000, Math.max(0, current + amount));

            let updates: Partial<Record<FactionId, number>> = {
                [faction]: newRep
            };

            // === RIVALRY SYSTEM ===
            // Corporate vs Rebels antagonism
            if (amount > 0) {
                if (faction === 'CORPORATE') {
                    const rebelRep = state.reputation['REBELS'] || 0;
                    if (rebelRep > 0) {
                        const penalty = Math.floor(amount * 0.5); // 50% penalty to rival
                        updates['REBELS'] = Math.max(0, rebelRep - penalty);
                    }
                } else if (faction === 'REBELS') {
                    const corpRep = state.reputation['CORPORATE'] || 0;
                    if (corpRep > 0) {
                        const penalty = Math.floor(amount * 0.5);
                        updates['CORPORATE'] = Math.max(0, corpRep - penalty);
                    }
                }
            }

            return {
                reputation: {
                    ...state.reputation,
                    ...updates
                },
                actionLogQueue: [...state.actionLogQueue, {
                    type: 'LOG',
                    msg: `РЕПУТАЦИЯ (${faction}): ${amount > 0 ? '+' : ''}${amount}`,
                    color: amount > 0 ? 'text-green-400' : 'text-red-400'
                }]
            };
        });
    },

    getReputationLevel: (faction) => {
        const rep = get().reputation[faction] || 0;
        // Find highest tier where min <= rep
        const tier = REPUTATION_TIERS.slice().reverse().find(t => rep >= t.min);
        return tier ? tier.level : 1;
    },

    getReputationTierName: (faction) => {
        const rep = get().reputation[faction] || 0;
        const tier = REPUTATION_TIERS.slice().reverse().find(t => rep >= t.min);
        return tier ? tier.name : 'Unknown';
    },

    getActivePerks: (faction) => {
        // Cast to any to avoid circular dependency inference issues during build
        const store = get() as any;
        const level = store.getReputationLevel(faction);
        const def = FACTIONS[faction];
        if (!def) return [];
        return def.perks.filter(p => p.levelRequired <= level);
    },

    getAllActivePerks: () => {
        const factions: FactionId[] = ['CORPORATE', 'SCIENCE', 'REBELS'];
        const allPerks: FactionPerk[] = [];
        const store = get() as any;

        factions.forEach(f => {
            const level = store.getReputationLevel(f);
            const def = FACTIONS[f];
            if (def) {
                def.perks.forEach(p => {
                    if (p.levelRequired <= level) {
                        allPerks.push(p);
                    }
                });
            }
        });
        return allPerks;
    },

    hasPerk: (perkId) => {
        const store = get() as any;
        const perks = store.getAllActivePerks();
        return perks.some((p: FactionPerk) => p.id === perkId);
    }
});
