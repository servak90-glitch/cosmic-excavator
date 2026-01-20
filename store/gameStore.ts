/**
 * GameStore — централизованное состояние игры
 * 
 * Рефакторировано в версии 3.0:
 * - Действия разбиты на слайсы в store/slices/
 * - Этот файл объединяет слайсы и содержит core логику
 */

import { create } from 'zustand';
import {
    GameState, View, VisualEvent, DrillSlot,
    DroneType, RegionId
} from '../types';
import {
    BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS,
    GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS
} from '../constants';
import { gameEngine } from '../services/GameEngine';
// Cooling imported removed
import { calculateStats } from '../services/gameMath';
import { audioEngine } from '../services/audioEngine';

import { abilitySystem } from '../services/systems/AbilitySystem';
import { damageBossWeakPoint } from '../services/systems/CombatSystem';
import { AbilityType } from '../types';

// Слайсы
import {
    createDrillSlice, DrillActions,
    createCitySlice, CityActions,
    createInventorySlice, InventoryActions,
    createUpgradeSlice, UpgradeActions,
    createEntitySlice, EntityActions,
    createSettingsSlice, SettingsActions,
    createExpeditionSlice, ExpeditionActions,
    createFactionSlice, FactionActions,
    createAdminSlice, AdminActions,
    createEventSlice, EventActions,
    createTravelSlice, TravelActions,
    createLicenseSlice, LicenseActions,
    createBaseSlice, BaseActions
} from './slices';
import { createMarketSlice, MarketSlice } from './slices/marketSlice';
import { createCaravanSlice, CaravanSlice } from './slices/caravanSlice';
import { createQuestSlice, QuestSlice } from './slices/questSlice';
import { GAME_VERSION } from '../constants';

// === ИНТЕРФЕЙСЫ ===

interface CoreActions {
    enterGame: () => void;
    exitToMenu: () => void;
    tick: (dt: number) => VisualEvent[];
    resetProgress: () => void;
    manualSave: () => void;
    manualLoad: () => boolean;
    exportSaveString: () => string;
    importSaveString: (str: string) => boolean;
}





// Полный тип store
export interface GameStore extends GameState,
    CoreActions, EventActions, AdminActions,
    DrillActions, CityActions, InventoryActions,
    UpgradeActions, EntityActions, SettingsActions, ExpeditionActions, FactionActions, TravelActions, LicenseActions, BaseActions,
    MarketSlice, CaravanSlice, QuestSlice {
    isGameActive: boolean;
    activeView: View;
    actionLogQueue: VisualEvent[];
    activateAbility: (id: AbilityType) => void;
    damageWeakPoint: (wpId: string) => void;
}

// === НАЧАЛЬНОЕ СОСТОЯНИЕ ===

const INITIAL_STATE: GameState = {
    depth: 0,
    heat: 0,
    integrity: 100,
    currentCargoWeight: 0,  // [CARGO SYSTEM] Начальный вес груза
    currentRegion: RegionId.RUST_VALLEY,  // [GLOBAL MAP] Стартовый регион
    shieldCharge: 100,
    maxShieldCharge: 100,
    isShielding: false,
    resources: {
        clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0,
        titanium: 0, uranium: 0, nanoSwarm: 0, ancientTech: 0,
        rubies: 0, emeralds: 0, diamonds: 0,
        // Fuel (MVP)
        coal: 500, oil: 0, gas: 0  // Начальный запас топлива
    },
    drill: {
        [DrillSlot.BIT]: BITS[0],
        [DrillSlot.ENGINE]: ENGINES[0],
        [DrillSlot.COOLING]: COOLERS[0],
        [DrillSlot.HULL]: HULLS[0],
        [DrillSlot.LOGIC]: LOGIC_CORES[0],
        [DrillSlot.CONTROL]: CONTROL_UNITS[0],
        [DrillSlot.GEARBOX]: GEARBOXES[0],
        [DrillSlot.POWER]: POWER_CORES[0],
        [DrillSlot.ARMOR]: ARMORS[0],
        [DrillSlot.CARGO_BAY]: CARGO_BAYS[0]
    },
    skillLevels: {},
    artifacts: [],
    inventory: {},
    equippedArtifacts: [null, null, null] as (string | null)[],
    discoveredArtifacts: [],
    analyzer: { activeItemInstanceId: null, timeLeft: 0, maxTime: 0 },
    activeQuests: [],
    completedQuestIds: [],
    failedQuestIds: [],
    lastQuestRefresh: 0,
    totalDrilled: 0,
    xp: 0,
    level: 1,
    activeEffects: [],
    eventQueue: [],
    recentEventIds: [],
    eventCooldowns: {},  // [EVENT SYSTEM v4.0] Кулдауны событий
    flyingObjects: [],
    currentBoss: null,
    lastBossDepth: 0,
    activeDrones: [],
    droneLevels: { [DroneType.COLLECTOR]: 0, [DroneType.COOLER]: 0, [DroneType.BATTLE]: 0, [DroneType.REPAIR]: 0, [DroneType.MINER]: 0 },
    storageLevel: 0,
    forgeUnlocked: false,
    cityUnlocked: true,  // [REBALANCE] Глобальная карта доступна сразу
    skillsUnlocked: false,

    // NARRATIVE STATE
    aiState: 'LUCID',
    narrativeTick: 0,

    // SETTINGS
    // SETTINGS
    settings: { musicVolume: 0.5, sfxVolume: 0.5, drillVolume: 0.5, musicMuted: false, sfxMuted: false, drillMuted: false, language: 'RU' },
    selectedBiome: null,
    debugUnlocked: false,
    isGodMode: false,
    isInfiniteCoolant: false,
    isInfiniteFuel: false,
    isInfiniteEnergy: false,
    isZeroWeight: false,
    isOverdrive: false,
    isDebugUIOpen: false,
    isDrilling: false,
    isOverheated: false,
    isBroken: false,
    isCoolingGameActive: false,
    heatStabilityTimer: 0,
    bossAttackTick: 0,
    lastInteractTime: Date.now(),

    eventCheckTick: 0,
    combatMinigame: null,
    activeAbilities: [],
    unlockedBlueprints: [],
    activeExpeditions: [],
    defeatedBosses: [], // Список побежденных боссов для Codex

    // [DEV_CONTEXT: SHIELD],
    minigameCooldown: 0,
    reputation: { CORPORATE: 0, SCIENCE: 0, REBELS: 0 },

    // === LICENSES & PERMITS ===
    globalReputation: 0,
    unlockedLicenses: ['green'],  // стартовая лицензия
    activePermits: {
        [RegionId.RUST_VALLEY]: {
            regionId: RegionId.RUST_VALLEY,
            type: 'permanent',
            expirationDate: null
        }
    },

    // === PLAYER BASES ===
    playerBases: [],

    // === PHASE 2: MARKET & CARAVANS ===
    marketTransactionHistory: [],
    caravans: [],
    caravanUnlocks: [
        { tier: '1star', unlocked: false },
        { tier: '2star', unlocked: false },
        { tier: '3star', unlocked: false },
    ]
};

// === ПЕРСИСТЕНТНОСТЬ ===

const PERSISTENT_KEYS: (keyof GameState)[] = [
    'depth', 'resources', 'heat', 'integrity', 'xp', 'level', 'drill',
    'inventory', 'equippedArtifacts', 'discoveredArtifacts', 'skillLevels',
    'activeQuests', 'completedQuestIds', 'failedQuestIds', 'settings', 'droneLevels', 'activeDrones',
    'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked', 'storageLevel',
    'lastBossDepth', 'analyzer', 'debugUnlocked', 'selectedBiome',
    'activeEffects', 'eventQueue', 'recentEventIds', 'lastQuestRefresh',
    'shieldCharge', 'currentCargoWeight', 'currentRegion',
    'globalReputation', 'unlockedLicenses', 'activePermits', 'playerBases',
    'marketTransactionHistory', 'caravans', 'caravanUnlocks'  // Phase 2
];

const createSnapshot = (state: GameState): Partial<GameState> => {
    const snapshot: any = {};
    PERSISTENT_KEYS.forEach(key => {
        snapshot[key] = state[key];
    });
    snapshot.version = GAME_VERSION;
    return snapshot;
};

const sanitizeAndMerge = (initial: GameState, saved: any): GameState => {
    if (!saved) return initial;

    const merged: any = { ...initial };

    const deepKeys: (keyof GameState)[] = ['resources', 'settings', 'droneLevels', 'skillLevels'];
    const arrayKeys: (keyof GameState)[] = [
        'inventory', 'equippedArtifacts', 'discoveredArtifacts',
        'activeQuests', 'completedQuestIds', 'failedQuestIds',
        'activeEffects', 'eventQueue', 'recentEventIds', 'activeDrones',
        'playerBases', 'caravans', 'caravanUnlocks', 'artifacts'
    ];
    const primitiveKeys: (keyof GameState)[] = [
        'depth', 'heat', 'integrity', 'xp', 'level', 'totalDrilled',
        'lastBossDepth', 'storageLevel', 'forgeUnlocked', 'cityUnlocked', 'skillsUnlocked',
        'selectedBiome', 'debugUnlocked', 'lastQuestRefresh', 'shieldCharge', 'minigameCooldown',
        'currentCargoWeight', 'currentRegion', 'globalReputation'
    ];

    deepKeys.forEach(key => {
        if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
            merged[key] = { ...initial[key as any], ...saved[key] };
        }
    });

    arrayKeys.forEach(key => {
        if (saved[key] !== undefined) {
            // КРИТИЧЕСКАЯ ПРОВЕРКА: Если сохраненное значение не массив (например {}), 
            // используем начальный массив, чтобы не сломать .map/.filter
            if (Array.isArray(saved[key])) {
                merged[key] = saved[key];
            } else {
                console.warn(`[STATE SANITIZER] Ключ ${key} в сохранении не является массивом. Использовано значение по умолчанию.`);
                merged[key] = initial[key];
            }
        }
    });

    primitiveKeys.forEach(key => {
        if (saved[key] !== undefined) {
            merged[key] = saved[key];
        }
    });

    // Специальная обработка для объектов, которые могут быть null
    if (saved.analyzer) merged.analyzer = saved.analyzer;
    if (saved.drill && typeof saved.drill === 'object') {
        merged.drill = { ...initial.drill, ...saved.drill };
    }

    return merged as GameState;
};

const SAVE_KEY = 'COSMIC_HARDCORE_SAVE';

// === STORE ===

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,
    isGameActive: false,
    activeView: View.DRILL,
    actionLogQueue: [],

    // === СЛАЙСЫ (Действия из модулей) ===
    ...createDrillSlice(set, get),
    ...createCitySlice(set, get),
    ...createInventorySlice(set, get),
    ...createUpgradeSlice(set, get),
    ...createEntitySlice(set, get),
    ...createSettingsSlice(set, get),
    ...createExpeditionSlice(set, get),
    ...createFactionSlice(set, get),
    ...createAdminSlice(set, get),
    ...createEventSlice(set, get),
    ...createTravelSlice(set, get),
    ...createLicenseSlice(set, get),
    ...createBaseSlice(set, get),
    ...createMarketSlice(set, get),
    ...createCaravanSlice(set, get),
    ...createQuestSlice(set, get),

    // === CORE ACTIONS ===

    enterGame: () => set({ isGameActive: true }),

    exitToMenu: () => {
        set({ isGameActive: false, activeView: View.DRILL });
    },

    manualSave: () => {
        const state = get();
        const snapshot = createSnapshot(state);

        try {
            const stringified = JSON.stringify(snapshot);
            localStorage.setItem(SAVE_KEY, stringified);
            set(s => ({ actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ПРОГРЕСС ЗАПИСАН В ЧЕРНЫЙ ЯЩИК', color: 'text-green-500 font-bold' }] }));
            audioEngine.playLog();
        } catch (e) {
            console.error("Save failed", e);
            set(s => ({ actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ОШИБКА ЗАПИСИ ДАННЫХ', color: 'text-red-500 font-bold' }] }));
        }
    },

    manualLoad: () => {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;

            const saved = JSON.parse(raw);
            const merged = sanitizeAndMerge(INITIAL_STATE, saved);

            set({ ...merged, actionLogQueue: [{ type: 'LOG', msg: 'СИСТЕМА ВОССТАНОВЛЕНА', color: 'text-cyan-400' }] });
            return true;
        } catch (e) {
            console.error("Load failed", e);
            return false;
        }
    },

    tick: (dt: number) => {
        const s = get();
        const { partialState, events, questUpdates } = gameEngine.tick(s, dt);

        // Обработка немедленных обновлений квестов (например, смерть босса)
        questUpdates.forEach(upd => {
            s.activeQuests.forEach(quest => {
                quest.objectives.forEach(obj => {
                    if (obj.type === upd.type && obj.target === upd.target) {
                        s.updateQuestObjective(quest.id, obj.id, obj.current + 1);
                    }
                });
            });
        });

        let nextView = s.activeView;

        const wasBossActive = !!s.currentBoss;
        const isBossActive = !!partialState.currentBoss;

        if (isBossActive && !wasBossActive) {
            nextView = View.COMBAT;
        } else if (!isBossActive && wasBossActive) {
            nextView = View.DRILL;
        }

        const queue = s.actionLogQueue;
        const allEvents = [...events, ...queue];

        set({
            ...partialState,
            activeView: nextView,
            actionLogQueue: [],
        });

        // Handle audio events from tick
        events.forEach(e => {
            if (e.type === 'SOUND' && e.sfx) {
                if (e.sfx === 'LOG') audioEngine.playLog();
                if (e.sfx === 'GLITCH') audioEngine.playGlitch();
            }
        });

        return allEvents;
    },

    resetProgress: () => {
        set({ ...INITIAL_STATE, isGameActive: true });
        localStorage.removeItem(SAVE_KEY);
        audioEngine.playLog();
    },

    exportSaveString: () => {
        const state = get();
        const snapshot = createSnapshot(state);
        try {
            const json = JSON.stringify(snapshot);
            const utf8Bytes = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
                (match, p1) => String.fromCharCode(parseInt(p1, 16))
            );
            return btoa(utf8Bytes);
        } catch (e) {
            console.error("Export generation failed", e);
            return "";
        }
    },

    importSaveString: (str) => {
        try {
            const binaryString = atob(str);
            const jsonString = decodeURIComponent(binaryString.split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const data = JSON.parse(jsonString);

            localStorage.setItem(SAVE_KEY, jsonString);
            const merged = sanitizeAndMerge(INITIAL_STATE, data);
            set(merged);
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    },



    // === ABILITY ACTIONS ===
    activateAbility: (id: AbilityType) => {
        const s = get();
        if (abilitySystem.canActivate(id, s.heat)) {
            abilitySystem.activate(id);
            set({ activeAbilities: abilitySystem.getAllStates() });

            const def = abilitySystem.getAbilityDef(id);
            if (def.heatCost !== 0) {
                set(state => ({ heat: Math.max(0, Math.min(100, state.heat + def.heatCost)) }));
            }

            audioEngine.playClick();

            // [VISUAL POLISH] Trigger effects based on ability
            const newEvents: VisualEvent[] = [];
            if (id === 'THERMAL_STRIKE') {
                newEvents.push({ type: 'PARTICLE', kind: 'SPARK', count: 60, color: '0xFF4400', position: 'DRILL_TIP' });
                newEvents.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' }); // Quick glitch
            } else if (id === 'EMP_BURST') {
                newEvents.push({ type: 'PARTICLE', kind: 'SPARK', count: 40, color: '0x00FFFF', position: 'CENTER' });
            } else if (id === 'OVERLOAD') {
                newEvents.push({ type: 'PARTICLE', kind: 'SMOKE', count: 30, color: '0xFF0000', position: 'DRILL_TIP' });
            }

            if (newEvents.length > 0) {
                set(s => ({ actionLogQueue: [...s.actionLogQueue, ...newEvents] }));
            }
        }
    },

    damageWeakPoint: (wpId: string) => {
        const s = get();
        if (!s.currentBoss) return;

        const stats = calculateStats(s.drill, s.skillLevels, s.equippedArtifacts, s.inventory, s.depth);
        const clickDamage = stats.totalDamage * stats.clickMult;

        const res = damageBossWeakPoint(s.currentBoss, wpId, clickDamage);
        if (res.damageDealt > 0) {
            audioEngine.playLaser();
            set({ currentBoss: res.boss });
            // Ideally we'd log this or show visual feedback here too, but BossRenderer handles the visual 'hit' state via props if we passed it,
            // or we rely on the BossOverlay pulsing.
        }
    }
}));

// [DEV_CONTEXT: CHEAT ACCESS]
(globalThis as any).gameStore = useGameStore;
