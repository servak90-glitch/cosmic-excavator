import { Quest } from '../types';

export const STORY_QUESTS: Quest[] = [
    // === CORPORATE FACTION ===

    {
        id: 'QUEST_LOGISTICS_TROUBLE',
        title: 'Логистические Проблемы',
        description: 'Void Industries нуждается в доставке крупной партии железа на Iron Gates. Помогите нам, и мы откроем вам доступ к продвинутым караванам.',
        status: 'available',
        type: 'DELIVERY',
        factionId: 'CORPORATE',
        objectives: [
            {
                id: 'deliver_iron',
                type: 'DELIVER',
                description: 'Доставить 500 Iron в Iron Gates',
                target: 'iron',
                required: 500,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 50 },
            { type: 'UNLOCK', target: 'caravan_2star' },  // Разблокировка 2★ Freighter
            { type: 'RESOURCE', target: 'rubies', amount: 5000 },
        ],
    },

    {
        id: 'QUEST_CORPORATE_EXPANSION',
        title: 'Корпоративная Экспансия',
        description: 'Постройте Station базу в регионе Magma Core для расширения корпоративного присутствия.',
        status: 'available',
        type: 'EXPLORATION',
        factionId: 'CORPORATE',
        prerequisites: ['QUEST_LOGISTICS_TROUBLE'],
        objectives: [
            {
                id: 'build_station_magma',
                type: 'BUILD_BASE',
                description: 'Построить Station в Magma Core',
                target: 'magma_core',
                required: 1,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 100 },
            { type: 'RESOURCE', target: 'rubies', amount: 10000 },
            { type: 'BLUEPRINT', target: 'corporate_drill_mk2' },
        ],
    },

    // === SCIENCE FACTION ===

    {
        id: 'QUEST_ANCIENT_RUINS',
        title: 'Древние Руины',
        description: 'Научная коллегия заинтересована в изучении артефактов древней цивилизации Aegis-7. Соберите несколько образцов для исследования.',
        status: 'available',
        type: 'COLLECTION',
        factionId: 'SCIENCE',
        objectives: [
            {
                id: 'collect_artifacts',
                type: 'COLLECT',
                description: 'Собрать 5 артефактов',
                target: 'artifact',
                required: 5,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'SCIENCE', amount: 75 },
            { type: 'BLUEPRINT', target: 'anomaly_scanner' },  // Perk: видит side tunnels заранее!
            { type: 'RESOURCE', target: 'rubies', amount: 3000 },
        ],
    },

    {
        id: 'QUEST_DEEP_MYSTERIES',
        title: 'Тайны Бездны',
        description: 'Достигните глубины 50000м и соберите образцы Ancient Tech для лаборатории.',
        status: 'available',
        type: 'EXPLORATION',
        factionId: 'SCIENCE',
        prerequisites: ['QUEST_ANCIENT_RUINS'], // Assumption: chained
        objectives: [
            {
                id: 'reach_50km',
                type: 'REACH_DEPTH',
                description: 'Достичь глубины 50000м',
                target: '50000',
                required: 1,
                current: 0,
            },
            {
                id: 'collect_ancient_tech',
                type: 'COLLECT',
                description: 'Собрать 10 Ancient Tech',
                target: 'ancientTech',
                required: 10,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'SCIENCE', amount: 150 },
            { type: 'XP', target: 'player', amount: 5000 },
            { type: 'BLUEPRINT', target: 'void_resonator' },
        ],
    },

    // === REBELS FACTION ===

    {
        id: 'QUEST_SMUGGLER_RUN',
        title: 'Контрабандистский Рейс',
        description: 'Повстанцы нуждаются в тайной доставке груза газа в Void Chasm без уплаты налогов корпорациям.',
        status: 'available',
        type: 'DELIVERY',
        factionId: 'REBELS',
        objectives: [
            {
                id: 'smuggle_gas',
                type: 'DELIVER',
                description: 'Контрабандой доставить 200 Gas в Void Chasm',
                target: 'gas',
                required: 200,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'REBELS', amount: 60 },
            { type: 'UNLOCK', target: 'smuggler_routes' },  // Perk: караваны без налогов!
            { type: 'RESOURCE', target: 'rubies', amount: 8000 },
        ],
    },

    {
        id: 'QUEST_FREEDOM_FIGHTER',
        title: 'Борьба за Свободу',
        description: 'Саботируйте корпоративные операции в Crystal Wastes, уничтожив корпоративных боссов.',
        status: 'available',
        type: 'COMBAT',
        factionId: 'REBELS',
        prerequisites: ['QUEST_SMUGGLER_RUN'],
        objectives: [
            {
                id: 'defeat_corporate_bosses',
                type: 'DEFEAT_BOSS',
                description: 'Победить 3 корпоративных боссов',
                target: 'corporate_boss',
                required: 3,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'REBELS', amount: 120 },
            { type: 'REPUTATION', target: 'CORPORATE', amount: -50 },
            { type: 'UNLOCK', target: 'black_market' },
            { type: 'RESOURCE', target: 'rubies', amount: 15000 },
        ],
    },

    // === NEUTRAL ===

    {
        id: 'QUEST_NEUTRAL_TRADER',
        title: 'Нейтральный Торговец',
        description: 'Докажите свою ценность как торговца, совершив сделки во всех регионах.',
        status: 'available',
        type: 'EXPLORATION',
        objectives: [
            {
                id: 'visit_all_regions',
                type: 'TRAVEL_TO',
                description: 'Посетить все 5 регионов',
                target: 'all_regions',
                required: 5,
                current: 0,
            }
        ],
        rewards: [
            { type: 'REPUTATION', target: 'CORPORATE', amount: 25 },
            { type: 'REPUTATION', target: 'SCIENCE', amount: 25 },
            { type: 'REPUTATION', target: 'REBELS', amount: 25 },
            { type: 'RESOURCE', target: 'rubies', amount: 10000 },
        ],
    }
];
