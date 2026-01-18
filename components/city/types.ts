/**
 * Shared types for City tab components
 */

import { Resources, ResourceType, Quest, QuestIssuer } from '../../types';

export interface CityTabBaseProps {
    resources: Resources;
    depth: number;
}

export interface TradeTabProps extends CityTabBaseProps {
    onTrade: (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => void;
}

export interface ContractsTabProps extends CityTabBaseProps {
    xp: number;
    activeQuests: Record<string, Quest>;
    onCompleteQuest: (questId: string) => void;
    onRefreshQuests: () => void;
}

export interface JewelerTabProps extends CityTabBaseProps {
    onTrade: (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => void;
}

export interface ServiceTabProps extends CityTabBaseProps {
    heat: number;
    integrity: number;
    maxIntegrity: number;
    onHeal: () => void;
    onRepair: () => void;
}

export interface BarTabProps extends CityTabBaseProps {
    // Bar uses store actions directly
}

export const getFactionStyle = (issuer: string) => {
    switch (issuer) {
        case 'CORP':
        case 'CORPORATE':
            return { border: 'border-zinc-500', bg: 'bg-zinc-900', text: 'text-zinc-200', badge: 'bg-zinc-700', icon: '🏢' };
        case 'SCIENCE': return { border: 'border-cyan-500', bg: 'bg-[#001015]', text: 'text-cyan-200', badge: 'bg-cyan-900', icon: '🔬' };
        case 'REBELS': return { border: 'border-amber-700', bg: 'bg-[#1a0f00]', text: 'text-amber-500', badge: 'bg-amber-900', icon: '✊' };
        default: return { border: 'border-white', bg: 'bg-black', text: 'text-white', badge: 'bg-zinc-500', icon: '?' };
    }
};
