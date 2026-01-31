/**
 * MARKET VIEW — UI для торговли ресурсами в Station базах
 * Phase 2: региональные цены + buy/sell
 */

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { getAllMarketPrices } from '../services/marketEngine';
import { getActivePerkIds } from '../services/factionLogic';
import { TL, t, TEXT_IDS } from '../services/localization';
import { BLACK_MARKET_ITEMS } from '../constants/blackMarket';
import type { Resources, ResourceType } from '../types';
import {
    ShoppingBag,
    Activity,
    ShieldAlert,
    BarChart3,
    Fingerprint,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
    Package,
    Gem,
    ChevronRight,
    Lock,
    Zap,
    MonitorDot,
    ScrollText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MarketView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const playerBases = useGameStore(s => s.playerBases);
    const buyFromMarket = useGameStore(s => s.buyFromMarket);
    const sellToMarket = useGameStore(s => s.sellToMarket);
    const buyBlackMarketItem = useGameStore(s => s.buyBlackMarketItem);
    const exchangeResourceForFuel = useGameStore(s => (s as any).exchangeResourceForFuel);
    const unlockedBlueprints = useGameStore(s => s.unlockedBlueprints);
    const reputation = useGameStore(s => s.reputation);
    const lang = useGameStore(s => s.settings.language);

    const [selectedResource, setSelectedResource] = useState<keyof Resources | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'regular' | 'black_market' | 'exchange'>('regular');
    const [expandedResource, setExpandedResource] = useState<ResourceType | null>(null);

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    // Проверка доступа к рынку: Терминал Хаба теперь общественный
    const canAccessMarket = true; // Всегда доступно в Хабе

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);
    const hasBlackMarket = activePerks.includes('BLACK_MARKET');
    const marketPrices = useMemo(() => getAllMarketPrices(currentRegion, [], activePerks), [currentRegion, activePerks]);

    const currentBase = playerBases.find(b => b.regionId === currentRegion);

    const handleBuy = () => {
        if (selectedResource && amount > 0) {
            buyFromMarket(selectedResource, amount);
            audioEngine.playMarketTrade();
            setAmount(1);
        }
    };

    const handleSell = () => {
        if (selectedResource && amount > 0) {
            sellToMarket(selectedResource, amount);
            audioEngine.playMarketTrade();
            setAmount(1);
        }
    };

    const selectedPrice = marketPrices.find(p => p.resource === selectedResource);
    const totalBuyCost = (selectedPrice?.finalPrice || 0) * amount;
    const totalSellRevenue = Math.floor((selectedPrice?.finalPrice || 0) * 0.8) * amount;
    const availableResource = selectedResource ? (resources[selectedResource] || 0) : 0;
    const canAfford = (resources.credits || 0) >= totalBuyCost;

    return (
        <div className="flex-1 flex flex-col p-0 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 md:h-full md:overflow-hidden relative z-10 font-technical">
            <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />

            {/* Header Hub Dashboard - compact on mobile */}
            <div className="max-w-7xl w-full mx-auto flex flex-row justify-between items-center gap-2 md:gap-8 mb-2 md:mb-10 shrink-0 px-3 md:px-0 pt-2 md:pt-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-1.5 md:p-3 glass-panel border-cyan-500/20 bg-cyan-500/5">
                        <ShoppingBag className="w-4 h-4 md:w-8 md:h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-7xl font-black uppercase tracking-tighter italic text-white leading-none">
                            {t(TL.ui.market, lang)}
                        </h1>
                        <div className="hidden md:flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                            <MonitorDot className="w-2 md:w-3 md:h-3 text-cyan-400 animate-pulse" />
                            <span className="text-[7px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                                {t(TL.ui.tradingTerminal, lang)} v.4.2
                            </span>
                        </div>
                    </div>
                </div>

                {/* Credits Mini-Bento - always visible */}
                <div className="glass-panel px-2 md:px-8 py-1.5 md:py-5 border-cyan-500/20 bg-cyan-500/5 flex flex-col group relative overflow-hidden">
                    <span className="text-[6px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1 leading-none">{t(TL.ui.creditReserve, lang)}</span>
                    <div className="flex items-center gap-1 md:gap-3">
                        <div className="text-sm md:text-3xl font-black text-white tracking-tighter italic">
                            {Math.floor(resources.credits || 0).toLocaleString()}
                        </div>
                        <span className="text-[6px] md:text-xs font-black text-cyan-400 px-1 py-0.5 glass-panel bg-cyan-500/10 border-cyan-500/20">CR</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 md:gap-10 flex-1 min-h-0 relative">
                {/* MARKET LISTING */}
                <div className="flex flex-col gap-4 md:gap-6 min-h-0">
                    {/* Tabs Framework */}
                    <div className="flex gap-1 md:gap-2 glass-panel p-1 md:p-2 border-white/5 bg-black/60 shrink-0 overflow-x-auto scrollbar-hide touch-pan-x">
                        <TabBtn active={activeTab === 'regular'} onClick={() => setActiveTab('regular')} icon={<BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" />} label={TL.ui.market} lang={lang} color="cyan" />
                        {hasBlackMarket && <TabBtn active={activeTab === 'black_market'} onClick={() => setActiveTab('black_market')} icon={<Fingerprint className="w-3.5 h-3.5 md:w-4 md:h-4" />} label={TL.ui.shadow_network} lang={lang} color="purple" />}
                        <TabBtn active={activeTab === 'exchange'} onClick={() => setActiveTab('exchange')} icon={<RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />} label={TL.ui.exchange} lang={lang} color="amber" />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-0 md:pr-4 scrollbar-hide space-y-4 md:space-y-6 pb-24">
                        <AnimatePresence mode="wait">
                            {activeTab === 'regular' && (
                                <motion.div
                                    key="regular-market" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5"
                                >
                                    {marketPrices.map(price => {
                                        const illegalResources = ['nanoSwarm', 'ancientTech'];
                                        const isIllegal = illegalResources.includes(price.resource);
                                        if (isIllegal) return null;
                                        if (price.resource === 'rubies') return null;

                                        const isSelected = price.resource === selectedResource;
                                        const hasResource = (resources[price.resource] || 0) > 0;

                                        return (
                                            <div
                                                key={price.resource}
                                                className={`
                                                glass-panel p-5 md:p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group
                                                ${isSelected ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.1)] scale-[1.02]' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}
                                            `}
                                            >
                                                {/* Заголовок карточки */}
                                                <div
                                                    onClick={() => {
                                                        setSelectedResource(price.resource as any);
                                                        // Раскрываем/сворачиваем карточку
                                                        setExpandedResource(expandedResource === price.resource ? null : price.resource as any);
                                                        setAmount(1);
                                                    }}
                                                    className="flex items-center justify-between mb-5"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 glass-panel rounded-lg border-white/10 ${isSelected ? 'text-cyan-400 bg-cyan-400/5' : 'text-white/20'}`}>
                                                            <Package className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-sm uppercase tracking-widest text-white leading-none mb-1">
                                                                {t(TL.resources[price.resource], lang) || price.resource}
                                                            </h3>
                                                            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.rawMaterialType, lang)}</div>
                                                        </div>
                                                    </div>
                                                    {hasResource && (
                                                        <div className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                                            {t(TL.ui.inCargo, lang)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none italic">{t(TL.ui.buy, lang)}</span>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-2xl font-black text-white tracking-tighter italic">
                                                                {Math.floor(price.finalPrice)}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-cyan-400 opacity-60">CR</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 text-right">
                                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none italic">{t(TL.ui.sell, lang)}</span>
                                                        <div className="flex items-baseline justify-end gap-1.5">
                                                            <span className="text-2xl font-black text-cyan-400 tracking-tighter italic">
                                                                {Math.floor(price.finalPrice * 0.8)}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-cyan-400 opacity-60">CR</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.cargo, lang)}:</span>
                                                        <span className="text-xs font-black text-white/60">{(resources[price.resource] || 0).toLocaleString()}</span>
                                                    </div>
                                                    {price.regionalModifier !== 1.0 && (
                                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border transition-colors ${price.regionalModifier < 1.0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                                            {price.regionalModifier < 1.0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                                            {Math.round(Math.abs(price.regionalModifier - 1) * 100)}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Раскрывающийся UI для мобильных */}
                                                <AnimatePresence>
                                                    {expandedResource === price.resource && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-5 mt-5 border-t border-cyan-500/20 space-y-4">
                                                                {/* Кнопки количества */}
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {[1, 10, 50, 100].map(val => (
                                                                        <button
                                                                            key={val}
                                                                            onClick={(e) => { e.stopPropagation(); setAmount(val); }}
                                                                            className={`flex-1 min-w-[48px] py-3 font-black text-xs uppercase tracking-widest transition-all rounded-lg
                                                                                ${amount === val ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                                                                        >
                                                                            {val}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setAmount(resources[price.resource] || 0); }}
                                                                        className="flex-1 min-w-[48px] py-3 font-black text-xs uppercase tracking-widest bg-white/10 text-white/60 hover:bg-white/20 rounded-lg"
                                                                    >
                                                                        MAX
                                                                    </button>
                                                                </div>

                                                                {/* Итого */}
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-white/40 font-black uppercase tracking-widest">{lang === 'RU' ? 'Кол-во' : 'Qty'}: {amount}</span>
                                                                    <span className="text-cyan-400 font-black">{Math.floor(price.finalPrice * amount).toLocaleString()} CR</span>
                                                                </div>

                                                                {/* Кнопки Buy/Sell */}
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if ((resources.credits || 0) >= price.finalPrice * amount) {
                                                                                buyFromMarket(price.resource as any, amount);
                                                                                audioEngine.playMarketTrade();
                                                                                setAmount(1);
                                                                            }
                                                                        }}
                                                                        disabled={(resources.credits || 0) < price.finalPrice * amount}
                                                                        className={`py-4 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all
                                                                            ${(resources.credits || 0) >= price.finalPrice * amount
                                                                                ? 'bg-white text-black hover:bg-cyan-400 active:scale-95'
                                                                                : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                                                                    >
                                                                        <TrendingUp className="w-4 h-4" />
                                                                        {t(TL.ui.buy, lang)}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if ((resources[price.resource] || 0) >= amount) {
                                                                                sellToMarket(price.resource as any, amount);
                                                                                audioEngine.playMarketTrade();
                                                                                setAmount(1);
                                                                            }
                                                                        }}
                                                                        disabled={(resources[price.resource] || 0) < amount}
                                                                        className={`py-4 font-black text-sm uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all
                                                                            ${(resources[price.resource] || 0) >= amount
                                                                                ? 'bg-cyan-500 text-black hover:bg-cyan-300 active:scale-95'
                                                                                : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                                                                    >
                                                                        <TrendingDown className="w-4 h-4" />
                                                                        {t(TL.ui.sell, lang)}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}

                            {activeTab === 'black_market' && (
                                <motion.div
                                    key="black-market" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="glass-panel p-8 border-purple-500/20 bg-purple-500/5 relative overflow-hidden flex items-center justify-between group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShieldAlert className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10 flex items-center gap-6">
                                            <div className="w-16 h-16 glass-panel border-purple-500/30 bg-purple-500/10 flex items-center justify-center rounded-2xl">
                                                <Fingerprint className="w-8 h-8 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{t(TL.ui.shadowExchange, lang)}</h3>
                                                <p className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.3em]">{t(TL.ui.encryptedChannel, lang)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                                        {BLACK_MARKET_ITEMS.map((item, idx) => {
                                            const isOwned = item.type === 'BLUEPRINT' && item.targetId ? unlockedBlueprints.includes(item.targetId) : false;
                                            const canAffordItem = item.cost.every(c => (resources[c.resource] || 0) >= c.amount);

                                            return (
                                                <div key={item.id} className={`glass-panel p-6 border-white/5 bg-white/5 relative group transition-all ${isOwned ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-purple-500/40 hover:bg-purple-500/5'}`}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 glass-panel border-white/10 bg-white/5 flex items-center justify-center rounded-xl text-purple-400">
                                                                {item.type === 'BLUEPRINT' ? <ScrollText className="w-6 h-6" /> : <MonitorDot className="w-6 h-6" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-white uppercase italic tracking-widest leading-none mb-1">{t(item.name, lang)}</h4>
                                                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{t(TL.ui.status_label, lang)}: {item.type === 'BLUEPRINT' ? (lang === 'RU' ? 'Чертеж' : 'Blueprint') : item.type === 'RESOURCE' ? (lang === 'RU' ? 'Ресурс' : 'Resource') : (lang === 'RU' ? 'Гаджет' : 'Gadget')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-white/40 font-black uppercase italic tracking-widest leading-relaxed mb-6 h-12 overflow-hidden">
                                                        {t(item.description, lang)}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            {item.cost.map(c => (
                                                                <div key={c.resource} className="flex items-baseline gap-2">
                                                                    <span className={`text-xl font-black tracking-tighter ${(resources[c.resource] || 0) >= c.amount ? 'text-white' : 'text-rose-500'}`}>
                                                                        {c.amount.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-[8px] font-bold text-purple-400 uppercase">{t(TL.resources[c.resource], lang)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => buyBlackMarketItem(item.id)}
                                                            disabled={isOwned || !canAffordItem}
                                                            className={`px-6 py-2.5 font-black text-[9px] uppercase tracking-widest transition-all rounded-lg
                                                            ${isOwned ? 'bg-white/5 text-white/20 border border-white/5' :
                                                                    canAffordItem ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]' :
                                                                        'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}
                                                        `}
                                                        >
                                                            {isOwned ? t(TEXT_IDS.CITY_OWNED, lang) : t(TL.ui.acquire, lang)}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'exchange' && (
                                <motion.div
                                    key="exchange-market" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-panel p-10 border-amber-500/20 bg-amber-500/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                                    <div className="max-w-2xl mx-auto space-y-12 py-8">
                                        <div className="text-center space-y-4">
                                            <div className="w-20 h-20 glass-panel border-amber-500/30 bg-amber-500/10 flex items-center justify-center rounded-3xl mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                                                <RefreshCcw className="w-10 h-10 text-amber-500" />
                                            </div>
                                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t(TL.ui.resourceConversion, lang)}</h3>
                                            <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.4em]">{t(TL.ui.directExchangeDesc, lang)}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:gap-10">
                                            <div className="space-y-6">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block italic">{t(TL.ui.selectFeedstock, lang)}</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['iron', 'copper', 'coal', 'gold'].map(res => (
                                                        <button
                                                            key={res} onClick={() => setSelectedResource(res as any)}
                                                            className={`p-4 glass-panel text-left border-white/5 transition-all
                                                            ${selectedResource === res ? 'bg-amber-500 text-black border-amber-400 scale-[1.05]' : 'bg-white/5 text-white/40 hover:bg-white/10'}
                                                        `}
                                                        >
                                                            <div className="text-[9px] font-black uppercase mb-1">{t(TL.resources[res as keyof Resources], lang)}</div>
                                                            <div className="text-xs font-black">{(resources[res as keyof Resources] || 0).toLocaleString()}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6 flex flex-col justify-end">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block italic">{t(TL.ui.finalizeExchange, lang)}</label>
                                                <div className="glass-panel p-6 border-white/10 bg-black/40 space-y-6">
                                                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.yieldEstimate, lang)}</span>
                                                            <div className="text-3xl font-black text-amber-500 italic">25.0 {t(TL.ui.units, lang)}</div>
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.efficiency, lang)}</span>
                                                            <div className="text-lg font-black text-white">94.2%</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        disabled={!selectedResource || (resources[selectedResource] || 0) < 100}
                                                        onClick={() => exchangeResourceForFuel && exchangeResourceForFuel(selectedResource, 100)}
                                                        className="w-full py-5 bg-amber-500 text-black font-black uppercase text-xs tracking-[0.4em] italic shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all active:scale-95 disabled:grayscale disabled:opacity-20"
                                                    >
                                                        {t(TL.ui.processConversion, lang)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </div>
    );
};

const TabBtn = ({ active, onClick, icon, label, lang, color }: { active: boolean, onClick: () => void, icon: any, label: any, lang: string, color: string }) => {
    const colorClasses = {
        cyan: active ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white/60 hover:bg-white/5',
        purple: active ? 'text-white bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'text-purple-400/40 hover:text-purple-400/60 hover:bg-purple-500/5',
        amber: active ? 'text-black bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-amber-500/40 hover:text-amber-500/60 hover:bg-amber-500/5'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-lg font-black font-technical text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden group shrink-0 min-h-[44px]
                ${(colorClasses as any)[color]}
            `}
        >
            <span className="transition-transform group-hover:scale-110 [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">{icon}</span>
            <span className="whitespace-nowrap">{t(label, lang as any)}</span>
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
        </button>
    );
};


