import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RegionId, ResourceType, View } from '../../types';
import { REGIONS } from '../../constants/regions';
import { t } from '../../services/localization';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ShoppingBag,
    Hammer,
    Bot,
    Zap,
    AlertTriangle,
    Hexagon,
    Boxes,
    ScrollText,
    Gem,
    GlassWater
} from 'lucide-react';

// Reuse existing sub-views or logic
import { MarketView } from '../MarketView';
import ForgeView from '../ForgeView';
import { BaseView } from '../BaseView';
import JewelerTab from '../city/JewelerTab';
import ServiceTab from '../city/ServiceTab';
import BarTab from '../city/BarTab';
import QuestPanel from '../QuestPanel';

interface RegionalHubOverlayProps {
    regionId: RegionId;
    onClose: () => void;
}

type HubTab = 'MARKET' | 'FORGE' | 'DRONES' | 'SERVICES' | 'BAR' | 'JEWELER' | 'CONTRACTS';

export const RegionalHubOverlay: React.FC<RegionalHubOverlayProps> = ({ regionId, onClose }) => {
    const [activeTab, setActiveTab] = useState<HubTab>('MARKET');
    const lang = useGameStore(s => s.settings.language);
    const region = REGIONS[regionId];

    const playerBases = useGameStore(s => s.playerBases);
    const currentBase = playerBases.find(b => b.regionId === regionId);

    const tabs: { id: HubTab; label: string; icon: any }[] = [
        { id: 'MARKET', label: lang === 'RU' ? 'РЫНОК' : 'MARKET', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'CONTRACTS', label: lang === 'RU' ? 'КОНТРАКТЫ' : 'CONTRACTS', icon: <ScrollText className="w-4 h-4" /> },
        { id: 'FORGE', label: lang === 'RU' ? 'КУЗНЯ' : 'FORGE', icon: <Hammer className="w-4 h-4" /> },
        { id: 'SERVICES', label: lang === 'RU' ? 'СЕРВИС' : 'SERVICES', icon: <Zap className="w-4 h-4" /> },
        { id: 'JEWELER', label: lang === 'RU' ? 'ЮВЕЛИР' : 'JEWELER', icon: <Gem className="w-4 h-4" /> },
        { id: 'BAR', label: lang === 'RU' ? 'БАР' : 'BAR', icon: <GlassWater className="w-4 h-4" /> },
        { id: 'DRONES', label: lang === 'RU' ? 'ДРОНЫ' : 'DRONES', icon: <Bot className="w-4 h-4" /> },
    ];

    // Получаем текущие статы через хук useStatsProperty или напрямую, если они есть в GameStore
    const stats_depth = useGameStore(s => s.depth);
    const stats_heat = useGameStore(s => s.heat);
    const stats_integrity = useGameStore(s => s.integrity);

    // В App.tsx maxIntegrity берется из calculateStats, здесь мы можем использовать s.drill.hull.baseStats.maxIntegrity
    const maxIntegrity = useGameStore(s => s.drill.hull.baseStats.maxIntegrity);
    const resources = useGameStore(s => s.resources);

    const { tradeCity, healCity, repairHull } = useGameStore(s => (s as any));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
        >
            <div className="relative w-full max-w-6xl h-full md:h-[90vh] bg-slate-900 md:border md:border-cyan-500/30 md:shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col overflow-hidden md:rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-cyan-500/20 bg-black/40 pt-[calc(1rem+var(--sat))] md:pt-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg shrink-0">
                            <Hexagon className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-2xl font-black text-white tracking-tight md:tracking-widest uppercase italic truncate">
                                {t(region.name, lang)} <span className="hidden sm:inline">// REGIONAL_HUB</span>
                            </h2>
                            <div className="flex gap-2 md:gap-4 mt-0.5">
                                <span className="text-[8px] md:text-[10px] font-mono text-cyan-500/60 uppercase">
                                    T1-{region.tierLimit} <span className="hidden sm:inline">(Public Access)</span>
                                </span>
                                <span className="text-[8px] md:text-[10px] font-mono text-white/20 uppercase tracking-tighter truncate">
                                    Sync: 100% <span className="hidden sm:inline">// {regionId.toUpperCase()}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 text-white/40 hover:text-white transition-colors shrink-0"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex gap-1 md:gap-2 p-1 md:p-2 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar touch-pan-x">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 text-[9px] md:text-[11px] font-bold font-mono tracking-widest uppercase transition-all relative shrink-0
                                ${activeTab === tab.id ? 'text-cyan-400 bg-cyan-500/5' : 'text-white/30 hover:text-white/60'}
                            `}
                        >
                            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="hub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'MARKET' && (
                            <motion.div
                                key="market"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y"
                            >
                                <MarketView />
                            </motion.div>
                        )}
                        {activeTab === 'FORGE' && (
                            <motion.div
                                key="forge"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y"
                            >
                                <div className="absolute top-4 right-8 z-10 flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-bold text-rose-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{lang === 'RU' ? `ЛИМИТ ТИРА: ${region.tierLimit}` : `TIER LIMIT: ${region.tierLimit}`}</span>
                                </div>
                                <ForgeView />
                            </motion.div>
                        )}
                        {activeTab === 'CONTRACTS' && (
                            <motion.div key="contracts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y">
                                <QuestPanel />
                            </motion.div>
                        )}
                        {activeTab === 'SERVICES' && (
                            <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y p-4 md:p-8">
                                <ServiceTab
                                    resources={resources}
                                    depth={stats_depth}
                                    heat={stats_heat}
                                    integrity={stats_integrity}
                                    maxIntegrity={maxIntegrity}
                                    onHeal={healCity}
                                    onRepair={repairHull}
                                />
                            </motion.div>
                        )}
                        {activeTab === 'JEWELER' && (
                            <motion.div key="jeweler" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y p-4 md:p-8">
                                <JewelerTab
                                    resources={resources}
                                    depth={stats_depth}
                                    onTrade={tradeCity}
                                />
                            </motion.div>
                        )}
                        {activeTab === 'BAR' && (
                            <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y p-4 md:p-8">
                                <BarTab
                                    resources={resources}
                                    depth={stats_depth}
                                />
                            </motion.div>
                        )}
                        {activeTab === 'DRONES' && (
                            <motion.div
                                key="drones"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="h-full flex-1 overflow-y-auto scrollbar-hide touch-pan-y"
                            >
                                {currentBase ? (
                                    <BaseView baseId={currentBase.id} onClose={() => { }} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-20 gap-6 opacity-40">
                                        <div className="p-8 border-2 border-dashed border-white/10 rounded-full">
                                            <Bot className="w-16 h-16" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white uppercase mb-2">
                                                {lang === 'RU' ? 'БАЗА НЕ ОБНАРУЖЕНА' : 'NO BASE DETECTED'}
                                            </h3>
                                            <p className="text-xs font-mono max-w-sm">
                                                {lang === 'RU' ? 'Для управления дронами необходимо основать базу в этом регионе.' : 'Establish a base in this region to access drone management.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Decor */}
                <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center px-6">
                    <div className="flex gap-4 opacity-20">
                        <Zap className="w-3 h-3 text-cyan-500" />
                        <Zap className="w-3 h-3 text-cyan-500" />
                        <Zap className="w-3 h-3 text-cyan-500" />
                    </div>
                    <span className="text-[8px] font-mono text-white/10 tracking-[0.5em] uppercase">
                        Tactical_Interface_Overlay_LTS_9000
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
