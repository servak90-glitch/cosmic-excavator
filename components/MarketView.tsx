/**
 * MARKET VIEW — UI для торговли ресурсами в Station базах
 * Phase 2: региональные цены + buy/sell
 */

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { getAllMarketPrices } from '../services/marketEngine';
import { getActivePerkIds } from '../services/factionLogic';
import { TL, t } from '../services/localization';
import { BLACK_MARKET_ITEMS } from '../constants/blackMarket';
import type { Resources } from '../types';

export const MarketView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const playerBases = useGameStore(s => s.playerBases);
    const buyFromMarket = useGameStore(s => s.buyFromMarket);
    const sellToMarket = useGameStore(s => s.sellToMarket);
    const buyBlackMarketItem = useGameStore(s => s.buyBlackMarketItem);
    const reputation = useGameStore(s => s.reputation);
    const lang = useGameStore(s => s.settings.language);

    const [selectedResource, setSelectedResource] = useState<keyof Resources | null>(null);
    const [amount, setAmount] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'regular' | 'black_market'>('regular');

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    // Проверка: игрок в Station?
    const currentBase = playerBases.find(b => b.regionId === currentRegion);
    const canAccessMarket = currentBase?.type === 'station';

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);
    const hasBlackMarket = activePerks.includes('BLACK_MARKET');

    const marketPrices = useMemo(() => getAllMarketPrices(currentRegion, [], activePerks), [currentRegion, activePerks]);

    if (!canAccessMarket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
                <div className="bg-gray-800/80 border-2 border-red-500 rounded-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">🚫 РЫНОК НЕДОСТУПЕН</h2>
                    <p className="text-gray-400">
                        Рынок доступен только в <span className="text-cyan-400 font-bold">Station</span> базах.
                        Постройте Station в этом регионе для доступа к торговле.
                    </p>
                </div>
            </div>
        );
    }



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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">💰 {t(TL.ui.market, lang).toUpperCase()}</h1>
                <p className="text-gray-400">Региональная торговля • Комиссия продажи: 20%</p>
            </div>

            {/* Credits Display */}
            <div className="max-w-6xl mx-auto mb-6 bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Баланс</p>
                        <p className="text-yellow-400 font-bold text-2xl">💎 {resources.rubies} credits</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">{t(TL.ui.currentRegion, lang)}</p>
                        <p className="text-cyan-400 font-bold">{t(TL.regions[currentBase.regionId], lang) || currentBase.regionId}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                {/* Price List */}
                <div className="lg:col-span-2">
                    {/* Tab Selector */}
                    {hasBlackMarket && (
                        <div className="flex gap-4 mb-4 border-b border-gray-700 pb-2">
                            <button
                                onClick={() => setActiveTab('regular')}
                                className={`px-4 py-2 rounded font-bold transition-all ${activeTab === 'regular' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-cyan-400'}`}
                            >
                                📊 {t(TL.ui.market, lang)}
                            </button>
                            <button
                                onClick={() => setActiveTab('black_market')}
                                className={`px-4 py-2 rounded font-bold transition-all ${activeTab === 'black_market' ? 'bg-purple-900 border border-purple-500 text-purple-200' : 'bg-gray-900 text-gray-500 hover:text-purple-400'}`}
                            >
                                👁️ SHADOW NETWORK
                            </button>
                        </div>
                    )}

                    {activeTab === 'regular' ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-4">📊 {t(TL.ui.market, lang)}</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {marketPrices.map(price => {
                                    // Perk: Black Market (Science Level 3) - Unlocks illegal goods
                                    const illegalResources = ['nanoSwarm', 'ancientTech'];
                                    const isIllegal = illegalResources.includes(price.resource);
                                    const hasBlackMarket = activePerks.includes('BLACK_MARKET');

                                    if (isIllegal && !hasBlackMarket) return null;
                                    if (price.resource === 'rubies') return null; // Credits are not traded

                                    const isSelected = price.resource === selectedResource;
                                    const hasResource = (resources[price.resource] || 0) > 0;

                                    return (
                                        <div
                                            key={price.resource}
                                            onClick={() => setSelectedResource(price.resource)}
                                            className={`
                                        bg-gray-800/70 border-2 rounded-lg p-4 cursor-pointer transition-all
                                        ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-gray-700 hover:border-cyan-500/50'}
                                    `}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-white capitalize">{t(TL.resources[price.resource], lang) || price.resource}</h3>
                                                <span className="text-xl">
                                                    {hasResource ? '✅' : ''}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">{t(TL.ui.buy, lang)}:</span>
                                                    <span className="text-green-400 font-bold">{price.finalPrice} 💎</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">{t(TL.ui.sell, lang)}:</span>
                                                    <span className="text-yellow-400 font-bold">
                                                        {Math.floor(price.finalPrice * 0.8)} 💎
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-1 border-t border-gray-700">
                                                    <span className="text-gray-500 text-xs">У вас:</span>
                                                    <span className="text-white text-xs">{resources[price.resource] || 0}</span>
                                                </div>

                                                {/* Regional modifier indicator */}
                                                {price.regionalModifier !== 1.0 && (
                                                    <div className="pt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${price.regionalModifier < 1.0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                                                            }`}>
                                                            {price.regionalModifier < 1.0 ? '🔽' : '🔼'} {Math.round((price.regionalModifier - 1) * 100)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-purple-400 mb-4 tracking-widest glitch-text">👁️ SHADOW NETWORK</h2>

                            <div className="grid gap-4">
                                {BLACK_MARKET_ITEMS.map(item => {
                                    const isBlueprint = item.type === 'BLUEPRINT';
                                    const isUnlocked = isBlueprint && item.targetId && useGameStore.getState().unlockedBlueprints.includes(item.targetId);

                                    const canAfford = item.cost.every(c => (resources[c.resource] || 0) >= c.amount);

                                    // Localized Name/Desc
                                    const itemName = typeof item.name === 'string' ? item.name : (item.name[lang] || item.name.EN);
                                    const itemDesc = typeof item.description === 'string' ? item.description : (item.description[lang] || item.description.EN);

                                    return (
                                        <div key={item.id} className="bg-gray-900/90 border border-purple-600/50 p-4 rounded flex justify-between items-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />

                                            <div>
                                                <h3 className="text-lg font-bold text-purple-200">
                                                    {itemName}
                                                </h3>
                                                <p className="text-gray-400 text-sm italic">
                                                    {itemDesc}
                                                </p>

                                                <div className="flex gap-2 mt-2">
                                                    {item.cost.map((c, i) => (
                                                        <span key={i} className={`text-xs px-2 py-1 rounded bg-gray-800 border items-center flex gap-1 ${(resources[c.resource] || 0) >= c.amount ? 'border-gray-600 text-gray-300' : 'border-red-900 text-red-400'
                                                            }`}>
                                                            {c.amount} {c.resource}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    buyBlackMarketItem(item.id);
                                                    audioEngine.playGlitch(); // Darker sound for black market
                                                }}
                                                disabled={!canAfford || (isUnlocked as boolean)}
                                                className={`
                                                    px-6 py-2 rounded font-bold border-2 transition-all
                                                    ${isUnlocked
                                                        ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                                        : canAfford
                                                            ? 'bg-purple-900/50 border-purple-500 hover:bg-purple-800 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                                            : 'bg-gray-900 border-red-900/50 text-gray-600 cursor-not-allowed'}
                                                `}
                                            >
                                                {isUnlocked ? 'OWNED' : 'ACQUIRE'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-center text-purple-900 font-mono mt-8">
                                WARNING: TRANSACTIONS ARE UNTRACEABLE. NO REFUNDS.
                            </p>
                        </div>
                    )}
                </div>

                {/* Trading Panel */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">🛒 Торговля</h2>

                    {selectedResource ? (
                        <div className="bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-400 capitalize mb-2">
                                    {t(TL.resources[selectedResource], lang) || selectedResource}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    В наличии: <span className="text-white font-bold">{availableResource}</span>
                                </p>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Количество:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setAmount(10)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">×10</button>
                                    <button onClick={() => setAmount(100)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">×100</button>
                                    <button onClick={() => setAmount(1000)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">×1000</button>
                                </div>
                            </div>

                            {/* Buy Button */}
                            <div className="pt-2 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">
                                    Стоимость: <span className="text-green-400 font-bold">{totalBuyCost} 💎</span>
                                </p>
                                <button
                                    onClick={handleBuy}
                                    disabled={resources.rubies < totalBuyCost}
                                    className={`
                                        w-full py-3 rounded-lg font-bold transition-all
                                        ${resources.rubies >= totalBuyCost
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {resources.rubies >= totalBuyCost ? `💵 ${t(TL.ui.buy, lang).toUpperCase()}` : '❌ НЕДОСТАТОЧНО СРЕДСТВ'}
                                </button>
                            </div>

                            {/* Sell Button */}
                            <div className="pt-2 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">
                                    Выручка: <span className="text-yellow-400 font-bold">{totalSellRevenue} 💎</span>
                                    <span className="text-xs text-red-400 ml-2">(комиссия 20%)</span>
                                </p>
                                <button
                                    onClick={handleSell}
                                    disabled={availableResource < amount}
                                    className={`
                                        w-full py-3 rounded-lg font-bold transition-all
                                        ${availableResource >= amount
                                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {availableResource >= amount ? `💰 ${t(TL.ui.sell, lang).toUpperCase()}` : '❌ НЕДОСТАТОЧНО РЕСУРСОВ'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-8 text-center">
                            <p className="text-gray-500">Выберите ресурс из списка</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
