import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BASE_COSTS, BASE_BUILD_TIMES, BASE_STORAGE_CAPACITY } from '../constants/playerBases';
import { RegionId, BaseType } from '../types';
import { t, TL } from '../services/localization';
import { formatCompactNumber } from '../services/gameMath';
import {
    X,
    Construction,
    Zap,
    Hammer,
    CheckCircle2,
    MonitorDot,
    Compass,
    Factory
} from 'lucide-react';

interface BuildBaseModalProps {
    regionId: RegionId;
    onClose: () => void;
    onBuild: (baseType: BaseType) => void;
}

export const BuildBaseModal: React.FC<BuildBaseModalProps> = ({ regionId, onClose, onBuild }) => {
    const resources = useGameStore(s => s.resources);
    const lang = useGameStore(s => s.settings.language);

    // В начале доступен только аванпост, остальное через улучшения
    const baseTypes: BaseType[] = ['outpost'];

    const canAfford = (baseType: BaseType): boolean => {
        const cost = BASE_COSTS[baseType];
        if (resources.credits < cost.credits) return false;
        for (const [resource, amount] of Object.entries(cost.materials)) {
            if ((resources[resource as keyof typeof resources] || 0) < (amount || 0)) {
                return false;
            }
        }
        return true;
    };

    const formatBuildTime = (ms: number): string => {
        if (ms === 0) return lang === 'RU' ? 'Мгновенно' : 'Instant';
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes} ${lang === 'RU' ? 'МИН' : 'MIN'}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${lang === 'RU' ? 'Ч' : 'H'}`;
    };

    const getBaseFeatures = (baseType: BaseType): string[] => {
        const features: string[] = [];
        if (baseType === 'outpost') {
            features.push(lang === 'RU' ? '📦 Базовое хранилище' : '📦 Base Storage');
            features.push(lang === 'RU' ? '📡 Связь с орбитой' : '📡 Orbital Link');
        }
        if (baseType === 'camp') {
            features.push(lang === 'RU' ? '🔧 Мастерская (Тир 1-5)' : '🔧 Workshop (Tier 1-5)');
            features.push(lang === 'RU' ? '📦 Среднее хранилище' : '📦 Medium storage');
        }
        if (baseType === 'station') {
            features.push(lang === 'RU' ? '🔧 Мастерская (Тир 1-10)' : '🔧 Workshop (Tier 1-10)');
            features.push(lang === 'RU' ? '💰 Доступ к рынку' : '💰 Market access');
            features.push(lang === 'RU' ? '⛽ Заправка' : '⛽ Fuel facilities');
            features.push(lang === 'RU' ? '📦 Большое хранилище' : '📦 Large storage');
        }
        return features;
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-void/90 backdrop-blur-xl p-3 md:p-6 overflow-y-auto"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />

                <motion.div
                    className="w-full max-w-5xl glass-panel border-cyan-500/30 bg-black/80 my-auto relative font-technical flex flex-col shadow-[0_0_100px_rgba(34,211,238,0.1)] rounded-none md:rounded-lg"
                    initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Hub - Fixed Height */}
                    <div className="p-5 md:p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="p-2 md:p-3 glass-panel border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
                                <Construction className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                    {t(TL.ui.build_base_title, lang)}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Sector_Deployment // {t(TL.regions[regionId], lang)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 md:p-3 glass-panel border-white/10 hover:border-white/40 text-white/40 hover:text-white transition-all group"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-5 md:p-10 flex flex-col gap-6 md:gap-10 overflow-visible">
                        {/* Blueprint Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                            {baseTypes.map(baseType => {
                                const cost = BASE_COSTS[baseType];
                                const canBuild = canAfford(baseType);
                                const buildTime = BASE_BUILD_TIMES[baseType];
                                const storage = BASE_STORAGE_CAPACITY[baseType];
                                const features = getBaseFeatures(baseType);

                                return (
                                    <div
                                        key={baseType}
                                        className={`glass-panel p-5 md:p-8 border-2 transition-all flex flex-col gap-4 md:gap-6 relative group overflow-hidden
                                            ${canBuild ? 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400 hover:bg-cyan-500/10' : 'border-white/5 bg-white/5 opacity-40'}
                                        `}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                            <Factory className="w-16 h-16 md:w-24 md:h-24" />
                                        </div>

                                        <div className="space-y-1 relative z-10">
                                            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                {baseType.toUpperCase()}
                                            </h3>
                                            <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">DEPLOY_SPEC: {(baseTypes.indexOf(baseType) + 1).toString().padStart(2, '0')}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 md:gap-3 relative z-10">
                                            <div className="p-2 md:p-3 glass-panel border-white/5 bg-black/40 space-y-1">
                                                <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">Build_Cycle</span>
                                                <div className="text-[10px] md:text-xs font-black text-cyan-400">{formatBuildTime(buildTime)}</div>
                                            </div>
                                            <div className="p-2 md:p-3 glass-panel border-white/5 bg-black/40 space-y-1">
                                                <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">Payload_Cap</span>
                                                <div className="text-[10px] md:text-xs font-black text-emerald-400">{formatCompactNumber(storage)} KG</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:space-y-3 relative z-10 flex-1">
                                            <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Authorized_Modules</span>
                                            <div className="space-y-1.5 md:space-y-2">
                                                {features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase text-white/60 tracking-wider">
                                                        <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400 shrink-0" />
                                                        <span className="truncate">{feature.replace(/📦|🔧|💰|⛽|📡/, '').trim()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-4 pt-4 border-t border-white/5 relative z-10">
                                            <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Req_Resources</span>
                                            <div className="space-y-1.5 md:space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Credits (CR)</span>
                                                    <span className={`text-[9px] md:text-[10px] font-black ${resources.credits >= cost.credits ? 'text-white' : 'text-rose-500'}`}>
                                                        {cost.credits.toLocaleString()}
                                                    </span>
                                                </div>
                                                {Object.entries(cost.materials).map(([resource, amount]) => (
                                                    <div key={resource} className="flex justify-between items-center px-1">
                                                        <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">{t(resource, lang)}</span>
                                                        <span className={`text-[9px] md:text-[10px] font-black ${(resources[resource as keyof typeof resources] || 0) >= (amount || 0) ? 'text-white' : 'text-rose-500'}`}>
                                                            {amount}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => canBuild && onBuild(baseType)}
                                            disabled={!canBuild}
                                            className={`w-full py-4 md:py-5 font-black uppercase text-[9px] md:text-xs tracking-[0.4em] italic shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all relative overflow-hidden group/btn
                                                ${canBuild ? 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95' : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'}
                                            `}
                                        >
                                            {canBuild ? 'Establish_Sector' : 'Insufficient_Payload'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Telemetry Log */}
                        <div className="bg-black/40 border border-white/5 p-4 md:p-6 rounded-none md:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="p-2 md:p-3 glass-panel border-cyan-500/20 bg-cyan-500/5 text-cyan-400 shrink-0">
                                    <MonitorDot className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Sector_Guidelines</span>
                                    <p className="text-[9px] md:text-[10px] font-black text-white/60 uppercase tracking-widest italic">{t(TL.ui.one_base_per_region, lang)}</p>
                                </div>
                            </div>
                            <div className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em] md:tracking-[0.5em] text-center sm:text-right">Auth_Status: Ready_For_Payload</div>
                        </div>

                        {/* Mobile Back Button (Secondary Close) */}
                        <button
                            onClick={onClose}
                            className="md:hidden w-full py-4 glass-panel border-white/10 text-white/40 font-black uppercase text-[9px] tracking-[0.3em] hover:text-white"
                        >
                            RETURN_TO_ORBIT
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
