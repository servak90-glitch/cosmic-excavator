import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Quest, QuestStatus, QuestObjective, QuestReward, FactionId } from '../types';
import { getAvailableQuests, getQuestById, generateQuestBatch } from '../services/questRegistry';
import { TL, t } from '../services/localization';


const FACTION_COLORS: Record<FactionId, string> = {
    'CORPORATE': 'border-blue-500/50 text-blue-300',
    'SCIENCE': 'border-cyan-500/50 text-cyan-300',
    'REBELS': 'border-red-500/50 text-red-300'
};

const FACTION_BADGES: Record<FactionId, string> = {
    'CORPORATE': '🏢 CORP',
    'SCIENCE': '🔬 SCI',
    'REBELS': '✊ REBEL'
};

/**
 * QuestPanel - UI компонент для отображения и управления квестами
 * Phase 3.1: Foundation + Factions
 */
const QuestPanel: React.FC = () => {
    const {
        activeQuests,
        completedQuestIds,
        depth,
        level,
        acceptQuest,
        completeQuest,
        refreshQuests,
        settings
    } = useGameStore();

    const lang = settings.language;


    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('active');
    const [dynamicQuests, setDynamicQuests] = useState<Quest[]>([]);

    // Получаем статические (сюжетные) квесты
    const availableStoryQuests = getAvailableQuests(completedQuestIds)
        .filter(q => !activeQuests.some(aq => aq.id === q.id) && !completedQuestIds.includes(q.id));

    // Функция обновления динамических контрактов
    const handleRefresh = () => {
        refreshQuests(100); // Тратим 100 глины через стор
        const batch = generateQuestBatch(depth, level || 1);
        setDynamicQuests(batch);
    };

    // Все доступные задания (сюжетные + динамические)
    const allAvailable = [...availableStoryQuests, ...dynamicQuests];

    // === RENDER HELPERS ===

    const renderObjectives = (quest: Quest) => (
        <div className="mt-2 space-y-1">
            {quest.objectives.map(obj => (
                <div key={obj.id} className="text-xs flex justify-between items-center bg-black/20 p-1 rounded">
                    <span>{t(obj.description, lang)}</span>

                    <span className={obj.current >= obj.required ? 'text-green-400' : 'text-gray-400'}>
                        {obj.current} / {obj.required}
                    </span>
                </div>
            ))}
        </div>
    );

    const renderRewards = (rewards: QuestReward[]) => (
        <div className="mt-2 flex flex-wrap gap-2">
            {rewards.map((r, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-yellow-900/40 text-yellow-200 border border-yellow-700/50 rounded flex items-center gap-1">
                    <span>🎁</span>
                    {r.type}: <span className="text-white">{r.target}</span> {r.amount ? `x${r.amount}` : ''}
                </span>
            ))}
        </div>
    );

    const renderFactionBadge = (factionId?: FactionId) => {
        if (!factionId) return null;
        return (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${FACTION_COLORS[factionId]} bg-black/40 uppercase tracking-wider`}>
                {FACTION_BADGES[factionId]}
            </span>
        );
    };

    return (
        <div className="flex flex-col bg-slate-900/95 border border-slate-700 rounded-lg relative shadow-2xl backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <span>📜</span> {t(TL.quests.title, lang)}
                </h2>


                {/* Tabs */}
                <div className="flex bg-slate-900 rounded p-1">
                    {(['available', 'active', 'completed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === tab
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            {t(TL.quests.tabs[tab], lang)} ({

                                tab === 'available' ? allAvailable.length :
                                    tab === 'active' ? activeQuests.length :
                                        completedQuestIds.length
                            })
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">

                {activeTab === 'available' && (
                    <div className="space-y-4">
                        <button
                            onClick={handleRefresh}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium border border-slate-600 mb-2 flex items-center justify-center gap-2"
                        >
                            <span>🔄</span> {allAvailable.length === 0 ? "Найти контракты" : "Обновить контракты"}
                        </button>

                        {allAvailable.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">{t(TL.quests.noAvailable, lang)}</div>

                        ) : (
                            allAvailable.map(quest => (
                                <div key={quest.id} className={`bg-slate-800 border p-4 rounded-lg hover:border-opacity-100 transition-colors ${quest.factionId ? FACTION_COLORS[quest.factionId].split(' ')[0] : 'border-slate-600'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold text-lg ${quest.factionId ? FACTION_COLORS[quest.factionId].split(' ')[1] : 'text-slate-200'}`}>
                                                    {t(quest.title, lang)}
                                                </h3>
                                                {renderFactionBadge(quest.factionId)}
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{t(quest.description, lang)}</p>

                                        </div>
                                        <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">{quest.type}</span>
                                    </div>

                                    {renderRewards(quest.rewards)}
                                    {renderObjectives(quest)}

                                    <button
                                        onClick={() => {
                                            acceptQuest(quest.id);
                                            // Если это динамический квест, убираем его из временного списка после принятия
                                            if (quest.id.startsWith('rnd_')) {
                                                setDynamicQuests(prev => prev.filter(q => q.id !== quest.id));
                                            }
                                        }}
                                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all active:scale-95 border border-blue-400/30"
                                    >
                                        {t(TL.quests.accept, lang)}

                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'active' && (
                    activeQuests.length === 0 ? (
                        <div className="text-center text-slate-500 mt-10">{t(TL.quests.noActive, lang)}</div>

                    ) : (
                        activeQuests.map(quest => {
                            const isReady = quest.objectives.every(o => o.current >= o.required);
                            return (
                                <div key={quest.id} className={`bg-slate-800 border ${isReady ? 'border-green-500 glow-green' : 'border-slate-600'} p-4 rounded-lg relative overflow-hidden`}>
                                    {/* Status Bar */}
                                    <div className={`absolute top-0 left-0 w-1 h-full ${isReady ? 'bg-green-500' : 'bg-blue-500/30'}`}></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-white">{t(quest.title, lang)}</h3>

                                                {renderFactionBadge(quest.factionId)}
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{t(quest.description, lang)}</p>

                                        </div>
                                        {isReady && <span className="text-xs px-2 py-1 bg-green-600 text-white rounded animate-pulse font-bold">{t(TL.quests.ready, lang)}</span>}

                                    </div>

                                    {renderObjectives(quest)}

                                    {isReady && (
                                        <button
                                            onClick={() => completeQuest(quest.id)}
                                            className="mt-4 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-all shadow-lg hover:shadow-green-500/50"
                                        >
                                            {t(TL.quests.complete, lang)} (+{t(TL.quests.rewards, lang).toUpperCase()})

                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )
                )}

                {activeTab === 'completed' && (
                    <div className="space-y-2 opacity-80">
                        {completedQuestIds.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10">{t(TL.quests.emptyHistory, lang)}</div>

                        ) : (
                            completedQuestIds.map(id => {
                                const def = getQuestById(id);
                                return (
                                    <div key={id} className="bg-slate-800/50 border border-slate-700 p-3 rounded flex justify-between items-center hover:bg-slate-800 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-slate-200 font-medium">{def ? t(def.title, lang) : id}</span>
                                            {def && <span className="text-xs text-slate-500">{t(def.description, lang).slice(0, 50)}...</span>}

                                        </div>
                                        <div className="flex items-center gap-2">
                                            {def && renderFactionBadge(def.factionId)}
                                            <span className="text-green-500 text-xs font-bold border border-green-900 bg-green-900/20 px-2 py-1 rounded">✔ {t(TL.quests.completedStatus, lang)}</span>

                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </div>
    );
};

export default QuestPanel;
