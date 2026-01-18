/**
 * SideTunnelSystem.ts
 * Phase 3.2: Enhanced Side Tunnels & Anomaly Scanner
 */

import {
    GameState, EventActionId, SideTunnelType, GameEvent, EventTrigger, VisualEffectType, InventoryItem
} from '../../types';
import { rollArtifact } from '../artifactRegistry';
import { calculateStats } from '../gameMath';
import { tunnelAtmosphere } from './TunnelAtmosphere';

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

export const TUNNEL_DEFINITIONS: Record<SideTunnelType, TunnelDef> = {
    SAFE: {
        type: 'SAFE',
        name: 'Стабильный Туннель',
        description: 'Сейсмически стабильный проход. Видны жилы ресурсов.',
        actionId: EventActionId.TUNNEL_SAFE,
        minDepth: 0,
        baseRisk: 0,
        rewards: {
            resources: [
                { type: 'copper', min: 20, max: 50 },
                { type: 'iron', min: 10, max: 30 }
            ],
            artifactChance: 0.05,
            techChance: 0.1,
            techAmount: 5
        },
        atmosphereEffect: 'NONE'
    },
    RISKY: {
        type: 'RISKY',
        name: 'Нестабильный Проход',
        description: 'Стены вибрируют. Возможен обвал, но сканеры фиксируют аномалии.',
        actionId: EventActionId.TUNNEL_RISKY,
        minDepth: 0,
        baseRisk: 0.4,
        rewards: {
            artifactChance: 0.3,
            techChance: 0.5,
            techAmount: 15
        },
        atmosphereEffect: 'GLITCH_RED'
    },
    CRYSTAL: {
        type: 'CRYSTAL',
        name: 'Кристальная Пещера',
        description: 'Стены покрыты резонирующими кристаллами. Высокая ценность.',
        actionId: EventActionId.TUNNEL_CRYSTAL,
        minDepth: 2000,
        baseRisk: 0.2, // Риск пореза/повреждения бура
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
        name: 'Заброшенная Шахта',
        description: 'Остатки древней добычи. Высокий риск обвала техники.',
        actionId: EventActionId.TUNNEL_MINE,
        minDepth: 1000,
        baseRisk: 0.6,
        rewards: {
            resources: [
                { type: 'coal', min: 100, max: 300 },
                { type: 'iron', min: 50, max: 150 },
                { type: 'gold', min: 10, max: 30 }
            ],
            artifactChance: 0.2,
            techChance: 0.8, // Много теха
            techAmount: 40
        },
        atmosphereEffect: 'NONE'
    },
    NEST: {
        type: 'NEST',
        name: 'Гнездо Чужих',
        description: 'Биосканеры зашкаливают. Чрезвычайная опасность.',
        actionId: EventActionId.TUNNEL_NEST,
        minDepth: 3000,
        baseRisk: 0.8, // Бой или урон
        rewards: {
            resources: [
                { type: 'nanoSwarm', min: 50, max: 200 }
            ],
            artifactChance: 0.6, // Высокий шанс артефакта
            techChance: 0.4,
            techAmount: 30
        },
        atmosphereEffect: 'GLOW_GOLD' // Или зелёный?
    }
};

class SideTunnelSystem {
    /**
     * Сгенерировать событие Side Tunnel
     */
    generateEvent(depth: number, biomeId: string, hasScanner: boolean): GameEvent | null {
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

        // Если нет сканера и туннель опасный, игрок может не узнать точный тип
        // Но пока что упростим: сканер просто дает больше инфо в описании или предупреждение

        let title = 'Обнаружен Боковой Туннель';
        let desc = def.description;

        if (!hasScanner && type !== 'SAFE') {
            // Без сканера описание более туманное
            if (type === 'CRYSTAL') desc = 'Странное свечение из бокового прохода.';
            if (type === 'MINE') desc = 'Видны следы искусственного происхождения.';
            if (type === 'NEST') desc = 'Слышны странные звуки из глубины.';
        } else if (hasScanner) {
            title = `[SCAN] ${def.name}`;
            desc = `${def.description} (Риск: ${Math.round(def.baseRisk * 100)}%)`;
        }

        return {
            id: `TUNNEL_${type}_${Date.now()}`,
            title: title,
            description: desc,
            type: 'CHOICE',
            weight: 100,
            options: [
                {
                    label: `Войти в ${def.name.toLowerCase()}`,
                    actionId: def.actionId,
                    risk: def.baseRisk > 0.3 ? 'HIGH' : (def.baseRisk > 0 ? 'MEDIUM' : 'LOW')
                },
                {
                    label: 'Игнорировать',
                    actionId: 'encounter_ignore'
                }
            ],
            triggers: [EventTrigger.DRILLING]
        } as any; // Cast for now due to legacy event structure
    }

    /**
     * Обработать результат входа в туннель
     * Возвращает обновления стейта и логи
     */
    resolveTunnel(actionId: EventActionId, state: GameState, activePerks: string[] = []): { updates: Partial<GameState>, logs: any[] } {
        const updates: Partial<GameState> = {};
        const logs: any[] = [];
        const r = { ...state.resources };

        // Determine type based on actionId
        let type: SideTunnelType | null = null;
        if (actionId === EventActionId.TUNNEL_SAFE) type = 'SAFE';
        if (actionId === EventActionId.TUNNEL_RISKY) type = 'RISKY';
        if (actionId === EventActionId.TUNNEL_CRYSTAL) type = 'CRYSTAL';
        if (actionId === EventActionId.TUNNEL_MINE) type = 'MINE';
        if (actionId === EventActionId.TUNNEL_NEST) type = 'NEST';

        if (!type) return { updates, logs };

        const def = TUNNEL_DEFINITIONS[type];
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);

        // Success Roll
        // Luck affects success chance
        // Base risk is failure chance. So Success = 1 - Risk.
        // Luck bonus: each point reduces risk by 1%?
        const riskReduction = stats.luck * 0.01;
        let actualRisk = Math.max(0, def.baseRisk - riskReduction);

        // Perk: Sabotage Expertise (Rebels Level 7) - +10% risky tunnel success (reduces risk by 0.1)
        if (activePerks.includes('SABOTAGE')) {
            actualRisk = Math.max(0, actualRisk - 0.1);
        }

        const roll = Math.random();

        const isSuccess = roll >= actualRisk;

        if (isSuccess) {
            logs.push({ type: 'SOUND', sfx: 'ACHIEVEMENT' });
            // Rewards
            if (def.rewards.resources) {
                def.rewards.resources.forEach(resDef => {
                    const amount = Math.floor(resDef.min + Math.random() * (resDef.max - resDef.min));
                    const mult = 1 + (state.depth / 5000); // Depth Scaling
                    // Fixed: resourceMultPct is not on stats, assuming 1.0 default if not present or check types
                    const total = Math.floor(amount * mult);

                    if (total > 0) {
                        r[resDef.type as keyof typeof r] = (r[resDef.type as keyof typeof r] || 0) + total;
                        logs.push({ type: 'LOG', msg: `>> ${resDef.type.toUpperCase()}: +${total}`, color: 'text-green-400' });
                    }
                });
            }

            if (Math.random() < def.rewards.techChance) {
                const amount = Math.floor(def.rewards.techAmount * (1 + Math.random()));
                r.ancientTech += amount;
                logs.push({ type: 'LOG', msg: `>> ANCIENT TECH: +${amount}`, color: 'text-blue-400' });
            }

            if (Math.random() < def.rewards.artifactChance) {
                const artDef = rollArtifact(state.depth, stats.luck, state.selectedBiome || undefined);
                const id = Math.random().toString(36).substr(2, 9);
                const newItem: InventoryItem = { instanceId: id, defId: artDef.id, acquiredAt: Date.now(), isIdentified: false, isEquipped: false };
                const newInv = { ...state.inventory, [id]: newItem };
                updates.inventory = newInv;
                if (state.storageLevel === 0) updates.storageLevel = 1;
                logs.push({ type: 'LOG', msg: '>> НАЙДЕН АРТЕФАКТ!', color: 'text-purple-400 font-bold' });
            }

            // Fixed: use valid hazard type or handle NONE logic differently
            // tunnelAtmosphere.triggerHazard('NONE', 0); // Invalid call
            // Instead we just don't trigger anything or reset if API supports it.
            // visualEffect 'NONE' handles the look.

        } else {
            // Failure
            logs.push({ type: 'SOUND', sfx: 'GLITCH' });

            // Damage / Loss depending on type
            let damage = 0;
            const maxIntegrity = state.drill.hull.baseStats.maxIntegrity; // Fixed property access

            switch (type) {
                case 'RISKY':
                case 'MINE':
                    damage = Math.floor(maxIntegrity * 0.3);
                    logs.push({ type: 'LOG', msg: `>> ОБВАЛ! КОРПУС ПОВРЕЖДЕН: -${damage}`, color: 'text-red-500 font-bold' });
                    tunnelAtmosphere.triggerHazard('CAVE_IN', 1.0);
                    break;
                case 'CRYSTAL':
                    damage = Math.floor(maxIntegrity * 0.15);
                    logs.push({ type: 'LOG', msg: `>> РЕЗОНАНС! ПОВРЕЖДЕНИЕ СИСТЕМ: -${damage}`, color: 'text-purple-500 font-bold' });
                    break;
                case 'NEST':
                    damage = Math.floor(maxIntegrity * 0.5);
                    logs.push({ type: 'LOG', msg: `>> АТАКА РОЯ! КРИТИЧЕСКИЕ ПОВРЕЖДЕНИЯ: -${damage}`, color: 'text-red-600 font-bold' });
                    // TODO: Trigger Combat?
                    break;
                default:
                    logs.push({ type: 'LOG', msg: '>> ПУСТО... ТОЛЬКО ПОТЕРЯ ВРЕМЕНИ', color: 'text-gray-500' });
            }

            // Apply defense
            const damageTaken = Math.max(0, damage - stats.defense);
            updates.integrity = Math.max(0, state.integrity - damageTaken);
        }

        updates.resources = r;
        return { updates, logs };
    }
}

export const sideTunnelSystem = new SideTunnelSystem();
