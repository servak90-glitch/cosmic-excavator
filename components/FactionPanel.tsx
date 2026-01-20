import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FACTIONS, REPUTATION_TIERS } from '../constants/factions';
import { FactionId, FactionPerk } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TL, t } from '../services/localization';

const FactionPanel: React.FC = () => {
    const { reputation, getReputationLevel, getReputationTierName, getActivePerks, settings } = useGameStore();
    const lang = settings.language;
    const [selectedFaction, setSelectedFaction] = useState<FactionId>('CORPORATE');

    const factions: FactionId[] = ['CORPORATE', 'SCIENCE', 'REBELS'];

    // Helper to get next tier
    const getNextTier = (currentRep: number) => {
        return REPUTATION_TIERS.find(t => t.min > currentRep);
    };

    const currentRep = reputation[selectedFaction] || 0;
    const currentLevel = getReputationLevel(selectedFaction);
    const tierName = getReputationTierName(selectedFaction);
    const nextTier = getNextTier(currentRep);
    const activePerks = getActivePerks(selectedFaction);
    const allPerks = FACTIONS[selectedFaction].perks;

    // Calculate progress to next tier
    const prevTierMin = REPUTATION_TIERS.find(t => t.level === currentLevel)?.min || 0;
    const nextTierMin = nextTier?.min || prevTierMin + 1000;
    const progress = Math.min(100, Math.max(0, ((currentRep - prevTierMin) / (nextTierMin - prevTierMin)) * 100));

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-zinc-900/50 p-2 md:p-4 rounded-lg border border-cyan-900/30">
            {/* Faction Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {factions.map(fid => (
                    <button
                        key={fid}
                        onClick={() => setSelectedFaction(fid)}
                        className={`px-4 py-2 rounded border transition-all whitespace-nowrap ${selectedFaction === fid
                            ? 'bg-cyan-900/50 border-cyan-500 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-black/40 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <span className="font-bold pixel-text">{t(TL.factions.names[fid], lang)}</span>
                    </button>
                ))}
            </div>

            {/* Selected Faction Content */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={selectedFaction}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col pr-2"
                >
                    {/* Header Info */}
                    <div className="mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-black text-white mb-1 pixel-text uppercase">
                            {t(TL.factions.names[selectedFaction], lang).toUpperCase()}
                        </h2>
                        <p className="text-sm text-zinc-400 font-mono mb-4">
                            {t(TL.factions.descriptions[selectedFaction], lang)}
                        </p>

                        {(selectedFaction === 'CORPORATE' && reputation['REBELS'] > 0) && (
                            <p className="mb-4 text-xs font-bold text-red-400 border border-red-900/50 bg-red-900/20 px-3 py-2 rounded flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{t(TL.factions.rivalry, lang)} {t(TL.factions.names['REBELS'], lang)} (-50%)</span>
                            </p>
                        )}
                        {(selectedFaction === 'REBELS' && reputation['CORPORATE'] > 0) && (
                            <p className="mb-4 text-xs font-bold text-red-400 border border-red-900/50 bg-red-900/20 px-3 py-2 rounded flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{t(TL.factions.rivalry, lang)} {t(TL.factions.names['CORPORATE'], lang)} (-50%)</span>
                            </p>
                        )}

                        {/* Reputation Status */}
                        <div className="bg-black/30 p-4 rounded border border-white/5">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-xs text-zinc-500 uppercase block mb-1">{t(TL.factions.standing, lang)}</span>
                                    <span className={`text-xl font-bold ${currentRep >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                                        {tierName} <span className="text-sm text-zinc-500">(Lvl {currentLevel})</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-mono text-white">{Math.floor(currentRep)}</span>
                                    <span className="text-xs text-zinc-500 block">{t(TL.factions.reputation, lang)}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-black rounded-full overflow-hidden mb-1">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                                {/* Scanline effect on bar */}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-full h-full opacity-30" />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                                <span>{prevTierMin}</span>
                                <span>{t(TL.factions.nextTier, lang)}: {nextTier ? nextTier.name.toUpperCase() : t(TL.factions.max, lang)} ({nextTierMin})</span>
                            </div>
                        </div>
                    </div>

                    {/* Perks Section */}
                    <div>
                        <h3 className="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center gap-2">
                            <span className="text-cyan-500">◈</span> {t(TL.factions.perkTitle, lang)}
                        </h3>

                        <div className="space-y-3">
                            {allPerks.map((perk) => {
                                const isUnlocked = currentLevel >= perk.levelRequired;
                                const perkInfo = (TL.factions.perks as any)[perk.id] || perk;
                                return (
                                    <div
                                        key={perk.id}
                                        className={`p-3 rounded border border-l-4 transition-all ${isUnlocked
                                            ? 'bg-cyan-950/20 border-cyan-900/50 border-l-cyan-500'
                                            : 'bg-black/20 border-zinc-800 border-l-zinc-700 opacity-60'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold text-sm ${isUnlocked ? 'text-cyan-300' : 'text-zinc-500'}`}>
                                                {typeof perkInfo.name === 'string' ? perkInfo.name : t(perkInfo.name, lang)}
                                            </span>
                                            <span className="text-[10px] font-mono py-0.5 px-1.5 rounded bg-black/50 text-zinc-500 border border-zinc-800">
                                                LVL {perk.levelRequired}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            {typeof (perkInfo.desc || perkInfo.description) === 'string' ? (perkInfo.desc || perkInfo.description) : t((perkInfo.desc || perkInfo.description), lang)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FactionPanel;
