/**
 * QUEST SLICE — управление квестами
 * Phase 3.1: Foundation
 */

import { SliceCreator } from './types';
import type { Quest, FactionId } from '../../types';
import { QUESTS, getQuestById } from '../../services/questRegistry';
import {
    updateQuestProgress,
    checkQuestAutoProgress,
    canActivateQuest,
    calculateQuestRewards,
    isQuestExpired,
} from '../../services/questEngine';

export interface QuestSlice {
    // Активные квесты игрока
    activeQuests: Quest[];

    // Завершённые квесты (IDs)
    completedQuestIds: string[];

    // Провалённые квесты (IDs)
    failedQuestIds: string[];

    // === ACTIONS ===

    // Взять квест
    acceptQuest: (questId: string) => void;

    // Обновить прогресс objective
    updateQuestObjective: (questId: string, objectiveId: string, progress: number) => void;

    // Завершить квест и получить награды
    completeQuest: (questId: string) => void;

    // Провалить квест
    failQuest: (questId: string) => void;

    // Проверить автоматический прогресс всех активных квестов (вызывается в GameEngine)
    checkAllQuestsProgress: () => void;
}

export const createQuestSlice: SliceCreator<QuestSlice> = (set, get) => ({
    activeQuests: [],
    completedQuestIds: [],
    failedQuestIds: [],

    acceptQuest: (questId) => {
        const state = get();
        const questDef = getQuestById(questId);

        if (!questDef) {
            console.warn(`❌ Квест ${questId} не найден`);
            return;
        }

        // Проверка: квест уже активен?
        if (state.activeQuests.some(q => q.id === questId)) {
            console.warn(`⚠️ Квест ${questId} уже активен`);
            return;
        }

        // Проверка: квест уже завершён?
        if (state.completedQuestIds.includes(questId)) {
            console.warn(`⚠️ Квест ${questId} уже завершён`);
            return;
        }

        // Проверка prerequisites
        if (!canActivateQuest(questDef, state.completedQuestIds)) {
            console.warn(`❌ Квест ${questId} требует выполнения других квестов`);
            return;
        }

        // Активируем квест
        const newQuest: Quest = {
            ...questDef,
            status: 'active',
        };

        set((state) => ({
            activeQuests: [...state.activeQuests, newQuest],
        }));

        console.log(`✅ Принят квест: "${newQuest.title}"`);
    },

    updateQuestObjective: (questId, objectiveId, progress) => {
        set((state) => {
            const questIndex = state.activeQuests.findIndex(q => q.id === questId);
            if (questIndex === -1) return {};

            const quest = state.activeQuests[questIndex];
            const updatedQuest = updateQuestProgress(quest, objectiveId, progress);

            const newActiveQuests = [...state.activeQuests];
            newActiveQuests[questIndex] = updatedQuest;

            console.log(`📊 Обновлён прогресс квеста "${quest.title}" - ${objectiveId}: ${progress}`);

            // Если квест завершён, автоматически подсказываем игроку
            if (updatedQuest.status === 'completed') {
                console.log(`🎉 Квест "${quest.title}" готов к сдаче!`);
            }

            return {
                activeQuests: newActiveQuests,
            };
        });
    },

    completeQuest: (questId) => {
        const state = get();
        const questIndex = state.activeQuests.findIndex(q => q.id === questId);

        if (questIndex === -1) {
            console.warn(`❌ Квест ${questId} не найден среди активных`);
            return;
        }

        const quest = state.activeQuests[questIndex];

        // Проверка: все objectives выполнены?
        const allCompleted = quest.objectives.every(obj => obj.current >= obj.required);
        if (!allCompleted) {
            console.warn(`❌ Квест "${quest.title}" ещё не завершён`);
            return;
        }

        // Рассчитать награды
        const rewards = calculateQuestRewards(quest);

        set((state) => {
            // Убрать из активных
            const newActiveQuests = state.activeQuests.filter(q => q.id !== questId);

            // Добавить в завершённые
            const newCompletedQuestIds = [...state.completedQuestIds, questId];

            // Применить награды
            const newResources = { ...state.resources };
            for (const [resource, amount] of Object.entries(rewards.resources)) {
                newResources[resource as any] = (newResources[resource as any] || 0) + amount;
            }

            const newReputation = { ...state.reputation };
            for (const [faction, amount] of Object.entries(rewards.reputation)) {
                newReputation[faction] = (newReputation[faction] || 0) + amount;
            }

            const newXp = (state.xp || 0) + rewards.xp;

            console.log(`🎉 Квест "${quest.title}" завершён!`);
            console.log(`Награды:`, rewards);

            // TODO Phase 3: Интеграция unlocks и blueprints
            const newUnlockedBlueprints = [...(state.unlockedBlueprints || [])];
            let blueprintsChanged = false;

            if (rewards.blueprints) {
                rewards.blueprints.forEach(bp => {
                    if (!newUnlockedBlueprints.includes(bp)) {
                        newUnlockedBlueprints.push(bp);
                        blueprintsChanged = true;
                        console.log(`📜 Изучен чертёж: ${bp}`);
                    }
                });
            }

            // Также обрабатываем rewards.unlocks (караваны, механики)
            // (Пока заглушка, т.к. requires implementation in specific systems)

            return {
                activeQuests: newActiveQuests,
                completedQuestIds: newCompletedQuestIds,
                resources: newResources,
                reputation: newReputation,
                xp: newXp,
                unlockedBlueprints: blueprintsChanged ? newUnlockedBlueprints : state.unlockedBlueprints,
            };
        });
    },

    failQuest: (questId) => {
        set((state) => {
            const questIndex = state.activeQuests.findIndex(q => q.id === questId);
            if (questIndex === -1) return {};

            const quest = state.activeQuests[questIndex];
            const newActiveQuests = state.activeQuests.filter(q => q.id !== questId);
            const newFailedQuestIds = [...state.failedQuestIds, questId];

            console.log(`💀 Квест "${quest.title}" провален`);

            return {
                activeQuests: newActiveQuests,
                failedQuestIds: newFailedQuestIds,
            };
        });
    },

    checkAllQuestsProgress: () => {
        const state = get();
        let hasChanges = false;

        const updatedQuests = state.activeQuests.map(quest => {
            // Проверка истечения времени
            if (isQuestExpired(quest, Date.now())) {
                console.warn(`⏰ Квест "${quest.title}" истёк`);
                // Автоматический fail через action
                setTimeout(() => (get() as any).failQuest(quest.id), 0);
                return quest;
            }

            // Авто-проверка прогресса
            const updated = checkQuestAutoProgress(quest, state);
            if (updated) {
                hasChanges = true;
                return updated;
            }
            return quest;
        });

        if (hasChanges) {
            set({ activeQuests: updatedQuests });
        }
    },
});
