/**
 * ShieldSystem — управление энергощитом
 * 
 * Отвечает за:
 * - Заряд щита при бурении
 * - Разряд при активной защите
 * - Пассивная утечка
 */

import { GameState, VisualEvent } from '../../types';

export interface ShieldUpdate {
    shieldCharge: number;
    isShielding: boolean;
}

/**
 * Обработка заряда/разряда щита
 */
export function processShield(state: GameState, dt: number): ShieldUpdate {
    let shieldCharge = state.shieldCharge;
    let isShielding = false;

    if (state.isDrilling && !state.isOverheated) {
        // Заряд при бурении: +5 в секунду
        shieldCharge = Math.min(100, shieldCharge + 5.0 * dt);
    } else if (!state.isDrilling && !state.isOverheated && shieldCharge > 0 && !state.isCoolingGameActive) {
        // Разряд при активной защите: -20 в секунду
        shieldCharge = Math.max(0, shieldCharge - 20.0 * dt);
        if (shieldCharge > 0) isShielding = true;
    } else {
        // Пассивная утечка: -1 в секунду
        shieldCharge = Math.max(0, shieldCharge - 1.0 * dt);
    }

    return { shieldCharge, isShielding };
}
