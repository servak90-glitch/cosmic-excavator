/**
 * Общие типы для игровых подсистем
 * Каждая подсистема получает состояние и возвращает частичное обновление + события
 */

import { GameState, VisualEvent, ResourceType, Resources, Stats } from '../../types';

/**
 * Базовый интерфейс обновления от подсистемы
 */
export interface SystemUpdate {
    partialState: Partial<GameState>;
    events: VisualEvent[];
}

/**
 * Контекст для подсистем — общие данные, вычисляемые один раз
 */
export interface SystemContext {
    stats: Stats;
    currentTime: number;
}

/**
 * Изменения ресурсов (накапливаются от разных систем)
 */
export type ResourceChanges = Partial<Record<ResourceType, number>>;

/**
 * Утилита: создаёт пустое обновление
 */
export function emptyUpdate(): SystemUpdate {
    return { partialState: {}, events: [] };
}

/**
 * Утилита: объединяет несколько обновлений от подсистем
 */
export function mergeUpdates(...updates: SystemUpdate[]): SystemUpdate {
    const merged: SystemUpdate = { partialState: {}, events: [] };

    for (const update of updates) {
        Object.assign(merged.partialState, update.partialState);
        merged.events.push(...update.events);
    }

    return merged;
}

/**
 * Утилита: применить изменения ресурсов к текущему состоянию
 */
export function applyResourceChanges(
    currentResources: Resources,
    changes: ResourceChanges
): Resources {
    if (Object.keys(changes).length === 0) return currentResources;

    const newResources = { ...currentResources };
    for (const [key, value] of Object.entries(changes)) {
        const resKey = key as ResourceType;
        const oldValue = newResources[resKey] || 0;
        const newValue = Math.max(0, oldValue + (value || 0));

        // Отладочное логирование при значимом уменьшении ресурсов (отключено для производительности)
        /*
        if (value && value < 0 && Math.abs(value) > 0.001) {
            console.log(`[RESOURCE_CHANGE] ${resKey}: ${oldValue.toFixed(2)} -> ${newValue.toFixed(2)} (diff: ${value.toFixed(4)})`);
        }
        */

        newResources[resKey] = newValue;
    }
    return newResources;
}
