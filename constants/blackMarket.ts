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
    }
];
