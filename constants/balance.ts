/**
 * BALANCE CONSTANTS
 * Centralized game balancing parameters.
 * Changing values here affects the entire game.
 */

import { ResourceType } from '../types';

// =============================================================================
// CITY: TRADE SYSTEM
// =============================================================================

export const CITY_TRADES = {
    /** Basic clay-to-stone exchange */
    BASIC_EXCHANGE: {
        cost: { clay: 500 },
        reward: { stone: 50 }
    },

    /** Reverse trade ratios: spend 10 to get 50 */
    REVERSE_TRADE: {
        inputAmount: 10,
        outputAmount: 50
    }
} as const;

/** Reverse trades configuration */
export const REVERSE_TRADES: { source: ResourceType, target: ResourceType, label: string }[] = [
    { source: ResourceType.STONE, target: ResourceType.CLAY, label: 'ДРОБИЛКА ПОРОДЫ' },
    { source: ResourceType.COPPER, target: ResourceType.STONE, label: 'УТИЛИЗАЦИЯ ПРОВОДКИ' },
    { source: ResourceType.IRON, target: ResourceType.COPPER, label: 'ПЕРЕПЛАВКА ЛОМА' },
    { source: ResourceType.SILVER, target: ResourceType.IRON, label: 'ДЕМОНТАЖ ЭЛЕКТРОНИКИ' },
    { source: ResourceType.GOLD, target: ResourceType.SILVER, label: 'РАЗМЫВ РУДЫ' },
    { source: ResourceType.TITANIUM, target: ResourceType.GOLD, label: 'РАСЩЕПЛЕНИЕ СПЛАВОВ' },
    { source: ResourceType.URANIUM, target: ResourceType.TITANIUM, label: 'ДЕАКТИВАЦИЯ ЯДРА' }
];

// =============================================================================
// CITY: SERVICE SYSTEM
// =============================================================================

export const CITY_SERVICE = {
    /** Depth threshold where cooling becomes paid */
    PAID_COOLING_DEPTH: 1000,

    /** Depth threshold for gold cooling cost */
    GOLD_COOLING_DEPTH: 5000,

    /** Cooling cost multipliers */
    COOLING_RATE_GOLD: 1,
    COOLING_RATE_STONE: 5,

    /** Quest refresh cost */
    QUEST_REFRESH_COST: 100
} as const;

// =============================================================================
// CITY: GEM TRADES
// =============================================================================

export const GEM_TRADES = [
    { gem: 'rubies' as ResourceType, label: 'РУБИН', xp: 500, moneyRes: 'gold' as ResourceType, moneyAmount: 100 },
    { gem: 'emeralds' as ResourceType, label: 'ИЗУМРУД', xp: 1500, moneyRes: 'titanium' as ResourceType, moneyAmount: 50 },
    { gem: 'diamonds' as ResourceType, label: 'АЛМАЗ', xp: 5000, moneyRes: 'ancientTech' as ResourceType, moneyAmount: 10 }
];

// =============================================================================
// CITY: BAR SYSTEM
// =============================================================================

export const BAR_DRINKS = [
    { id: 'drink_oil', name: 'МАСЛЯНЫЙ СТАУТ', desc: 'Реген HP, но Нагрев x2', cost: 50, res: 'iron' as ResourceType, effectId: 'BAR_OIL_STOUT', icon: '🍺', color: 'text-amber-600' },
    { id: 'drink_rust', name: 'РЖАВЫЙ ГВОЗДЬ', desc: 'Клик x3, но Авто-бур x0.5', cost: 100, res: 'copper' as ResourceType, effectId: 'BAR_RUSTY_NAIL', icon: '🍷', color: 'text-orange-500' },
    { id: 'drink_nuke', name: 'ЯДЕРНЫЙ ВИСКИ', desc: 'Скорость x5, но урон обшивке', cost: 20, res: 'uranium' as ResourceType, effectId: 'BAR_NUCLEAR_WHISKEY', icon: '☢️', color: 'text-green-500' },
    { id: 'drink_void', name: 'КОКТЕЙЛЬ ПУСТОТЫ', desc: 'Ресурсы x10, но слепота', cost: 10, res: 'rubies' as ResourceType, effectId: 'BAR_VOID_COCKTAIL', icon: '🌑', color: 'text-purple-500' },
];

export const GAMBLING = {
    /** Win chance for dice game (45%) */
    WIN_CHANCE: 0.45,
    /** Payout multiplier on win */
    PAYOUT_MULTIPLIER: 2,
    /** Minimum bet */
    MIN_BET: 10,
    /** Maximum bet */
    MAX_BET: 1000
} as const;

// =============================================================================
// CITY: PREMIUM BUFFS
// =============================================================================

export const PREMIUM_BUFFS = [
    { id: 'nano_repair', name: 'НАНО-СВАРКА', desc: 'Авто-ремонт (10 мин)', cost: 2000, res: 'titanium' as ResourceType, effectId: 'PREMIUM_NANO_REPAIR', icon: '🛠️', color: 'text-green-400' },
    { id: 'diamond_coat', name: 'АЛМАЗНОЕ НАПЫЛЕНИЕ', desc: 'Скорость бурения x2 (5 мин)', cost: 50, res: 'diamonds' as ResourceType, effectId: 'PREMIUM_DIAMOND_COAT', icon: '✨', color: 'text-cyan-400' },
    { id: 'void_shield', name: 'ЩИТ ПУСТОТЫ', desc: 'Защита +50% (3 мин)', cost: 100, res: 'ancientTech' as ResourceType, effectId: 'PREMIUM_VOID_SHIELD', icon: '🛡️', color: 'text-purple-400' },
    { id: 'quant_luck', name: 'КВАНТОВАЯ УДАЧА', desc: 'Макс. шанс находок (5 мин)', cost: 500, res: 'rubies' as ResourceType, effectId: 'PREMIUM_QUANTUM_LUCK', icon: '🍀', color: 'text-amber-400' },
    { id: 'abs_zero', name: 'АБСОЛЮТНЫЙ НОЛЬ', desc: 'Нагрев отключен (2 мин)', cost: 200, res: 'emeralds' as ResourceType, effectId: 'PREMIUM_ABSOLUTE_ZERO', icon: '❄️', color: 'text-blue-300' },
    { id: 'mag_storm', name: 'МАГНИТНЫЙ ШТОРМ', desc: 'Ресурсы x3 (5 мин)', cost: 5000, res: 'gold' as ResourceType, effectId: 'PREMIUM_MAGNETIC_STORM', icon: '🧲', color: 'text-yellow-500' },
    { id: 'overdrive', name: 'ИНЪЕКЦИЯ ЯДРА', desc: 'Сила клика x5 (1 мин)', cost: 100, res: 'uranium' as ResourceType, effectId: 'PREMIUM_OVERDRIVE', icon: '☢️', color: 'text-red-500' },
    { id: 'chronos', name: 'ХРОНОС-ПОЛЕ', desc: 'Авто-добыча x3 (5 мин)', cost: 20, res: 'ancientTech' as ResourceType, effectId: 'PREMIUM_CHRONOS', icon: '⏳', color: 'text-pink-400' },
];

// =============================================================================
// GAME ENGINE: TIMING
// =============================================================================

export const GAME_TIMING = {
    /** Game tick interval in milliseconds */
    TICK_INTERVAL: 100,

    /** Ticks per second */
    TICKS_PER_SECOND: 10,

    /** Event check interval (in ticks) */
    EVENT_CHECK_TICKS: 50,

    /** Random event chance per check */
    EVENT_CHANCE: 0.1,

    /** Narrative log interval (in ticks) */
    NARRATIVE_TICKS: 150
} as const;

// =============================================================================
// GAME ENGINE: PROGRESSION
// =============================================================================

export const PROGRESSION = {
    /** Depth required to unlock Forge */
    FORGE_UNLOCK_DEPTH: 50,

    /** Depth required to unlock City */
    CITY_UNLOCK_DEPTH: 200,

    /** Depth required to unlock Skills */
    SKILLS_UNLOCK_DEPTH: 400,

    /** Depth required for storage level 1 */
    STORAGE_LVL1_DEPTH: 600,

    /** Depth interval for boss spawns */
    BOSS_SPAWN_INTERVAL: 500,

    /** Minimum depth for boss encounters */
    BOSS_MIN_DEPTH: 200,

    /** Boss spawn chance per tick when eligible */
    BOSS_SPAWN_CHANCE: 0.005
} as const;

// =============================================================================
// GAME ENGINE: COMBAT
// =============================================================================

export const COMBAT = {
    /** Shield charge rate per tick when drilling */
    SHIELD_CHARGE_RATE: 0.5,

    /** Shield drain rate per tick when active */
    SHIELD_DRAIN_RATE: 2.0,

    /** Shield passive leakage rate */
    SHIELD_LEAKAGE_RATE: 0.1,

    /** Damage reduction when shielding */
    SHIELD_DAMAGE_REDUCTION: 0.8,

    /** Overheat evasion penalty */
    OVERHEAT_EVASION_PENALTY: 0.5,

    /** Combat minigame trigger chance */
    MINIGAME_TRIGGER_CHANCE: 0.01
} as const;

// =============================================================================
// GAME ENGINE: HEAT & DRILLING
// =============================================================================

export const HEAT = {
    /** Critical heat threshold (triggers cooling minigame) */
    CRITICAL_THRESHOLD: 95,

    /** Maximum heat (triggers overheat) */
    MAX_HEAT: 100,

    /** Hull damage percentage on overheat */
    OVERHEAT_DAMAGE_PERCENT: 0.1,

    /** Base heat generation per tick */
    BASE_HEAT_GEN: 0.85
} as const;

export const DRILLING = {
    /** Resource gain multiplier from drilling */
    RESOURCE_MULTIPLIER: 0.3,

    /** Overdrive speed multiplier */
    OVERDRIVE_MULTIPLIER: 100,

    /** Minimum drilling efficiency (prevents softlock) */
    MIN_EFFICIENCY: 0.01,

    /** Efficiency penalty per missing tier */
    TIER_PENALTY: 0.5
} as const;

// =============================================================================
// DEATH & PENALTIES
// =============================================================================

export const DEATH = {
    /** Resource loss percentage on death */
    RESOURCE_LOSS_PERCENT: 0.3,

    /** Depth loss on death */
    DEPTH_LOSS: 50
} as const;
