/**
 * MARKET SLICE — управление рыночными транзакциями
 * Phase 2: buy/sell в Station базах
 */

import { SliceCreator } from './types';
import type { MarketTransaction, Resources } from '../../types';
import { calculateMarketPrice, calculateSellRevenue } from '../../services/marketEngine';
import { recalculateCargoWeight } from '../../services/gameMath';

export interface MarketSlice {
    marketTransactionHistory: MarketTransaction[];

    buyFromMarket: (resource: keyof Resources, amount: number) => void;
    sellToMarket: (resource: keyof Resources, amount: number) => void;
}

import { getActivePerkIds } from '../../services/factionLogic';

export const createMarketSlice: SliceCreator<MarketSlice> = (set, get) => ({
    marketTransactionHistory: [],

    buyFromMarket: (resource, amount) => {
        const state = get();

        // Проверка: игрок в Station?
        const currentBase = state.playerBases.find(b => b.regionId === state.currentRegion);
        if (!currentBase || currentBase.type !== 'station') {
            console.warn('❌ Market доступен только в Station!');
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);

        // Расчёт цены
        const price = calculateMarketPrice(resource, state.currentRegion, [], activePerks);
        const totalCost = price.finalPrice * amount;

        // Проверки
        if (state.resources.rubies < totalCost) {
            console.warn(`❌ Недостаточно credits (нужно ${totalCost}, есть ${state.resources.rubies})`);
            return;
        }

        // Транзакция
        set((state) => {
            const newResources = {
                ...state.resources,
                rubies: state.resources.rubies - totalCost,
                [resource]: (state.resources[resource] || 0) + amount,
            };

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
                marketTransactionHistory: [
                    ...state.marketTransactionHistory,
                    {
                        type: 'buy',
                        resource,
                        amount,
                        pricePerUnit: price.finalPrice,
                        totalCost,
                        regionId: state.currentRegion,
                        timestamp: Date.now(),
                    },
                ],
            };
        });

        console.log(`✅ Куплено ${amount} ${resource} за ${totalCost} credits`);
    },

    sellToMarket: (resource, amount) => {
        const state = get();

        // Проверка: игрок в Station?
        const currentBase = state.playerBases.find(b => b.regionId === state.currentRegion);
        if (!currentBase || currentBase.type !== 'station') {
            console.warn('❌ Market доступен только в Station!');
            return;
        }

        // Проверка наличия ресурсов
        if ((state.resources[resource] || 0) < amount) {
            console.warn(`❌ Недостаточно ${resource} (нужно ${amount}, есть ${state.resources[resource] || 0})`);
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);

        // Расчёт выручки (80% от рыночной цены)
        const { sellPrice, totalRevenue } = calculateSellRevenue(resource, amount, state.currentRegion, [], activePerks);

        // Транзакция
        set((state) => {
            const newResources = {
                ...state.resources,
                rubies: state.resources.rubies + totalRevenue,
                [resource]: (state.resources[resource] || 0) - amount,
            };

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
                marketTransactionHistory: [
                    ...state.marketTransactionHistory,
                    {
                        type: 'sell',
                        resource,
                        amount,
                        pricePerUnit: sellPrice,
                        totalCost: totalRevenue,
                        regionId: state.currentRegion,
                        timestamp: Date.now(),
                    },
                ],
            };
        });

        console.log(`✅ Продано ${amount} ${resource} за ${totalRevenue} credits (цена продажи: ${sellPrice}/шт)`);
    },
});
