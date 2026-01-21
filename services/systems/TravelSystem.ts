/**
 * TravelSystem — управление негновенными перемещениями между регионами
 */

import { GameState, VisualEvent } from '../../types';

export interface TravelUpdate {
    currentRegion?: any;
    travel?: null;
}

/**
 * Обработка активного перемещения
 */
export function processTravel(state: GameState): { update: Partial<GameState>; events: VisualEvent[] } {
    const events: VisualEvent[] = [];

    if (!state.travel) {
        return { update: {}, events };
    }

    const now = Date.now();
    const arrivalTime = state.travel.startTime + state.travel.duration;

    // Путешествие завершено
    if (now >= arrivalTime) {
        const target = state.travel.targetRegion;

        events.push({
            type: 'LOG',
            msg: `📍 ПЕРЕМЕЩЕНИЕ В ${target.toUpperCase()} ЗАВЕРШЕНО!`,
            color: 'text-green-400 font-bold'
        });

        // Мы возвращаем null для travel, чтобы сбросить состояние пути
        return {
            update: {
                currentRegion: target,
                travel: null
            },
            events
        };
    }

    return { update: {}, events };
}
