import { ResourceType, LocalizedString } from '../types';

export type BlackMarketItemType = 'BLUEPRINT' | 'RESOURCE' | 'GADGET';

export interface BlackMarketItem {
    id: string;
    type: BlackMarketItemType;
    name: LocalizedString;
    description: LocalizedString;
    cost: {
        resource: ResourceType;
        amount: number;
    }[];
    stock: number; // -1 for infinite
    targetId?: string; // ID of blueprint or item to unlock
    requiredReputation?: number; // Min faction reputation (Rebels)
}

export const BLACK_MARKET_ITEMS: BlackMarketItem[] = [
    {
        id: 'bm_ancient_tech_small',
        type: 'RESOURCE',
        name: { RU: 'Контейнер Древних (S)', EN: 'Ancient Container (S)' },
        description: { RU: '5 единиц Ancient Tech. Не спрашивай, откуда.', EN: '5 units of Ancient Tech. Don\'t ask source.' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 5000 },
            { resource: ResourceType.URANIUM, amount: 50 }
        ],
        stock: 5,
        targetId: 'ancientTech_5',
        requiredReputation: 300
    },
    {
        id: 'bm_blueprint_fusion',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Ядро Синтеза', EN: 'Blueprint: Fusion Core' },
        description: { RU: 'Позволяет объединять буры. Критическая технология.', EN: 'Allows drill fusion. Critical tech.' },
        cost: [
            { resource: ResourceType.NANO_SWARM, amount: 100 },
            { resource: ResourceType.DIAMONDS, amount: 20 }
        ],
        stock: 1,
        targetId: 'blueprint_fusion_core',
        requiredReputation: 600
    },
    {
        id: 'bm_shield_generator',
        type: 'GADGET',
        name: { RU: 'Генератор Поля (Прототип)', EN: 'Field Generator (Prototype)' },
        description: { RU: 'Мгновенно восстанавливает 50% щита.', EN: 'Instantly restores 50% shield.' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 2000 }
        ],
        stock: 10,
        targetId: 'consumable_shield_50',
        requiredReputation: 100
    },
    {
        id: 'bm_heat_sync',
        type: 'GADGET',
        name: { RU: 'Тепловой Синхронизатор', EN: 'Heat Synchronizer' },
        description: { RU: 'Сбрасывает 100% нагрева. Одноразовый.', EN: 'Vents 100% heat. Disposable.' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 3000 },
            { resource: ResourceType.GOLD, amount: 200 }
        ],
        stock: 5,
        targetId: 'consumable_heat_vent',
        requiredReputation: 300
    },
    {
        id: 'bm_nano_swarm_pack',
        type: 'RESOURCE',
        name: { RU: 'Капсула с Роем', EN: 'Swarm Capsule' },
        description: { RU: '1000 Нано-роя. Опасно.', EN: '1000 Nano-swarm. Dangerous.' },
        cost: [
            { resource: ResourceType.ANCIENT_TECH, amount: 10 }
        ],
        stock: 3,
        targetId: 'nanoSwarm_1000',
        requiredReputation: 1000
    },
    {
        id: 'bm_blueprint_advanced_drilling',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Продвинутое Бурение', EN: 'Blueprint: Advanced Drilling' },
        description: { RU: 'Открывает доступ к буровым головам Tier 7-9', EN: 'Unlocks Tier 7-9 drill bits' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 5000 },
            { resource: ResourceType.TITANIUM, amount: 1000 }
        ],
        stock: 1,
        targetId: 'blueprint_advanced_drilling',
        requiredReputation: 500
    },
    {
        id: 'bm_blueprint_high_power_engines',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Мощные Двигатели', EN: 'Blueprint: High-Power Engines' },
        description: { RU: 'Открывает доступ к мощным двигателям Tier 7-9', EN: 'Unlocks Tier 7-9 engines' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 5000 },
            { resource: ResourceType.URANIUM, amount: 500 }
        ],
        stock: 1,
        targetId: 'blueprint_high_power_engines',
        requiredReputation: 500
    },
    {
        id: 'bm_blueprint_quantum_cooling',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Квантовое Охлаждение', EN: 'Blueprint: Quantum Cooling' },
        description: { RU: 'Открывает доступ к продвинутым кулерам Tier 7-9', EN: 'Unlocks Tier 7-9 coolers' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 5000 },
            { resource: ResourceType.DIAMONDS, amount: 50 }
        ],
        stock: 1,
        targetId: 'blueprint_quantum_cooling',
        requiredReputation: 500
    },
    {
        id: 'bm_blueprint_quantum_drilling',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Квантовое Бурение', EN: 'Blueprint: Quantum Drilling' },
        description: { RU: 'Открывает доступ к легендарным бурам Tier 10-12', EN: 'Unlocks Tier 10-12 legendary bits' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 15000 },
            { resource: ResourceType.ANCIENT_TECH, amount: 50 }
        ],
        stock: 1,
        targetId: 'blueprint_quantum_drilling',
        requiredReputation: 1000
    },
    {
        id: 'bm_blueprint_quantum_engines',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Квантовые Двигатели', EN: 'Blueprint: Quantum Engines' },
        description: { RU: 'Открывает доступ к легендарным двигателям Tier 10-12', EN: 'Unlocks Tier 10-12 legendary engines' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 15000 },
            { resource: ResourceType.ANCIENT_TECH, amount: 50 }
        ],
        stock: 1,
        targetId: 'blueprint_quantum_engines',
        requiredReputation: 1000
    },
    {
        id: 'bm_blueprint_cryogenic_tech',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Криогенные Технологии', EN: 'Blueprint: Cryogenic Tech' },
        description: { RU: 'Открывает доступ к легендарным кулерам Tier 10-12', EN: 'Unlocks Tier 10-12 legendary coolers' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 15000 },
            { resource: ResourceType.ANCIENT_TECH, amount: 50 }
        ],
        stock: 1,
        targetId: 'blueprint_cryogenic_tech',
        requiredReputation: 1000
    },
    {
        id: 'bm_blueprint_titanium_hull',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Титановые Корпуса', EN: 'Blueprint: Titanium Hulls' },
        description: { RU: 'Открывает доступ к усиленным корпусам Tier 7-9', EN: 'Unlocks Tier 7-9 reinforced hulls' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 5000 },
            { resource: ResourceType.TITANIUM, amount: 2000 }
        ],
        stock: 1,
        targetId: 'blueprint_titanium_hull',
        requiredReputation: 500
    },
    {
        id: 'bm_blueprint_adaptive_armor',
        type: 'BLUEPRINT',
        name: { RU: 'Схема: Адаптивная Броня', EN: 'Blueprint: Adaptive Armor' },
        description: { RU: 'Открывает доступ к легендарным корпусам Tier 10-12', EN: 'Unlocks Tier 10-12 legendary hulls' },
        cost: [
            { resource: ResourceType.RUBIES, amount: 15000 },
            { resource: ResourceType.ANCIENT_TECH, amount: 75 }
        ],
        stock: 1,
        targetId: 'blueprint_adaptive_armor',
        requiredReputation: 1000
    }
];
