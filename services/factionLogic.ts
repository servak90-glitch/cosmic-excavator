import { FACTIONS, REPUTATION_TIERS } from '../constants/factions';
import { ReputationState, FactionId } from '../types';

/**
 * Helper to get active perk IDs from reputation state
 * Used by GameEngine and non-React logic
 */
export function getActivePerkIds(reputation: ReputationState): string[] {
    const activePerks: string[] = [];
    const factionIds: FactionId[] = ['CORPORATE', 'SCIENCE', 'REBELS'];

    factionIds.forEach(fid => {
        const rep = reputation[fid] || 0;
        // Find current level
        const tier = REPUTATION_TIERS.slice().reverse().find(t => rep >= t.min);
        const level = tier ? tier.level : 1;

        const factionDef = FACTIONS[fid];
        if (factionDef) {
            factionDef.perks.forEach(p => {
                if (p.levelRequired <= level) {
                    activePerks.push(p.id);
                }
            });
        }
    });

    return activePerks;
}
