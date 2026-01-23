/**
 * SideTunnelSystem.ts
 * Phase 3.2: Enhanced Side Tunnels & Anomaly Scanner
 */

import {
    GameState, EventActionId, SideTunnelType, GameEvent, EventTrigger, VisualEffectType, InventoryItem, SideTunnelState, VisualEvent
} from '../../types';
import { rollArtifact } from '../artifactRegistry';
import { calculateStats } from '../gameMath';
import { t } from '../localization';

interface TunnelDef {
    type: SideTunnelType;
    name: string;
    description: string;
    actionId: EventActionId;
    minDepth: number;
    baseRisk: number; // 0-1
    rewards: {
        resources?: { type: string, min: number, max: number }[];
        artifactChance: number;
        techChance: number;
        techAmount: number;
    };
    atmosphereEffect: VisualEffectType;
}

export const TUNNEL_DEFINITIONS: Record<SideTunnelType, Omit<TunnelDef, 'name' | 'description'> & { name: { RU: string, EN: string }, description: { RU: string, EN: string } }> = {
    SAFE: {
        type: 'SAFE',
        name: { RU: 'Стабильный Туннель', EN: 'Stable Tunnel' },
        description: { RU: 'Сейсмически стабильный проход. Видны жилы ресурсов.', EN: 'Seismically stable passage. Resource veins are visible.' },
        actionId: EventActionId.TUNNEL_SAFE,
        minDepth: 0,
        baseRisk: 0,
        rewards: {
            resources: [
                { type: 'copper', min: 20, max: 50 },
                { type: 'iron', min: 10, max: 30 },
                { type: 'ice', min: 5, max: 20 },
                { type: 'scrap', min: 3, max: 15 }
            ],
            artifactChance: 0.05,
            techChance: 0.1,
            techAmount: 5
        },
        atmosphereEffect: 'NONE'
    },
    RISKY: {
        type: 'RISKY',
        name: { RU: 'Нестабильный Проход', EN: 'Unstable Passage' },
        description: { RU: 'Стены вибрируют. Возможен обвал, но сканеры фиксируют аномалии.', EN: 'Walls are vibrating. Cave-in is possible, but scanners detect anomalies.' },
        actionId: EventActionId.TUNNEL_RISKY,
        minDepth: 0,
        baseRisk: 0.4,
        rewards: {
            resources: [
                { type: 'ice', min: 20, max: 50 },
                { type: 'scrap', min: 10, max: 30 }
            ],
            artifactChance: 0.3,
            techChance: 0.5,
            techAmount: 15
        },
        atmosphereEffect: 'GLITCH_RED'
    },
    CRYSTAL: {
        type: 'CRYSTAL',
        name: { RU: 'Кристальная Пещера', EN: 'Crystal Cave' },
        description: { RU: 'Стены покрыты резонирующими кристаллами. Высокая ценность.', EN: 'Walls are covered with resonating crystals. High value.' },
        actionId: EventActionId.TUNNEL_CRYSTAL,
        minDepth: 2000,
        baseRisk: 0.2,
        rewards: {
            resources: [
                { type: 'rubies', min: 5, max: 15 },
                { type: 'emeralds', min: 2, max: 8 },
                { type: 'diamonds', min: 1, max: 3 }
            ],
            artifactChance: 0.4,
            techChance: 0.2,
            techAmount: 20
        },
        atmosphereEffect: 'GLOW_PURPLE'
    },
    MINE: {
        type: 'MINE',
        name: { RU: 'Заброшенная Шахта', EN: 'Abandoned Mine' },
        description: { RU: 'Остатки древней добычи. Высокий риск обвала техники.', EN: 'Remains of ancient mining. High risk of equipment collapse.' },
        actionId: EventActionId.TUNNEL_MINE,
        minDepth: 1000,
        baseRisk: 0.6,
        rewards: {
            resources: [
                { type: 'coal', min: 100, max: 300 },
                { type: 'iron', min: 50, max: 150 },
                { type: 'gold', min: 10, max: 30 },
                { type: 'scrap', min: 20, max: 60 }
            ],
            artifactChance: 0.2,
            techChance: 0.8,
            techAmount: 40
        },
        atmosphereEffect: 'NONE'
    },
    NEST: {
        type: 'NEST',
        name: { RU: 'Гнездо Чужих', EN: 'Alien Nest' },
        description: { RU: 'Биосканеры зашкаливают. Чрезвычайная опасность.', EN: 'Bioscaners are off the charts. Extreme danger.' },
        actionId: EventActionId.TUNNEL_NEST,
        minDepth: 3000,
        baseRisk: 0.8,
        rewards: {
            resources: [
                { type: 'nanoSwarm', min: 50, max: 200 }
            ],
            artifactChance: 0.6,
            techChance: 0.4,
            techAmount: 30
        },
        atmosphereEffect: 'GLOW_GOLD'
    }
};

export const AVAILABLE_BLUEPRINTS = [
    'blueprint_advanced_drilling',
    'blueprint_quantum_drilling',
    'blueprint_high_power_engines',
    'blueprint_quantum_engines',
    'blueprint_quantum_cooling',
    'blueprint_cryogenic_tech',
    'blueprint_titanium_hull',
    'blueprint_adaptive_armor',
    'blueprint_fusion_core'
];

class SideTunnelSystem {
    /**
     * Сгенерировать событие Side Tunnel
     */
    generateEvent(depth: number, biomeId: string, hasScanner: boolean, lang: 'RU' | 'EN'): GameEvent | null {
        // Шанс появления спец. туннелей растёт с глубиной
        const specialChance = Math.min(0.5, depth / 10000);

        let type: SideTunnelType = 'SAFE'; // Default

        if (Math.random() < 0.4) {
            type = 'RISKY';
        } else if (Math.random() < specialChance) {
            // Выбор спец туннеля
            const types: SideTunnelType[] = [];
            if (depth >= TUNNEL_DEFINITIONS.CRYSTAL.minDepth) types.push('CRYSTAL');
            if (depth >= TUNNEL_DEFINITIONS.MINE.minDepth) types.push('MINE');
            if (depth >= TUNNEL_DEFINITIONS.NEST.minDepth) types.push('NEST');

            if (types.length > 0) {
                type = types[Math.floor(Math.random() * types.length)];
            }
        }

        const def = TUNNEL_DEFINITIONS[type];

        let title = lang === 'RU' ? 'Обнаружен Боковой Туннель' : 'Side Tunnel Detected';
        let desc = t(def.description, lang);

        if (!hasScanner && type !== 'SAFE') {
            // Без сканера описание более туманное
            if (type === 'CRYSTAL') desc = lang === 'RU' ? 'Странное свечение из бокового прохода.' : 'Strange glow from a side passage.';
            if (type === 'MINE') desc = lang === 'RU' ? 'Видны следы искусственного происхождения.' : 'Traces of artificial origin are visible.';
            if (type === 'NEST') desc = lang === 'RU' ? 'Слышны странные звуки из глубины.' : 'Strange sounds heard from the depths.';
        } else if (hasScanner) {
            title = `[SCAN] ${t(def.name, lang)}`;
            desc = `${t(def.description, lang)} (${lang === 'RU' ? 'Риск' : 'Risk'}: ${Math.round(def.baseRisk * 100)}%)`;
        }

        return {
            id: `TUNNEL_${type}_${Date.now()}`,
            title: title,
            description: desc,
            type: 'CHOICE',
            weight: 100,
            options: [
                {
                    label: `${lang === 'RU' ? 'Войти в' : 'Enter'} ${t(def.name, lang).toLowerCase()}`,
                    actionId: def.actionId,
                    risk: def.baseRisk > 0.3 ? 'HIGH' : (def.baseRisk > 0 ? 'MEDIUM' : 'LOW')
                },
                {
                    label: lang === 'RU' ? 'Игнорировать' : 'Ignore',
                    actionId: 'encounter_ignore'
                }
            ],
            triggers: [EventTrigger.DRILLING]
        } as any;
    }

    /**
     * Создать начальное состояние для исследования туннеля
     */
    startTunnel(type: SideTunnelType, depth: number): SideTunnelState {
        const def = TUNNEL_DEFINITIONS[type];

        // Генерация наград
        const rewards: Record<string, number> = {};
        if (def.rewards.resources) {
            def.rewards.resources.forEach(res => {
                const amount = Math.floor(res.min + Math.random() * (res.max - res.min));
                const scaling = 1 + (depth / 5000);
                rewards[res.type] = Math.floor(amount * scaling);
            });
        }

        // Ancient Tech
        if (Math.random() < def.rewards.techChance) {
            rewards.ancientTech = Math.floor(def.rewards.techAmount * (1 + Math.random()));
        }

        return {
            type,
            name: def.name,
            progress: 0,
            maxProgress: (100 + (depth / 100)) / 3, // Сокращено в 3 раза для баланса (v4.1.3)
            rewards,
            difficulty: 1 + (def.baseRisk * 5),
        };
    }
}

export const sideTunnelSystem = new SideTunnelSystem();

/**
 * Обработка продвижения в боковом туннеле
 */
export function processSideTunnel(
    state: GameState,
    drillPower: number,
    dt: number,
    lang: 'RU' | 'EN'
): { update: Partial<GameState>; resourceChanges: Record<string, number>; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    const resourceChanges: Record<string, number> = {};

    if (!state.sideTunnel) {
        return { update: {}, resourceChanges: {}, events };
    }

    const tunnel = { ...state.sideTunnel };

    // Продвижение зависит от мощности бура и сложности туннеля
    const progressGain = (drillPower * dt) / (tunnel.difficulty || 1);
    tunnel.progress += progressGain;

    // Шанс найти ресурс во время раскопок в туннеле
    if (Math.random() < 0.05 * dt * 60) {
        const resourceTypes = Object.keys(tunnel.rewards).filter(k => k !== 'ancientTech');
        if (resourceTypes.length > 0) {
            const resType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            const amount = Math.max(1, Math.floor((tunnel.rewards[resType] / 20) * Math.random()));
            resourceChanges[resType] = (resourceChanges[resType] || 0) + amount;

            events.push({
                type: 'TEXT',
                position: 'CENTER',
                text: `+${amount} ${resType.toUpperCase()}`,
                style: 'RESOURCE'
            });
        }
    }

    // Завершение туннеля
    if (tunnel.progress >= tunnel.maxProgress) {
        events.push({
            type: 'LOG',
            msg: lang === 'RU' ? `🎉 ТУННЕЛЬ "${t(tunnel.name as any, lang).toUpperCase()}" ПОЛНОСТЬЮ ИССЛЕДОВАН!` : `🎉 TUNNEL "${t(tunnel.name as any, lang).toUpperCase()}" FULLY EXPLORED!`,
            color: 'text-yellow-400 font-bold'
        });

        // Финальные награды
        Object.entries(tunnel.rewards).forEach(([res, amount]) => {
            resourceChanges[res] = (resourceChanges[res] || 0) + amount;
            events.push({
                type: 'LOG',
                msg: `>> ${lang === 'RU' ? 'ПОЛУЧЕНО' : 'RECEIVED'}: ${Math.floor(amount)} ${res.toUpperCase()}`,
                color: 'text-green-400'
            });
        });

        // Шанс найти чертеж (Blueprint) - Phase 3
        if (Math.random() < 0.25) {
            const potentialBlueprints = AVAILABLE_BLUEPRINTS.filter(bp => !state.unlockedBlueprints.includes(bp));

            if (potentialBlueprints.length > 0) {
                const newBp = potentialBlueprints[Math.floor(Math.random() * potentialBlueprints.length)];

                events.push({
                    type: 'LOG',
                    msg: lang === 'RU'
                        ? `🛠️ ОБНАРУЖЕН СЕКРЕТНЫЙ ЧЕРТЕЖ: ${newBp.replace('blueprint_', '').replace(/_/g, ' ').toUpperCase()}!`
                        : `🛠️ SECRET BLUEPRINT DISCOVERED: ${newBp.replace('blueprint_', '').replace(/_/g, ' ').toUpperCase()}!`,
                    color: 'text-purple-400 font-bold'
                });
                events.push({ type: 'SOUND', sfx: 'ACHIEVEMENT' });

                return {
                    update: {
                        sideTunnel: null,
                        unlockedBlueprints: [...state.unlockedBlueprints, newBp]
                    },
                    resourceChanges,
                    events
                };
            }
        }

        return {
            update: {
                sideTunnel: null
            },
            resourceChanges,
            events
        };
    }

    return {
        update: {
            sideTunnel: tunnel
        },
        resourceChanges,
        events
    };
}
