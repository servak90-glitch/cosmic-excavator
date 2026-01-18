import React, { useEffect } from 'react';
import { ArtifactDefinition, ArtifactRarity } from '../types';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS } from '../services/localization';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { audioEngine } from '../services/audioEngine';



interface CodexViewProps {
    discoveredArtifacts: string[]; // List of DefIDs
}

const CodexView: React.FC<CodexViewProps> = ({ discoveredArtifacts }) => {
    const lang = useGameStore(s => s.settings.language);

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

    const discoveredCount = discoveredArtifacts.length;
    const totalCount = ARTIFACTS.length;

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

            {/* SCROLL CONTAINER */}
            <div className="flex-1 overflow-y-auto relative z-10 touch-pan-y overscroll-contain">
                {/* GRID CONTAINER */}
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
            </div>
        </div>
    );
};

export default CodexView;
