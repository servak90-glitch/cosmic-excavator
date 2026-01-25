
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { t, TL } from '../../services/localization';
import { ResourceType, Resources } from '../../types';
import { getResourceLabel, formatCompactNumber } from '../../services/gameMath';
import { CITY_TRADES, REVERSE_TRADES } from '../../constants/balance.ts';
import {
    Fuel,
    Recycle,
    Hammer,
    Package,
    Ghost,
    ArrowRight
} from 'lucide-react';

interface TradeTabProps {
    resources: Resources;
    depth: number;
    onTrade: (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => void;
}

const TradeTab: React.FC<TradeTabProps> = ({ resources, onTrade }) => {
    const lang = useGameStore(s => s.settings.language);
    const tradeCost = CITY_TRADES.BASIC_EXCHANGE.cost;
    const tradeReward = CITY_TRADES.BASIC_EXCHANGE.reward;
    const canAffordTrade = resources.clay >= (tradeCost.clay || 0);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: SCRAP & TRASH (5 cols) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/20 to-transparent blur opacity-40"></div>
                        <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-sm border border-amber-500/20">
                                    <Recycle className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-sm font-black text-white tracking-[0.3em] uppercase italic">{t(TL.ui.junkDealer, lang)}</h3>
                            </div>

                            <div className="bg-white/5 border border-white/5 p-6 rounded-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="text-3xl font-black text-amber-600 font-mono">500</div>
                                    <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{t(TL.resources.clay, lang)}</div>
                                </div>
                                <div className="text-zinc-700">
                                    <ArrowRight className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                    <div className="text-3xl font-black text-white font-mono">50</div>
                                    <div className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{t(TL.resources.stone, lang)}</div>
                                </div>
                            </div>

                            <button
                                disabled={!canAffordTrade}
                                onClick={() => onTrade(tradeCost, tradeReward)}
                                className={`w-full py-4 font-black uppercase tracking-[0.4em] text-[10px] transition-all
                                    ${canAffordTrade
                                        ? 'bg-amber-600 text-black hover:bg-white shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
                                        : 'bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed'}`}
                            >
                                {canAffordTrade ? t(TL.ui.exchange, lang) : t(TL.ui.insufficientResources, lang)}
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500/10 to-transparent blur opacity-30"></div>
                        <div className="relative bg-black/40 backdrop-blur-md border border-white/5 p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-500/10 rounded-sm border border-green-500/20">
                                    <Hammer className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-400 tracking-[0.3em] uppercase italic">{t(TL.ui.industrialCrusher, lang)}</h3>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                {REVERSE_TRADES.map((trade, idx) => {
                                    const canSee = resources[trade.source] > 0 || resources[trade.target] > 100;
                                    if (!canSee) return null;
                                    const costVal = 10;
                                    const rewardVal = 50;
                                    const canAfford = resources[trade.source] >= costVal;
                                    return (
                                        <div key={idx} className="bg-white/5 border border-white/5 p-3 flex items-center justify-between group/item hover:bg-white/10 transition-colors">
                                            <div className="flex-1">
                                                <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">{t(trade.label, lang)}</div>
                                                <div className="flex items-center gap-2 font-mono text-[10px]">
                                                    <span className="text-amber-600 font-bold">{costVal}</span>
                                                    <ArrowRight className="w-3 h-3 text-zinc-700" />
                                                    <span className="text-green-500 font-bold">{rewardVal}</span>
                                                </div>
                                            </div>
                                            <button
                                                disabled={!canAfford}
                                                onClick={() => onTrade({ [trade.source]: costVal }, { [trade.target]: rewardVal })}
                                                className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all
                                                    ${canAfford ? 'bg-zinc-800 text-white hover:bg-white hover:text-black' : 'text-zinc-700 border border-zinc-900 cursor-not-allowed'}`}
                                            >
                                                {t(TL.ui.start, lang)}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FUEL STATION (7 cols) */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="relative group h-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur opacity-40"></div>
                        <div className="relative bg-black/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-sm border border-cyan-500/20">
                                        <Fuel className="w-6 h-6 text-cyan-500" />
                                    </div>
                                    <h1 className="text-lg md:text-xl font-black text-white tracking-[0.2em] uppercase italic">{t(TL.ui.fuelStation, lang)}</h1>
                                </div>
                                <div className="hidden md:block text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase">Energy Processing Unit</div>
                            </div>

                            <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-4">{t(TL.ui.dealerAccepts, lang)}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto no-scrollbar pr-2 flex-1 pb-4">
                                {([
                                    ResourceType.CLAY, ResourceType.STONE, ResourceType.COPPER,
                                    ResourceType.IRON, ResourceType.SILVER, ResourceType.GOLD,
                                    ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.ICE, ResourceType.SCRAP
                                ] as ResourceType[]).filter(res => resources[res] > 0).map(res => {
                                    const canAfford = resources[res] >= 10;
                                    return (
                                        <div key={res} className="relative bg-white/5 border border-white/5 p-4 flex flex-col justify-between group/res hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] text-white font-black uppercase tracking-widest block">{t(getResourceLabel(res), lang)}</span>
                                                    <span className="text-[8px] text-zinc-500 font-mono uppercase">{t(TL.ui.inStock, lang)}: {Math.floor(resources[res])}</span>
                                                </div>
                                                <div className="opacity-20 group-hover/res:opacity-80 transition-opacity">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 mt-auto">
                                                <div className="bg-black/40 px-3 py-1.5 border border-white/5 text-[9px] font-mono whitespace-nowrap">
                                                    <span className="text-amber-600">10</span> <span className="text-zinc-600 italic">pts</span> <span className="text-white mx-1">→</span> <span className="text-cyan-400">5</span> <span className="text-cyan-500/40">FUEL</span>
                                                </div>
                                                <button
                                                    disabled={!canAfford}
                                                    onClick={() => onTrade({ [res]: 10 }, { coal: 5 })}
                                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all
                                                        ${canAfford ? 'bg-cyan-600 text-white hover:bg-white hover:text-black' : 'bg-transparent text-zinc-700 border border-zinc-800 cursor-not-allowed'}`}
                                                >
                                                    {t(TL.ui.exchange, lang)}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(resources).filter(res => {
                                    const baseRes = [
                                        ResourceType.CLAY, ResourceType.STONE, ResourceType.COPPER,
                                        ResourceType.IRON, ResourceType.SILVER, ResourceType.GOLD,
                                        ResourceType.TITANIUM, ResourceType.URANIUM, ResourceType.ICE, ResourceType.SCRAP
                                    ];
                                    return baseRes.includes(res as ResourceType) && resources[res as ResourceType] > 0;
                                }).length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                                            <Ghost className="w-16 h-16 mb-4" />
                                            <div className="text-[10px] font-black uppercase tracking-[0.5em]">{t(TL.ui.no_exchange_res, lang)}</div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradeTab;
