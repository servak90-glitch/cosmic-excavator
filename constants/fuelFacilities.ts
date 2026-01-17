import type { Facility, FacilityId } from '../types';

/**
 * Fuel Facilities - постройки для крафта топлива в Player Bases
 * Phase 2: basic_refinery + advanced_refinery
 */
export const FUEL_FACILITIES: Record<FacilityId, Facility> = {
    basic_refinery: {
        id: 'basic_refinery',
        name: 'Базовая Нефтепереработка',
        cost: 5000,
        description: 'Перерабатывает глину и камень в топливо',
        unlocksRecipes: ['clay_to_oil', 'stone_to_gas']
    },
    advanced_refinery: {
        id: 'advanced_refinery',
        name: 'Продвинутая Нефтепереработка',
        cost: 25000,
        description: 'Японская ликвефакция угля (Coal → Oil)',
        unlocksRecipes: ['coal_to_oil']
    },
};

/**
 * Проверка наличия facility в базе
 */
export function hasFacility(facilities: FacilityId[], facilityId: FacilityId): boolean {
    return facilities.includes(facilityId);
}

/**
 * Проверка возможности постройки facility
 */
export function canBuildFacility(
    facilities: FacilityId[],
    facilityId: FacilityId,
    currentCredits: number
): { canBuild: boolean; reason?: string } {
    // Уже построена?
    if (hasFacility(facilities, facilityId)) {
        return { canBuild: false, reason: 'Уже построена' };
    }

    // Достаточно credits?
    const facility = FUEL_FACILITIES[facilityId];
    if (currentCredits < facility.cost) {
        return { canBuild: false, reason: `Нужно ${facility.cost} credits` };
    }

    // Advanced refinery требует basic refinery
    if (facilityId === 'advanced_refinery' && !hasFacility(facilities, 'basic_refinery')) {
        return { canBuild: false, reason: 'Требуется Basic Refinery' };
    }

    return { canBuild: true };
}
