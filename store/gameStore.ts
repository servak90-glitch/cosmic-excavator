/**
 * GameStore — централизованное состояние игры
 * 
 * Рефакторировано в версии 3.0:
 * - Действия разбиты на слайсы в store/slices/
 * - Этот файл объединяет слайсы и содержит core логику
 */

import { create } from 'zustand';
import {
    GameState, View, Resources, RegionId, EventTrigger,
    PlayerBase, BaseType, BaseStatus, DefenseUnitType, DefenseProductionJob,
    AbilityType, VisualEvent, DrillSlot, DroneType
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
    createBaseSlice, BaseActions,
    createMarketSlice, MarketActions,
    createCaravanSlice, CaravanActions,
    createQuestSlice, QuestActions,
    createCraftSlice, CraftActions  // NEW: Phase 2.1
} from './slices';
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
    DrillActions, CityActions, InventoryActions,  // InventoryActions включает equipment actions
    UpgradeActions, EntityActions, SettingsActions, ExpeditionActions, FactionActions, TravelActions, LicenseActions, BaseActions,
    MarketActions, CaravanActions, QuestActions, CraftActions {  // NEW: Phase 2.1
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
        coal: 200, oil: 0, gas: 0, ice: 0,  // [REBALANCE] Уменьшено с 500 до 200
        scrap: 0,  // NEW: Phase 2.2 - для разборки equipment
        credits: 0,  // NEW: Phase 2.3 - основная валюта
        repairKit: 0,
        coolantPaste: 0,
        advancedCoolant: 0
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
    pendingPredictions: [],  // [PREDICTION SYSTEM] Отложенные предсказанные события
    flyingObjects: [],
    unlockedBlueprints: [],
    sideTunnel: null,
    currentBoss: null,
    lastBossDepth: 0,
    activeDrones: [],
    droneLevels: { [DroneType.COLLECTOR]: 0, [DroneType.COOLER]: 0, [DroneType.BATTLE]: 0, [DroneType.REPAIR]: 0, [DroneType.MINER]: 0 },
    storageLevel: 0,
    forgeUnlocked: false,
    cityUnlocked: true,  // [REBALANCE] Глобальная карта доступна сразу
    skillsUnlocked: false,

    // === PHASE 3: CONSUMABLES ===
    consumables: {
        repairKit: 0,
        coolantPaste: 0,
        advancedCoolant: 0
    },

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
    // === PHASE 2.3: TRAVEL ===
    travel: null,
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
    ],

    // === PHASE 2.1: CRAFTING QUEUE ===
    craftingQueue: [],  // Пустая очередь крафта

    // === PHASE 2.2: UNIFIED INVENTORY ===
    equipmentInventory: [],  // Пустой инвентарь equipment

    // === PHASE 4: FREE COOLING COOLDOWN ===
    freeCoolingLastUsed: 0  // Изначально доступно
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
    'marketTransactionHistory', 'caravans', 'caravanUnlocks',  // Phase 2
    'craftingQueue',  // Phase 2.1
    'equipmentInventory',  // Phase 2.2
    'consumables', // NEW: Phase 3
    'unlockedBlueprints',
    'freeCoolingLastUsed'  // Phase 4: Free cooling cooldown
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
    ...createCraftSlice(set, get),  // NEW: Phase 2.1

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

        // === НОВОЕ: Проверка Crafting Queue ===
        const now = Date.now();
        let queueUpdated = false;
        const updatedQueue = s.craftingQueue.map(job => {
            if (job.status === 'in_progress' && job.completionTime <= now) {
                queueUpdated = true;
                return { ...job, status: 'ready_to_collect' as const };
            }
            return job;
        });

        // Добавить notifications для завершенных заданий
        if (queueUpdated) {
            const completedJobs = updatedQueue.filter(
                (j, idx) => j.status === 'ready_to_collect' && s.craftingQueue[idx]?.status === 'in_progress'
            );

            completedJobs.forEach(job => {
                events.push({
                    type: 'LOG',
                    msg: `🔔 КРАФТ ЗАВЕРШЁН: ${job.partId}! Заберите в Forge.`,
                    color: 'text-green-400 font-bold'
                });
            });

            if (completedJobs.length > 0) {
                audioEngine.playLog();  // Звук уведомления
            }
        }

        // === НОВОЕ: Проверка завершения путешествия (Phase 2.3) ===
        if (s.travel && s.travel.startTime + s.travel.duration <= now) {
            s.completeTravel();
        }

        const queue = s.actionLogQueue;
        const allEvents = [...events, ...queue];

        set({
            ...partialState,
            activeView: nextView,
            actionLogQueue: [],
            craftingQueue: updatedQueue
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
