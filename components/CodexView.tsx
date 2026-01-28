import React, { useEffect, useState } from 'react';
import { ArtifactDefinition, ArtifactRarity } from '../types';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS, TL } from '../services/localization';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { audioEngine } from '../services/audioEngine';
import { MONSTER_CODEX } from '../constants/monsters';
import {
    Box,
    Skull,
    Info,
    Shield,
    Zap,
    Lock,
    Sparkles,
    Flame,
    Wind,
    Droplets,
    Activity,
    Search,
    Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodexViewProps {
    discoveredArtifacts: string[];
}

const CodexView: React.FC<CodexViewProps> = ({ discoveredArtifacts }) => {
    const lang = useGameStore(s => s.settings.language);
    const defeatedBosses = useGameStore(s => s.defeatedBosses);
    const [tab, setTab] = useState<'artifacts' | 'monsters'>('artifacts');

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const sortedArtifacts = [...ARTIFACTS].sort((a, b) => {
        const rarityOrder = {
            [ArtifactRarity.COMMON]: 1,
            [ArtifactRarity.RARE]: 2,
            [ArtifactRarity.EPIC]: 3,
            [ArtifactRarity.LEGENDARY]: 4,
            [ArtifactRarity.ANOMALOUS]: 5
        };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    const discoveredCount = tab === 'artifacts' ? discoveredArtifacts.length : defeatedBosses.length;
    const totalCount = tab === 'artifacts' ? ARTIFACTS.length : MONSTER_CODEX.length;
    const completionPercent = Math.floor((discoveredCount / totalCount) * 100);

    return (
        <div className="flex-1 flex flex-col bg-void relative h-full overflow-hidden pointer-events-auto">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${tab === 'artifacts' ? 'from-cyan-500/5' : 'from-rose-500/5'} to-transparent pointer-events-none transition-colors duration-1000`} />

            {/* HEADER HUB */}
            <div className="relative z-10 glass-panel border-x-0 border-t-0 rounded-none pb-6 mb-2 flex flex-col md:flex-row justify-between items-start md:items-end p-6 gap-4 bg-black/40">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Database className={`w-5 h-5 ${tab === 'artifacts' ? 'text-cyan-400' : 'text-rose-400'}`} />
                        <h2 className="text-xl md:text-2xl font-black font-technical tracking-tighter text-white uppercase italic">
                            {t(TL.ui.xenoArchive, lang)} // V.4.2
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 glass-panel py-1 px-3 border-white/5 bg-white/5">
                            <span className="text-[10px] text-white/30 font-technical uppercase tracking-widest leading-none">{t(TL.ui.status_label, lang)}:</span>
                            <span className="text-[10px] text-white font-technical font-black uppercase leading-none">{t(TL.ui.accessGranted, lang)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel py-3 px-6 border-white/10 bg-white/5 flex flex-col items-center md:items-end min-w-[140px]">
                        <span className="text-[9px] text-white/30 font-technical font-black uppercase tracking-widest mb-1">{t(TL.ui.databaseCoverage, lang)}</span>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-black font-technical text-white leading-none tabular-nums">
                                {completionPercent}<span className="text-xs opacity-40 ml-0.5">%</span>
                            </div>
                            <div className="text-[10px] font-technical text-white/20">[{discoveredCount}/{totalCount}]</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATOR */}
            <div className="relative z-10 flex px-6 py-2 gap-4 shrink-0 bg-black/20 border-b border-white/5">
                <button
                    onClick={() => setTab('artifacts')}
                    className={`flex items-center gap-2 py-3 px-6 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em]
                        ${tab === 'artifacts' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Box className="w-3.5 h-3.5" />
                    {t(TL.ui.artifactsVault, lang)}
                </button>
                <button
                    onClick={() => setTab('monsters')}
                    className={`flex items-center gap-2 py-3 px-6 text-[10px] font-black font-technical transition-all border-b-2 uppercase tracking-[0.2em]
                        ${tab === 'monsters' ? 'border-rose-400 text-rose-400 bg-rose-400/5' : 'border-transparent text-white/30 hover:text-white/60'}
                    `}
                >
                    <Skull className="w-3.5 h-3.5" />
                    {t(TL.ui.hostileRegistry, lang)}
                </button>
            </div>

            {/* SCROLLABLE GRID */}
            <div className="flex-1 overflow-y-auto relative z-10 px-6 py-8 scrollbar-hide pb-4 md:pb-8">
                <AnimatePresence mode="wait">
                    {tab === 'artifacts' ? (
                        <motion.div
                            key="artifacts"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {sortedArtifacts.map((def) => {
                                const isDiscovered = discoveredArtifacts.includes(def.id);
                                const colorClass = getArtifactColor(def.rarity);
                                const borderColor = colorClass.split(' ')[0];
                                const textColor = colorClass.split(' ')[1];

                                return (
                                    <div
                                        key={def.id}
                                        className={`glass-panel min-h-[260px] p-5 flex flex-col items-center relative group overflow-hidden transition-all duration-500
                                            ${isDiscovered ? `hover:border-cyan-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white/[0.03]` : 'opacity-40 grayscale blur-[1px]'}
                                        `}
                                    >
                                        <div className="w-full flex justify-between items-center mb-6 z-10">
                                            <span className="text-[8px] font-black font-technical text-white/20 uppercase tracking-widest shrink-0">DEF_ID: {def.id.substring(0, 4)}</span>
                                            {isDiscovered ? (
                                                <div className={`px-2 py-0.5 rounded-full border border-current text-[7px] font-black font-technical uppercase tracking-widest ${textColor}`}>
                                                    {def.rarity}
                                                </div>
                                            ) : <Lock className="w-2.5 h-2.5 text-white/20" />}
                                        </div>

                                        <div className={`flex-1 flex items-center justify-center text-5xl md:text-6xl my-4 relative transition-all duration-700
                                            ${isDiscovered ? 'filter drop-shadow-[0_0_15px_currentColor]' : 'opacity-5 blur-md'}
                                        `}>
                                            {isDiscovered ? def.icon : '❓'}
                                            {isDiscovered && <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent blur-2xl opacity-40 animate-pulse pointer-events-none" />}
                                        </div>

                                        <div className="w-full text-center mt-auto z-10">
                                            <h4 className={`text-[10px] md:text-xs font-black font-technical uppercase tracking-tight mb-2 leading-tight transition-colors ${isDiscovered ? 'text-white group-hover:text-cyan-400' : 'text-white/20'}`}>
                                                {isDiscovered ? t(def.name, lang) : t(TL.ui.unknownSubstance, lang)}
                                            </h4>
                                            {isDiscovered && (
                                                <div className="text-[9px] text-white/30 font-technical leading-relaxed h-[36px] overflow-hidden line-clamp-3 italic">
                                                    "{t(def.loreDescription, lang)}"
                                                </div>
                                            )}
                                        </div>

                                        {/* HOVER DETAIL OVERLAY */}
                                        {isDiscovered && (
                                            <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-6 flex flex-col justify-center text-center z-20 border-t-2 border-cyan-500 overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent)]" />
                                                <div className={`text-[10px] font-black font-technical uppercase tracking-widest mb-2 ${textColor}`}>{t(def.name, lang)}</div>
                                                <p className="text-[9px] text-white/50 font-technical leading-relaxed mb-4">{t(def.description, lang)}</p>
                                                <div className="w-full h-px bg-white/10 mb-4" />
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">{t(TL.ui.augmentationMod, lang)}:</span>
                                                    <div className="glass-panel p-2 border-emerald-500/20 bg-emerald-500/5 text-[9px] text-emerald-400 font-bold font-technical leading-tight">
                                                        {t(def.effectDescription, lang)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="monsters"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {MONSTER_CODEX.map((monster) => {
                                const isDefeated = defeatedBosses.includes(monster.id);

                                return (
                                    <div
                                        key={monster.id}
                                        className={`glass-panel min-h-[260px] p-5 flex flex-col items-center relative group overflow-hidden transition-all duration-500
                                            ${isDefeated ? `hover:border-rose-500 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-white/[0.03]` : 'opacity-40 grayscale blur-[1px]'}
                                        `}
                                    >
                                        <div className="w-full flex justify-between items-center mb-6 z-10">
                                            <span className="text-[8px] font-black font-technical text-white/20 uppercase tracking-widest shrink-0">STRATE_ID: {monster.id.substring(0, 4)}</span>
                                            {isDefeated ? (
                                                <div className="px-2 py-0.5 rounded-full border border-rose-500/50 text-rose-400 text-[7px] font-black font-technical uppercase tracking-widest">
                                                    Tier_{monster.tier}
                                                </div>
                                            ) : <Lock className="w-2.5 h-2.5 text-white/20" />}
                                        </div>

                                        <div className={`flex-1 flex items-center justify-center text-5xl md:text-6xl my-4 relative transition-all duration-700
                                            ${isDefeated ? 'filter drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'opacity-5 blur-md'}
                                        `}>
                                            {isDefeated ? monster.icon : '💀'}
                                        </div>

                                        <div className="w-full text-center mt-auto z-10">
                                            <h4 className={`text-[10px] md:text-xs font-black font-technical uppercase tracking-tight mb-2 leading-tight transition-colors ${isDefeated ? 'text-white group-hover:text-rose-400' : 'text-white/20'}`}>
                                                {isDefeated ? t(monster.name, lang) : t(TL.ui.unknownSpectre, lang)}
                                            </h4>
                                            {isDefeated && (
                                                <div className="text-[9px] text-white/30 font-technical leading-relaxed h-[36px] overflow-hidden line-clamp-3 italic">
                                                    "{t(monster.description, lang)}"
                                                </div>
                                            )}
                                        </div>

                                        {/* HOVER DETAIL OVERLAY */}
                                        {isDefeated && (
                                            <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-6 flex flex-col justify-center text-center z-20 border-t-2 border-rose-500">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.1),transparent)]" />
                                                <div className="text-[10px] font-black font-technical uppercase tracking-widest mb-2 text-rose-400">{t(monster.name, lang)}</div>
                                                <p className="text-[9px] text-white/50 font-technical leading-relaxed mb-4">{t(monster.lore, lang)}</p>
                                                <div className="w-full h-px bg-white/10 mb-4" />
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{t(TL.ui.identifiedWeakness, lang)}:</span>
                                                    <div className="glass-panel py-1 px-4 border-cyan-500/20 bg-cyan-500/5 text-[10px] text-cyan-400 font-bold font-technical uppercase">
                                                        {t((TL as any).weaknesses[monster.weakness], lang) || monster.weakness}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CodexView;
