import type { CaravanTier, ZoneColor } from '../types';

/**
 * Спецификация караванов разных тиров
 */
export interface CaravanSpec {
    tier: CaravanTier;
    name: string;
    capacity: number;      // Единицы груза
    travelTime: number;    // Миллисекунды
    baseRisk: Record<ZoneColor, number>;  // Шанс потери по зонам (0-1)
    unlockCost: number;    // Credits для разблокировки
    description: string;
}

export const CARAVAN_SPECS: Record<CaravanTier, CaravanSpec> = {
    '1star': {
        tier: '1star',
        name: 'Shuttle',
        capacity: 500,
        travelTime: 2 * 60 * 60 * 1000,  // 2 часа
        baseRisk: {
            green: 0.15,   // 15% шанс потери
            yellow: 0.20,  // 20%
            red: 0.30,     // 30%
        },
        unlockCost: 15000,
        description: 'Базовый караван. Медленный и рискованный, но бесплатный.'
    },

    // === PHASE 3: Advanced Caravans (не реализованы) ===
    '2star': {
        tier: '2star',
        name: 'Freighter',
        capacity: 1500,
        travelTime: 1 * 60 * 60 * 1000,  // 1 час
        baseRisk: {
            green: 0.05,
            yellow: 0.10,
            red: 0.20,
        },
        unlockCost: 0,  // Разблокируется квестом "Логистические проблемы"
        description: 'Улучшенный караван. Быстрее и безопаснее. (Требует квест)'
    },
    '3star': {
        tier: '3star',
        name: 'Hauler',
        capacity: 3000,
        travelTime: 30 * 60 * 1000,  // 30 минут
        baseRisk: {
            green: 0.00,
            yellow: 0.02,
            red: 0.10,
        },
        unlockCost: 0,  // Разблокируется сюжетной веткой "Корпоративное партнёрство"
        description: 'Элитный караван. Минимальный риск, быстрая доставка. (Требует quest + комиссия 10%)'
    },
};

/**
 * Стоимость разблокировки Basic Logistics (1★ караваны)
 */
export const BASIC_LOGISTICS_UNLOCK_COST = 15000;

/**
 * Проверка разблокировки каравана
 */
export function isCaravanUnlocked(
    tier: CaravanTier,
    unlockedTiers: Set<CaravanTier>
): boolean {
    return unlockedTiers.has(tier);
}

/**
 * Получить характеристики каравана
 */
export function getCaravanSpec(tier: CaravanTier): CaravanSpec {
    return CARAVAN_SPECS[tier];
}
