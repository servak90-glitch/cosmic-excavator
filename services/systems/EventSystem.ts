/**
 * EventSystem — управление случайными событиями
 * 
 * ОБНОВЛЕНО v4.0: Вероятностные модели
 * - Поддержка Poisson распределения для событий
 * - Триггеры контекста (DRILLING, TRAVELING, etc.)
 * - Cooldowns для предотвращения спама
 * - Обработка новых полей (instantResource, caravanEffect, baseEffect)
 */

import { GameState, VisualEvent, GameEvent, EventTrigger, Resources } from '../../types';
import { rollRandomEvent } from '../eventRegistry';
import { calculateStats } from '../gameMath';
import { poissonProbability, normalDistribution } from '../mathUtils';
import { getActivePerkIds } from '../factionLogic';

export interface EventUpdate {
    eventCheckTick: number;
    eventQueue: GameEvent[];
    recentEventIds: string[];
    eventCooldowns?: Record<string, number>;  // ID события -> время последнего срабатывания
    pendingPredictions?: Array<{ event: GameEvent; triggerTime: number; predictionShown: boolean }>;  // Отложенные предсказанные события

    integrity?: number;
    depth?: number;
    xp?: number;
    heat?: number;
    resourceChanges?: Partial<Resources>;
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
    let pendingPredictions = state.pendingPredictions || [];

    const updates: Partial<EventUpdate> = {};
    const currentTime = Date.now();

    // === ОБРАБОТКА ОТЛОЖЕННЫХ ПРЕДСКАЗАНИЙ ===
    const triggeredPredictions = pendingPredictions.filter(p => currentTime >= p.triggerTime);

    if (triggeredPredictions.length > 0) {
        // Активируем отложенные события
        triggeredPredictions.forEach(p => {
            eventQueue = [...eventQueue, p.event];
            recentEventIds = [...recentEventIds, p.event.id];
            visualEvents.push({
                type: 'LOG',
                msg: `>> СОБЫТИЕ: ${p.event.title}`,
                color: 'text-cyan-400'
            });
            visualEvents.push({ type: 'SOUND', sfx: 'LOG' });
        });

        // Удаляем сработавшие предсказания
        pendingPredictions = pendingPredictions.filter(p => currentTime < p.triggerTime);
    }

    // === ВЕРОЯТНОСТНАЯ ПРОВЕРКА СОБЫТИЙ (POISSON Distribution) ===
    // Проверяем каждые 10 тиков (1 секунда)
    // Poisson: P(at least 1) = 1 - e^(-λt)
    // λ = базовая частота событий в секунду
    const BASE_LAMBDA = 0.005;  // ~1 событие каждые 200 секунд (~3.3 минуты)
    const CHECK_INTERVAL_TICKS = 10;

    if (eventCheckTick >= CHECK_INTERVAL_TICKS && eventQueue.length === 0 && !state.currentBoss && !state.combatMinigame?.active) {
        eventCheckTick = 0;

        // Определяем текущий триггер
        const currentTrigger = state.isDrilling ? EventTrigger.DRILLING : EventTrigger.DRILLING;

        // === POISSON PROBABILITY ===
        // Модификаторы частоты на основе условий игры
        let lambdaModifier = 1.0;

        // Глубина увеличивает частоту событий (чем глубже — тем чаще)
        if (state.depth > 1000) lambdaModifier *= 1.2;
        if (state.depth > 5000) lambdaModifier *= 1.3;
        if (state.depth > 10000) lambdaModifier *= 1.5;

        // Высокая температура увеличивает частоту опасных событий
        if (state.heat > 70) lambdaModifier *= 1.4;

        // Вычисляем вероятность события за 1 секунду
        const lambda = BASE_LAMBDA * lambdaModifier;
        const poissonProbability = 1 - Math.exp(-lambda);  // P(k≥1) = 1 - e^(-λ)

        // Бросок на событие
        if (Math.random() < poissonProbability) {
            // Получаем кандидата на событие
            // Scanner unlocked via Blueprint OR Faction Perk (Science Lvl 7)
            const activePerks = getActivePerkIds(state.reputation);
            const hasScanner =
                state.unlockedBlueprints.includes('anomaly_scanner') ||
                activePerks.includes('ANOMALY_SCANNER');

            const candidateEvent = rollRandomEvent(
                recentEventIds,
                state.depth,
                state.heat,
                hasScanner,
                state.selectedBiome || 'rust_valley',
                state.settings.language
            );

            if (candidateEvent) {
                // Проверяем триггер
                if (!matchesTrigger(candidateEvent, currentTrigger)) {
                    return {
                        update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns },
                        events: visualEvents
                    };
                }

                // Проверяем cooldown
                if (candidateEvent.cooldown && isOnCooldown(candidateEvent.id, eventCooldowns, currentTime, candidateEvent.cooldown)) {
                    return {
                        update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns, pendingPredictions },
                        events: visualEvents
                    };
                }

                // === PREDICTION SYSTEM ===
                // Если есть predictionTime, создаем предупреждение и откладываем событие
                if (stats.predictionTime > 0) {
                    const detailLevel =
                        stats.predictionTime >= 20 ? 'FULL' :
                            stats.predictionTime >= 10 ? 'MEDIUM' : 'BASIC';

                    visualEvents.push({
                        type: 'PREDICTION',
                        eventTitle: typeof candidateEvent.title === 'string' ? candidateEvent.title : candidateEvent.title.RU,
                        eventType: candidateEvent.id,
                        timeRemaining: stats.predictionTime,
                        detailLevel
                    });

                    // Сохраняем pending event
                    pendingPredictions = [...pendingPredictions, {
                        event: candidateEvent,
                        triggerTime: currentTime + (stats.predictionTime * 1000),
                        predictionShown: true
                    }];

                    // Ограничиваем максимум 3 активных предсказания
                    if (pendingPredictions.length > 3) {
                        pendingPredictions = pendingPredictions.slice(-3);
                    }

                    // НЕ добавляем в eventQueue сразу, возвращаем обновления
                    return {
                        update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns, pendingPredictions },
                        events: visualEvents
                    };
                }

                // Событие срабатывает!
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
                    visualEvents.push({ type: 'TEXT', position: 'CENTER', text: `-${dmg}`, style: 'DAMAGE' });
                    // Screen Shake for impact
                    visualEvents.push({ type: 'SCREEN_SHAKE', intensity: 20, duration: 400 });
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

                    // Начисление ресурса в state.resources через resourceChanges
                    const resType = resource.type.toLowerCase() as keyof Resources;
                    if (!updates.resourceChanges) updates.resourceChanges = {};
                    updates.resourceChanges[resType] = (updates.resourceChanges[resType] || 0) + Math.floor(amount);

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
        update: { eventCheckTick, eventQueue, recentEventIds, eventCooldowns, pendingPredictions, ...updates },
        events: visualEvents
    };
}
