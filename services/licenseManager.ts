/**
 * License Manager — утилиты для работы с лицензиями и разрешениями
 */

import { REPUTATION_TIERS, REGION_ZONE_REQUIREMENTS, TEMP_PERMIT_DURATION } from '../constants/licenses';
import { RegionId, type ZoneLicense, type Permit, type ReputationTier } from '../types';

/**
 * Получить reputation tier по количеству репутации
 */
export function getReputationTier(globalReputation: number): ReputationTier {
    return REPUTATION_TIERS.find(t =>
        globalReputation >= t.min && globalReputation <= t.max
    ) || REPUTATION_TIERS[0];
}

/**
 * Проверка наличия требуемой лицензии зоны
 */
export function hasRequiredLicense(
    unlockedLicenses: ZoneLicense[],
    requiredZone: ZoneLicense
): boolean {
    // Иерархия: green < yellow < red
    const zoneHierarchy: Record<ZoneLicense, number> = { green: 0, yellow: 1, red: 2 };

    const maxUnlockedLevel = Math.max(
        ...unlockedLicenses.map(z => zoneHierarchy[z]),
        -1  // fallback
    );

    return maxUnlockedLevel >= zoneHierarchy[requiredZone];
}

/**
 * Проверка наличия активного разрешения на регион
 */
export function hasActivePermit(
    permits: Partial<Record<RegionId, Permit>>,
    regionId: RegionId
): boolean {
    // Rust Valley всегда доступен
    if (regionId === RegionId.RUST_VALLEY) return true;

    const permit = permits[regionId];
    if (!permit) return false;

    // Permanent permits никогда не истекают
    if (permit.type === 'permanent') return true;

    // Temporary permits проверяем expiration
    if (permit.expirationDate && permit.expirationDate > Date.now()) {
        return true;
    }

    return false;
}

/**
 * Рассчитать цену с учётом скидки за репутацию
 */
export function calculatePermitPrice(
    basePrice: number,
    globalReputation: number
): number {
    const tier = getReputationTier(globalReputation);
    return Math.round(basePrice * (1 - tier.discount));
}

/**
 * Какая license требуется для региона
 */
export function getRequiredLicense(regionId: RegionId): ZoneLicense {
    return REGION_ZONE_REQUIREMENTS[regionId];
}

/**
 * Создать новый permit объект
 */
export function createPermit(
    regionId: RegionId,
    type: 'temporary' | 'permanent'
): Permit {
    return {
        regionId,
        type,
        expirationDate: type === 'temporary'
            ? Date.now() + TEMP_PERMIT_DURATION
            : null
    };
}
