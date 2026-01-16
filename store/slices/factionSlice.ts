import { SliceCreator } from './types';
import { FactionId, ReputationState } from '../../types';

export interface FactionActions {
    addReputation: (faction: FactionId, amount: number) => void;
    getReputationLevel: (faction: FactionId) => number;
}

export const createFactionSlice: SliceCreator<FactionActions> = (set, get) => ({
    addReputation: (faction, amount) => {
        set(state => {
            const current = state.reputation[faction] || 0;
            const newRep = Math.min(1000, Math.max(0, current + amount)); // Max 1000 for now

            // Notification logic could go here
            return {
                reputation: {
                    ...state.reputation,
                    [faction]: newRep
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
        return Math.floor(rep / 100) + 1; // Level 1-10
    }
});
