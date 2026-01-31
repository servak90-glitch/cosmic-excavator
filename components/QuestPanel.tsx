import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Quest, FactionId, QuestReward } from '../types';
import { getAvailableQuests, getQuestById, generateQuestBatch } from '../services/questRegistry';
import { TL, t } from '../services/localization';
import { getResourceLabel } from '../services/gameMath';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScrollText,
    Target,
    CheckCircle2,
    Clock,
    RefreshCcw,
    ShieldAlert,
    Trophy,
    Zap,
    Briefcase,
    Beaker,
    Users,
    Navigation,
    Search,
    MonitorDot
} from 'lucide-react';

const FACTION_ICONS: Record<FactionId, React.ReactNode> = {
    'CORPORATE': <Briefcase className="w-4 h-4" />,
    'SCIENCE': <Beaker className="w-4 h-4" />,
    'REBELS': <Users className="w-4 h-4" />
};

const FACTION_CHIP: Record<FactionId, string> = {
    'CORPORATE': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    'SCIENCE': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'REBELS': 'bg-orange-500/10 text-orange-400 border-orange-500/30'
};

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

    const lang = settings.language as 'RU' | 'EN';
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('active');
    const [dynamicQuests, setDynamicQuests] = useState<Quest[]>([]);

    const availableStoryQuests = getAvailableQuests(completedQuestIds)
        .filter(q => !activeQuests.some(aq => aq.id === q.id) && !completedQuestIds.includes(q.id));

    const handleRefresh = () => {
        refreshQuests(100);
        const batch = generateQuestBatch(depth, level || 1);
        setDynamicQuests(batch);
    };

    const allAvailable = [...availableStoryQuests, ...dynamicQuests];

    return (
        <div className="flex flex-col flex-1 min-h-full md:h-full min-h-0 relative font-technical md:overflow-hidden pb-0 md:pb-12">
            {/* HEADER HUB: GLASSMOPHISM 2.0 */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-8 mb-0 md:mb-10 shrink-0 relative z-10 p-0 md:p-0">
                <div className="group">
                    <div className="flex items-center gap-4 mb-2 md:mb-3">
                        <div className="p-2 md:p-3 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
                            <ScrollText className="w-6 h-6 md:w-10 md:h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <MonitorDot className="w-2 h-2 text-cyan-400 animate-pulse" />
                                <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">{t(TL.ui.subNetFeed, lang)}</span>
                            </div>
                            <h1 className="text-2xl md:text-6xl font-[1000] uppercase tracking-tighter italic text-white leading-none">
                                {t(TL.quests.title, lang)}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex w-full lg:w-auto bg-black/60 backdrop-blur-xl p-1 border border-white/5 rounded-sm shrink-0 overflow-x-auto no-scrollbar">
                    {(['available', 'active', 'completed'] as const).map(tab => {
                        const count = tab === 'available' ? allAvailable.length : tab === 'active' ? activeQuests.length : completedQuestIds.length;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 transition-all relative overflow-hidden group shrink-0
                                    ${activeTab === tab ? 'text-black bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">{t(TL.quests.tabs[tab], lang)}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono border ${activeTab === tab ? 'bg-black/10 border-black/20' : 'bg-white/10 border-white/5'}`}>{count}</span>
                                {activeTab === tab && <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 md:overflow-y-auto no-scrollbar relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'available' && (
                        <motion.div
                            key="available-quests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <button
                                onClick={handleRefresh}
                                className="w-full py-8 bg-cyan-500/5 hover:bg-cyan-500 border border-cyan-500/20 hover:border-cyan-500 transition-all group flex flex-col items-center justify-center gap-2 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700 mb-2" />
                                <span className="text-[10px] font-[1000] uppercase tracking-[0.5em] italic">{t(TL.ui.scanHighPriority, lang)}</span>
                                <span className="text-[8px] text-zinc-500 font-mono uppercase group-hover:text-black/60 tracking-widest">{t(TL.ui.powerUnitsFee, lang)}</span>
                            </button>

                            {allAvailable.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 grayscale text-center group">
                                    <div className="text-8xl mb-8 opacity-10 group-hover:opacity-30 transition-opacity duration-1000">📡</div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">{t(TL.quests.noAvailable, lang)}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {allAvailable.map(quest => (
                                        <QuestCard
                                            key={quest.id}
                                            quest={quest}
                                            lang={lang}
                                            onAction={() => {
                                                acceptQuest(quest.id);
                                                if (quest.id.startsWith('rnd_')) {
                                                    setDynamicQuests(prev => prev.filter(q => q.id !== quest.id));
                                                }
                                            }}
                                            actionLabel={t(TL.quests.accept, lang)}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'active' && (
                        <motion.div
                            key="active-quests" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        >
                            {activeQuests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 grayscale text-center opacity-20">
                                    <Navigation className="w-20 h-20 mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t(TL.quests.noActive, lang)}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {activeQuests.map(quest => {
                                        const isReady = quest.objectives.every(o => o.current >= o.required);
                                        return (
                                            <QuestCard
                                                key={quest.id}
                                                quest={quest}
                                                lang={lang}
                                                onAction={() => completeQuest(quest.id)}
                                                actionLabel={t(TL.quests.complete, lang)}
                                                isReady={isReady}
                                                showObjectives
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'completed' && (
                        <motion.div
                            key="completed-quests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 max-w-5xl mx-auto"
                        >
                            {completedQuestIds.length === 0 ? (
                                <div className="text-center opacity-20 py-24 uppercase font-black tracking-widest text-[10px]">{t(TL.quests.emptyHistory, lang)}</div>
                            ) : (
                                completedQuestIds.map(id => {
                                    const def = getQuestById(id);
                                    return (
                                        <div key={id} className="relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-white/5 transition-transform duration-500 translate-x-[-100%] group-hover:translate-x-0" />
                                            <div className="relative bg-white/[0.02] border border-white/5 p-6 flex items-center justify-between transition-colors">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-white uppercase italic tracking-widest leading-none mb-2">{def ? t(def.title, lang) : id}</h4>
                                                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">{t(TL.ui.contractFulfilled, lang)}</div>
                                                    </div>
                                                </div>
                                                {def?.factionId && (
                                                    <div className={`px-6 py-2 border text-[9px] font-[1000] uppercase tracking-widest flex items-center gap-3 ${FACTION_CHIP[def.factionId]}`}>
                                                        {FACTION_ICONS[def.factionId]}
                                                        {t(TL.factions.names[def.factionId], lang)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const QuestCard = ({ quest, lang, onAction, actionLabel, isReady = false, showObjectives = false }: { quest: Quest, lang: 'RU' | 'EN', onAction: () => void, actionLabel: string, isReady?: boolean, showObjectives?: boolean }) => (
    <div className={`group relative flex flex-col transition-all duration-500
        ${isReady ? 'hover:scale-[1.02]' : 'hover:scale-[1.01]'}
    `}>
        {/* Glow Background */}
        <div className={`absolute -inset-0.5 blur opacity-20 group-hover:opacity-40 transition duration-500
            ${isReady ? 'bg-emerald-500' : 'bg-cyan-500'}
        `} />

        <div className={`relative flex-1 flex flex-col bg-black/60 backdrop-blur-xl border p-6 md:p-8 overflow-hidden
            ${isReady ? 'border-emerald-500/50' : 'border-white/5'}
        `}>
            {/* Sector Decorative Pattern */}
            <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-white/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative flex-1 flex flex-col gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className={`p-2 bg-white/5 border border-white/10 ${isReady ? 'text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-cyan-400 border-cyan-500/30'}`}>
                            {quest.type === 'STORY' ? <Zap className="w-5 h-5" /> : <MonitorDot className="w-5 h-5" />}
                        </div>
                        {isReady && <Trophy className="w-6 h-6 text-emerald-500 animate-bounce" />}
                    </div>

                    <div className="space-y-2">
                        {quest.factionId && (
                            <div className={`inline-flex px-3 py-1 border text-[8px] font-black uppercase tracking-widest items-center gap-2 ${FACTION_CHIP[quest.factionId]}`}>
                                {FACTION_ICONS[quest.factionId]}
                                {t(TL.factions.names[quest.factionId], lang)}
                            </div>
                        )}
                        <h3 className={`text-xl font-[1000] uppercase italic tracking-tighter leading-[0.9] ${isReady ? 'text-emerald-400' : 'text-white'}`}>
                            {t(quest.title, lang)}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase italic tracking-widest leading-relaxed line-clamp-3">
                            {t(quest.description, lang)}
                        </p>
                    </div>
                </div>

                {/* REWARDS: SCI-FI DATA BLOCKS */}
                <div className="space-y-3">
                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">{t(TL.ui.authorizationReward, lang)}</div>
                    <div className="flex flex-wrap gap-2">
                        {quest.rewards.map((r, idx) => (
                            <div key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 text-amber-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group/reward hover:bg-amber-500 hover:text-black transition-colors">
                                <MonitorDot className="w-3 h-3 text-white/20 group-hover/reward:text-black/40" />
                                {r.type === 'RESOURCE' ? t(getResourceLabel(r.target as any), lang) : r.type}: {r.amount || r.target}
                            </div>
                        ))}
                    </div>
                </div>

                {/* OBJECTIVES: PRECISION TRACKING */}
                {quest.objectives && quest.objectives.length > 0 && (
                    <div className="space-y-4 mt-auto">
                        <div className="h-px bg-white/5" />
                        <div className="space-y-4">
                            {quest.objectives.map(obj => {
                                const prog = Math.min(100, (obj.current / obj.required) * 100);
                                const done = obj.current >= obj.required;
                                return (
                                    <div key={obj.id} className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest italic font-mono">
                                            <span className={done ? 'text-emerald-400' : 'text-zinc-500'}>{t(obj.description, lang)}</span>
                                            {showObjectives || isReady ? (
                                                <span className={done ? 'text-emerald-400 shadow-[0_0_8px_#22c55e]' : 'text-white'}>{obj.current} <span className="opacity-20">/</span> {obj.required}</span>
                                            ) : (
                                                <span className="text-white/40">{obj.required}</span>
                                            )}
                                        </div>
                                        <div className="h-0.5 bg-white/5 relative overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out
                                                    ${done ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}
                                                style={{ width: `${prog}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={onAction}
                    disabled={!isReady && showObjectives}
                    className={`w-full py-5 font-[1000] uppercase text-[10px] tracking-[0.4em] transition-all relative overflow-hidden group/btn
                        ${isReady ? 'bg-emerald-500 text-black hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                            showObjectives ? 'bg-white/5 text-zinc-700 border border-white/5 cursor-not-allowed' :
                                'bg-white text-black hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]'}
                    `}
                >
                    <span className="relative z-10">{actionLabel}</span>
                    <div className="absolute inset-x-0 bottom-0 h-0 group-hover/btn:h-full bg-white/10 transition-all duration-300" />
                </button>
            </div>
        </div>
    </div>
);

export default QuestPanel;
