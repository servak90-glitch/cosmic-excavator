/**
 * MARKET VIEW — UI для торговли ресурсами в Station базах
 * Phase 2: региональные цены + buy/sell
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { getAllMarketPrices } from '../services/marketEngine';
import { getActivePerkIds } from '../services/factionLogic';
import { TL } from '../services/localization';
import type { Resources } from '../types';

export const MarketView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const playerBases = useGameStore(s => s.playerBases);
    const buyFromMarket = useGameStore(s => s.buyFromMarket);
    const sellToMarket = useGameStore(s => s.sellToMarket);
    const reputation = useGameStore(s => s.reputation);

    const [selectedResource, setSelectedResource] = useState<keyof Resources | null>(null);
    const [amount, setAmount] = useState<number>(1);

    // Проверка: игрок в Station?
    const currentBase = playerBases.find(b => b.regionId === currentRegion);
    const canAccessMarket = currentBase?.type === 'station';

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);
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
            setAmount(1);
        }
    };

    const handleSell = () => {
        if (selectedResource && amount > 0) {
            sellToMarket(selectedResource, amount);
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
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">💰 {TL.ui.market.toUpperCase()}</h1>
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
                        <p className="text-gray-400 text-sm">{TL.ui.currentRegion}</p>
                        <p className="text-cyan-400 font-bold">{TL.regions[currentBase.regionId] || currentBase.regionId}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                {/* Price List */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white mb-4">📊 Рыночные цены</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {marketPrices.map(price => {
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
                                        <h3 className="font-bold text-white capitalize">{TL.resources[price.resource] || price.resource}</h3>
                                        <span className="text-xl">
                                            {hasResource ? '✅' : ''}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">{TL.ui.buy}:</span>
                                            <span className="text-green-400 font-bold">{price.finalPrice} 💎</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">{TL.ui.sell}:</span>
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
                </div>

                {/* Trading Panel */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">🛒 Торговля</h2>

                    {selectedResource ? (
                        <div className="bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-400 capitalize mb-2">
                                    {TL.resources[selectedResource] || selectedResource}
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
                                    {resources.rubies >= totalBuyCost ? `💵 ${TL.ui.buy.toUpperCase()}` : '❌ НЕДОСТАТОЧНО СРЕДСТВ'}
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
                                    {availableResource >= amount ? `💰 ${TL.ui.sell.toUpperCase()}` : '❌ НЕДОСТАТОЧНО РЕСУРСОВ'}
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
