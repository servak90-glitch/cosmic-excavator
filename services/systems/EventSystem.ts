/**
 * EventSystem — управление случайными событиями
 * 
 * ОБНОВЛЕНО v4.0: Вероятностные модели
 * - Поддержка Poisson распределения для событий
 * - Триггеры контекста (DRILLING, TRAVELING, etc.)
 * - Cooldowns для предотвращения спама
 * - Обработка новых полей (instantResource, caravanEffect, baseEffect)
 */

import { GameState, VisualEvent, GameEvent, EventTrigger } from '../../types';
import { rollRandomEvent } from '../eventRegistry';
import { calculateStats } from '../gameMath';
import { poissonProbability, normalDistribution } from '../mathUtils';

export interface EventUpdate {
    eventCheckTick: number;
    eventQueue: GameEvent[];
    recentEventIds: string[];
    eventCooldowns?: Record<string, number>;  // ID события -> время последнего срабатывания

    integrity?: number;
    depth?: number;
    xp?: number;
    heat?: number;
}

/**
 * Проверяет, может ли событие сработать на основе триггера
 */
function matchesTrigger(event: GameEvent, currentTrigger: EventTrigger): boolean {
    if (!event.triggers || event.triggers.length === 0) {
        return true;  // Legacy события без триггеров работают везде
    }
    return event.triggers.includes(currentTrigger);
}

/**
 * Проверяет, не находится ли событие на cooldown
 */
function isOnCooldown(eventId: string, cooldowns: Record<string, number>, currentTime: number, eventCooldown: number): boolean {
    if (!eventCooldown) return false;

    const lastTriggerTime = cooldowns[eventId] || 0;
    const timeSinceLastTrigger = currentTime - lastTriggerTime;

    return timeSinceLastTrigger < eventCooldown * 1000;  // Cooldown в секундах -> мс
}

/**
 * Вычисляет вероятность события на основе модели
 */
function calculateEventProbability(event: GameEvent, state: GameState, deltaTime: number): number {
    if (!event.probabilityModel) {
        return 0.1;  // Legacy: 10% шанс для старых событий
    }

    const model = event.probabilityModel;

    switch (model.type) {
        case 'poisson': {
            // Poisson: P(≥1) = 1 - e^(-λt)
            const lambda = model.lambda || 0.01;
            const hours = deltaTime / 3600;  // dt в секундах -> часы

            // Apply depth modifier if exists
            let adjustedLambda = lambda;
            if (model.depthModifier) {
                adjustedLambda *= model.depthModifier(state.depth);
            }

            return 1 - Math.exp(-adjustedLambda * hours);
        }

        case 'exponential_decay': {
            // Exponential decay with depth
            const baseChance = model.baseChance || 0.01;
            const scale = model.scale || 5000;
            return baseChance * Math.exp(-state.depth / scale);
        }

        case 'conditional': {
            // Dynamic calculation based on game state
            if (model.calculateChance) {
                return model.calculateChance({
                    depth: state.depth,
                    heat: state.heat,
                    zone: 'green',  // TODO: determine from region
                    cargoValue: 0,  // TODO: calculate from resources
                    caravanLevel: 1  // TODO: from caravan state
                });
            }
            return model.baseChance || 0.1;
        }

        default:
            return 0.1;  // Fallback
    }
}

/**
 * Обработка случайных событий (REFACTORED для вероятностных моделей)
 */
export function processEvents(state: GameState, stats: ReturnType<typeof calculateStats>): { update: EventUpdate; events: VisualEvent[] } {
    const visualEvents: VisualEvent[] = [];

    let eventCheckTick = (state.eventCheckTick || 0) + 1;
    let eventQueue = state.eventQueue;
    let recentEventIds = state.recentEventIds;
    let eventCooldowns = state.eventCooldowns || {};

    const updates: Partial<EventUpdate> = {};
    const currentTime = Date.now();

    // === ВЕРОЯТНОСТНАЯ ПРОВЕРКА СОБЫТИЙ ===
    // Проверяем каждые 10 тиков (1 секунда)
    if (eventCheckTick >= 10 && eventQueue.length === 0 && !state.currentBoss && !state.combatMinigame?.active) {
        eventCheckTick = 0;

        // Определяем текущий триггер
        const currentTrigger = state.isDrilling ? EventTrigger.DRILLING : EventTrigger.DRILLING;  // TODO: динамически определять

        // Получаем события, которые могут сработать
        const candidateEvent = rollRandomEvent(recentEventIds, state.depth, state.heat);

        if (candidateEvent) {
            // Проверяем триггер
            if (!matchesTrigger(candidateEvent, currentTrigger)) {
                // Событие не подходит по контексту
                return {
                    update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns },
                    events: visualEvents
                };
            }

            // Проверяем cooldown
            if (candidateEvent.cooldown && isOnCooldown(candidateEvent.id, eventCooldowns, currentTime, candidateEvent.cooldown)) {
                // Событие на cooldown
                return {
                    update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns },
                    events: visualEvents
                };
            }

            // Вычисляем вероятность
            const deltaTime = 1.0;  // 1 секунда между проверками
            const probability = calculateEventProbability(candidateEvent, state, deltaTime);

            // Проверяем случайный бросок
            if (Math.random() < probability) {
                const newEvent = candidateEvent;

                eventQueue = [...eventQueue, newEvent];
                recentEventIds = [...recentEventIds, newEvent.id];

                // Обновляем cooldown
                eventCooldowns[newEvent.id] = currentTime;

                // Хранить только 5 последних
                if (recentEventIds.length > 5) recentEventIds.shift();

                visualEvents.push({ type: 'SOUND', sfx: 'LOG' });
                visualEvents.push({
                    type: 'LOG',
                    msg: `>> СОБЫТИЕ: ${newEvent.title}`,
                    color: "text-cyan-400"
                });

                // --- INSTANT EFFECTS (HARDCORE) ---
                if (newEvent.instantDamage) {
                    const dmg = Math.floor(stats.integrity * newEvent.instantDamage);
                    updates.integrity = Math.max(0, state.integrity - dmg);
                    visualEvents.push({ type: 'LOG', msg: `>> КРИТИЧЕСКИЙ УРОН: -${dmg} HP`, color: 'text-red-500 font-bold' });
                    visualEvents.push({ type: 'TEXT', x: window.innerWidth / 2, y: window.innerHeight / 2, text: `-${dmg}`, style: 'DAMAGE' });
                }

                if (newEvent.instantDepth) {
                    updates.depth = state.depth + newEvent.instantDepth;
                    visualEvents.push({ type: 'LOG', msg: `>> СКАЧОК: +${newEvent.instantDepth}м`, color: 'text-purple-400 font-bold' });
                }

                if (newEvent.instantXp) {
                    updates.xp = state.xp + newEvent.instantXp;
                    visualEvents.push({ type: 'LOG', msg: `>> ОПЫТ: +${newEvent.instantXp} XP`, color: 'text-green-400' });
                }

                if (newEvent.instantHeat) {
                    updates.heat = Math.min(100, state.heat + newEvent.instantHeat);
                    visualEvents.push({ type: 'LOG', msg: `>> НАГРЕВ: +${newEvent.instantHeat}`, color: 'text-orange-500' });
                }

                // --- NEW: INSTANT RESOURCE (для топливных событий) ---
                if (newEvent.instantResource && typeof newEvent.instantResource === 'object' && 'type' in newEvent.instantResource) {
                    const resource = newEvent.instantResource;
                    let amount = resource.amountMean || 100;

                    // Если есть параметры распределения, используем Normal distribution
                    if (resource.amountMean && resource.amountStdDev) {
                        amount = Math.max(
                            resource.amountMin || 0,
                            Math.min(
                                resource.amountMax || 1000,
                                normalDistribution(resource.amountMean, resource.amountStdDev)
                            )
                        );
                    }

                    // TODO: добавить ресурс в state.resources через resourceChanges
                    visualEvents.push({
                        type: 'LOG',
                        msg: `>> ДОБЫЧА: +${Math.floor(amount)} ${resource.type.toUpperCase()}`,
                        color: 'text-green-400 font-bold'
                    });
                }
            }
        }
    }

    return {
        update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns, ...updates },
        events: visualEvents
    };
}
