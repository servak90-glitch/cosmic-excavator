/**
 * HazardSystem.ts
 * 
 * Система случайных опасностей туннеля.
 * Управляет вероятностью и эффектами событий: Обвалы, Выбросы газа, Магма.
 * Включает кулдауны для предотвращения спама событий.
 */

import { GameState, VisualEvent } from '../../types';

export interface HazardUpdate {
    integrity?: number;
    heat?: number;
}

// Конфигурация опасностей
const HAZARD_COOLDOWN = 15 * 60; // 15 секунд (при 60 FPS)
const MIN_DEPTH_FOR_HAZARDS = 2000; // Начинаются с 2км

export function processHazards(state: GameState, dt: number): { update: HazardUpdate; events: VisualEvent[] } {
    const events: VisualEvent[] = [];
    const update: HazardUpdate = {};

    // 1. Проверка условий
    if (state.depth < MIN_DEPTH_FOR_HAZARDS ||
        state.currentBoss ||
        state.combatMinigame ||
        state.isCoolingGameActive ||
        !state.isDrilling) {
        return { update, events };
    }

    // 2. Расчет вероятности (растет с глубиной)
    // Вероятность проверяется каждый тик, поэтому масштабируем шанс через dt.
    const deepness = Math.max(0, state.depth - MIN_DEPTH_FOR_HAZARDS);
    // chancePerSecond: 0.5% - 2% в секунду
    const chancePerSecond = Math.min(0.02, 0.005 + deepness / 2000000);

    // Доп. защита от спама: если недавно было событие (eventQueue не пуст), не триггерим
    if (state.eventQueue.length > 0) return { update, events };

    if (Math.random() < chancePerSecond * dt) {
        const hazardRoll = Math.random();

        if (hazardRoll < 0.4) {
            // CAVE_IN (40%)
            // Небольшой урон, работает только если прочность > 20%
            if (state.integrity > 20) {
                const dmg = Math.floor(Math.random() * 10) + 5;
                update.integrity = Math.max(0, state.integrity - dmg);
                events.push({ type: 'LOG', msg: `⚠️ ОБВАЛ ПОРОДЫ! -${dmg}% КОРПУС`, color: 'text-yellow-500' });
                // Триггер визуального эффекта будет в GameEngine через update.events
                // Мы добавим спец. событие для GameEngine
                events.push({ type: 'SOUND', sfx: 'GLITCH' }); // Placeholder sound
            }
        } else if (hazardRoll < 0.7) {
            // GAS_POCKET (30%)
            // Нагрев + 10
            if (state.heat < 80) {
                update.heat = Math.min(100, state.heat + 10);
                events.push({ type: 'LOG', msg: `⚠️ ГАЗОВЫЙ КАРМАН! ТЕМПЕРАТУРА ПОВЫШЕНА`, color: 'text-green-500' });
            }
        } else {
            // MAGMA_FLOW (30%)
            // Только на глубине > 15000
            if (state.depth > 15000 && state.heat < 70) {
                update.heat = Math.min(100, state.heat + 20);
                events.push({ type: 'LOG', msg: `⚠️ МАГМАТИЧЕСКИЙ ПОТОК! КРИТИЧЕСКИЙ НАГРЕВ`, color: 'text-orange-500' });
            }
        }
    }

    return { update, events };
}
