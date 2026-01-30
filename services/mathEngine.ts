/**
 * Математическое Ядро Баланса v0.3.6
 * Централизованная система расчётов для всех игровых механик
 * 
 * Основано на:
 * - Sequential Thinking Analysis (22 мысли)
 * - Gemini Chat v0.3.6 Design Document
 * - User Decisions (Phase 1 approved)
 */

import { GLOBAL_BALANCE_CONFIG, RegionId, FuelType } from './mathEngineConfig';
import type { Resources, DrillState, EquipmentItem } from '../types';
import { calculateCargoWeight } from './gameMath';  // ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩУЮ СИСТЕМУ!

// ============================================
// DEPTH SCALING (Gemini Chat)
// ============================================

/**
 * Рассчитывает шкалу глубины для масштабирования характеристик
 * Используется для Boss HP, Resource Value, Event Difficulty
 * 
 * Формула: S_d = 1 + (Depth / DEPTH_UNIT)^ALPHA_PROG
 * 
 * @param depth - Текущая глубина бурения (метры)
 * @returns Множитель масштабирования (1.0 = базовый уровень)
 * 
 * @example
 * calculateDepthScale(0)      // 1.0   (0% бонуса)
 * calculateDepthScale(5000)   // 2.0   (100% бонуса)
 * calculateDepthScale(25000)  // 7.25  (~625% бонуса)
 */
export function calculateDepthScale(depth: number): number {
    return 1 + Math.pow(
        depth / GLOBAL_BALANCE_CONFIG.DEPTH_UNIT,
        GLOBAL_BALANCE_CONFIG.ALPHA_PROG
    );
}

// ============================================
// CRAFTING TIME (Gemini Chat)
// ============================================

/**
 * Рассчитывает время крафта equipment в Forge
 * ДЛЯ БУДУЩЕЙ Crafting Queue системы (Phase 2)
 * 
 * Формула: T_craft = BASE_CRAFT_TIME × Tier^1.5 × K_DIFF
 * 
 * @param tier - Тир предмета (1-15)
 * @returns Время крафта в секундах
 * 
 * @example
 * calculateCraftTime(1)   // 60s   (1 минута)
 * calculateCraftTime(5)   // 671s  (~11 минут)
 * calculateCraftTime(15)  // 3488s (~58 минут)
 */
export function calculateCraftTime(tier: number): number {
    return GLOBAL_BALANCE_CONFIG.BASE_CRAFT_TIME
        * Math.pow(tier, 1.5)
        * GLOBAL_BALANCE_CONFIG.K_DIFF;
}

// ============================================
// EQUIPMENT MASS & TOTAL MASS
// ============================================

/**
 * Рассчитывает массу одной детали бура по её ID
 * Использует массы из constants.tsx (сгенерированные формулами)
 * 
 * @param partId - ID детали (например: "bit_5", "engine_12")
 * @returns Масса детали в кг, или 0 если не найдена
 */
/**
 * Централизованный расчёт массы детали.
 * Используется как основной источник логики масштабирования массы в ядре.
 */
function getEquipmentMassById(partId: string): number {
    // Парсим ID для определения типа и тира
    const match = partId.match(/^(\w+)_(\d+)$/);
    if (!match) {
        // Поддержка специальных ID (например, fusion)
        if (partId.startsWith('fus_eng_')) return Math.round(584 + (parseInt(partId.split('_').pop() || '0') - 12) * 40);
        return 0;
    }

    const [, type, tierStr] = match;
    const tier = parseInt(tierStr, 10);

    // Формулы расчёта массы (Централизованная логика масштабирования)
    const formulas: Record<string, (t: number) => number> = {
        bit: (t) => Math.round(10 * Math.pow(t, 0.75)),
        eng: (t) => Math.round(80 * Math.pow(t, 0.8)),
        cool: (t) => Math.round(30 * Math.pow(t, 0.7)),
        hull: (t) => Math.round(500 * Math.pow(t, 0.875)),
        cpu: (t) => Math.round(5 * Math.pow(t, 0.6)),
        ctrl: (t) => Math.round(8 * Math.pow(t, 0.65)),
        gear: (t) => Math.round(50 * Math.pow(t, 0.8)),
        pwr: (t) => Math.round(100 * Math.pow(t, 0.85)),
        arm: (t) => Math.round(150 * Math.pow(t, 0.9)),
        shd: (t) => Math.round(20 * Math.pow(t, 1.3)),
        cargo: (t) => Math.round(200 * Math.pow(t, 0.85))
    };

    const formula = formulas[type] || formulas[type.substring(0, 3)];
    return formula ? formula(tier) : 0;
}

/**
 * Рассчитывает полную массу установленного на бур оборудования.
 * Является единственной точкой входа для получения массы в ядре.
 */
export function calculateDrillMass(drill: DrillState): number {
    let totalMass = 0;

    const parts = [
        drill.bit,
        drill.engine,
        drill.cooling,
        drill.hull,
        drill.logic,
        drill.control,
        drill.gearbox,
        drill.power,
        drill.armor,
        drill.shield,
        drill.cargoBay
    ];

    for (const part of parts) {
        if (part) {
            // Приоритизируем прямой пропс mass из данных (constants), 
            // но ядро (getEquipmentMassById) остается хозяином логики.
            totalMass += (part as any).mass ?? getEquipmentMassById(part.id);
        }
    }

    return totalMass;
}

/**
 * Рассчитывает полную массу для Global Map путешествий
 * ИСПРАВЛЕННАЯ ФОРМУЛА: M_total = M_drill + M_payload
 * M_payload = M_cargo (включая топливо) + M_inventory_equipment
 * 
 * @param drill - Текущее состояние бура
 * @param resources - Ресурсы игрока
 * @param equipmentInventory - Оборудование в инвентаре
 * @returns Объект с Gross Weight (полная масса) и Payload (полезная нагрузка)
 */
export function calculateTotalMass(
    drill: DrillState,
    resources: Partial<Resources>,
    equipmentInventory: EquipmentItem[] = []
): { grossWeight: number; payload: number } {
    // Масса установленного оборудования (структура бура)
    const drillMass = calculateDrillMass(drill);

    // Масса ресурсов в инвентаре (УЖЕ включает топливо через RESOURCE_WEIGHTS!)
    const cargoMass = calculateCargoWeight(resources);

    // Масса оборудования в инвентаре (Phase 2.3)
    const inventoryMass = equipmentInventory.reduce((acc, item) => {
        // У InventoryItem может не быть поля mass, если это сокращенный тип, 
        // поэтому берем через ID, но там в mathEngine.ts уже есть кэширование/формулы
        return acc + getEquipmentMassById(item.partId);
    }, 0);

    const payload = cargoMass + inventoryMass;

    return {
        grossWeight: drillMass + payload,
        payload
    };
}

// ============================================
// GLOBAL MAP PHYSICS
// ============================================

/**
 * Рассчитывает расход топлива на путешествие
 * КВАДРАТИЧНАЯ зависимость от полезной нагрузки (Payload)
 * 
 * Формула: F = (D / L_type) × (1 + (Payload / Capacity)² × K_drag)
 * 
 * @param distance - Расстояние (км)
 * @param payload - Текущая полезная нагрузка (кг)
 * @param maxCapacity - Максимальная грузоподъёмность (кг)
 * @param fuelType - Тип топлива ('coal' | 'oil' | 'gas')
 * @param regionId - ID региона для регионального модификатора
 * @returns Количество единиц топлива
 */
export function calculateFuelConsumption(
    distance: number,
    payload: number,
    maxCapacity: number,
    fuelType: FuelType,
    regionId: RegionId
): number {
    const L_type = GLOBAL_BALANCE_CONFIG.FUEL_EFFICIENCY[fuelType];
    const K_drag = GLOBAL_BALANCE_CONFIG.REGION_DRAG[regionId];

    // Квадратичная зависимость от ЗАГРУЗКИ (payload / capacity)
    const loadFactor = Math.pow(payload / maxCapacity, GLOBAL_BALANCE_CONFIG.MASS_PENALTY);
    const baseConsumption = distance / L_type;

    return baseConsumption * (1 + loadFactor * K_drag);
}

/**
 * Рассчитывает фактическую скорость движения
 * Учитывает полезную нагрузку и эффективность двигателя
 * 
 * Формула: V_act = V_base × (1 - SPEED_PENALTY_FACTOR × Payload/Capacity) × η_engine
 * 
 * @param baseSpeed - Базовая скорость (км/ч)
 * @param payload - Текущая полезная нагрузка (кг)
 * @param maxCapacity - Максимальная грузоподъёмность (кг)
 * @param engineEfficiency - Эффективность двигателя (1.0 = 100%)
 * @returns Фактическая скорость (км/ч)
 */
export function calculateTravelSpeed(
    baseSpeed: number,
    payload: number,
    maxCapacity: number,
    engineEfficiency: number
): number {
    const loadRatio = payload / maxCapacity;
    const speedPenalty = GLOBAL_BALANCE_CONFIG.SPEED_PENALTY_FACTOR * loadRatio;

    let actualSpeed = baseSpeed * (1 - speedPenalty) * engineEfficiency;

    // Ограничение снизу: минимум 20% базовой скорости
    actualSpeed = Math.max(actualSpeed, baseSpeed * GLOBAL_BALANCE_CONFIG.MIN_TRAVEL_SPEED_PERCENT);

    return actualSpeed;
}

/**
 * Рассчитывает время путешествия (в миллисекундах)
 * 
 * @param distance - Расстояние (км)
 * @param speed - Скорость (км/ч)
 * @returns Время в ms
 */
export function calculateTravelDuration(distance: number, speed: number): number {
    if (speed <= 0) return 0;
    const hours = distance / speed;
    return hours * 3600 * 1000; // Часы в миллисекунды
}

/**
 * Рассчитывает вероятность инцидента во время путешествия
 * 
 * @param distance - Расстояние (км)
 * @param payload - Текущая загрузка (кг)
 * @param maxCapacity - Максимальная грузоподъёмность (кг)
 * @param regionId - ID региона
 * @returns Вероятность инцидента (0-1)
 */
export function calculateIncidentProbability(
    distance: number,
    payload: number,
    maxCapacity: number,
    regionId: RegionId
): number {
    const P_base = GLOBAL_BALANCE_CONFIG.REGION_BASE_INCIDENT[regionId];
    const K_weight = GLOBAL_BALANCE_CONFIG.K_WEIGHT_INCIDENT;
    const loadRatio = payload / maxCapacity;

    // Lambda для Poisson распределения
    const lambda = (distance / 1000) * (P_base + K_weight * loadRatio);

    // Вероятность хотя бы одного инцидента
    const probability = 1 - Math.exp(-lambda);

    // Ограничение сверху (не может быть > 75%)
    return Math.min(probability, GLOBAL_BALANCE_CONFIG.MAX_INCIDENT_CHANCE);
}

/**
 * Рассчитывает бонус охлаждения при движении
 * КВАДРАТИЧНАЯ зависимость от скорости (конвекция)
 * 
 * Формула: ΔC = C_base × (1 + (V_act/V_base)²)
 * 
 * @param baseCooling - Базовое охлаждение (из Cooler Part)
 * @param actualSpeed - Фактическая скорость (км/ч)
 * @param baseSpeed - Базовая скорость без груза (км/ч)
 * @returns Эффективное охлаждение в пути
 * 
 * @example
 * // Cooling 100, скорость 75% от максимума
 * calculateTravelCooling(100, 75, 100)
 * // = 100 × (1 + 0.75²) = 156.25 (на 56% лучше!)
 */
export function calculateTravelCooling(
    baseCooling: number,
    actualSpeed: number,
    baseSpeed: number
): number {
    const speedRatio = actualSpeed / baseSpeed;

    // Квадратичная конвекция (физически более корректно)
    const coolingMultiplier = 1 + Math.pow(speedRatio, GLOBAL_BALANCE_CONFIG.CONVECTION_FACTOR);

    return baseCooling * coolingMultiplier;
}

// ============================================
// VALIDATION & SAFETY
// ============================================

/**
 * Проверяет возможность путешествия
 * Валидация перед стартом
 * 
 * @param payload - Текущая полезная нагрузка (кг)
 * @param maxCapacity - Максимальная грузоподъёмность (кг)
 * @param fuelAvailable - Доступное топливо
 * @param fuelNeeded - Требуемое топливо
 * @returns Объект с флагом allowed и причиной отказа (если есть)
 */
export function canTravel(
    payload: number,
    maxCapacity: number,
    fuelAvailable: number,
    fuelNeeded: number
): { allowed: boolean; reason?: string } {
    // Проверка перегруза (ТОЛЬКО полезная нагрузка vs вместимость)
    if (payload > maxCapacity) {
        const overloadPercent = ((payload / maxCapacity - 1) * 100).toFixed(0);
        return {
            allowed: false,
            reason: `Перегруз склада! ${Math.round(payload)}кг / ${maxCapacity}кг (+${overloadPercent}%)`
        };
    }

    // Проверка топлива
    if (fuelAvailable < fuelNeeded) {
        return {
            allowed: false,
            reason: `Недостаточно топлива! Нужно ${fuelNeeded.toFixed(1)}, есть ${fuelAvailable.toFixed(1)}`
        };
    }

    return { allowed: true };
}
