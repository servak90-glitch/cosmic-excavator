/**
 * Регионы планеты Aegis-7 (Global Map MVP)
 * 
 * 5 регионов с координатами, ресурсными бонусами и lore
 * Основа для Travel System
 */

import { Region, RegionId } from '../types';

/**
 * 5 РЕГИОНОВ ПЛАНЕТЫ AEGIS-7 (MVP)
 * Источник: regions_aegis7_concept.md
 */
export const REGIONS: Record<RegionId, Region> = {
    [RegionId.RUST_VALLEY]: {
        id: RegionId.RUST_VALLEY,
        name: 'Ржавая Долина',
        coordinates: { x: 0, y: 0 },
        recommendedLevel: 10,
        baseZoneColor: 'green',
        resourceBonuses: {
            coal: 1.3  // Бонус +30% к углю для топливной системы
        },
        description: 'Стартовый регион. Зона нелегальных бурильщиков, бандиты и коррозия.'
    },

    [RegionId.CRYSTAL_WASTES]: {
        id: RegionId.CRYSTAL_WASTES,
        name: 'Кристальные Пустоши',
        coordinates: { x: 0, y: 1000 },
        recommendedLevel: 25,
        baseZoneColor: 'green',
        resourceBonuses: {
            emeralds: 3.0,  // ×3 ИЗУМРУДЫ!
            stone: 1.5,
            gas: 1.2
        },
        description: 'Заброшенные кристаллические шахты Science Faction. Изумруды ×3, магнитные аномалии.'
    },

    [RegionId.IRON_GATES]: {
        id: RegionId.IRON_GATES,
        name: 'Железные Врата',
        coordinates: { x: 1000, y: 0 },
        recommendedLevel: 35,
        baseZoneColor: 'yellow',
        resourceBonuses: {
            iron: 2.0,
            silver: 1.5,
            oil: 1.3
        },
        description: 'Военная зона Void Industries. Железо ×2, контроль корпораций, патрули дронов.'
    },

    [RegionId.MAGMA_CORE]: {
        id: RegionId.MAGMA_CORE,
        name: 'Магматическое Ядро',
        coordinates: { x: -700, y: -700 },
        recommendedLevel: 50,
        baseZoneColor: 'red',
        resourceBonuses: {
            gold: 2.0,
            titanium: 2.0,
            uranium: 1.5,
            ancientTech: 2.0
        },
        description: 'Вулканический регион. Экстремальные температуры, древние руины, лавовые потоки.'
    },

    [RegionId.VOID_CHASM]: {
        id: RegionId.VOID_CHASM,
        name: 'Бездна Пустоты',
        coordinates: { x: 700, y: 700 },
        recommendedLevel: 60,
        baseZoneColor: 'red',
        resourceBonuses: {
            ancientTech: 3.0,  // ×3 ANCIENT TECH!
            diamonds: 2.0,
            nanoSwarm: 1.5
        },
        description: 'Аномальная зона. Пространственные разрывы, Ancient Tech ×3, подготовка к порталу.'
    }
};

/**
 * Список ID всех регионов (для UI dropdown, loops, etc)
 */
export const REGION_IDS = Object.values(RegionId);

/**
 * Стартовый регион (для INITIAL_STATE)
 */
export const STARTING_REGION = RegionId.RUST_VALLEY;
