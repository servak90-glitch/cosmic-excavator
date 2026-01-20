import React, { useEffect, useState } from 'react';
import { ArtifactDefinition, ArtifactRarity } from '../types';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS } from '../services/localization';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { audioEngine } from '../services/audioEngine';
import { MONSTER_CODEX } from '../constants/monsters';



interface CodexViewProps {
    discoveredArtifacts: string[]; // List of DefIDs
}

const CodexView: React.FC<CodexViewProps> = ({ discoveredArtifacts }) => {
    const lang = useGameStore(s => s.settings.language);
    const defeatedBosses = useGameStore(s => s.defeatedBosses);
    const [tab, setTab] = useState<'artifacts' | 'monsters'>('artifacts');

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);
    // Sort artifacts: Common -> Rare -> Epic -> Legendary -> Anomalous

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

    return (
        <div className="flex-1 flex flex-col bg-[#050505] relative h-full overflow-hidden pointer-events-auto">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] z-0" />
            <div className="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] opacity-20 pointer-events-none" />

            {/* HEADER */}
            <div className="relative z-10 border-b-2 border-zinc-800 pb-4 mb-2 flex justify-between items-end p-4 shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl pixel-text text-zinc-200 mb-1">{t(TEXT_IDS.ARCHIVE_TITLE, lang)}</h2>
                    <div className="text-[10px] md:text-xs text-zinc-500 font-mono">
                        {t(TEXT_IDS.COLLECTION_STATUS, lang)}: <span className="text-cyan-400 font-bold">{Math.floor((discoveredCount / totalCount) * 100)}%</span> [{discoveredCount} / {totalCount}]
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[9px] text-zinc-600 font-mono">CLASSIFIED: OMEGA</div>
                </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="relative z-10 flex gap-2 px-4 pb-2 shrink-0">
                <button
                    onClick={() => setTab('artifacts')}
                    className={`flex-1 py-2 px-4 text-xs font-bold transition-all border-b-2 ${tab === 'artifacts'
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                        }`}
                >
                    📦 АРТЕФАКТЫ
                </button>
                <button
                    onClick={() => setTab('monsters')}
                    className={`flex-1 py-2 px-4 text-xs font-bold transition-all border-b-2 ${tab === 'monsters'
                        ? 'border-red-400 text-red-400'
                        : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                        }`}
                >
                    👹 МОНСТРЫ
                </button>
            </div>

            {/* SCROLL CONTAINER */}
            <div className="flex-1 overflow-y-auto relative z-10 touch-pan-y overscroll-contain">
                {/* ARTIFACTS TAB */}
                {tab === 'artifacts' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 pb-24">
                        {sortedArtifacts.map((def) => {
                            const isDiscovered = discoveredArtifacts.includes(def.id);
                            const colorClass = getArtifactColor(def.rarity);
                            const borderColor = colorClass.split(' ')[0]; // Extract border class
                            const textColor = colorClass.split(' ')[1]; // Extract text class

                            return (
                                <div
                                    key={def.id}
                                    className={`aspect-[4/5] min-h-[220px] border bg-black/50 p-3 flex flex-col items-center relative group overflow-hidden transition-all
                                ${isDiscovered ? `${borderColor} opacity-100` : 'border-zinc-900 opacity-40'}
                            `}
                                >
                                    <div className="w-full flex justify-between text-[8px] font-mono text-zinc-600 uppercase mb-2 shrink-0">
                                        <span>ID: {def.id.substring(0, 4)}</span>
                                        {isDiscovered ? <span className={textColor}>{def.rarity}</span> : <span>{t(TEXT_IDS.LOCKED_ITEM, lang)}</span>}
                                    </div>


                                    {/* Icon */}
                                    <div className={`flex-1 flex items-center justify-center text-4xl md:text-5xl my-2 filter ${isDiscovered ? 'drop-shadow-[0_0_10px_currentColor] grayscale-0' : 'grayscale blur-sm opacity-20'}`}>
                                        {isDiscovered ? def.icon : '?'}
                                    </div>

                                    {/* Info */}
                                    <div className="w-full text-center mt-auto shrink-0">
                                        <div className={`text-[10px] md:text-xs font-bold pixel-text mb-2 leading-tight ${isDiscovered ? 'text-white' : 'text-zinc-700'}`}>
                                            {isDiscovered ? t(def.name, lang) : t(TEXT_IDS.UNKNOWN_ITEM, lang)}
                                        </div>

                                        {isDiscovered && (
                                            <div className="text-[8px] text-zinc-500 line-clamp-3 italic leading-snug h-[3em]">
                                                "{t(def.loreDescription, lang)}"
                                            </div>
                                        )}

                                    </div>

                                    {/* Hover Overlay (Full details) */}
                                    {isDiscovered && (
                                        <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform p-4 flex flex-col justify-center text-center z-20 border-t border-zinc-800">
                                            <div className={`text-[10px] font-bold mb-2 ${textColor}`}>{t(def.name, lang)}</div>
                                            <div className="text-[9px] text-zinc-300 mb-3 leading-relaxed">{t(def.description, lang)}</div>
                                            <div className="w-full h-px bg-zinc-800 mb-3" />
                                            <div className="text-[9px] text-green-400 font-mono uppercase">
                                                {t(TEXT_IDS.LABEL_EFFECT, lang)}
                                                <br />
                                                {t(def.effectDescription, lang)}
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MONSTERS TAB */}
                {tab === 'monsters' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 pb-24">
                        {MONSTER_CODEX.map((monster) => {
                            const isDefeated = defeatedBosses.includes(monster.id);
                            const borderColor = isDefeated ? 'border-red-500' : 'border-zinc-900';
                            const textColor = isDefeated ? 'text-red-400' : 'text-zinc-700';

                            return (
                                <div
                                    key={monster.id}
                                    className={`aspect-[4/5] min-h-[220px] border bg-black/50 p-3 flex flex-col items-center relative group overflow-hidden transition-all ${isDefeated ? borderColor + ' opacity-100' : 'border-zinc-900 opacity-40'
                                        }`}
                                >
                                    <div className="w-full flex justify-between text-[8px] font-mono text-zinc-600 uppercase mb-2 shrink-0">
                                        <span>ID: {monster.id.substring(0, 4)}</span>
                                        {isDefeated ? <span className={textColor}>TIER {monster.tier}</span> : <span>{t(TEXT_IDS.LOCKED_ITEM, lang)}</span>}
                                    </div>

                                    {/* Icon */}
                                    <div className={`flex-1 flex items-center justify-center text-4xl md:text-5xl my-2 filter ${isDefeated ? 'drop-shadow-[0_0_10px_currentColor] grayscale-0' : 'grayscale blur-sm opacity-20'
                                        }`}>
                                        {isDefeated ? monster.icon : '?'}
                                    </div>

                                    {/* Info */}
                                    <div className="w-full text-center mt-auto shrink-0">
                                        <div className={`text-[10px] md:text-xs font-bold pixel-text mb-2 leading-tight ${isDefeated ? 'text-white' : 'text-zinc-700'
                                            }`}>
                                            {isDefeated ? t(monster.name, lang) : t(TEXT_IDS.UNKNOWN_ITEM, lang)}
                                        </div>

                                        {isDefeated && (
                                            <div className="text-[8px] text-zinc-500 line-clamp-2 italic leading-snug h-[2.5em]">
                                                "{t(monster.description, lang)}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Overlay (Full details) */}
                                    {
                                        isDefeated && (
                                            <div className="absolute inset-0 bg-black/95 translate-y-full group-hover:translate-y-0 transition-transform p-4 flex flex-col justify-center text-center z-20 border-t border-zinc-800">
                                                <div className="text-[10px] font-bold mb-2 text-red-400">{t(monster.name, lang)}</div>
                                                <div className="text-[9px] text-zinc-300 mb-2 leading-relaxed">{t(monster.lore, lang)}</div>
                                                <div className="w-full h-px bg-zinc-800 mb-2" />
                                                <div className="text-[9px] text-cyan-400 font-mono">
                                                    СЛАБОСТЬ: {monster.weakness}
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
};

export default CodexView;
