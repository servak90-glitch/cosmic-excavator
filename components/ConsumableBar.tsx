/**
 * ConsumableBar - Панель быстрого доступа к расходникам
 */

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { t } from '../services/localization';

export const ConsumableBar: React.FC = () => {
    const consumables = useGameStore(s => s.consumables);
    const useConsumable = useGameStore(s => s.useConsumable);
    const lang = useGameStore(s => s.settings.language);

    // Обработка горячих клавиш
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '1') useConsumable('repairKit');
            if (e.key === '2') useConsumable('coolantPaste');
            if (e.key === '3') useConsumable('advancedCoolant');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [useConsumable]);

    const items = [
        { id: 'repairKit', key: '1', label: { RU: 'РЕМ', EN: 'REP' }, color: 'border-green-500 text-green-400' },
        { id: 'coolantPaste', key: '2', label: { RU: 'ХЛАД', EN: 'COOL' }, color: 'border-blue-500 text-blue-400' },
        { id: 'advancedCoolant', key: '3', label: { RU: 'ИММУН', EN: 'IMMUN' }, color: 'border-purple-500 text-purple-400' }
    ];

    return (
        <div className="flex md:flex-row flex-col gap-2 p-1 bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-lg pointer-events-auto">
            {items.map(item => {
                const count = (consumables as any)[item.id] || 0;
                return (
                    <button
                        key={item.id}
                        onClick={() => useConsumable(item.id as any)}
                        disabled={count <= 0}
                        className={`
                            relative w-12 h-12 border-2 flex flex-col items-center justify-center transition-all active:scale-90
                            ${count > 0 ? item.color + ' bg-zinc-900/80 hover:bg-zinc-800' : 'border-zinc-800 text-zinc-700 bg-zinc-950 opacity-50 grayscale'}
                            rounded-md group
                        `}
                    >
                        <span className="text-[10px] font-black tracking-tighter">{t(item.label, lang)}</span>
                        <span className="text-[12px] font-mono font-bold">{count}</span>

                        {/* Hotkey Indicator */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-zinc-800 border border-zinc-600 flex items-center justify-center rounded text-[8px] text-zinc-400 font-bold group-hover:text-white transition-colors">
                            {item.key}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
