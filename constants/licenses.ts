/**
 * LICENSES & PERMITS CONSTANTS
 * 
 * Константы для системы лицензий и разрешений Global Map
 */

import { RegionId, ZoneLicense, type ReputationTier } from '../types';

// Reputation Tiers с бонусами
export const REPUTATION_TIERS: ReputationTier[] = [
    { tier: 1, min: 0, max: 99, name: 'Новичок', discount: 0 },
    { tier: 2, min: 100, max: 249, name: 'Известный', discount: 0.05 },
    { tier: 3, min: 250, max: 499, name: 'Уважаемый', discount: 0.10 },
    { tier: 4, min: 500, max: 999, name: 'Герой', discount: 0.20 },
    { tier: 5, min: 1000, max: Infinity, name: 'Легенда', discount: 0.30 }
];

// Цены лицензий (в rubies)
export const LICENSE_PRICES: Record<ZoneLicense, number> = {
    green: 5000,
    yellow: 25000,
    red: 100000
};

// Цены разрешений (temporary/permanent)
export const PERMIT_PRICES: Record<RegionId, { temp: number; perm: number }> = {
    [RegionId.RUST_VALLEY]: { temp: 0, perm: 0 },
    [RegionId.CRYSTAL_WASTES]: { temp: 1000, perm: 10000 },
    [RegionId.IRON_GATES]: { temp: 5000, perm: 50000 },
    [RegionId.MAGMA_CORE]: { temp: 20000, perm: 200000 },
    [RegionId.VOID_CHASM]: { temp: -1, perm: -1 }  // quest only
};

// Требования зон для регионов
export const REGION_ZONE_REQUIREMENTS: Record<RegionId, ZoneLicense> = {
    [RegionId.RUST_VALLEY]: 'green',        // стартовый
    [RegionId.CRYSTAL_WASTES]: 'green',
    [RegionId.IRON_GATES]: 'yellow',
    [RegionId.MAGMA_CORE]: 'red',
    [RegionId.VOID_CHASM]: 'red'
};

// Срок действия временного разрешения (7 дней в миллисекундах)
export const TEMP_PERMIT_DURATION = 7 * 24 * 60 * 60 * 1000;
