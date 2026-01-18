/**
 * QUEST ENGINE — логика прогресса и завершения квестов
 * Phase 3.1: Foundation
 */

import type { Quest, QuestObjective, GameState } from '../types';
import { getQuestById } from './questRegistry';

/**
 * Обновить прогресс objective квеста
 * 
 * @param quest - квест для обновления
 * @param objectiveId - ID objective
 * @param newProgress - новое значение прогресса
 * @returns обновлённый квест
 */
export function updateQuestProgress(
    quest: Quest,
    objectiveId: string,
    newProgress: number
): Quest {
    const updatedObjectives = quest.objectives.map(obj =>
        obj.id === objectiveId
            ? { ...obj, current: Math.min(newProgress, obj.required) }
            : obj
    );

    // Проверяем, все ли objectives выполнены
    const allCompleted = updatedObjectives.every(obj => obj.current >= obj.required);

    return {
        ...quest,
        objectives: updatedObjectives,
        status: allCompleted ? 'completed' : quest.status,
    };
}

/**
 * Проверить автоматическое обновление прогресса квеста на основе GameState
 * 
 * Эта функция вызывается в GameEngine tick() для авто-обновления прогресса
 * 
 * @param quest - квест для проверки
 * @param state - текущее состояние игры
 * @returns обновлённый квест или null если изменений нет
 */
export function checkQuestAutoProgress(quest: Quest, state: GameState): Quest | null {
    if (quest.status !== 'active') return null;

    let hasChanges = false;
    const updatedObjectives = quest.objectives.map(obj => {
        let newCurrent = obj.current;

        switch (obj.type) {
            case 'REACH_DEPTH': {
                // Проверка текущей глубины
                const targetDepth = parseInt(obj.target);
                if (state.depth >= targetDepth) {
                    newCurrent = 1;
                    hasChanges = true;
                }
                break;
            }

            case 'COLLECT': {
                // Проверка ресурсов в инвентаре
                const resourceAmount = state.resources[obj.target as any] || 0;
                if (resourceAmount !== newCurrent) {
                    newCurrent = Math.min(resourceAmount, obj.required);
                    hasChanges = true;
                }
                break;
            }

            case 'BUILD_BASE': {
                // Проверка построенных баз
                const basesInRegion = state.playerBases.filter(b => b.regionId === obj.target).length;
                if (basesInRegion !== newCurrent) {
                    newCurrent = Math.min(basesInRegion, obj.required);
                    hasChanges = true;
                }
                break;
            }

            case 'TRAVEL_TO': {
                // Для \"visit all regions\" квеста
                if (obj.target === 'all_regions') {
                    // Уникальные регионы, в которых есть базы игрока
                    const uniqueRegions = new Set(state.playerBases.map(b => b.regionId));
                    if (uniqueRegions.size !== newCurrent) {
                        newCurrent = Math.min(uniqueRegions.size, obj.required);
                        hasChanges = true;
                    }
                }
                break;
            }

            // DELIVER и DEFEAT_BOSS требуют ручного обновления через actions
            case 'DELIVER':
            case 'DEFEAT_BOSS':
            default:
                break;
        }

        return { ...obj, current: newCurrent };
    });

    if (!hasChanges) return null;

    // Проверяем завершение
    const allCompleted = updatedObjectives.every(obj => obj.current >= obj.required);

    return {
        ...quest,
        objectives: updatedObjectives,
        status: allCompleted ? 'completed' : 'active',
    };
}

/**
 * Проверить можно ли активировать квест
 * 
 * @param quest - квест для проверки
 * @param completedQuestIds - IDs завершённых квестов
 * @returns true если квест доступен
 */
export function canActivateQuest(quest: Quest, completedQuestIds: string[]): boolean {
    // Проверка prerequisites
    if (quest.prerequisites) {
        return quest.prerequisites.every(prereqId => completedQuestIds.includes(prereqId));
    }
    return true;
}

/**
 * Выдать награды за завершение квеста
 * 
 * Эта функция НЕ изменяет state напрямую, а возвращает объект с изменениями
 * 
 * @param quest - завершённый квест
 * @returns объект с наградами для применения в store
 */
export function calculateQuestRewards(quest: Quest): {
    resources: Record<string, number>;
    reputation: Record<string, number>;
    unlocks: string[];
    blueprints: string[];
    xp: number;
} {
    const result = {
        resources: {} as Record<string, number>,
        reputation: {} as Record<string, number>,
        unlocks: [] as string[],
        blueprints: [] as string[],
        xp: 0,
    };

    for (const reward of quest.rewards) {
        switch (reward.type) {
            case 'RESOURCE':
                result.resources[reward.target] = (result.resources[reward.target] || 0) + (reward.amount || 0);
                break;

            case 'REPUTATION':
                result.reputation[reward.target] = (result.reputation[reward.target] || 0) + (reward.amount || 0);
                break;

            case 'UNLOCK':
                result.unlocks.push(reward.target);
                break;

            case 'BLUEPRINT':
                result.blueprints.push(reward.target);
                break;

            case 'XP':
                result.xp += reward.amount || 0;
                break;
        }
    }

    return result;
}

/**
 * Проверить истёк ли deadline квеста
 * 
 * @param quest - квест для проверки
 * @param currentTime - текущее время (Date.now())
 * @returns true если квест провален по времени
 */
export function isQuestExpired(quest: Quest, currentTime: number): boolean {
    if (!quest.expiresAt) return false;
    return currentTime >= quest.expiresAt;
}
