/**
 * PLAYER BASES CONSTANTS
 * 
 * Константы для системы баз игрока
 */

import { RegionId, type BaseType, type Resources } from '../types';

// Стоимость постройки баз
export const BASE_COSTS: Record<BaseType, { credits: number; materials: Partial<Resources> }> = {
    outpost: {
        credits: 10000,
        materials: { clay: 300, stone: 200 }
    },
    camp: {
        credits: 50000,
        materials: { iron: 1000, copper: 1000 }
    },
    station: {
        credits: 200000,
        materials: { titanium: 5000, uranium: 100 }
    }
};

// Время постройки (в миллисекундах)
export const BASE_BUILD_TIMES: Record<BaseType, number> = {
    outpost: 0,                      // Мгновенно
    camp: 30 * 60 * 1000,           // 30 минут
    station: 2 * 60 * 60 * 1000     // 2 часа
};

// Вместимость хранилища
export const BASE_STORAGE_CAPACITY: Record<BaseType, number> = {
    outpost: 2000,
    camp: 10000,
    station: 50000
};

// Workshop tier ranges по регионам
export const WORKSHOP_TIER_RANGES: Record<RegionId, Record<BaseType, [number, number] | null>> = {
    [RegionId.RUST_VALLEY]: {
        outpost: null,
        camp: [1, 5],
        station: [1, 7]
    },
    [RegionId.CRYSTAL_WASTES]: {
        outpost: null,
        camp: [3, 8],
        station: [3, 10]
    },
    [RegionId.IRON_GATES]: {
        outpost: null,
        camp: [5, 10],
        station: [5, 12]
    },
    [RegionId.MAGMA_CORE]: {
        outpost: null,
        camp: [8, 13],
        station: [8, 15]
    },
    [RegionId.VOID_CHASM]: {
        outpost: null,
        camp: [10, 15],
        station: [1, 15]  // Station в Void Chasm = ВСЕ TIERS
    }
};
