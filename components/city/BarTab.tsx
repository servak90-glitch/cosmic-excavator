import React, { useState } from 'react';
import { BarTabProps } from './types';
import { ResourceType } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { getResourceLabel } from '../../services/gameMath';
import { BAR_DRINKS, GAMBLING } from '../../constants/balance';

// Тип результата броска
type DiceResult = { won: boolean; amount: number } | null;

const BarTab: React.FC<BarTabProps> = ({ resources }) => {
    const [barTab, setBarTab] = useState<'DRINKS' | 'DICE'>('DRINKS');
    const [diceBetRes, setDiceBetRes] = useState<ResourceType>('stone');
    const [diceBetAmount, setDiceBetAmount] = useState<number>(GAMBLING.MIN_BET);
    const [lastResult, setLastResult] = useState<DiceResult>(null);
    const [isRolling, setIsRolling] = useState(false);

    const buyCityBuff = useGameStore(s => s.buyCityBuff);
    const gambleResources = useGameStore(s => s.gambleResources);

    // Обёртка для броска с анимацией результата
    const handleRoll = () => {
        if (resources[diceBetRes] < diceBetAmount) return;

        setIsRolling(true);
        setLastResult(null);

        // Симуляция броска (результат определяется в store, но мы копируем логику для UI)
        setTimeout(() => {
            const won = Math.random() < GAMBLING.WIN_CHANCE;
            gambleResources(diceBetRes, diceBetAmount);
            setLastResult({ won, amount: won ? diceBetAmount : -diceBetAmount });
            setIsRolling(false);
        }, 500);
    };

    return (
        <div className="max-w-md mx-auto flex flex-col h-full">
            {/* Sub-tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900 mb-4">
                <button
                    onClick={() => setBarTab('DRINKS')}
                    className={`flex-1 py-2 text-xs font-bold pixel-text ${barTab === 'DRINKS' ? 'bg-amber-900/20 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    МЕНЮ
                </button>
                <button
                    onClick={() => setBarTab('DICE')}
                    className={`flex-1 py-2 text-xs font-bold pixel-text ${barTab === 'DICE' ? 'bg-purple-900/20 text-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    КОСТИ
                </button>
            </div>

            {/* DRINKS */}
            {barTab === 'DRINKS' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-zinc-900 border border-amber-800 p-4 text-center">
                        <h3 className="text-amber-500 pixel-text mb-1">БАР "РЖАВАЯ ГАЙКА"</h3>
                        <p className="text-[10px] text-zinc-500 italic">"Наши напитки не просто сшибают с ног, они разъедают пол."</p>
                    </div>
                    <div className="space-y-3">
                        {BAR_DRINKS.map(drink => {
                            const canAfford = resources[drink.res as ResourceType] >= drink.cost;
                            return (
                                <div key={drink.id} className="bg-black border border-zinc-800 p-3 flex justify-between items-center gap-4 group hover:border-amber-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{drink.icon}</div>
                                        <div>
                                            <div className={`text-xs font-bold ${drink.color} pixel-text`}>{drink.name}</div>
                                            <div className="text-[9px] text-zinc-400 font-mono max-w-[150px]">{drink.desc}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => buyCityBuff(drink.cost, drink.res as ResourceType, drink.effectId)}
                                        disabled={!canAfford}
                                        className={`px-4 py-2 border font-mono text-xs font-bold min-w-[80px]
                      ${canAfford ? 'border-amber-600 text-amber-500 hover:bg-amber-900/20' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'}
                    `}
                                    >
                                        {drink.cost} {getResourceLabel(drink.res)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* DICE */}
            {barTab === 'DICE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-zinc-900 border border-purple-800 p-4 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(168,85,247,0.05)_10px,rgba(168,85,247,0.05)_20px)] pointer-events-none" />
                        <h3 className="text-purple-400 pixel-text mb-2 text-lg">КОСТИ ПУСТОТЫ</h3>
                        <div className="text-4xl my-4">🎲 🎲</div>
                        <p className="text-[10px] text-zinc-400 mb-4 font-mono">
                            Шанс выигрыша: {Math.round(GAMBLING.WIN_CHANCE * 100)}%. Выплата: x{GAMBLING.PAYOUT_MULTIPLIER}.
                        </p>

                        {/* BET CONTROLS */}
                        <div className="flex flex-col gap-2 bg-black/50 p-3 border border-zinc-700">
                            <div className="flex justify-between items-center text-xs text-zinc-300 font-mono">
                                <span>СТАВКА:</span>
                                <select
                                    value={diceBetRes}
                                    onChange={(e) => setDiceBetRes(e.target.value as ResourceType)}
                                    className="bg-black border border-zinc-600 px-2 py-1 outline-none text-right"
                                >
                                    <option value="stone">КАМЕНЬ</option>
                                    <option value="copper">МЕДЬ</option>
                                    <option value="iron">ЖЕЛЕЗО</option>
                                    <option value="gold">ЗОЛОТО</option>
                                    <option value="rubies">РУБИНЫ</option>
                                </select>
                            </div>
                            <input
                                type="range"
                                min={GAMBLING.MIN_BET}
                                max={GAMBLING.MAX_BET}
                                step="10"
                                value={diceBetAmount}
                                onChange={(e) => setDiceBetAmount(parseInt(e.target.value))}
                                className="w-full accent-purple-500 h-1 bg-zinc-700 appearance-none cursor-pointer"
                            />
                            <div className="text-center font-bold text-purple-300 pixel-text text-sm">
                                {diceBetAmount} {getResourceLabel(diceBetRes)}
                            </div>
                        </div>

                        {/* РЕЗУЛЬТАТ БРОСКА */}
                        {lastResult && (
                            <div className={`mt-3 py-3 px-4 text-center font-bold pixel-text text-lg border-2 animate-in zoom-in-50 duration-300
                                ${lastResult.won
                                    ? 'bg-green-900/30 border-green-500 text-green-400'
                                    : 'bg-red-900/30 border-red-500 text-red-400'}`}
                            >
                                {lastResult.won ? '🎉 ВЫИГРЫШ!' : '💀 ПРОИГРЫШ...'}
                                <div className="text-sm font-mono mt-1">
                                    {lastResult.won ? '+' : ''}{lastResult.amount} {getResourceLabel(diceBetRes)}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleRoll}
                            disabled={resources[diceBetRes] < diceBetAmount || isRolling}
                            className={`w-full mt-4 py-3 font-bold border-2 pixel-text transition-all active:scale-95
                ${resources[diceBetRes] >= diceBetAmount && !isRolling
                                    ? 'border-purple-500 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40'
                                    : 'border-zinc-800 text-zinc-600 cursor-not-allowed'}
              `}
                        >
                            {isRolling ? '🎲 БРОСАЕМ...' : 'БРОСИТЬ КОСТИ'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarTab;
