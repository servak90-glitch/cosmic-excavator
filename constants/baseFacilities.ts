import type { Facility, FacilityId } from '../types';

/**
 * Facility Definitions - все доступные постройки для баз игрока
 */
export const BASE_FACILITIES: Record<FacilityId, Facility> = {
    basic_refinery: {
        id: 'basic_refinery',
        name: { RU: 'Базовая Нефтепереработка', EN: 'Basic Refinery' },
        cost: 5000,
        description: {
            RU: 'Позволяет перерабатывать глину в мазут и камень в газ.',
            EN: 'Enables refining clay to oil and stone to gas.'
        },
        unlocksRecipes: ['clay_to_oil', 'stone_to_gas']
    },
    advanced_refinery: {
        id: 'advanced_refinery',
        name: { RU: 'Продвинутая Нефтепереработка', EN: 'Advanced Refinery' },
        cost: 25000,
        description: {
            RU: 'Японская ликвефакция угля. Позволяет добывать качественное топливо из угля.',
            EN: 'Advanced coal liquefaction. Produce high-quality fuel from coal.'
        },
        unlocksRecipes: ['coal_to_oil']
    },
    workshop_facility: {
        id: 'workshop_facility',
        name: { RU: 'Мастерская (Ур. 1)', EN: 'Workshop (Tier 1)' },
        cost: 15000,
        description: {
            RU: 'Позволяет производить базовые расходные материалы (Ремкомплекты).',
            EN: 'Allows production of basic consumables (Repair Kits).'
        },
        unlocksRecipes: ['craft_repair_kit']
    },
    advanced_workshop: {
        id: 'advanced_workshop',
        name: { RU: 'Мастерская (Ур. 2)', EN: 'Advanced Workshop (Tier 2)' },
        cost: 45000,
        description: {
            RU: 'Позволяет производить продвинутые системы охлаждения.',
            EN: 'Allows production of advanced cooling systems.'
        },
        unlocksRecipes: ['craft_coolant_paste', 'craft_advanced_coolant']
    },
    research_lab: {
        id: 'research_lab',
        name: { RU: 'Исследовательская Лаборатория', EN: 'Research Lab' },
        cost: 60000,
        description: {
            RU: 'Ускоряет анализ артефактов в этом регионе в 2 раза.',
            EN: 'Speeds up artifact analysis in this region by 2x.'
        },
        unlocksRecipes: []
    }
};
