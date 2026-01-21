import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Resources, ResourceType, ExpeditionDifficulty } from '../../types';
import { DRONES } from '../../constants';

const DIFFICULTIES: { id: ExpeditionDifficulty, label: string, color: string, risk: string }[] = [
    { id: 'LOW', label: 'РАЗВЕДКА', color: 'text-green-400', risk: 'НИЗКИЙ (5%)' },
    { id: 'MEDIUM', label: 'ОПЕРАЦИЯ', color: 'text-yellow-400', risk: 'СРЕДНИЙ (20%)' },
    { id: 'HIGH', label: 'РЕЙД', color: 'text-orange-500', risk: 'ВЫСОКИЙ (40%)' },
    { id: 'EXTREME', label: 'СМЕРТЕЛЬНО', color: 'text-red-500', risk: 'ЭКСТРЕМАЛЬНЫЙ (70%)' }
];

const TARGET_RESOURCES: ResourceType[] = [
    ResourceType.IRON, ResourceType.COPPER, ResourceType.SILVER, ResourceType.GOLD,
    ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.RUBIES, ResourceType.EMERALDS,
    ResourceType.DIAMONDS, ResourceType.ANCIENT_TECH
];

const ExpeditionTab: React.FC = () => {
    const { resources, launchExpedition, activeExpeditions, collectRewards, cancelExpedition } = useGameStore();

    const [selectedDiff, setSelectedDiff] = useState<ExpeditionDifficulty>('LOW');
    const [selectedResource, setSelectedResource] = useState<ResourceType>(ResourceType.IRON);
    const [droneCount, setDroneCount] = useState(10);
    const [now, setNow] = useState(Date.now());

    // Update time for progress bars
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLaunch = () => {
        launchExpedition(selectedDiff, droneCount, selectedResource);
    };

    const cost = droneCount * 10;
    const canAfford = resources.nanoSwarm >= cost;

    return (
        <div className="flex flex-col h-full gap-4">

            {/* NEW EXPEDITION PANEL */}
            <div className="bg-zinc-900 border border-zinc-700 p-4">
                <h3 className="pixel-text text-lg text-white mb-4 border-b border-zinc-800 pb-2">ЦЕНТР ЭКСПЕДИЦИЙ</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT: SETTINGS */}
                    <div className="space-y-4">
                        {/* Difficulty */}
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDiff(d.id)}
                                    className={`flex-1 py-2 text-[10px] font-bold border transition-colors
                                        ${selectedDiff === d.id
                                            ? `bg-zinc-800 ${d.color} border-${d.color.split('-')[1]}-400`
                                            : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono text-center">
                            РИСК: <span className={DIFFICULTIES.find(d => d.id === selectedDiff)?.color}>{DIFFICULTIES.find(d => d.id === selectedDiff)?.risk}</span>
                        </div>

                        {/* Resource Target */}
                        <div className="grid grid-cols-5 gap-1">
                            {TARGET_RESOURCES.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedResource(r)}
                                    className={`p-1 border text-[10px] font-mono uppercase truncate
                                        ${selectedResource === r ? 'bg-zinc-800 text-cyan-400 border-cyan-400' : 'bg-black text-zinc-600 border-zinc-800'}
                                    `}
                                    title={r}
                                >
                                    {r.substring(0, 3)}
                                </button>
                            ))}
                        </div>

                        {/* Drone Count Slider */}
                        <div>
                            <div className="flex justify-between text-[10px] text-zinc-400 map-1">
                                <span>ДРОНЫ (НАНОВОЛОКНО)</span>
                                <span className="text-white font-bold">{droneCount}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={droneCount}
                                onChange={(e) => setDroneCount(parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] mt-1">
                                <span>СТОИМОСТЬ: <span className={canAfford ? 'text-green-400' : 'text-red-500'}>{cost} NS</span></span>
                                <span>БАЛАНС: {Math.floor(resources.nanoSwarm)} NS</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLaunch}
                            disabled={!canAfford}
                            className={`w-full py-4 font-bold pixel-text text-sm transition-all
                                ${canAfford
                                    ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500 hover:bg-cyan-800/50 hover:scale-[1.02]'
                                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}
                            `}
                        >
                            ЗАПУСТИТЬ ПРОТОКОЛ
                        </button>
                    </div>

                    {/* RIGHT: ACTIVE MISSIONS */}
                    <div className="bg-black/40 border border-zinc-800 p-2 overflow-y-auto max-h-[300px] scrollbar-thin">
                        <div className="text-[10px] text-zinc-500 mb-2 font-mono text-center">- АКТИВНЫЕ МИССИИ -</div>

                        {activeExpeditions.length === 0 && (
                            <div className="text-center py-10 text-zinc-700 text-xs italic">
                                НЕТ АКТИВНЫХ ЭКСПЕДИЦИЙ
                            </div>
                        )}

                        {activeExpeditions.map(exp => {
                            const diff = DIFFICULTIES.find(d => d.id === exp.difficulty);
                            const progress = Math.min(100, Math.max(0, ((now - exp.startTime) / exp.duration) * 100));
                            const timeLeft = Math.max(0, Math.ceil((exp.duration - (now - exp.startTime)) / 1000));
                            const isDone = timeLeft <= 0;

                            return (
                                <div key={exp.id} className="mb-2 bg-zinc-900 border border-zinc-700 p-2 relative overflow-hidden group">
                                    {/* Progress BG */}
                                    <div
                                        className="absolute inset-0 bg-cyan-900/10 pointer-events-none transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />

                                    <div className="relative flex justify-between items-start mb-1">
                                        <div className="text-[10px] font-bold text-white">
                                            {diff?.label} <span className="text-zinc-500">#{exp.id}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-cyan-400">
                                            {exp.droneCount} DRONES
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="text-[10px] text-zinc-400 font-mono">
                                            ЦЕЛЬ: <span className="text-white uppercase">{exp.resourceTarget}</span>
                                        </div>

                                        {isDone ? (
                                            <button
                                                onClick={() => collectRewards(exp.id)}
                                                className="bg-green-600 text-white text-[10px] px-2 py-1 hover:bg-green-500 animate-pulse"
                                            >
                                                ЗАВЕРШИТЬ
                                            </button>
                                        ) : (
                                            <div className="text-[10px] font-mono text-zinc-500">
                                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                            </div>
                                        )}
                                    </div>

                                    {/* STATUS TEXT OR LOG */}
                                    {exp.log.length > 0 && (
                                        <div className="mt-1 text-[8px] text-zinc-600 truncate font-mono border-t border-zinc-800/50 pt-1">
                                            {exp.log[exp.log.length - 1]}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* INFO PANEL */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-3 text-[10px] text-zinc-500 font-mono">
                <p>Экспедиции требуют <span className="text-cyan-400">Нановолокно (Nano Swarm)</span> для создания временных дронов.</p>
                <p>В случае успеха вы получите ресурсы и вернете часть нановолокна (выжившие дроны).</p>
                <p className="text-red-400">ВНИМАНИЕ: При провале миссии все дроны и ресурсы будут потеряны.</p>
            </div>
        </div>
    );
};

export default ExpeditionTab;
