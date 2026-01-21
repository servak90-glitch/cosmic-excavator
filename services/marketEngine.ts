/**
 * MARKET ENGINE — динамическая система ценообразования
 * Phase 2: региональные цены + временные модификаторы
 */

import { REGIONAL_PRICE_MODIFIERS } from '../constants/marketPrices';
import type { RegionId, Resources, MarketPrice } from '../types';
import { ResourceType } from '../types';

// Базовые цены ресурсов (в credits за единицу)
// TODO: вынести в constants/prices.ts когда появится
const RESOURCE_PRICES: Record<keyof Resources, number> = {
    clay: 1,
    stone: 2,
    copper: 5,
    iron: 10,
    silver: 20,
    gold: 50,
    titanium: 100,
    uranium: 200,
    nanoSwarm: 500,
    ancientTech: 1000,
    rubies: 100,
    emeralds: 150,
    diamonds: 300,
    coal: 5,
    oil: 15,
    gas: 30,
    ice: 10,
    scrap: 8,
    credits: 1,
    repairKit: 500,
    coolantPaste: 1000,
    advancedCoolant: 5000
};

/**
 * Расчёт рыночной цены ресурса в регионе
 * 
 * Формула: finalPrice = basePrice × regionalModifier × temporalModifier
 * 
 * @param resource - тип ресурса
 * @param regionId - ID региона
 * @param activeEvents - массив активных событий (опционально)
 * @returns объект MarketPrice с детальной информацией о цене
 */
export function calculateMarketPrice(
    resource: keyof Resources,
    regionId: RegionId,
    activeEvents: string[] = [],
    activePerks: string[] = []
): MarketPrice {
    const basePrice = RESOURCE_PRICES[resource] || 1;
    const regionalModifier = REGIONAL_PRICE_MODIFIERS[resource]?.[regionId] || 1.0;

    // Временной модификатор (события)
    let temporalModifier = 1.0;

    // Perk: Corporate Exchange (-5% price)
    if (activePerks.includes('CORP_EXCHANGE')) {
        temporalModifier *= 0.95;
    }

    // Perk: Black Market (Allows trading illegal goods - logic handled in UI, but maybe price affected?)
    // For now Black Market just unlocks the tab/items.

    // TODO Phase 3: добавить события с динамическими ценами
    // if (activeEvents.includes('PRICE_SPIKE')) {
    //     temporalModifier *= 1.3;
    // }

    const finalPrice = Math.floor(basePrice * regionalModifier * temporalModifier);

    return {
        resource,
        basePrice,
        regionalModifier,
        temporalModifier,
        finalPrice,
    };
}

/**
 * Проверка возможности покупки ресурса
 */
export function canAffordPurchase(
    resource: keyof Resources,
    amount: number,
    currentCredits: number,
    regionId: RegionId,
    activeEvents: string[] = [],
    activePerks: string[] = []
): { canAfford: boolean; totalCost: number; reason?: string } {
    const price = calculateMarketPrice(resource, regionId, activeEvents, activePerks);
    const totalCost = price.finalPrice * amount;

    if (currentCredits < totalCost) {
        return {
            canAfford: false,
            totalCost,
            reason: `Нужно ${totalCost} credits (у вас ${currentCredits})`
        };
    }

    return { canAfford: true, totalCost };
}

/**
 * Расчёт выручки от продажи ресурса
 * 
 * Игрок получает 80% от рыночной цены (комиссия 20%)
 */
export function calculateSellRevenue(
    resource: keyof Resources,
    amount: number,
    regionId: RegionId,
    activeEvents: string[] = [],
    activePerks: string[] = []
): { sellPrice: number; totalRevenue: number; fee: number } {
    const price = calculateMarketPrice(resource, regionId, activeEvents, activePerks);
    const sellPrice = Math.floor(price.finalPrice * 0.8);  // 20% комиссия (FIXME: Maybe perks reduce fee?)
    const totalRevenue = sellPrice * amount;
    const fee = (price.finalPrice - sellPrice) * amount;

    return { sellPrice, totalRevenue, fee };
}

/**
 * Получить все цены в регионе для отображения в UI
 */
export function getAllMarketPrices(
    regionId: RegionId,
    activeEvents: string[] = [],
    activePerks: string[] = []
): MarketPrice[] {
    const resources: ResourceType[] = [
        ResourceType.CLAY, ResourceType.STONE, ResourceType.COPPER, ResourceType.IRON,
        ResourceType.SILVER, ResourceType.GOLD, ResourceType.TITANIUM, ResourceType.URANIUM,
        ResourceType.NANO_SWARM, ResourceType.ANCIENT_TECH, ResourceType.RUBIES, ResourceType.EMERALDS,
        ResourceType.DIAMONDS, ResourceType.COAL, ResourceType.OIL, ResourceType.GAS,
        ResourceType.ICE, ResourceType.SCRAP
    ];

    return resources.map(resource =>
        calculateMarketPrice(resource, regionId, activeEvents, activePerks)
    );
}
