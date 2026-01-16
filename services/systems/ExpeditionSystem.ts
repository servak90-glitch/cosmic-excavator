/**
 * ExpeditionSystem.ts
 * 
 * Логика экспедиций:
 * - Расчет шансов успеха
 * - Расчет времени (реальное время)
 * - Генерация наград и потерь
 */

import { Expedition, ExpeditionDifficulty, ResourceType, Resources, GameState, DroneType } from '../../types';
import { DRONES } from '../../constants';

// Конфигурация сложностей
const DIFFICULTY_CONFIG: Record<ExpeditionDifficulty, { risk: number, timeMult: number, rewardMult: number, minDrones: number }> = {
    'LOW': { risk: 0.05, timeMult: 10, rewardMult: 1, minDrones: 1 },
    'MEDIUM': { risk: 0.20, timeMult: 20, rewardMult: 2.5, minDrones: 5 },
    'HIGH': { risk: 0.40, timeMult: 40, rewardMult: 6, minDrones: 10 },
    'EXTREME': { risk: 0.70, timeMult: 80, rewardMult: 15, minDrones: 20 }
};

const BASE_TIME_MS = 60 * 1000; // 1 минута базы

export class ExpeditionSystem {

    public calculateExpeditionParams(difficulty: ExpeditionDifficulty, droneCount: number, targetResource: ResourceType) {
        const config = DIFFICULTY_CONFIG[difficulty];

        // Время: База * Множитель сложности
        // Больше дронов = чуть быстрее (бонус до 50% скорости)
        const speedBonus = Math.min(0.5, (droneCount - config.minDrones) * 0.01);
        const duration = (BASE_TIME_MS * config.timeMult) * (1 - speedBonus);

        return {
            duration: Math.floor(duration),
            risk: config.risk,
            minDrones: config.minDrones
        };
    }

    public createExpedition(difficulty: ExpeditionDifficulty, droneCount: number, targetResource: ResourceType): Expedition {
        const params = this.calculateExpeditionParams(difficulty, droneCount, targetResource);

        return {
            id: Math.random().toString(36).substr(2, 9),
            difficulty,
            droneCount,
            resourceTarget: targetResource,
            startTime: Date.now(),
            duration: params.duration,
            riskChance: params.risk,
            status: 'ACTIVE',
            log: [`Экспедиция начата. Цель: ${targetResource}. Дронов: ${droneCount}. Сложность: ${difficulty}`]
        };
    }

    public checkStatus(expedition: Expedition): Expedition {
        if (expedition.status !== 'ACTIVE') return expedition;

        const now = Date.now();
        const endTime = expedition.startTime + expedition.duration;

        if (now >= endTime) {
            return this.resolveExpedition(expedition);
        }

        return expedition;
    }

    private resolveExpedition(expedition: Expedition): Expedition {
        const config = DIFFICULTY_CONFIG[expedition.difficulty];
        const log = [...expedition.log];
        let status: 'COMPLETED' | 'FAILED' = 'COMPLETED';
        let lostDrones = 0;
        const rewards: Partial<Resources> = {};

        // 1. Проверка риска (провал миссии или потеря дронов)
        // Риск - это шанс ПРОБЛЕМЫ.
        // Бросаем кубик.
        const roll = Math.random();

        if (roll < expedition.riskChance) {
            // Проблема случилась
            if (Math.random() < 0.3) {
                // Полный провал миссии
                status = 'FAILED';
                log.push("КРИТИЧЕСКИЙ СБОЙ: Связь с группой потеряна. Миссия провалена.");
            } else {
                // Частичный успех но с потерями
                status = 'COMPLETED';
                // Сколько дронов погибло? От 10% до 50%
                const lostPct = 0.1 + Math.random() * 0.4;
                lostDrones = Math.ceil(expedition.droneCount * lostPct);
                log.push(`ТРЕВОГА: Группа попала под обвал. Потеряно дронов: ${lostDrones}.`);
            }
        } else {
            log.push("Миссия выполнена успешно. Системы в норме.");
        }

        // 2. Расчет награды (если COMPLETED)
        if (status === 'COMPLETED') {
            const activeDrones = expedition.droneCount - lostDrones;
            if (activeDrones <= 0) {
                status = 'FAILED';
                log.push("Все дроны уничтожены. Груз оставлен.");
            } else {
                // Базовая добыча зависит от типа ресурса (редкие ресурсы добываются труднее)
                let baseAmount = 100;
                if (['rubies', 'emeralds', 'diamonds'].includes(expedition.resourceTarget)) baseAmount = 5;
                else if (['uranium', 'titanium'].includes(expedition.resourceTarget)) baseAmount = 20;

                const amount = Math.floor(baseAmount * config.rewardMult * activeDrones * (0.8 + Math.random() * 0.4));
                rewards[expedition.resourceTarget] = amount;
                log.push(`Добыто ресурсов: ${amount} ${expedition.resourceTarget}.`);
            }
        }

        return {
            ...expedition,
            status,
            lostDrones,
            rewards,
            log
        };
    }
}

export const expeditionSystem = new ExpeditionSystem();
