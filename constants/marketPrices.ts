import { ResourceType } from '../types';
import type { RegionId } from '../types';

/**
 * Региональные модификаторы цен для Dynamic Market
 * 
 * Логика: Ресурс ДЕШЕВЛЕ там, где его много добывается.
 * ДОРОЖЕ там, где редок.
 */
export const REGIONAL_PRICE_MODIFIERS: Record<ResourceType, Record<RegionId, number>> = {
    // === BASIC RESOURCES ===
    [ResourceType.CLAY]: {
        rust_valley: 1.0,
        crystal_wastes: 0.8,
        iron_gates: 1.1,
        magma_core: 1.3,
        void_chasm: 1.5,
    },
    [ResourceType.STONE]: {
        rust_valley: 1.0,
        crystal_wastes: 0.7,
        iron_gates: 0.9,
        magma_core: 1.2,
        void_chasm: 1.5,
    },
    [ResourceType.COPPER]: {
        rust_valley: 1.2,
        crystal_wastes: 1.0,
        iron_gates: 0.7,
        magma_core: 1.1,
        void_chasm: 1.3,
    },
    [ResourceType.IRON]: {
        rust_valley: 1.3,
        crystal_wastes: 1.1,
        iron_gates: 0.6,
        magma_core: 1.0,
        void_chasm: 1.2,
    },
    [ResourceType.SILVER]: {
        rust_valley: 1.4,
        crystal_wastes: 1.2,
        iron_gates: 0.9,
        magma_core: 0.8,
        void_chasm: 1.1,
    },
    [ResourceType.GOLD]: {
        rust_valley: 1.4,
        crystal_wastes: 1.2,
        iron_gates: 1.1,
        magma_core: 0.7,
        void_chasm: 1.0,
    },
    [ResourceType.TITANIUM]: {
        rust_valley: 1.5,
        crystal_wastes: 1.3,
        iron_gates: 1.2,
        magma_core: 0.9,
        void_chasm: 0.8,
    },
    [ResourceType.URANIUM]: {
        rust_valley: 1.5,
        crystal_wastes: 1.3,
        iron_gates: 1.2,
        magma_core: 1.0,
        void_chasm: 0.8,
    },

    // === ADVANCED RESOURCES ===
    [ResourceType.NANO_SWARM]: {
        rust_valley: 1.5,
        crystal_wastes: 1.4,
        iron_gates: 1.3,
        magma_core: 1.1,
        void_chasm: 0.7,
    },
    [ResourceType.ANCIENT_TECH]: {
        rust_valley: 1.5,
        crystal_wastes: 1.3,
        iron_gates: 1.2,
        magma_core: 1.0,
        void_chasm: 0.8,
    },

    // === GEMS ===
    [ResourceType.RUBIES]: {
        rust_valley: 1.3,
        crystal_wastes: 1.0,
        iron_gates: 1.1,
        magma_core: 0.9,
        void_chasm: 1.2,
    },
    [ResourceType.EMERALDS]: {
        rust_valley: 1.5,
        crystal_wastes: 0.5,  // Много изумрудов в Crystal Wastes!
        iron_gates: 1.2,
        magma_core: 1.3,
        void_chasm: 1.1,
    },
    [ResourceType.DIAMONDS]: {
        rust_valley: 1.5,
        crystal_wastes: 1.2,
        iron_gates: 1.3,
        magma_core: 1.0,
        void_chasm: 0.8,
    },

    // === FUEL RESOURCES ===
    [ResourceType.COAL]: {
        rust_valley: 1.0,
        crystal_wastes: 1.2,
        iron_gates: 0.8,
        magma_core: 0.7,
        void_chasm: 1.3,
    },
    [ResourceType.OIL]: {
        rust_valley: 1.2,
        crystal_wastes: 1.0,
        iron_gates: 0.9,
        magma_core: 0.8,
        void_chasm: 1.1,
    },
    [ResourceType.GAS]: {
        rust_valley: 1.3,
        crystal_wastes: 1.1,
        iron_gates: 1.0,
        magma_core: 0.9,
        void_chasm: 0.8,
    },
    [ResourceType.ICE]: {
        rust_valley: 1.5,
        crystal_wastes: 0.8,
        iron_gates: 1.1,
        magma_core: 1.0,
        void_chasm: 0.7,
    },
    [ResourceType.SCRAP]: {
        rust_valley: 0.8,
        crystal_wastes: 1.1,
        iron_gates: 0.9,
        magma_core: 1.0,
        void_chasm: 1.2,
    },
    [ResourceType.CREDITS]: {
        rust_valley: 1.0,
        crystal_wastes: 1.0,
        iron_gates: 1.0,
        magma_core: 1.0,
        void_chasm: 1.0,
    },
    [ResourceType.REPAIR_KIT]: {
        rust_valley: 1.0,
        crystal_wastes: 1.1,
        iron_gates: 0.9,
        magma_core: 1.2,
        void_chasm: 1.3,
    },
    [ResourceType.COOLANT_PASTE]: {
        rust_valley: 1.2,
        crystal_wastes: 1.0,
        iron_gates: 1.1,
        magma_core: 0.8,
        void_chasm: 0.9,
    },
    [ResourceType.ADVANCED_COOLANT]: {
        rust_valley: 1.3,
        crystal_wastes: 1.1,
        iron_gates: 1.2,
        magma_core: 0.9,
        void_chasm: 0.8,
    }
};

/**
 * Получить региональный модификатор для ресурса
 */
export function getRegionalModifier(resource: ResourceType, regionId: RegionId): number {
    return REGIONAL_PRICE_MODIFIERS[resource]?.[regionId] || 1.0;
}

/**
 * Комиссия при ПРОДАЖЕ ресурсов на рынке (20%)
 */
export const MARKET_SELL_FEE = 0.20;
