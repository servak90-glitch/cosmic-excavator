/**
 * HazardSystem.ts
 * 
 * Система случайных опасностей туннеля.
 * Управляет вероятностью и эффектами событий: Обвалы, Выбросы газа, Магма.
 * Включает кулдауны для предотвращения спама событий.
 */

import { GameState, VisualEvent, Stats } from '../../types';
import { audioEngine } from '../audioEngine';

export interface HazardUpdate {
    integrity?: number;
    heat?: number;
}

// Конфигурация опасностей
const HAZARD_COOLDOWN = 15 * 60; // 15 секунд (при 60 FPS)
const MIN_DEPTH_FOR_HAZARDS = 2000; // Начинаются с 2км

export function processHazards(state: GameState, stats: Stats, dt: number, activePerks: string[] = []): { update: HazardUpdate; events: VisualEvent[] } {
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
    let chancePerSecond = Math.min(0.02, 0.005 + deepness / 2000000);

    // Perk: Quantum Stability (Science Level 10) - -50% hazard frequency
    if (activePerks.includes('QUANTUM_STABILITY')) {
        chancePerSecond *= 0.5;
    }

    // Доп. защита от спама: если недавно было событие (eventQueue не пуст), не триггерим
    if (state.eventQueue.length > 0) return { update, events };

    if (Math.random() < chancePerSecond * dt) {
        const hazardRoll = Math.random();

        if (hazardRoll < 0.4) {
            // CAVE_IN (40%)
            // Небольшой урон, работает только если прочность > 20%
            if (state.integrity > 20) {
                const baseDmg = Math.floor(Math.random() * 10) + 5;

                // Применяем hazardResist
                const resistMultiplier = 1 - (stats.hazardResist / 100);
                const finalDmg = Math.floor(baseDmg * resistMultiplier);

                update.integrity = Math.max(0, state.integrity - finalDmg);

                // Визуальный индикатор resist
                if (stats.hazardResist > 0) {
                    events.push({
                        type: 'LOG',
                        msg: `⚠️ ОБВАЛ ПОРОДЫ! -${finalDmg}% КОРПУС (🛡️ RESIST: -${Math.round(stats.hazardResist)}%)`,
                        color: 'text-yellow-500'
                    });
                } else {
                    events.push({ type: 'LOG', msg: `⚠️ ОБВАЛ ПОРОДЫ! -${finalDmg}% КОРПУС`, color: 'text-yellow-500' });
                }

                audioEngine.playHazardTrigger('CAVE_IN');
                audioEngine.playHazardDamage();
            }
        } else if (hazardRoll < 0.7) {
            // GAS_POCKET (30%)
            // Нагрев + 10
            if (state.heat < 80) {
                update.heat = Math.min(100, state.heat + 10);
                events.push({ type: 'LOG', msg: `⚠️ ГАЗОВЫЙ КАРМАН! ТЕМПЕРАТУРА ПОВЫШЕНА`, color: 'text-green-500' });

                audioEngine.playHazardTrigger('GAS');
            }
        } else {
            // MAGMA_FLOW (30%)
            // Только на глубине > 15000
            if (state.depth > 15000 && state.heat < 70) {
                update.heat = Math.min(100, state.heat + 20);
                events.push({ type: 'LOG', msg: `⚠️ МАГМАТИЧЕСКИЙ ПОТОК! КРИТИЧЕСКИЙ НАГРЕВ`, color: 'text-orange-500' });

                audioEngine.playHazardTrigger('MAGMA');
            }
        }
    }

    return { update, events };
}
