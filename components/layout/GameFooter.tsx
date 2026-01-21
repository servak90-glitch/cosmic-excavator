
import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { View } from '../../types';
import { t, TEXT_IDS } from '../../services/localization';

interface GameFooterProps {
    logs: {
        msg: string;
        color?: string;
        icon?: string;
        detail?: string;
        timestamp?: string;
    }[];
}

const GameFooter: React.FC<GameFooterProps> = ({ logs }) => {
    const activeView = useGameStore(s => s.activeView);
    const setView = useGameStore(s => s.setView);
    const currentBoss = useGameStore(s => s.currentBoss);
    const lang = useGameStore(s => s.settings.language);

    // Feature flags
    const forgeUnlocked = useGameStore(s => s.forgeUnlocked);
    const skillsUnlocked = useGameStore(s => s.skillsUnlocked);
    const cityUnlocked = useGameStore(s => s.cityUnlocked);
    const storageLevel = useGameStore(s => s.storageLevel);

    const consoleEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeView === View.DRILL || activeView === View.COMBAT) {
            consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, activeView]);

    const navButtons = [
        { id: View.DRILL, label: t(TEXT_IDS.MENU_DRILL, lang), icon: '🎯' },
        ...(cityUnlocked ? [{ id: View.CITY, label: t(TEXT_IDS.MENU_CITY, lang), icon: '🏙️' }] : []),
        ...(cityUnlocked ? [{ id: View.GLOBAL_MAP, label: t(TEXT_IDS.MENU_MAP, lang), icon: '🗺️' }] : []),
        ...(forgeUnlocked ? [{ id: View.FORGE, label: t(TEXT_IDS.MENU_FORGE, lang), icon: '🔧' }] : []),
        ...(skillsUnlocked ? [{ id: View.SKILLS, label: t(TEXT_IDS.MENU_SKILLS, lang), icon: '⚡' }] : []),
        { id: View.ARTIFACTS, label: t(TEXT_IDS.MENU_ARTIFACTS, lang), icon: '📦' },
        { id: View.CODEX, label: t(TEXT_IDS.MENU_ARCHIVE, lang), icon: '📚' }
    ];


    return (
        <div className="flex flex-col shrink-0 z-30 bg-zinc-950 border-t border-zinc-800 transition-all duration-300 pointer-events-auto">
            {/* LOG CONSOLE */}
            {(activeView === View.DRILL || activeView === View.COMBAT) && (
                <div className="h-24 md:h-48 p-2 font-mono text-[9px] md:text-xs overflow-y-auto scrollbar-hide space-y-1.5 bg-black/80 touch-pan-y relative custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-2 ${log.color || 'text-zinc-400'} border-l-2 border-zinc-800/50 pl-2 animate-slideInRight py-0.5`}>
                            {/* Timestamp */}
                            <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>

                            {/* Icon */}
                            {log.icon && <span className="shrink-0">{log.icon}</span>}

                            {/* Content */}
                            <div className="flex flex-col flex-1">
                                <span className="leading-tight">{log.msg}</span>
                                {log.detail && (
                                    <span className="text-[8px] md:text-[10px] text-zinc-500 italic mt-0.5 leading-none px-1 border-l border-zinc-700/30">
                                        ↳ {log.detail}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={consoleEndRef} />
                </div>
            )}

            {/* NAVIGATION */}
            <div className={`h-12 md:h-14 flex ${activeView === View.DRILL ? 'border-t border-zinc-800' : ''}`}>
                {navButtons.map(btn => (
                    <button
                        key={btn.id}
                        onClick={() => !currentBoss && setView(btn.id as View)}
                        className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 border-r border-zinc-800 last:border-0 hover:bg-white/5 active:bg-white/10 transition-colors 
                            ${activeView === btn.id ? 'bg-zinc-900 text-cyan-400' : 'text-zinc-500'} 
                            ${currentBoss ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <span className="text-base md:text-lg">{btn.icon}</span>
                        <span className="text-[9px] md:text-xs font-bold pixel-text md:inline">{btn.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameFooter;
