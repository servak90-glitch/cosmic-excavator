import React from 'react';
import { UpgradeCardProps } from './types';
import { Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { audioEngine } from '../../services/audioEngine';


/**
 * Upgrade Card component for drill parts
 */
const UpgradeCard: React.FC<UpgradeCardProps> = ({ title, current, next, type, resources, onBuy }) => {
    const lang = useGameStore(s => s.settings.language);
    const unlockedBlueprints = useGameStore(s => s.unlockedBlueprints);
    if (!next) return (

        <div className="bg-zinc-900 p-3 md:p-4 border border-zinc-800 opacity-50 flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
            <div>
                <h3 className="text-zinc-500 font-bold mb-2 pixel-text text-xs md:text-sm">{title}</h3>
                <div className="text-[10px] md:text-xs text-zinc-600 font-mono mb-2">TIER {current.tier}</div>
                <p className="text-[10px] md:text-xs text-zinc-600">МАКСИМУМ</p>
            </div>
        </div>
    );

    const isFusionLocked = next.tier >= 13;
    const requiresBlueprint = next.blueprintId;
    const hasBlueprint = !requiresBlueprint || unlockedBlueprints.includes(requiresBlueprint);
    const cost = (next.cost || {}) as Partial<Resources>;
    const costKeys = Object.keys(cost) as Array<keyof Resources>;
    const canAfford = !isFusionLocked && hasBlueprint && costKeys.every(r => resources[r] >= (cost[r] || 0));

    return (
        <div className="bg-zinc-900 p-3 md:p-4 border border-zinc-700 flex flex-col justify-between min-h-[180px] md:min-h-[220px] hover:border-zinc-500 transition-colors group relative">
            <div>
                <h3 className="text-cyan-400 font-bold mb-1 pixel-text text-xs md:text-sm group-hover:text-white transition-colors truncate">{title}</h3>
                <div className="text-[9px] md:text-[10px] text-zinc-500 mb-2 font-mono">
                    TIER {current.tier} <span className="text-zinc-300">➔ {next.tier}</span>
                </div>

                <div className="bg-black/50 p-2 mb-2 border border-zinc-800 min-h-[40px] md:min-h-[50px]">
                    <p className="text-[9px] md:text-[10px] text-zinc-300 italic leading-tight">"{t(next.description, lang)}"</p>

                    <div className="mt-1 text-[8px] md:text-[9px] text-green-400 font-mono grid grid-cols-2 gap-x-2">
                        {(next.baseStats as any).damage && <span>DMG: {(next.baseStats as any).damage}</span>}
                        {(next.baseStats as any).speed && <span>SPD: {(next.baseStats as any).speed}</span>}
                        {(next.baseStats as any).cooling && <span>COOL: {(next.baseStats as any).cooling}</span>}
                        {(next.baseStats as any).energyOutput && <span>PWR: {(next.baseStats as any).energyOutput}</span>}
                        {(next.baseStats as any).torque && <span className="text-amber-400">TRQ: {(next.baseStats as any).torque}%</span>}
                        {(next.baseStats as any).regen && <span className="text-emerald-400">REG: {(next.baseStats as any).regen}/s</span>}
                        {(next.baseStats as any).luck && <span className="text-purple-400">LCK: {(next.baseStats as any).luck}%</span>}
                        {(next.baseStats as any).cargoCapacity && <span className="text-blue-400">CRG: {(next.baseStats as any).cargoCapacity}</span>}
                        {(next.baseStats as any).energyCost > 0 && <span className="text-red-500 col-span-2">LOAD: -{(next.baseStats as any).energyCost} W</span>}
                    </div>
                </div>

                {/* Индикатор чертежа */}
                {requiresBlueprint && (
                    <div className={`text-[9px] md:text-[10px] font-bold font-mono text-center py-1 px-2 mb-2 border ${hasBlueprint
                            ? 'bg-purple-900/30 border-purple-500/50 text-purple-300'
                            : 'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse'
                        }`}>
                        {hasBlueprint ? '📜 ЧЕРТЕЖ ПОЛУЧЕН' : '⚠️ ТРЕБУЕТСЯ ЧЕРТЕЖ'}
                    </div>
                )}

                <div className="space-y-1 mb-3">
                    {isFusionLocked ? (
                        <div className="text-[10px] text-purple-400 font-bold font-mono py-2 text-center animate-pulse">ТРЕБУЕТСЯ СЛИЯНИЕ</div>
                    ) : (
                        costKeys.map(res => (
                            <div key={res} className="flex justify-between text-[9px] md:text-[10px] font-mono border-b border-zinc-800/50 pb-0.5">
                                <span className="text-zinc-500 uppercase">{res}</span>
                                <span className={resources[res] >= (cost[res] || 0) ? 'text-green-400' : 'text-red-500'}>
                                    {cost[res]?.toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                disabled={!canAfford}
                onClick={() => {
                    onBuy(type);
                    audioEngine.playBaseBuild(next.id as any);
                }}
                className={`w-full py-2 md:py-3 text-[10px] md:text-xs font-bold pixel-text transition-all border active:scale-95
            ${isFusionLocked
                        ? 'bg-zinc-950 border-purple-900/50 text-zinc-600 cursor-not-allowed opacity-50'
                        : canAfford
                            ? 'bg-cyan-900/50 border-cyan-500 hover:bg-cyan-500 hover:text-black text-cyan-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'}
         `}
            >
                {isFusionLocked ? 'ТОЛЬКО СЛИЯНИЕ' : !hasBlueprint ? 'НУЖЕН ЧЕРТЕЖ' : canAfford ? 'УЛУЧШИТЬ' : 'НЕДОСТУПНО'}
            </button>
        </div>
    );
};

export default UpgradeCard;
