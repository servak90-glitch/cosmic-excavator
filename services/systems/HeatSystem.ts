/**
 * HeatSystem — управление температурой бура
 * 
 * Отвечает за:
 * - Нагрев при бурении
 * - Охлаждение в простое
 * - Перегрев и критические состояния
 * - Минигейм охлаждения
 */

import { GameState, VisualEvent, Stats } from '../../types';
import { audioEngine } from '../audioEngine';

export interface HeatUpdate {
    heat: number;
    isOverheated: boolean;
    isCoolingGameActive: boolean;
    isDrilling: boolean;
    heatStabilityTimer: number;
    integrity?: number;
}

/**
 * Обработка нагрева/охлаждения
 */
export function processHeat(
    state: GameState,
    stats: Stats,
    activeEffects: GameState['activeEffects'],
    dt: number
): { update: HeatUpdate; events: VisualEvent[] } {
    const events: VisualEvent[] = [];

    let heat = state.heat;
    let isOverheated = state.isOverheated;
    let isCoolingGameActive = state.isCoolingGameActive;
    let isDrilling = state.isDrilling;
    let heatStabilityTimer = state.heatStabilityTimer;
    let integrity = state.integrity;

    // Температура не может быть ниже окружающей (ambient heat)
    if (heat < stats.ambientHeat && !state.isInfiniteCoolant) {
        heat = stats.ambientHeat;
    }
    if (state.isInfiniteCoolant) heat = 0;

    // Счётчик стабильности при низком нагреве (используем dt для секунд)
    if (heat <= 1) {
        heatStabilityTimer += dt;
    } else {
        heatStabilityTimer = 0;
    }

    // Логика при активном бурении
    if (isDrilling && !isOverheated && !state.isBroken) {
        // Критический нагрев — запуск минигейма
        if (heat >= 95 && !isCoolingGameActive && !state.isGodMode) {
            isCoolingGameActive = true;
            isDrilling = false;
            heat = 95;
            events.push({
                type: 'LOG',
                msg: "!!! АВАРИЙНАЯ БЛОКИРОВКА ТЕПЛА !!!",
                color: "text-red-500 font-bold animate-pulse"
            });
            audioEngine.playAlarm();
        } else if (!state.currentBoss) {
            // Обычный нагрев при бурении
            const heatReduction = (1 - (stats.skillMods.heatGenReductionPct + stats.artifactMods.heatGenPct) / 100);
            let heatMult = 1;
            activeEffects.forEach(e => {
                if (e.modifiers.heatGenMultiplier) heatMult *= e.modifiers.heatGenMultiplier;
            });

            if (!state.isInfiniteCoolant) {
                // Базовая скорость нагрева: ~8.5% в секунду
                heat += 8.5 * heatMult * heatReduction * dt;
            }

            // Перегрев — урон по корпусу
            if (heat >= 100 && !state.isGodMode) {
                heat = 100;
                isOverheated = true;
                isDrilling = false;
                const dmg = Math.ceil(stats.integrity * 0.1);
                integrity = Math.max(0, integrity - dmg);

                events.push({ type: 'LOG', msg: "!!! КРИТИЧЕСКИЙ ПЕРЕГРЕВ !!!", color: "text-red-500 font-bold" });
                events.push({
                    type: 'TEXT',
                    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 50 : 300,
                    text: `-${dmg}`,
                    style: 'DAMAGE'
                });
                events.push({ type: 'SOUND', sfx: 'GLITCH' });
            }
        }
    } else {
        // Охлаждение в простое
        const coolingDisabled = activeEffects.some(e => e.modifiers && e.modifiers.coolingDisabled);

        if (!coolingDisabled) { // Убрано !isCoolingGameActive, чтобы охлаждение шло всегда
            // stats.totalCooling — это базовое значение охлаждения
            // Базовое охлаждение ~20% в секунду при totalCooling=50 (ускорено в 2 раза)
            const coolingAmount = (stats.totalCooling * 0.4 + 0.2) * stats.ventSpeed * dt;
            heat = Math.max(stats.ambientHeat, heat - coolingAmount);

            if (heat <= stats.ambientHeat + 1) {
                if (isOverheated) {
                    isOverheated = false;
                    events.push({ type: 'LOG', msg: "СИСТЕМЫ ОХЛАЖДЕНЫ.", color: "text-green-500" });
                }
                if (isCoolingGameActive) {
                    isCoolingGameActive = false;
                    events.push({ type: 'LOG', msg: "АВАРИЙНАЯ БЛОКИРОВКА СНЯТА.", color: "text-cyan-400" });
                }
            } else if (heat > stats.ambientHeat + 10 && coolingAmount < 0.01 && Math.random() < 0.02 * dt * 60) {
                events.push({ type: 'LOG', msg: "ПРЕДУПРЕЖДЕНИЕ: ВНЕШНЯЯ СРЕДА СЛИШКОМ ГОРЯЧАЯ.", color: "text-orange-400" });
            }
        }
    }

    return {
        update: {
            heat,
            isOverheated,
            isCoolingGameActive,
            isDrilling,
            heatStabilityTimer,
            integrity: integrity !== state.integrity ? integrity : undefined
        },
        events
    };
}
