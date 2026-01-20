import { BossType, LocalizedString } from '../types';

export interface MonsterCodexEntry {
    id: string;
    name: LocalizedString;
    type: BossType;
    tier: number;
    icon: string;
    description: LocalizedString;
    lore: LocalizedString;
    weakness: string;
}

export const MONSTER_CODEX: MonsterCodexEntry[] = [
    // === TIER 1: WORM (Черви) ===
    {
        id: 'worm_basic',
        name: { RU: 'Глубинный Пожиратель', EN: 'Deep Devourer' },
        type: BossType.WORM,
        tier: 1,
        icon: '🐛',
        description: { RU: 'Массивный червь, обитающий на малых глубинах', EN: 'Massive worm inhabiting shallow depths' },
        lore: { RU: 'Первые колонисты называли их «живыми туннелями». Эти существа прокладывают пути через породу, оставляя за собой гладкие стены из расплавленного камня.', EN: 'Early colonists called them "living tunnels". These creatures carve paths through rock, leaving smooth walls of molten stone behind.' },
        weakness: 'MASH'
    },
    {
        id: 'worm_advanced',
        name: { RU: 'Титановый Червь', EN: 'Titanium Worm' },
        type: BossType.WORM,
        tier: 2,
        icon: '🪱',
        description: { RU: 'Эволюционировавший червь с титановым панцирем', EN: 'Evolved worm with titanium carapace' },
        lore: { RU: 'Их чешуя содержит высокую концентрацию титана. Некоторые шахтёры намеренно охотятся на них, но мало кто возвращается.', EN: 'Their scales contain high titanium concentration. Some miners deliberately hunt them, but few return.' },
        weakness: 'MASH'
    },

    // === TIER 2: SWARM (Рои) ===
    {
        id: 'swarm_basic',
        name: { RU: 'Королева Улья', EN: 'Hive Queen' },
        type: BossType.SWARM,
        tier: 1,
        icon: '🦟',
        description: { RU: 'Центр коллективного разума нано-роя', EN: 'Core of nano-swarm collective mind' },
        lore: { RU: 'Когда-то это были микро-дроны для добычи. Теперь они охотятся стаями, управляемые единым разумом. Уничтожь королеву — рой рассыплется.', EN: 'Once mining micro-drones. Now they hunt in swarms, controlled by a single mind. Destroy the queen - the swarm collapses.' },
        weakness: 'ALIGN'
    },
    {
        id: 'swarm_advanced',
        name: { RU: 'Коллективный Разум', EN: 'Collective Mind' },
        type: BossType.SWARM,
        tier: 2,
        icon: '🐝',
        description: { RU: 'Продвинутая форма роя с распределённым интеллектом', EN: 'Advanced swarm form with distributed intelligence' },
        lore: { RU: 'Эволюция роя. Вместо одной королевы — тысячи узлов. Каждый дрон содержит частичку целого. Убей один узел — другие станут умнее.', EN: 'Swarm evolution. Instead of one queen - thousands of nodes. Each drone contains a piece of the whole. Kill one node - others grow smarter.' },
        weakness: 'ALIGN'
    },

    // === TIER 3: CORE (Ядра) ===
    {
        id: 'core_basic',
        name: { RU: 'Страж Ядра', EN: 'Core Guardian' },
        type: BossType.CORE,
        tier: 1,
        icon: '🔥',
        description: { RU: 'Сущность из чистой магмы и энергии', EN: 'Entity of pure magma and energy' },
        lore: { RU: 'Легенды говорят, что планета защищает своё сердце. Стражи появляются там, где бур проникает слишком глубоко. Температура их тела превышает 2000°C.', EN: 'Legends say the planet protects its heart. Guardians appear where drills penetrate too deep. Their body temperature exceeds 2000°C.' },
        weakness: 'TIMING'
    },
    {
        id: 'core_advanced',
        name: { RU: 'Сингулярность-1', EN: 'Singularity-1' },
        type: BossType.CORE,
        tier: 2,
        icon: '🌋',
        description: { RU: 'Аномалия пространства-времени в форме ядра', EN: 'Space-time anomaly in core form' },
        lore: { RU: 'Это не просто магма. Сканеры показывают искажение гравитации вокруг сущности. Некоторые учёные полагают, что это — зародыш мини-чёрной дыры.', EN: 'This is not just magma. Scanners show gravity distortion around the entity. Some scientists believe this is an embryonic mini black hole.' },
        weakness: 'TIMING'
    },

    // === TIER 4: CONSTRUCT (Конструкты) ===
    {
        id: 'construct_basic',
        name: { RU: 'Геометрический Ужас', EN: 'Geometric Horror' },
        type: BossType.CONSTRUCT,
        tier: 1,
        icon: '📐',
        description: { RU: 'Древняя защитная система неизвестной цивилизации', EN: 'Ancient defense system of unknown civilization' },
        lore: { RU: 'Идеальные грани. Безупречная симметрия. Построено расой, исчезнувшей миллионы лет назад. Но машины всё ещё выполняют приказ: уничтожать непрошенных гостей.', EN: 'Perfect edges. Flawless symmetry. Built by a race that vanished millions of years ago. But the machines still follow orders: destroy intruders.' },
        weakness: 'MEMORY'
    },
    {
        id: 'construct_advanced',
        name: { RU: 'Монолит', EN: 'Monolith' },
        type: BossType.CONSTRUCT,
        tier: 2,
        icon: '🗿',
        description: { RU: 'Титановая крепость с адаптивной защитой', EN: 'Titanium fortress with adaptive defenses' },
        lore: { RU: 'Самовосстанавливающийся. Самообучающийся. С каждым поколением шахтёров становится умнее. Записи показывают: первые монолиты имели примитивное ИИ. Нынешние — почти разумны.', EN: 'Self-repairing. Self-learning. Grows smarter with each generation of miners. Records show: first monoliths had primitive AI. Current ones are nearly sentient.' },
        weakness: 'MEMORY'
    },

    // === TIER 5: VOID SENTINEL (Стражи Пустоты) ===
    {
        id: 'void_basic',
        name: { RU: 'Страж Пустоты', EN: 'Void Sentinel' },
        type: BossType.VOID_SENTINEL,
        tier: 1,
        icon: '👁️',
        description: { RU: 'Хранитель глубочайших слоёв реальности', EN: 'Keeper of reality\'s deepest layers' },
        lore: { RU: 'На глубине 50 километров реальность начинает... изгибаться. Стражи материализуются из ничего, защищая границу между мирами. Их взгляд проникает в душу.', EN: 'At 50 kilometer depth, reality begins to... bend. Sentinels materialize from nothing, guarding the boundary between worlds. Their gaze pierces the soul.' },
        weakness: 'MEMORY'
    },
    {
        id: 'void_advanced',
        name: { RU: 'Центурион AEGIS-7', EN: 'Centurion AEGIS-7' },
        type: BossType.VOID_SENTINEL,
        tier: 2,
        icon: '🛡️',
        description: { RU: 'Последняя линия обороны Пустоты', EN: 'Void\'s final line of defense' },
        lore: { RU: 'ПРЕДУПРЕЖДЕНИЕ AEGIS: ДОСТУП ЗАПРЕЩЁН. Протокол 7 активирован. Согласно древним записям, никто не побеждал Центуриона дважды. Он помнит.', EN: 'AEGIS WARNING: ACCESS DENIED. Protocol 7 activated. According to ancient records, no one has defeated the Centurion twice. It remembers.' },
        weakness: 'MEMORY'
    }
];

// Вспомогательная функция для получения монстра по типу босса
export function getMonstersByType(type: BossType): MonsterCodexEntry[] {
    return MONSTER_CODEX.filter(m => m.type === type);
}

// Функция для получения ID монстра по имени босса (для логирования побед)
export function getBossCodexId(bossName: string, bossType: BossType): string {
    // Простое сопоставление по имени и типу
    const entry = MONSTER_CODEX.find(m =>
        m.type === bossType && (
            (typeof m.name === 'string' && m.name === bossName) ||
            (typeof m.name === 'object' && (m.name.RU === bossName || m.name.EN === bossName))
        )
    );

    // Если точного совпадения нет, возвращаем базовый ID для типа
    if (!entry) {
        return `${bossType.toLowerCase()}_basic`;
    }

    return entry.id;
}
