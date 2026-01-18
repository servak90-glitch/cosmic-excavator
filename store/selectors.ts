/**
 * Optimized Store Selectors using useShallow
 * 
 * These hooks group related state slices to reduce re-renders.
 * Components will only re-render when the specific state they use changes.
 */

import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';

/**
 * Core game state: game lifecycle and view
 */
export const useGameCore = () => useGameStore(
    useShallow(s => ({
        isGameActive: s.isGameActive,
        activeView: s.activeView,
        settings: s.settings,
        enterGame: s.enterGame,
        manualLoad: s.manualLoad,
        tick: s.tick,
    }))
);

/**
 * Drill state and resources
 */
export const useDrillState = () => useGameStore(
    useShallow(s => ({
        depth: s.depth,
        heat: s.heat,
        shieldCharge: s.shieldCharge,
        resources: s.resources,
        drill: s.drill,
        xp: s.xp,
        integrity: s.integrity,
    }))
);

/**
 * Drill interaction actions
 */
export const useDrillActions = () => useGameStore(
    useShallow(s => ({
        isDrilling: s.isDrilling,
        isOverheated: s.isOverheated,
        setDrilling: s.setDrilling,
        manualClick: s.manualClick,
        manualRechargeShield: s.manualRechargeShield,
    }))
);

/**
 * Combat and events state
 */
export const useCombatState = () => useGameStore(
    useShallow(s => ({
        currentBoss: s.currentBoss,
        combatMinigame: s.combatMinigame,
        eventQueue: s.eventQueue,
        isCoolingGameActive: s.isCoolingGameActive,
        clickFlyingObject: s.clickFlyingObject,
    }))
);

/**
 * Combat actions
 */
export const useCombatActions = () => useGameStore(
    useShallow(s => ({
        handleEventOption: s.handleEventOption,
        completeCombatMinigame: s.completeCombatMinigame,
        setCoolingGame: s.setCoolingGame,
        forceVentHeat: s.forceVentHeat,
        triggerOverheat: s.triggerOverheat,
    }))
);

/**
 * City-related state for CityView
 */
export const useCityState = () => useGameStore(
    useShallow(s => ({
        skillLevels: s.skillLevels,
        equippedArtifacts: s.equippedArtifacts,
        inventory: s.inventory,
        activeQuests: s.activeQuests,
        discoveredArtifacts: s.discoveredArtifacts,
    }))
);

/**
 * City actions
 */
export const useCityActions = () => useGameStore(
    useShallow(s => ({
        tradeCity: s.tradeCity,
        healCity: s.healCity,
        repairHull: s.repairHull,
        completeQuest: s.completeQuest,
        refreshQuests: s.refreshQuests,
    }))
);

/**
 * Settings and configuration
 */
export const useSettingsActions = () => useGameStore(
    useShallow(s => ({
        setLanguage: s.setLanguage,
        updateSettings: s.updateSettings,
        resetProgress: s.resetProgress,
        selectBiome: s.selectBiome,
        selectedBiome: s.selectedBiome,
    }))
);

/**
 * AI companion state
 */
export const useAIState = () => useGameStore(
    useShallow(s => ({
        aiState: s.aiState,
    }))
);

/**
 * View navigation actions
 */
export const useViewActions = () => useGameStore(
    useShallow(s => ({
        setView: s.setView,
    }))
);

