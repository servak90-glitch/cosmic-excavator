/**
 * AnalyzerSystem — управление анализатором артефактов
 * 
 * Отвечает за:
 * - Таймер анализа
 * - Идентификацию артефактов
 */

import { GameState, VisualEvent, InventoryItem } from '../../types';
import { ARTIFACTS } from '../artifactRegistry';

export interface AnalyzerUpdate {
    analyzer: GameState['analyzer'];
    discoveredArtifacts: string[];
}

export interface AnalyzerResult {
    update: AnalyzerUpdate;
    inventoryChanges: Record<string, InventoryItem>;
    events: VisualEvent[];
}

/**
 * Обработка анализатора
 */
export function processAnalyzer(state: GameState): AnalyzerResult {
    const events: VisualEvent[] = [];
    const nextAnalyzer = { ...state.analyzer };
    let nextDiscovered = state.discoveredArtifacts;
    const inventoryChanges: Record<string, InventoryItem> = {};

    // Уменьшение таймера
    if (nextAnalyzer.activeItemInstanceId && nextAnalyzer.timeLeft > 0) {
        // Проверяем, есть ли Research Lab в текущем регионе
        const currentRegion = state.currentRegion;
        const regionBase = state.playerBases.find(b => b.regionId === currentRegion && b.status === 'active');
        const hasLab = regionBase?.facilities.includes('research_lab');

        // Если есть Лаборатория - прогресс идет в 2 раза быстрее
        const decrement = hasLab ? 2 : 1;
        nextAnalyzer.timeLeft = Math.max(0, nextAnalyzer.timeLeft - decrement);
    }

    // Завершение анализа
    if (nextAnalyzer.activeItemInstanceId && nextAnalyzer.timeLeft <= 0) {
        const itemId = nextAnalyzer.activeItemInstanceId;
        const item = state.inventory[itemId];

        if (item) {
            const def = ARTIFACTS.find(a => a.id === item.defId);
            events.push({
                type: 'LOG',
                msg: `АНАЛИЗ ЗАВЕРШЕН: ${def?.name}`,
                color: "text-green-400 font-bold"
            });
            events.push({ type: 'SOUND', sfx: 'ACHIEVEMENT' });

            // Добавить в открытые
            if (def && !nextDiscovered.includes(def.id)) {
                nextDiscovered = [...nextDiscovered, def.id];
            }

            // Идентифицировать
            inventoryChanges[itemId] = { ...item, isIdentified: true };
            nextAnalyzer.activeItemInstanceId = null;
        }
    }

    return {
        update: {
            analyzer: nextAnalyzer,
            discoveredArtifacts: nextDiscovered
        },
        inventoryChanges,
        events
    };
}
