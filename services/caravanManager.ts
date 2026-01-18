/**
 * CARAVAN MANAGER — управление караванами
 * Phase 2 (MVP): только 1★ караваны
 */

import { CARAVAN_SPECS } from '../constants/caravans';
import { getRegionById } from './regionMath';
import { calculateCargoWeight } from './gameMath';
import type { Caravan, PlayerBase, Resources, CaravanTier, ZoneColor } from '../types';

/**
 * Расчёт риска потери каравана
 */
export function calculateCaravanRisk(
    fromBase: PlayerBase,
    toBase: PlayerBase,
    tier: CaravanTier,
    activePerks: string[] = []
): number {
    const spec = CARAVAN_SPECS[tier];

    // Риск зависит от зон обоих регионов (берём максимум)
    const fromRegion = getRegionById(fromBase.regionId);
    const toRegion = getRegionById(toBase.regionId);

    // Определяем максимальную опасность зоны
    const maxZone: ZoneColor = fromRegion.baseZoneColor === 'red' || toRegion.baseZoneColor === 'red' ? 'red'
        : fromRegion.baseZoneColor === 'yellow' || toRegion.baseZoneColor === 'yellow' ? 'yellow'
            : 'green';

    let risk = spec.baseRisk[maxZone];

    // Perk: Cargo Insurance (-50% risk)
    if (activePerks.includes('INSURANCE')) {
        risk *= 0.5;
    }

    return risk;
}

/**
 * Создание нового каравана
 */
export function createCaravan(
    fromBase: PlayerBase,
    toBase: PlayerBase,
    cargo: Partial<Resources>,
    tier: CaravanTier,
    activePerks: string[] = []
): Caravan {
    const now = Date.now();
    const spec = CARAVAN_SPECS[tier];

    return {
        id: `caravan_${now}_${Math.random().toString(36).substr(2, 9)}`,
        tier,
        fromBaseId: fromBase.id,
        toBaseId: toBase.id,
        cargo,
        cargoWeight: calculateCargoWeight(cargo),
        departureTime: now,
        arrivalTime: now + spec.travelTime,
        status: 'in_transit',
        lossChance: calculateCaravanRisk(fromBase, toBase, tier, activePerks),
    };
}

/**
 * Проверка завершения каравана
 * 
 * @returns 'pending' - караван в пути
 *          'success' - прибыл успешно
 *          'lost' - потерян (пираты/аварія)
 */
export function checkCaravanCompletion(caravan: Caravan): 'pending' | 'success' | 'lost' {
    const now = Date.now();

    // Караван ещё в пути
    if (now < caravan.arrivalTime) {
        return 'pending';
    }

    // Караван прибыл — проверка на потерю
    const random = Math.random();
    return random < caravan.lossChance ? 'lost' : 'success';
}

/**
 * Проверка возможности отправки каравана
 */
export function canSendCaravan(
    cargo: Partial<Resources>,
    tier: CaravanTier,
    fromBaseResources: Partial<Resources>,
    activePerks: string[] = []
): { canSend: boolean; reason?: string } {
    const spec = CARAVAN_SPECS[tier];
    const cargoWeight = calculateCargoWeight(cargo);

    // Perk: Bulk Logistics (+20% capacity)
    let capacity = spec.capacity;
    if (activePerks.includes('BULK_LOGISTICS')) {
        capacity *= 1.2;
    }

    // Проверка вместимости
    if (cargoWeight > capacity) {
        return {
            canSend: false,
            reason: `Груз превышает вместимость (${cargoWeight}/${Math.floor(capacity)})`
        };
    }

    // Проверка наличия ресурсов в базе
    for (const [resource, amount] of Object.entries(cargo)) {
        const available = fromBaseResources[resource as keyof Resources] || 0;
        if (available < (amount || 0)) {
            return {
                canSend: false,
                reason: `Недостаточно ${resource} в базе (нужно ${amount}, есть ${available})`
            };
        }
    }

    return { canSend: true };
}

/**
 * Расчёт времени прибытия каравана
 */
export function getCaravanETA(caravan: Caravan): {
    arrived: boolean;
    remainingMs: number;
    remainingMinutes: number;
} {
    const now = Date.now();
    const arrived = now >= caravan.arrivalTime;
    const remainingMs = Math.max(0, caravan.arrivalTime - now);
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    return { arrived, remainingMs, remainingMinutes };
}
