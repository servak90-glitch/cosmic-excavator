/**
 * EVENT REGISTRY — реестр случайных событий
 * 
 * ВОССТАНОВЛЕННАЯ ЗАГЛУШКА
 * TODO: восстановить полный список событий из git истории
 */

import { GameEvent, EventTrigger, EventActionId } from '../types';
import { sideTunnelSystem } from './systems/SideTunnelSystem';

// Базовые события для работы игры
export const EVENTS: GameEvent[] = [
    {
        id: 'GAS_POCKET',
        type: 'ANOMALY',
        weight: 25,
        title: 'Газовый карман',
        description: 'Вы наткнулись на карман с токсичным газом!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 60,
        instantDamage: 0.1,
        options: [
            {
                actionId: 'continue',
                label: '⚠️ Продолжить бурение',
                risk: 'Урон: -5 HP'
            },
            {
                actionId: 'retreat',
                label: '🔙 Отступить',
                risk: 'Глубина: -10м'
            }
        ]
    },
    {
        id: 'TECTONIC_SHIFT',
        type: 'WARNING',
        weight: 25,
        title: 'Тектонический сдвиг',
        description: 'Земля содрогается под вами!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 120,
        instantDepth: 20,
        options: [
            {
                actionId: 'accept',
                label: '✅ Продолжить'
            }
        ]
    },
    {
        id: 'RICH_VEIN',
        type: 'NOTIFICATION',
        weight: 40,
        title: 'Богатая жила',
        description: 'Вы обнаружили залежи ресурсов!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 90,
        instantResource: {
            type: 'stone',
            amountMean: 100,
            amountStdDev: 20,
            amountMin: 50,
            amountMax: 200
        },
        options: [
            {
                actionId: 'mine',
                label: '⛏️ Добыть ресурсы',
                risk: '+50 камня'
            }
        ]
    },
    {
        id: 'HEAT_WAVE',
        type: 'WARNING',
        weight: 30,
        title: 'Тепловая волна',
        description: 'Температура резко возрастает!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 45,
        instantHeat: 15,
        options: [
            {
                actionId: 'endure',
                label: '🥵 Терпеть'
            },
            {
                actionId: 'stop',
                label: '⏸️ Остановить бурение'
            }
        ]
    },
    {
        id: 'GOLD_VEIN',
        type: 'NOTIFICATION',
        weight: 30,
        minDepth: 1000,
        title: 'Золотая жила',
        description: 'Блеск золота в породе!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 180,
        options: [
            {
                actionId: 'mine_gold',
                label: '💰 Добыть золото',
                risk: '+100 XP'
            }
        ]
    },
    {
        id: 'FOSSIL_FIND',
        type: 'NOTIFICATION',
        weight: 20,
        minDepth: 500,
        title: 'Находка окаменелости',
        description: 'Древний артефакт обнаружен в породе.',
        triggers: [EventTrigger.DRILLING],
        cooldown: 300,
        options: [
            {
                actionId: 'collect',
                label: '🦴 Собрать находку',
                risk: '+200 XP'
            }
        ]
    },
    {
        id: 'QUANTUM_FLUCTUATION',
        type: 'ANOMALY',
        weight: 15,
        minDepth: 5000,
        title: 'Квантовая флуктуация',
        description: 'Пространство вокруг вас искажается...',
        triggers: [EventTrigger.DRILLING],
        cooldown: 240,
        instantDepth: 100,
        options: [
            {
                actionId: 'embrace',
                label: '🌀 Принять аномалию'
            }
        ]
    },
    {
        id: 'MAGNETIC_STORM',
        type: 'WARNING',
        weight: 20,
        title: 'Магнитная буря',
        description: 'Электромагнитные помехи мешают системам!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 120,
        instantHeat: 10,
        options: [
            {
                actionId: 'wait_out',
                label: '⚡ Переждать'
            }
        ]
    },
    {
        id: 'COAL_DEPOSIT',
        type: 'NOTIFICATION',
        weight: 35,
        title: 'Залежи угля',
        description: 'Вы обнаружили богатые залежи угля в породе!',
        triggers: [EventTrigger.DRILLING],
        cooldown: 60,
        instantResource: {
            type: 'coal',
            amountMean: 75,
            amountStdDev: 25,
            amountMin: 30,
            amountMax: 150
        },
        options: [
            {
                actionId: 'mine_coal',
                label: '⛏️ Добыть уголь',
                risk: '+50-100 угля'
            }
        ]
    },
    {
        id: 'PIRATE_BASE_RAID',
        type: 'COMBAT_EVENT',
        title: { RU: '🏴‍☠️ Налет Пиратов', EN: '🏴‍☠️ Pirate Raid' },
        description: { RU: 'Сканеры зафиксировали приближение пиратского отряда. Они нацелились на ваши склады!', EN: 'Scanners detected an approaching pirate squad. They are targeting your storage!' },
        triggers: [EventTrigger.BASE_RAID],
        weight: 10,
        options: [
            {
                actionId: EventActionId.BASE_DEFEND,
                label: { RU: '🛡️ Активировать гарнизон', EN: '🛡️ Activate Garrison' }
            },
            {
                actionId: EventActionId.BASE_SURRENDER,
                label: { RU: '📦 Отдать часть припасов', EN: '📦 Hand over supplies' }
            }
        ]
    },
    {
        id: 'VOID_SABOTAGE',
        type: 'ANOMALY',
        title: { RU: '🌀 Саботаж Пустоты', EN: '🌀 Void Sabotage' },
        description: { RU: 'Странное влияние Пустоты дестабилизирует механизмы базы. Нужна срочная защита!', EN: 'Strange Void influence destabilizes base machinery. Urgent protection needed!' },
        triggers: [EventTrigger.BASE_RAID],
        weight: 5,
        options: [
            {
                actionId: EventActionId.BASE_DEFEND,
                label: { RU: '🛠️ Отразить помехи', EN: '🛠️ Deflect interference' }
            }
        ]
    },
    {
        id: 'TUNNEL_CRYSTAL_FIND',
        type: 'NOTIFICATION',
        title: 'Резонанс Кристаллов',
        description: 'Сканеры фиксируют необычную частоту в боковом ответвлении.',
        triggers: [EventTrigger.DRILLING],
        weight: 15,
        minDepth: 2000,
        cooldown: 300,
        options: [
            {
                actionId: 'tunnel_crystal',
                label: '💎 Исследовать кристальный туннель',
                risk: 'MEDIUM'
            },
            {
                actionId: 'encounter_ignore',
                label: 'Проигнорировать'
            }
        ]
    },
    {
        id: 'TUNNEL_MINE_FIND',
        type: 'NOTIFICATION',
        title: 'Древний Шахтный Ствол',
        description: 'Вы наткнулись на заброшенную систему вентиляции.',
        triggers: [EventTrigger.DRILLING],
        weight: 15,
        minDepth: 1000,
        cooldown: 300,
        options: [
            {
                actionId: 'tunnel_mine',
                label: '🔦 Спуститься в шахту',
                risk: 'HIGH'
            },
            {
                actionId: 'encounter_ignore',
                label: 'Игнорировать'
            }
        ]
    },
    {
        id: 'TUNNEL_NEST_FIND',
        type: 'NOTIFICATION',
        title: 'Гнездо Чужих',
        description: 'Биосканеры зашкаливают! Впереди органическое образование.',
        triggers: [EventTrigger.DRILLING],
        weight: 10,
        minDepth: 3000,
        cooldown: 600,
        options: [
            {
                actionId: 'tunnel_nest',
                label: '🥚 Изучить гнездо',
                risk: 'EXTREME'
            },
            {
                actionId: 'encounter_ignore',
                label: 'Отступить'
            }
        ]
    }
];

/**
 * [SIDE TUNNEL SYSTEM]
 * Генерирует событие бокового туннеля с учетом сканера
 */

export function rollRandomEvent(
    recentEventIds: string[],
    depth: number,
    heat: number,
    hasScanner: boolean = false,
    biomeId: string = 'rust_valley',
    lang: 'RU' | 'EN' = 'RU'
): GameEvent | null {
    // 1. Шанс на Side Tunnel (повышается с глубиной)
    if (Math.random() < 0.25) { // 25% шанс вместо обычного события
        const event = sideTunnelSystem.generateEvent(depth, biomeId, hasScanner, lang);
        if (event) return event;
    }

    // 2. Обычные события
    const availableEvents = EVENTS.filter(e =>
        !recentEventIds.includes(e.id) &&
        (e.minDepth === undefined || depth >= e.minDepth)
    );

    if (availableEvents.length === 0) {
        return null;
    }

    // Используем weight из самих событий
    const weights = availableEvents.map(event => {
        let w = event.weight;
        // Модификаторы на основе условий
        if (event.id === 'GAS_POCKET' && depth > 10000) w *= 1.5;
        if (event.id === 'HEAT_WAVE' && heat > 50) w *= 2.0;
        if (event.id === 'QUANTUM_FLUCTUATION' && depth > 5000) w *= 1.5;
        return w;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    for (let i = 0; i < availableEvents.length; i++) {
        roll -= weights[i];
        if (roll <= 0) {
            return availableEvents[i];
        }
    }

    return availableEvents[0];
}

/**
 * Создаёт эффект из события (legacy support)
 * Поддерживает вызов с 1 аргументом (effectId) или 2 аргументами (effectType, value)
 */

// Реестр предопределённых эффектов для lookup по effectId
const EFFECT_PRESETS: Record<string, { type: 'BUFF' | 'DEBUFF' | 'NEUTRAL' | 'ANOMALY'; value: number; name: string; description: string; duration: number, modifiers: any }> = {
    // BAR DRINKS
    'BAR_OIL_STOUT': { type: 'BUFF', value: 1, name: 'Oil Stout', description: 'HP Regen Activated', duration: 300, modifiers: { heatGenMultiplier: 2.0 } },
    'BAR_RUSTY_NAIL': { type: 'BUFF', value: 3, name: 'Rusty Nail', description: 'Click x3, Auto-drill x0.5', duration: 300, modifiers: { clickPowerMultiplier: 3.0, drillSpeedMultiplier: 0.5 } },
    'BAR_NUCLEAR_WHISKEY': { type: 'BUFF', value: 5, name: 'Nuclear Whiskey', description: 'Speed x5, hull damage risk', duration: 60, modifiers: { drillSpeedMultiplier: 5.0 } },
    'BAR_VOID_COCKTAIL': { type: 'BUFF', value: 10, name: 'Void Cocktail', description: 'Resources x10, blindness', duration: 180, modifiers: { resourceMultiplier: 10.0 } },

    // PREMIUM BUFFS
    'PREMIUM_NANO_REPAIR': { type: 'BUFF', value: 1, name: 'Nano-Repair', description: 'Auto-repair systems active', duration: 600, modifiers: {} }, // Handled in regeneration logic
    'PREMIUM_DIAMOND_COAT': { type: 'BUFF', value: 2, name: 'Diamond Coating', description: 'Drilling Speed x2', duration: 300, modifiers: { drillSpeedMultiplier: 2.0 } },
    'PREMIUM_VOID_SHIELD': { type: 'BUFF', value: 1.5, name: 'Void Shield', description: 'Defense +50%', duration: 180, modifiers: { defenseMultiplier: 1.5 } },
    'PREMIUM_QUANTUM_LUCK': { type: 'BUFF', value: 100, name: 'Quantum Luck', description: 'Max Loot Chance', duration: 300, modifiers: { consumableDropMultiplier: 10.0, luckPctBoost: 50 } },
    'PREMIUM_ABSOLUTE_ZERO': { type: 'BUFF', value: 0, name: 'Absolute Zero', description: 'Heat Generation Disabled', duration: 120, modifiers: { heatGenMultiplier: 0 } },
    'PREMIUM_MAGNETIC_STORM': { type: 'BUFF', value: 3, name: 'Magnetic Storm', description: 'Resources x3', duration: 300, modifiers: { resourceMultiplier: 3.0 } },
    'PREMIUM_OVERDRIVE': { type: 'BUFF', value: 5, name: 'Core Overdrive', description: 'Click Power x5', duration: 60, modifiers: { clickPowerMultiplier: 5.0 } },
    'PREMIUM_CHRONOS': { type: 'BUFF', value: 3, name: 'Chronos Field', description: 'Auto-mining x3', duration: 300, modifiers: { drillSpeedMultiplier: 3.0 } },

    // LEGACY & SPECIAL
    'BAR_XP_BOOST': { type: 'BUFF', value: 25, name: 'XP Boost', description: '+25% XP за 5 минут', duration: 300, modifiers: { xpMultiplier: 1.25 } },
    'BAR_DRILL_BOOST': { type: 'BUFF', value: 20, name: 'Drill Boost', description: '+20% скорости бурения', duration: 300, modifiers: { drillSpeedMultiplier: 1.2 } },
    'BAR_LUCK_BOOST': { type: 'BUFF', value: 15, name: 'Fortune', description: '+15% к удаче', duration: 300, modifiers: { luckPctBoost: 15 } },
    'JEWELER_CRIT': { type: 'BUFF', value: 10, name: 'Critical Eye', description: '+10% крит шанс', duration: 600, modifiers: { critChanceBoost: 10 } },
    'OVERHEAT_DEBUFF': { type: 'DEBUFF', value: -20, name: 'Overheated', description: '-20% охлаждения', duration: 60, modifiers: { coolingMultiplier: 0.8 } },
    'RADIATION_SICKNESS': { type: 'ANOMALY', value: -10, name: 'Radiation', description: 'Радиационное заражение', duration: 120, modifiers: { drillSpeedMultiplier: 0.9 } },
    'VOID_BLESSING': { type: 'ANOMALY', value: 50, name: 'Void Blessing', description: 'Благословение Пустоты', duration: 180, modifiers: { resourceMultiplier: 1.5, drillSpeedMultiplier: 1.5 } }
};

export function createEffect(effectIdOrType: string, value?: number) {
    // Если вызвано с 1 аргументом - ищем в реестре
    if (value === undefined) {
        const preset = EFFECT_PRESETS[effectIdOrType];
        if (preset) {
            return {
                id: Math.random().toString(36).substr(2, 9),
                type: preset.type,
                value: preset.value,
                name: preset.name,
                description: preset.description,
                duration: preset.duration,
                modifiers: preset.modifiers || {}
            };
        }
        // Не найдено - возвращаем null
        return null;
    }

    // Legacy: вызвано с 2 аргументами
    return {
        id: Math.random().toString(36).substr(2, 9),
        type: effectIdOrType as 'BUFF' | 'DEBUFF' | 'NEUTRAL' | 'ANOMALY',
        value,
        name: 'Legacy Effect',
        description: 'Auto-generated effect',
        duration: 0,
        modifiers: {}
    };
}
