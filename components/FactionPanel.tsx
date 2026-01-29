import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FACTIONS, REPUTATION_TIERS } from '../constants/factions';
import { FactionId, FactionPerk } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TL, t } from '../services/localization';
import {
    Shield,
    FlaskConical,
    Users,
    Activity,
    Target,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Lock,
    TrendingUp,
    Briefcase,
    Beaker,
    Fingerprint,
    Cpu,
    Radio,
    Terminal,
    Globe
} from 'lucide-react';

const FactionIcons: Record<FactionId, React.ReactNode> = {
    'CORPORATE': <Briefcase className="w-5 h-5" />,
    'SCIENCE': <Beaker className="w-5 h-5" />,
    'REBELS': <Users className="w-5 h-5" />,
};

const FactionColors: Record<FactionId, string> = {
    'CORPORATE': 'text-cyan-400',
    'SCIENCE': 'text-purple-400',
    'REBELS': 'text-orange-400',
};

const FactionPanel: React.FC = () => {
    const { reputation, getReputationLevel, getReputationTierName, getActivePerks, settings } = useGameStore();
    const lang = settings.language;
    const [selectedFaction, setSelectedFaction] = useState<FactionId>('CORPORATE');

    const factions: FactionId[] = ['CORPORATE', 'SCIENCE', 'REBELS'];

    const getNextTier = (currentRep: number) => {
        return REPUTATION_TIERS.find(t => t.min > currentRep);
    };

    const currentRep = reputation[selectedFaction] || 0;
    const currentLevel = getReputationLevel(selectedFaction);
    const tierName = getReputationTierName(selectedFaction);
    const nextTier = getNextTier(currentRep);
    const activePerksList = getActivePerks(selectedFaction);
    const allPerks = FACTIONS[selectedFaction].perks;

    const prevTierMin = REPUTATION_TIERS.find(t => t.level === currentLevel)?.min || 0;
    const nextTierMin = nextTier?.min || prevTierMin + 1000;
    const progress = Math.min(100, Math.max(0, ((currentRep - prevTierMin) / (nextTierMin - prevTierMin)) * 100));

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-void/20 p-0 md:p-10 rounded-none pointer-events-auto h-full overflow-hidden relative font-technical">
            <div className="absolute inset-0 mesh-bg opacity-10 pointer-events-none" />

            {/* FACTION SELECTOR HUD */}
            <div className="flex gap-2 md:gap-4 mb-0 md:mb-10 overflow-x-auto pb-2 md:pb-4 no-scrollbar shrink-0 relative z-10">
                {factions.map(fid => (
                    <button
                        key={fid}
                        onClick={() => setSelectedFaction(fid)}
                        className={`flex items-center gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-5 glass-panel transition-all whitespace-nowrap relative group group/btn overflow-hidden shrink-0
                            ${selectedFaction === fid
                                ? `border-${FactionColors[fid].split('-')[1]}-500/40 bg-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.5)]`
                                : 'border-white/5 bg-black/40 text-white/30 hover:text-white/60 hover:bg-white/5'
                            }`}
                    >
                        <div className={`transition-all duration-500 group-hover/btn:scale-125 ${selectedFaction === fid ? FactionColors[fid] : 'text-inherit'} [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5`}>
                            {FactionIcons[fid]}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className={`text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase leading-none mb-1 ${selectedFaction === fid ? 'text-white' : 'text-inherit'}`}>
                                {t(TL.factions.names[fid], lang)}
                            </span>
                            <span className="text-[7px] md:text-[8px] font-black opacity-30 uppercase tracking-widest">{fid === 'REBELS' ? 'Free_State' : 'Authorized'}</span>
                        </div>

                        {selectedFaction === fid && (
                            <>
                                <motion.div layoutId="faction-indicator" className={`absolute bottom-0 left-0 right-0 h-[3px] bg-current ${FactionColors[fid]} shadow-[0_0_15px_currentColor]`} />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
                            </>
                        )}
                    </button>
                ))}
            </div>

            {/* DOSSIER PANEL */}
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide relative z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={selectedFaction}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                            <div className="lg:col-span-8 flex flex-col justify-center">
                                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                                    <div className={`w-1 h-6 md:h-8 ${FactionColors[selectedFaction].replace('text', 'bg-')}`} />
                                    <h2 className={`text-2xl md:text-6xl font-black italic uppercase tracking-tighter ${FactionColors[selectedFaction]} leading-none`}>
                                        {t(TL.factions.names[selectedFaction], lang)}
                                    </h2>
                                </div>
                                <p className="text-[10px] md:text-sm text-white/40 leading-relaxed max-w-2xl italic pl-4 md:pl-5 border-l border-white/5">
                                    "{t(TL.factions.descriptions[selectedFaction], lang)}"
                                </p>
                            </div>

                            <div className="lg:col-span-4 flex flex-col gap-3">
                                {(selectedFaction === 'CORPORATE' && reputation['REBELS'] > 0) && (
                                    <div className="glass-panel px-6 py-4 border-rose-500/30 bg-rose-500/5 text-[9px] text-rose-400 font-black flex items-center gap-4 animate-pulse uppercase tracking-widest">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <span>{t(TL.factions.rivalryWarning, lang)}: {t(TL.factions.names.REBELS, lang)} (-50% Rep)</span>
                                    </div>
                                )}
                                {(selectedFaction === 'REBELS' && reputation['CORPORATE'] > 0) && (
                                    <div className="glass-panel px-6 py-4 border-rose-500/30 bg-rose-500/5 text-[9px] text-rose-400 font-black flex items-center gap-4 animate-pulse uppercase tracking-widest">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <span>{t(TL.factions.rivalryWarning, lang)}: {t(TL.factions.names.CORPORATE, lang)} (-50% Rep)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STATUS MATRIX */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <BentoMetric
                                label={t(TL.ui.clearanceTier, lang)}
                                value={tierName}
                                subValue={`${t(TL.ui.level, lang)} ${currentLevel}`}
                                icon={<Fingerprint className="w-5 h-5" />}
                                color={FactionColors[selectedFaction]}
                            />
                            <BentoMetric
                                label={t(TL.ui.trustPoints, lang)}
                                value={Math.floor(currentRep).toLocaleString()}
                                subValue={t(TL.ui.active, lang)}
                                icon={<Activity className="w-5 h-5 text-emerald-400" />}
                            />
                            <div className="md:col-span-2 glass-panel p-6 bg-white/[0.03] border-white/10 flex flex-col justify-center relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Radio className="w-20 h-20" />
                                </div>
                                <div className="flex justify-between items-center mb-4 pr-1">
                                    <span className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none">Authorization_Progress</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${FactionColors[selectedFaction]}`}>
                                        Next: {nextTier ? nextTier.name.toUpperCase() : 'MAX_LEVEL'}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-black/60 rounded-full overflow-hidden mb-3 p-0.5 border border-white/5">
                                    <motion.div
                                        className={`h-full bg-current ${FactionColors[selectedFaction]} rounded-full shadow-[0_0_20px_currentColor]`}
                                        initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "circOut" }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-shimmer" />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
                                    <span>P_MIN: {prevTierMin}</span>
                                    <span>P_TARGET: {nextTierMin}</span>
                                </div>
                            </div>
                        </div>

                        {/* PERKS REGISTRY */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 py-2">
                                <Terminal className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.4em] italic">
                                    {t(TL.ui.factionPerks, lang)}
                                </h3>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {allPerks.map((perk, idx) => {
                                    const isUnlocked = currentLevel >= perk.levelRequired;
                                    const perkInfo = (TL.factions.perks as any)[perk.id] || perk;
                                    return (
                                        <div
                                            key={perk.id}
                                            className={`group p-6 glass-panel border-l-4 transition-all duration-500 relative overflow-hidden
                                                ${isUnlocked
                                                    ? `bg-white/[0.02] border-white/10 border-l-${FactionColors[selectedFaction].split('-')[1]}-500 shadow-[0_5px_15px_rgba(0,0,0,0.2)]`
                                                    : 'bg-black/40 border-white/5 border-l-white/5 opacity-40 grayscale blur-[0.5px]'
                                                }`}
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Cpu className="w-16 h-16" />
                                            </div>

                                            <div className="flex justify-between items-start mb-5 relative z-10">
                                                <div className={`p-2.5 glass-panel rounded-lg border-white/10 ${isUnlocked ? FactionColors[selectedFaction] : 'text-white/10'}`}>
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div className={`text-[9px] font-black px-3 py-1 glass-panel uppercase tracking-widest ${isUnlocked ? 'text-emerald-400 border-emerald-500/30' : 'text-white/20 border-white/5'}`}>
                                                    {isUnlocked ? t(TL.ui.status, lang) : `${t(TL.ui.level, lang)} ${perk.levelRequired}`}
                                                </div>
                                            </div>

                                            <div className="relative z-10 space-y-2">
                                                <h4 className={`text-sm font-black uppercase italic tracking-widest transition-colors ${isUnlocked ? 'text-white' : 'text-white/20'}`}>
                                                    {typeof perkInfo.name === 'string' ? perkInfo.name : t(perkInfo.name, lang)}
                                                </h4>
                                                <p className={`text-[10px] uppercase font-bold tracking-wider leading-relaxed ${isUnlocked ? 'text-white/40' : 'text-white/10'}`}>
                                                    {typeof perkInfo.description === 'string' ? perkInfo.description : t(perkInfo.description, lang)}
                                                </p>
                                            </div>

                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RECENT ACTIVITY LOG PLACEHOLDER */}
                        <div className="p-8 glass-panel border-white/5 bg-black/40 flex items-center gap-8 group">
                            <div className="p-4 glass-panel border-cyan-500/20 bg-cyan-500/5 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-2 leading-none">{t(TL.ui.dossierActive, lang)}</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 text-[9px] text-white/20 uppercase font-black">
                                        <span className="text-cyan-400">[{t(TL.ui.active, lang)}]</span> {t(TL.ui.globalCoordLink, lang)} 84.19.X
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] text-white/20 uppercase font-black">
                                        <span className="text-white/40">[LOG]</span> {t(TL.ui.syncOk, lang)} // SECTOR_7
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const BentoMetric = ({ label, value, subValue, icon, color = 'text-white' }: { label: string, value: string, subValue: string, icon: any, color?: string }) => (
    <div className="glass-panel p-4 md:p-6 bg-white/[0.03] border-white/10 relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 md:p-5 opacity-10 group-hover:opacity-20 transition-opacity">
            {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: `${(icon.props as any).className || ''} w-4 h-4 md:w-5 md:h-5` }) : icon}
        </div>
        <span className="text-[7px] md:text-[9px] text-white/20 font-black uppercase tracking-[0.3em] block mb-1.5 md:mb-2 italic">{label}</span>
        <div className={`text-lg md:text-xl font-black uppercase tracking-tighter italic ${color} leading-none mb-1 md:mb-1.5 truncate pr-8`}>
            {value}
        </div>
        <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-widest">{subValue}</span>
    </div>
);

export default FactionPanel;
