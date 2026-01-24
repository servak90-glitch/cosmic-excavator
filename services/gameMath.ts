
import { DrillState, Resources, GameState, ResourceType, EquipmentItem } from '../types';
import { calculateSkillModifiers } from './skillRegistry';
import { ARTIFACTS } from './artifactRegistry';
import { calculateTotalMass, calculateDepthScale } from './mathEngine';

// [DEV_CONTEXT: HARDCORE MATH]
const BASE_CARGO_CAPACITY = 5000;

// 1. Rock Density: Every 800m requires +1 Tier of Drill Bit.
export const getRockDensity = (depth: number) => {
    return 1 + Math.floor(depth / 800);
};

// 2. Ambient Heat: Temperature rises with depth.
// 50,000m = 50% base heat.
export const getAmbientTemp = (depth: number) => {
    return Math.min(50, depth / 1000);
};

// 3. Repair Cost: Exponential scaling with depth + Critical Tax
export const calculateRepairCost = (depth: number, currentHp: number, maxHp: number): { resource: ResourceType, cost: number } => {
    const missingHp = maxHp - currentHp;
    if (missingHp <= 0) return { resource: ResourceType.STONE, cost: 0 };
    // Resource Tiering based on Depth
    let resource: ResourceType = ResourceType.STONE;
    if (depth > 40000) resource = ResourceType.TITANIUM;
    else if (depth > 15000) resource = ResourceType.GOLD;
    else if (depth > 4000) resource = ResourceType.IRON;

    // Depth Multiplier
    const depthMult = 1 + (depth / 1000); // Повышено (было /2000)
    const isCritical = (currentHp / maxHp) < 0.20;
    const criticalMult = isCritical ? 2.0 : 1.0; // Повышено (было 1.5)

    const cost = Math.ceil(missingHp * 2 * depthMult * criticalMult); // Коэффициент x2 (было x1)

    return { resource, cost };
};

// 4. Shield Recharge Cost
export const calculateShieldRechargeCost = (depth: number): { resource: ResourceType, cost: number } => {
    if (depth < 2000) return { resource: ResourceType.STONE, cost: 0 }; // Free early game

    let resource: ResourceType = ResourceType.STONE;
    let baseCost = 100;

    if (depth > 30000) { resource = ResourceType.URANIUM; baseCost = 100; }
    else if (depth > 15000) { resource = ResourceType.GOLD; baseCost = 200; }
    else if (depth > 5000) { resource = ResourceType.IRON; baseCost = 400; }
    else { resource = ResourceType.COPPER; baseCost = 600; }

    const cost = Math.ceil(baseCost * (1 + depth / 5000)); // Ускоренный рост (было /10000)
    return { resource, cost };
};

// === CARGO SYSTEM (GLOBAL MAP) ===

/**
 * Вес каждого ресурса (единиц веса на 1 единицу ресурса)
 * Используется для расчёта грузоподъёмности бура при перемещении между регионами
 */
export const RESOURCE_WEIGHTS: Record<keyof Resources, number> = {
    // Базовые материалы (тяжёлые)
    clay: 2,
    stone: 3,
    copper: 4,
    iron: 5,

    // Драгметаллы (средние)
    silver: 3,
    gold: 4,
    titanium: 5,
    uranium: 6,

    // Редкие (лёгкие, но ценные)
    nanoSwarm: 1,
    ancientTech: 2,
    rubies: 1,
    emeralds: 1,
    diamonds: 1,

    // Топливо (MVP)
    coal: 3,
    oil: 2,
    gas: 1,
    ice: 2,
    scrap: 2,
    credits: 0,
    repairKit: 5,
    coolantPaste: 3,
    advancedCoolant: 4,
};

/**
 * Рассчитывает текущий вес груза игрока
 * @param resources - Ресурсы игрока (inventory)
 * @returns Общий вес в единицах
 */
export function calculateCargoWeight(resources: Partial<Resources>): number {
    // [DEV_CONTEXT: CHEAT] Zero Weight
    const s = (globalThis as any).gameStore?.getState?.();
    if (s?.isZeroWeight) return 0;

    let totalWeight = 0;

    for (const [resource, amount] of Object.entries(resources)) {
        const weight = RESOURCE_WEIGHTS[resource as keyof Resources] || 0;
        totalWeight += (amount || 0) * weight;
    }

    return totalWeight;
}

/**
 * Рассчитывает общее количество топлива в условных единицах
 */
export function calculateTotalFuel(resources: Partial<Resources>): number {
    return (resources.coal || 0) + (resources.oil || 0) * 1.5 + (resources.gas || 0) * 2;
}

/**
 * Вспомогательная функция для обновления currentCargoWeight в state
 * Используется в слайсах при изменении ресурсов
 * @param resources - Текущие ресурсы игрока
 * @returns Обновлённый вес груза
 */
export function recalculateCargoWeight(resources: Resources): number {
    return calculateCargoWeight(resources);
}



// UI UTILITY: Compact Number Formatting
export const formatCompactNumber = (num: number): string => {
    if (num === 0 || isNaN(num)) return '0';
    if (num < 0) return '-' + formatCompactNumber(Math.abs(num));

    // [UI REBALANCE] Всегда возвращаем целое число до 1000м, чтобы не растягивать UI
    if (num < 1000) return Math.floor(num).toString();

    const suffixes = ['', 'k', 'M', 'B', 'T'];
    const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);

    if (suffixNum >= suffixes.length) return '∞';

    let shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));

    // [UI REBALANCE] Даже для больших чисел убираем дробную часть если возможно
    return Math.floor(shortValue) + suffixes[suffixNum];
};

// === КЭШИРОВАНИЕ calculateStats ===
// Кэш предотвращает повторные вычисления при неизменных входных данных

interface StatsCache {
    key: string;
    result: ReturnType<typeof calculateStatsInternal>;
    timestamp: number;
}

let statsCache: StatsCache | null = null;
const CACHE_TTL = 100; // Время жизни кэша в мс (10 тиков)

/**
 * Генерация ключа кэша на основе входных данных
 */
function generateCacheKey(
    drill: DrillState,
    skillLevels: GameState['skillLevels'],
    equippedArtifacts: string[],
    currentDepth: number
): string {
    // Ключевые данные, влияющие на результат
    return JSON.stringify({
        bit: drill.bit?.id,
        engine: drill.engine?.id,
        cooling: drill.cooling?.id,
        hull: drill.hull?.id,
        logic: drill.logic?.id,
        control: drill.control?.id,
        gearbox: drill.gearbox?.id,
        power: drill.power?.id,
        armor: drill.armor?.id,
        skills: Object.keys(skillLevels).sort().map(k => `${k}:${skillLevels[k]}`).join(','),
        artifacts: equippedArtifacts.filter(Boolean).sort().join(','),
        depthTier: Math.floor(currentDepth / 100) // Округляем глубину до 100м
    });
}

/**
 * Обёртка с кэшированием
 */
export const calculateStats = (
    drill: DrillState,
    skillLevels: GameState['skillLevels'],
    equippedArtifacts: string[],
    inventory: GameState['inventory'],
    currentDepth: number = 0
) => {
    const now = Date.now();
    const cacheKey = generateCacheKey(drill, skillLevels, equippedArtifacts, currentDepth);

    // Проверяем кэш
    if (statsCache && statsCache.key === cacheKey && (now - statsCache.timestamp) < CACHE_TTL) {
        return statsCache.result;
    }

    // Вычисляем новый результат
    const result = calculateStatsInternal(drill, skillLevels, equippedArtifacts, inventory, currentDepth);

    // Обновляем кэш
    statsCache = { key: cacheKey, result, timestamp: now };

    return result;
};

const calculateStatsInternal = (
    drill: DrillState,
    skillLevels: GameState['skillLevels'],
    equippedArtifacts: string[],
    inventory: GameState['inventory'],
    currentDepth: number = 0
) => {

    // Defensive check for corrupted state
    if (!drill || !drill.bit || !drill.power || !drill.engine || !drill.cooling || !drill.hull || !drill.logic || !drill.control || !drill.gearbox || !drill.armor) {
        console.warn("Invalid drill state in calculateStats, using safe defaults", drill);
        return {
            energyProd: 0,
            energyCons: 0,
            energyEfficiency: 1,
            totalDamage: 0,
            totalSpeed: 0,
            totalCooling: 0,
            torque: 0,
            critChance: 0,
            luck: 0,
            predictionTime: 0,
            clickMult: 1,
            ventSpeed: 1,
            defense: 0,
            evasion: 0,
            hazardResist: 0,
            integrity: 100,
            regen: 0,
            droneEfficiency: 1,
            drillingEfficiency: 1,
            ambientHeat: 0,
            requiredTier: 1,
            skillMods: { clickPowerPct: 0, autoSpeedPct: 0, heatGenReductionPct: 0, resourceMultPct: 0, residueEffPct: 0, xpGainPct: 0, buffDurationPct: 0, critChance: 0, coolingPowerPct: 0, globalSpeedPct: 0, analysisSpeedPct: 0 },
            artifactMods: { clickPowerPct: 0, drillSpeedPct: 0, heatGenPct: 0, resourceMultPct: 0, luckPct: 0, shopDiscountPct: 0 }
        };
    }

    const energyProd = drill.power.baseStats.energyOutput;
    const baseEnergyCons = drill.bit.baseStats.energyCost + drill.engine.baseStats.energyCost + drill.cooling.baseStats.energyCost +
        drill.logic.baseStats.energyCost + drill.control.baseStats.energyCost + drill.gearbox.baseStats.energyCost +
        drill.armor.baseStats.energyCost + (drill.cargoBay?.baseStats?.energyCost || 0);

    // [NEW v4.0.1] Глубинный коэффициент сложности
    const depthScale = calculateDepthScale(currentDepth);
    const energyCons = baseEnergyCons * depthScale;

    // [DEV_CONTEXT: CHEAT] Infinite Energy
    const storeState = (globalThis as any).gameStore?.getState?.();
    const energyEfficiency = storeState?.isInfiniteEnergy ? 1.0 : (energyProd >= energyCons ? 1.0 : (energyProd / Math.max(1, energyCons)));

    const totalCargoCapacity = BASE_CARGO_CAPACITY +
        (drill.hull.baseStats.cargoCapacity || 0) +
        (drill.cargoBay?.baseStats?.cargoCapacity || 0);

    // Calculate Artifact Modifiers
    const artifactMods = {
        clickPowerPct: 0,
        drillSpeedPct: 0,
        heatGenPct: 0,
        resourceMultPct: 0,
        luckPct: 0,
        shopDiscountPct: 0
    };

    equippedArtifacts.forEach(id => {
        const item = inventory[id];
        if (item) {
            const def = ARTIFACTS.find(a => a.id === item.defId);
            if (def && def.modifiers) {
                if (def.modifiers.clickPowerPct) artifactMods.clickPowerPct += def.modifiers.clickPowerPct;
                if (def.modifiers.drillSpeedPct) artifactMods.drillSpeedPct += def.modifiers.drillSpeedPct;
                if (def.modifiers.heatGenPct) artifactMods.heatGenPct += def.modifiers.heatGenPct;
                if (def.modifiers.resourceMultPct) artifactMods.resourceMultPct += def.modifiers.resourceMultPct;
                if (def.modifiers.luckPct) artifactMods.luckPct += def.modifiers.luckPct;
                if (def.modifiers.shopDiscountPct) artifactMods.shopDiscountPct += def.modifiers.shopDiscountPct;
            }
        }
    });

    const skillMods = calculateSkillModifiers(skillLevels);

    // --- HARDCORE MECHANICS ---

    // 1. Density Penalty
    const requiredTier = getRockDensity(currentDepth);
    const tierDiff = drill.bit.tier - requiredTier;
    let drillingEfficiency = 1.0;

    if (tierDiff < 0) {
        // Exponential penalty: 0.5x per missing tier
        drillingEfficiency = Math.pow(0.5, Math.abs(tierDiff));
        // Hard cap minimum speed to avoid total softlock (1%)
        drillingEfficiency = Math.max(0.01, drillingEfficiency);
    }

    // 2. Ambient Heat
    const ambientHeat = getAmbientTemp(currentDepth);
    // Cooling becomes harder deep underground (air is hot)
    const coolingEfficiencyEnv = Math.max(0.1, 1.0 - (currentDepth / 100000));

    // [DEV_CONTEXT: EVASION PROTOCOL]
    // Base formula: 0.5% per tier of Engine + Logic
    const baseEvasion = (drill.engine.tier * 0.5) + (drill.logic.tier * 0.5);
    // Hard Cap 60%
    const totalEvasion = Math.min(60, baseEvasion);

    return {
        energyProd,
        energyCons,
        energyEfficiency,
        totalDamage: drill.bit.baseStats.damage * (1 + (skillMods.clickPowerPct + artifactMods.clickPowerPct) / 100) * energyEfficiency * drillingEfficiency,
        totalSpeed: drill.engine.baseStats.speed * (1 + (skillMods.autoSpeedPct + artifactMods.drillSpeedPct) / 100) * energyEfficiency * drillingEfficiency,
        totalCooling: drill.cooling.baseStats.cooling * (1 + (skillMods.coolingPowerPct) / 100) * energyEfficiency * coolingEfficiencyEnv,
        totalCargoCapacity: totalCargoCapacity,
        torque: drill.gearbox.baseStats.torque || 0,
        critChance: drill.logic.baseStats.critChance + skillMods.critChance,
        luck: (drill.logic.baseStats.luck || 0) + artifactMods.luckPct,
        predictionTime: drill.logic.baseStats.predictionTime || 0,
        clickMult: drill.control.baseStats.clickMultiplier * (1 + (skillMods.clickPowerPct + artifactMods.clickPowerPct) / 100),
        ventSpeed: drill.control.baseStats.ventSpeed || 1.0,
        defense: drill.armor.baseStats.defense,
        evasion: totalEvasion,
        hazardResist: drill.armor.baseStats.hazardResist || 0,
        integrity: drill.hull.baseStats.maxIntegrity,
        regen: drill.hull.baseStats.regen || 0,
        droneEfficiency: drill.power.baseStats.droneEfficiency || 1.0,
        travelSpeed: 50 + (drill.engine.tier * 25), // км/ч
        skillMods,
        artifactMods,
        // Exposed for UI/Logic
        drillingEfficiency,
        ambientHeat,
        requiredTier,
        depthScale // [NEW] Коэффициент сложности на текущей глубине
    };
};

import { TL } from './localization';

export const getResourceLabel = (res: string): any => {
    // Check if it's a standard resource from TL
    const tlRes = (TL.resources as any)[res];
    if (tlRes) return tlRes;

    const labels: Record<string, any> = {
        XP: { RU: 'ОПЫТ', EN: 'XP' },
        DEPTH: { RU: 'ГЛУБИНА', EN: 'DEPTH' },
        coal: { RU: 'УГОЛЬ', EN: 'COAL' },
        oil: { RU: 'НЕФТЬ', EN: 'OIL' },
        gas: { RU: 'ГАЗ', EN: 'GAS' }
    };
    return labels[res] || { RU: res.toUpperCase(), EN: res.toUpperCase() };
};

