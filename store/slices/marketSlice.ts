/**
 * MARKET SLICE — управление рыночными транзакциями
 * Phase 2: buy/sell в Station базах
 */

import { SliceCreator } from './types';
import type { MarketTransaction, Resources } from '../../types';
import { calculateMarketPrice, calculateSellRevenue } from '../../services/marketEngine';
import { recalculateCargoWeight, calculateStats } from '../../services/gameMath';
import { audioEngine } from '../../services/audioEngine';
import { BLACK_MARKET_ITEMS } from '../../constants/blackMarket';

export interface MarketActions {
    marketTransactionHistory: MarketTransaction[];

    buyFromMarket: (resource: keyof Resources, amount: number) => void;
    sellToMarket: (resource: keyof Resources, amount: number) => void;
    buyBlackMarketItem: (itemId: string) => void;
}

import { getActivePerkIds } from '../../services/factionLogic';

export const createMarketSlice: SliceCreator<MarketActions> = (set, get) => ({
    marketTransactionHistory: [],

    buyFromMarket: (resource, amount) => {
        const state = get();

        // Рынок доступен через Терминал Хаба (глобальный доступ)

        const activePerks = getActivePerkIds(state.reputation);

        // Расчёт цены
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);
        const price = calculateMarketPrice(resource, state.currentRegion, [], activePerks);

        // Apply Artifact Discount
        const discountMult = Math.max(0.1, 1 - (stats.artifactMods.shopDiscountPct / 100));
        const totalCost = price.finalPrice * amount * discountMult;

        // Проверки
        if (state.resources.credits < totalCost) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно credits (нужно ${totalCost}, есть ${state.resources.credits})`);
            return;
        }

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                credits: state.resources.credits - totalCost,
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

        // Рынок доступен через Терминал Хаба (глобальный доступ)

        // Проверка наличия ресурсов
        if ((state.resources[resource] || 0) < amount) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно ${resource} (нужно ${amount}, есть ${state.resources[resource] || 0})`);
            return;
        }

        const activePerks = getActivePerkIds(state.reputation);

        // Расчёт выручки (80% от рыночной цены)
        const { sellPrice, totalRevenue } = calculateSellRevenue(resource, amount, state.currentRegion, [], activePerks);

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                credits: state.resources.credits + totalRevenue,
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

    buyBlackMarketItem: (itemId: string) => {
        const state = get();
        const item = BLACK_MARKET_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        // Check stock (if implemented globally, currently static constant so stock doesn't deplete per save)
        // For MVP, allow infinite or check if already bought if blueprint
        if (item.type === 'BLUEPRINT' && item.targetId && state.unlockedBlueprints.includes(item.targetId)) {
            audioEngine.playUIError();
            return;
        }

        // Check costs
        for (const cost of item.cost) {
            if ((state.resources[cost.resource] || 0) < cost.amount) {
                audioEngine.playUIError();
                return; // Not enough resources
            }
        }

        // Deduct resources
        audioEngine.playMarketTrade(); // Or a specific darker sound

        set(state => {
            const newResources = { ...state.resources };
            item.cost.forEach(c => {
                newResources[c.resource] = (newResources[c.resource] || 0) - c.amount;
            });

            const updates: Partial<any> = { resources: newResources };
            const visuals: any[] = [];

            // Apply Reward
            if (item.type === 'BLUEPRINT' && item.targetId) {
                updates.unlockedBlueprints = [...state.unlockedBlueprints, item.targetId];
                visuals.push({ type: 'LOG', msg: `📜 BLUEPRINT UNLOCKED: ${item.name}`, color: 'text-purple-400' });
            } else if (item.type === 'RESOURCE' && item.targetId) {
                // Parse targetId e.g. "nanoSwarm_1000"
                const [res, amtStr] = item.targetId.split('_');
                const amt = parseInt(amtStr);
                if (res && amt) {
                    newResources[res as keyof Resources] = (newResources[res as keyof Resources] || 0) + amt;
                    visuals.push({ type: 'LOG', msg: `📦 SMUGGLED: ${amt} ${res}`, color: 'text-green-400' });
                }
            } else if (item.type === 'GADGET') {
                if (item.targetId === 'consumable_shield_50') {
                    updates.shieldCharge = Math.min(state.maxShieldCharge, state.shieldCharge + 50);
                    visuals.push({ type: 'LOG', msg: `🛡️ SHIELD BOOSTED`, color: 'text-cyan-400' });
                } else if (item.targetId === 'consumable_heat_vent') {
                    updates.heat = 0;
                    visuals.push({ type: 'LOG', msg: `❄️ EMERGENCY VENTING`, color: 'text-cyan-400' });
                }
            }

            visuals.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' });

            return {
                ...updates,
                currentCargoWeight: recalculateCargoWeight(newResources), // Cargo might change
                actionLogQueue: [...state.actionLogQueue, ...visuals]
            }
        });
    },

    exchangeResourceForFuel: (resource, amount) => {
        const state = get();

        // Исключаем топливо и кредиты из обмена
        const excludedResources: string[] = ['coal', 'oil', 'gas', 'rubies', 'emeralds', 'diamonds', 'credits'];
        if (excludedResources.includes(resource as string)) {
            audioEngine.playUIError();
            console.warn(`❌ ${resource} нельзя обменять на топливо`);
            return;
        }

        // Проверка наличия ресурсов
        if ((state.resources[resource] || 0) < amount) {
            audioEngine.playUIError();
            console.warn(`❌ Недостаточно ${resource} (нужно ${amount}, есть ${state.resources[resource] || 0})`);
            return;
        }

        // Курс обмена: 10 ресурсов = 5 угля
        const coalReceived = Math.floor((amount / 10) * 5);

        if (coalReceived === 0) {
            audioEngine.playUIError();
            console.warn(`❌ Минимум 10 единиц для обмена`);
            return;
        }

        // Транзакция
        audioEngine.playMarketTrade();
        set((state) => {
            const newResources = {
                ...state.resources,
                [resource]: (state.resources[resource] || 0) - amount,
                coal: (state.resources.coal || 0) + coalReceived,
            };

            return {
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),
            };
        });

        console.log(`✅ Обменяно ${amount} ${resource} на ${coalReceived} угля`);
    }
});
