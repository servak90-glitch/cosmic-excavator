import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ResourceType, Language } from '../../types';
import { getResourceLabel, formatCompactNumber } from '../../services/gameMath';
import { t, TEXT_IDS } from '../../services/localization';
import {
    Menu,
    Diamond,
    Settings2,
    Box,
    ChevronDown,
    Activity,
    Gem,
    Coins,
    Sparkles,
    Trophy,
    X
} from 'lucide-react';

const COMMON_RESOURCES: ResourceType[] = [
    ResourceType.CLAY, ResourceType.STONE, ResourceType.COPPER,
    ResourceType.IRON, ResourceType.SILVER, ResourceType.GOLD
];
const RARE_RESOURCES: ResourceType[] = [
    ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.NANO_SWARM,
    ResourceType.ANCIENT_TECH, ResourceType.RUBIES, ResourceType.EMERALDS,
    ResourceType.DIAMONDS
];
const FUEL_RESOURCES: ResourceType[] = [
    ResourceType.COAL, ResourceType.OIL, ResourceType.GAS,
    ResourceType.ICE, ResourceType.SCRAP
];
const SUPPLY_RESOURCES: ResourceType[] = [
    ResourceType.REPAIR_KIT, ResourceType.COOLANT_PASTE, ResourceType.ADVANCED_COOLANT
];

const ResourceItem: React.FC<{ name: string; amount: number; label: React.ReactNode }> = ({ amount, label }) => (
    <div
        className="flex flex-col items-center justify-center border-r border-white/5 bg-white/5 backdrop-blur-md px-3 min-w-[56px] transition-colors hover:bg-white/10 group cursor-help"
    >
        <div className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors mb-0.5">
            {label}
        </div>
        <span className="text-[11px] font-bold font-technical text-white tracking-tighter">
            {formatCompactNumber(amount)}
        </span>
    </div>
);

interface GameHeaderProps {
    onOpenMenu: () => void;
    onOpenInventory?: () => void;
    onOpenRare?: () => void;
    isRareOpen?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onOpenMenu, onOpenInventory, onOpenRare, isRareOpen }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);

    return (
        <div className="flex glass-panel border-x-0 border-t-0 rounded-none shrink-0 h-11 relative z-[150] bg-black/40 pointer-events-auto">
            {/* LEFT: COMMON RESOURCES (Prioritize Credits on mobile) */}
            <div className="flex-1 flex overflow-x-auto scrollbar-hide touch-pan-x items-center">
                <div className="px-2 md:px-3 flex items-center border-r border-white/5 h-full bg-white/5">
                    <Activity className="w-3 md:w-4 h-3 md:h-4 text-cyan-400 opacity-60" />
                </div>

                {/* Always show Credits if > 0 */}
                <ResourceItem name={ResourceType.CREDITS} amount={resources.credits} label={<Coins className="w-3 h-3" />} />

                {/* Hide other common resources on extra small screens, show on md+ */}
                <div className="hidden sm:flex items-stretch h-full">
                    {COMMON_RESOURCES.map(key => resources[key] > 0 ? (
                        <ResourceItem key={key} name={key} amount={resources[key]} label={t(getResourceLabel(key), lang)} />
                    ) : null)}
                </div>
            </div>

            {/* RIGHT: ACTION GROUP */}
            <div className="flex items-stretch border-l border-white/5">
                {/* RARE TOGGLE */}
                <button
                    onClick={onOpenRare}
                    className={`w-12 flex flex-col items-center justify-center border-r border-white/5 transition-all
                        ${isRareOpen ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                    `}
                    title="Rare Resources"
                >
                    <Gem className="w-4 h-4" />
                    <ChevronDown className={`w-2.5 h-2.5 mt-0.5 transition-transform ${isRareOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* EQUIPMENT INVENTORY */}
                {onOpenInventory && (
                    <button
                        onClick={onOpenInventory}
                        className="w-12 flex items-center justify-center border-r border-white/5 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        title="Storage (I)"
                    >
                        <Box className="w-4.5 h-4.5" />
                    </button>
                )}

                {/* MENU TOGGLE */}
                <button
                    onClick={onOpenMenu}
                    className="w-12 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

        </div>
    );
};

// Экспортируем контент отдельно для использования в App.tsx
export const RareResourcesMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    resources: any;
    lang: Language;
    discoveredArtifactsCount: number;
}> = ({ isOpen, onClose, resources, lang, discoveredArtifactsCount }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                style={{ zIndex: 10000 }}
                onClick={onClose}
            />
            <div
                className="fixed md:fixed top-0 md:top-12 left-0 md:left-auto md:right-4 bottom-0 md:bottom-auto md:w-80 glass-panel p-0 flex flex-col overflow-hidden bg-[#0c0c0c] border-white/10 shadow-2xl pointer-events-auto"
                style={{ zIndex: 10001 }}
            >
                {/* Header with safe area padding for mobile */}
                <div className="px-6 pt-12 pb-6 md:px-4 md:pt-3 md:pb-3 border-b border-white/5 flex items-center justify-between bg-white/5 md:bg-transparent">
                    <div className="flex items-center gap-3">
                        <Diamond className="w-5 md:w-3.5 h-5 md:h-3.5 text-cyan-400" />
                        <h4 className="text-base md:text-[10px] font-black md:font-bold text-white uppercase tracking-[0.2em] font-technical">
                            {t(TEXT_IDS.HEADER_RARE_RESOURCES, lang)}
                        </h4>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8 md:w-4 md:h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-1 space-y-6 md:space-y-4">
                    {/* 1. DISCOVERIES (Artifacts) */}
                    <div className="px-4 md:px-3">
                        <div className="flex items-center gap-2 mb-3 opacity-30">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] font-technical">Discoveries</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex justify-between items-center p-3 glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-technical text-white/60 uppercase">{lang === 'RU' ? 'АРТЕФАКТЫ' : 'ARTIFACTS'}</span>
                                </div>
                                <span className="text-sm font-technical font-black text-white">{discoveredArtifactsCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. BASE ASSETS */}
                    <div className="px-4 md:px-3">
                        <div className="flex items-center gap-2 mb-3 opacity-30">
                            <Box className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] font-technical">Base Assets</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                            {COMMON_RESOURCES.map(key => (
                                <div key={key} className="flex flex-col p-2.5 glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                    <span className="text-[8px] font-technical text-white/30 group-hover:text-white/50 uppercase tracking-tighter mb-1 truncate">
                                        {t(getResourceLabel(key), lang)}
                                    </span>
                                    <span className="text-[11px] font-technical font-bold text-white">
                                        {formatCompactNumber(resources[key] || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. FUEL & ENERGY */}
                    <div className="px-4 md:px-3">
                        <div className="flex items-center gap-2 mb-3 opacity-30">
                            <Activity className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] font-technical">Fuel & Energy</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {FUEL_RESOURCES.map(key => (
                                <div key={key} className="flex flex-col p-2.5 glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                    <span className="text-[8px] font-technical text-white/30 group-hover:text-white/50 uppercase tracking-tighter mb-1 truncate">
                                        {t(getResourceLabel(key), lang)}
                                    </span>
                                    <span className="text-[11px] font-technical font-bold text-cyan-400">
                                        {formatCompactNumber(resources[key] || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. DRILL SUPPLIES */}
                    <div className="px-4 md:px-3">
                        <div className="flex items-center gap-2 mb-3 opacity-30">
                            <Settings2 className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] font-technical">Drill Supplies</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {SUPPLY_RESOURCES.map(key => (
                                <div key={key} className="flex flex-col p-2.5 glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                    <span className="text-[8px] font-technical text-white/30 group-hover:text-white/50 uppercase tracking-tighter mb-1 truncate">
                                        {t(getResourceLabel(key), lang)}
                                    </span>
                                    <span className="text-[11px] font-technical font-bold text-amber-400">
                                        {formatCompactNumber(resources[key] || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. RARE ASSETS */}
                    <div className="px-4 md:px-3 pb-8 md:pb-4">
                        <div className="flex items-center gap-2 mb-3 opacity-30">
                            <Gem className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] font-technical">Rare Assets</span>
                        </div>
                        <div className="space-y-1">
                            {RARE_RESOURCES.map(key => (
                                <div
                                    key={key}
                                    className="flex justify-between items-center px-3 py-3 md:py-2 hover:bg-white/5 transition-all outline-none rounded-sm group border-b border-white/5 md:border-b-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[12px] md:text-[10px] font-technical text-white/40 group-hover:text-white/60 uppercase tracking-tighter">
                                            {t(getResourceLabel(key), lang)}
                                        </span>
                                    </div>
                                    <span className={`text-[14px] md:text-[11px] font-technical font-black ${['rubies', 'emeralds', 'diamonds'].includes(key) ? 'neon-text-purple' : 'text-cyan-400'}`}>
                                        {formatCompactNumber(resources[key] || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameHeader;
