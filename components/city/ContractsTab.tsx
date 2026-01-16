import React, { useMemo } from 'react';
import { ContractsTabProps, getFactionStyle } from './types';
import { Resources } from '../../types';
import { getResourceLabel } from '../../services/gameMath';

import { useGameStore } from '../../store/gameStore';

const ContractsTab: React.FC<ContractsTabProps> = ({
    resources,
    xp,
    depth,
    activeQuests,
    onCompleteQuest,
    onRefreshQuests
}) => {
    const questList = useMemo(() => Object.values(activeQuests), [activeQuests]);
    const { reputation } = useGameStore();

    return (
        <div className="max-w-2xl mx-auto">
            {/* REPUTATION HEADER */}
            <div className="flex justify-between items-center mb-4 bg-zinc-900/50 p-2 border border-zinc-800 rounded">
                <div className="flex gap-4">
                    <div className="text-[10px]">
                        <span className="text-zinc-400">CORP: </span>
                        <span className="text-white font-bold">{reputation?.CORPORATE || 0}</span>
                    </div>
                    <div className="text-[10px]">
                        <span className="text-cyan-400">SCIENCE: </span>
                        <span className="text-white font-bold">{reputation?.SCIENCE || 0}</span>
                    </div>
                    <div className="text-[10px]">
                        <span className="text-amber-500">REBELS: </span>
                        <span className="text-white font-bold">{reputation?.REBELS || 0}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 md:mb-6">
                <div>
                    <h3 className="text-lg md:text-xl pixel-text text-white">ДОСКА ОБЪЯВЛЕНИЙ</h3>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-mono">ЗАПРОСЫ ФРАКЦИЙ</p>
                </div>
                <button
                    onClick={onRefreshQuests}
                    className="text-[9px] md:text-[10px] border border-zinc-700 bg-zinc-900 px-2 md:px-3 py-1 hover:bg-zinc-800 transition-colors active:scale-95"
                >
                    ОБНОВИТЬ (100 ГЛИНЫ)
                </button>
            </div>

            {questList.length === 0 ? (
                <div className="border border-red-500/50 bg-red-950/20 p-8 text-center animate-pulse">
                    <h4 className="text-red-500 font-bold pixel-text text-sm mb-2">НЕТ АКТИВНЫХ КОНТРАКТОВ</h4>
                    <p className="text-zinc-400 font-mono text-xs">ТРЕБУЕТСЯ ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {questList.map(quest => {
                        const style = getFactionStyle(quest.issuer);
                        let canComplete = true;
                        quest.requirements.forEach(req => {
                            if (req.type === 'RESOURCE' || req.type === 'TECH') {
                                if (resources[req.target as keyof Resources] < req.amount) canComplete = false;
                            } else if (req.type === 'XP') {
                                if (xp < req.amount) canComplete = false;
                            } else if (req.type === 'DEPTH') {
                                if (depth < req.amount) canComplete = false;
                            }
                        });
                        return (
                            <div key={quest.id} className={`border p-3 md:p-4 flex flex-col justify-between relative group ${style.border} ${style.bg}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded font-bold ${style.badge} text-white`}>
                                            {quest.issuer}
                                        </span>
                                    </div>
                                    <h4 className={`text-xs md:text-sm font-bold mb-1 ${style.text}`}>{quest.title}</h4>
                                    <p className="text-[9px] text-zinc-400 mb-3 leading-tight">{quest.description}</p>

                                    {/* REQUIREMENTS */}
                                    <div className="mb-3">
                                        <div className="text-[8px] text-zinc-500 font-bold mb-1">ТРЕБОВАНИЯ:</div>
                                        <div className="bg-black/30 p-1.5 md:p-2 border-l-2 border-red-900/30">
                                            {quest.requirements.map((req, i) => (
                                                <div key={i} className="flex justify-between text-[10px] md:text-xs font-mono">
                                                    <span>{getResourceLabel(req.target)}</span>
                                                    <span className={(req.type === 'RESOURCE' && resources[req.target as keyof Resources] >= req.amount) ? 'text-green-500' : 'text-red-500'}>
                                                        {req.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* REWARDS */}
                                    <div className="mb-2">
                                        <div className="text-[8px] text-zinc-500 font-bold mb-1">НАГРАДА:</div>
                                        <div className="bg-black/30 p-1.5 md:p-2 border-l-2 border-green-900/30">
                                            {quest.rewards.map((rew, i) => (
                                                <div key={i} className="flex justify-between text-[10px] md:text-xs font-mono">
                                                    <span>{rew.type === 'REPUTATION' ? 'REP' : getResourceLabel(rew.target)}</span>
                                                    <span className="text-green-400">+{rew.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {/* Legacy Display */}
                                            {quest.reputationReward && (
                                                <div className="flex justify-between text-[10px] md:text-xs font-mono">
                                                    <span>REP</span>
                                                    <span className="text-green-400">+{quest.reputationReward}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onCompleteQuest(quest.id)}
                                    disabled={!canComplete}
                                    className={`mt-3 w-full py-2 text-[10px] md:text-xs font-bold pixel-text ${canComplete ? 'bg-white text-black hover:bg-green-400' : 'bg-black text-zinc-600 border border-zinc-800'}`}
                                >
                                    {canComplete ? 'ВЫПОЛНИТЬ' : 'НЕДОСТУПНО'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ContractsTab;
