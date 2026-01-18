/**
 * EVENT REGISTRY — реестр случайных событий
 * 
 * ВОССТАНОВЛЕННАЯ ЗАГЛУШКА
 * TODO: восстановить полный список событий из git истории
 */

import { GameEvent, EventTrigger } from '../types';
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
    hasScanner: boolean = false
): GameEvent | null {
    // 1. Шанс на Side Tunnel (повышается с глубиной)
    if (Math.random() < 0.25) { // 25% шанс вместо обычного события
        const biomeId = 'rust_valley'; // TODO: get from context
        const event = sideTunnelSystem.generateEvent(depth, biomeId, hasScanner);
        if (event) return event;
    }

    // 2. Обычные события
    const availableEvents = EVENTS.filter(e => !recentEventIds.includes(e.id));

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
 */
export function createEffect(effectType: string, value: number) {
    return {
        id: Math.random().toString(36).substr(2, 9),
        type: effectType,
        value,
        name: 'Legacy Effect',
        description: 'Auto-generated effect',
        duration: 0,
        modifiers: {}
    };
}
