

export enum View {
  DRILL = 'DRILL',
  CITY = 'CITY',
  FORGE = 'FORGE',
  SKILLS = 'SKILLS',
  CODEX = 'CODEX',
  COMBAT = 'COMBAT',
  GLOBAL_MAP = 'GLOBAL_MAP'
}

export type Language = 'RU' | 'EN';
export type LocalizedString = { RU: string; EN: string } | string;


export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  drillVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  drillMuted: boolean;
  language: Language;
  graphicsQuality: 'low' | 'medium' | 'high';
}

export enum ResourceType {
  CLAY = 'clay',
  STONE = 'stone',
  COPPER = 'copper',
  IRON = 'iron',
  SILVER = 'silver',
  GOLD = 'gold',
  TITANIUM = 'titanium',
  URANIUM = 'uranium',
  NANO_SWARM = 'nanoSwarm',
  ANCIENT_TECH = 'ancientTech',
  RUBIES = 'rubies',
  EMERALDS = 'emeralds',
  DIAMONDS = 'diamonds',
  COAL = 'coal',
  OIL = 'oil',
  GAS = 'gas',
  ICE = 'ice',           // NEW: Phase 3
  SCRAP = 'scrap',
  CREDITS = 'credits',
  // Consumables as resources for easy count tracking
  REPAIR_KIT = 'repairKit',
  COOLANT_PASTE = 'coolantPaste',
  ADVANCED_COOLANT = 'advancedCoolant'
}

export type Resources = {
  [key in ResourceType]: number;
};

// === GLOBAL MAP: REGIONS ===

/**
 * ID регионов планеты Aegis-7
 */
export enum RegionId {
  RUST_VALLEY = 'rust_valley',        // Стартовый регион (0, 0)
  CRYSTAL_WASTES = 'crystal_wastes',  // Север (0, 1000)
  IRON_GATES = 'iron_gates',          // Восток (1000, 0)
  MAGMA_CORE = 'magma_core',          // Юго-запад (-700, -700)
  VOID_CHASM = 'void_chasm'           // Северо-восток (700, 700)
}

/**
 * Цвет зоны региона (динамически зависит от player level)
 * green = легко, yellow = умеренно, red = опасно
 */
export type ZoneColor = 'green' | 'yellow' | 'red';

/**
 * Регион планеты Aegis-7
 */
export interface Region {
  id: RegionId;
  name: LocalizedString;                              // Название
  coordinates: { x: number; y: number };     // Координаты на глобальной карте
  recommendedLevel: number;                  // Рекомендуемый минимальный уровень игрока
  baseZoneColor: ZoneColor;                  // Базовый цвет зоны

  // Ресурсные бонусы (множители к базовой добыче)
  resourceBonuses?: Partial<Record<ResourceType, number>>;

  // Lore description
  description?: LocalizedString;

  // NEW: Tactical Scanner Phase 5
  tierLimit: number; // Максимальный тир крафта в этом регионе
}

// === LICENSES & PERMITS ===

export type ZoneLicense = 'green' | 'yellow' | 'red';
export type PermitType = 'temporary' | 'permanent';

export interface License {
  zone: ZoneLicense;
  acquiredAt: number;  // timestamp
}

export interface Permit {
  regionId: RegionId;
  type: PermitType;
  expirationDate: number | null;  // null = permanent, timestamp otherwise
}

export interface ReputationTier {
  tier: 1 | 2 | 3 | 4 | 5;
  min: number;
  max: number;
  name: string;
  discount: number;
}

export interface FactionPerk {
  id: string;
  levelRequired: number;
  name: LocalizedString;
  description: LocalizedString;
  effectType: 'MARKET' | 'LOGISTICS' | 'SCANNER' | 'COMBAT' | 'PASSIVE';
  value?: number;
}


export interface FactionDef {
  id: FactionId;
  name: string;
  description: string;
  perks: FactionPerk[];
}

// === PLAYER BASES ===

export type BaseType = 'outpost' | 'camp' | 'station';
export type BaseStatus = 'building' | 'active' | 'abandoned' | 'damaged' | 'under_attack';

export interface DroneStation {
  level: number;
  fuelStorage: {
    coal: number;
    oil: number;
    gas: number;
  };
  maxFuelStorage: number;
  activeDrones: number;
  maxDrones: number;
  maintenanceLevel: number; // 0-100%
}

export interface BaseDefense {
  infantry: number;   // "Стражи"
  drones: number;     // "Перехватчики"
  turrets: number;    // "Сентинелы"
  integrity: number;  // 0-100%
  shields: number;    // Заряд щита базы
}

export type DefenseUnitType = 'infantry' | 'drone' | 'turret' | 'shield_gen';

export interface PlayerBase {
  id: string;
  regionId: RegionId;
  type: BaseType;
  status: BaseStatus;

  defense: BaseDefense;

  // Storage
  storageCapacity: number;
  storedResources: Partial<Resources>;

  // Features
  hasWorkshop: boolean;
  workshopTierRange: [number, number] | null;  // Tier range для крафта
  hasFuelFacilities: boolean;
  hasMarket: boolean;  // Только для Station
  hasFortification: boolean;
  hasGuards: boolean;

  // Timing
  constructionStartTime: number;
  constructionCompletionTime: number;
  lastVisitedAt: number;

  upgradeLevel: number;

  // === PHASE 2: FUEL FACILITIES ===
  facilities: FacilityId[];  // Построенные facilities в этой базе

  // === PHASE 4: DEFENSE PRODUCTION ===
  productionQueue: DefenseProductionJob[];

  // === NEW: DRONE STATION (Phase 5.1) ===
  droneStation?: DroneStation;
}

export interface DefenseProductionJob {
  id: string;
  unitType: DefenseUnitType;
  startTime: number;
  completionTime: number;
}

// === PHASE 2: FUEL & CRAFTING FACILITIES ===

export type FacilityId = 'basic_refinery' | 'advanced_refinery' | 'workshop_facility' | 'advanced_workshop' | 'research_lab';

export interface Facility {
  id: FacilityId;
  name: LocalizedString;
  cost: number;
  description: LocalizedString;
  unlocksRecipes: string[];  // Recipe IDs (Fuel or Crafting)
}

export interface CraftingRecipe {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  requiredFacility?: FacilityId;
  input: Array<{ resource: ResourceType; amount: number }>;
  output: { resource: ResourceType; amount: number };
  craftTime?: number; // В миллисекундах, опционально (пока мгновенно)
}


// === PHASE 2: DYNAMIC MARKET ===

export interface MarketPrice {
  resource: keyof Resources;
  basePrice: number;           // Из RESOURCE_PRICES
  regionalModifier: number;    // Зависит от региона
  temporalModifier: number;    // События, день недели
  finalPrice: number;          // Итоговая цена
}

export interface MarketTransaction {
  type: 'buy' | 'sell';
  resource: keyof Resources;
  amount: number;
  pricePerUnit: number;
  totalCost: number;
  regionId: RegionId;
  timestamp: number;
}

// === PHASE 2: CARAVAN SYSTEM ===

export type CaravanTier = '1star' | '2star' | '3star';  // Phase 2: только 1star
export type CaravanStatus = 'in_transit' | 'completed' | 'lost';

export interface Caravan {
  id: string;
  tier: CaravanTier;
  fromBaseId: string;
  toBaseId: string;
  cargo: Partial<Resources>;
  cargoWeight: number;

  departureTime: number;
  arrivalTime: number;
  status: CaravanStatus;

  lossChance: number;  // Вычисляется при отправке
}

export interface CaravanUnlock {
  tier: CaravanTier;
  unlocked: boolean;
  unlockedAt?: number;
}


// === EVENT SYSTEM ===

/**
 * Event Trigger: определяет контекст, когда может сработать событие
 */
export enum EventTrigger {
  DRILLING = 'drilling',
  TRAVELING = 'traveling',
  TRAVEL = 'travel',  // Для Global Map путешествий
  BASE_VISIT = 'base_visit',
  MARKET_UPDATE = 'market_update',
  COMBAT = 'combat',

  // Новые триггеры для логистических событий
  GLOBAL_MAP_ACTIVE = 'global_map_active',
  CARAVAN_TRAVELING = 'caravan_traveling',
  STUCK_IN_SPACE = 'stuck_in_space',
  BASE_RAID = 'base_raid'
}

export enum ArtifactRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  ANOMALOUS = 'ANOMALOUS'
}


export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Godly';

export type VisualEffectType = 'NONE' | 'GLOW_PURPLE' | 'GLOW_GOLD' | 'GLITCH_RED' | 'MATRIX_GREEN' | 'FROST_BLUE' | 'FIRE_BURST' | 'EMP_SHOCK';

export interface Stats {
  energyProd: number;
  energyCons: number;
  energyEfficiency: number;
  totalDamage: number;
  totalSpeed: number;
  totalCooling: number;
  torque: number;
  critChance: number;
  luck: number;
  predictionTime: number;
  clickMult: number;
  ventSpeed: number;
  defense: number;
  evasion: number;
  hazardResist: number;
  integrity: number;
  regen: number;
  droneEfficiency: number;
  drillingEfficiency: number;
  ambientHeat: number;
  requiredTier: number;
  totalCargoCapacity?: number; // [NEW v4.0] Общая грузоподъемность (база + модули)
  // Using simplified types for mods to avoid huge interface duplication
  skillMods: Record<string, number>;
  artifactMods: Record<string, number>;
}

export interface CombatMinigame {
  active: boolean;
  type: CombatMinigameType;
  difficulty: number;
}

export type DrillFX =
  | 'pixel_sparks_brown'
  | 'blue_glint'
  | 'fractal_rainbow_trail'
  | 'white_hole_distortion'
  | 'static_noise_overlay'
  | 'golden_aura_vfx'
  | 'infinite_loop_glow'
  | 'none';

export interface ArtifactDefinition {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  loreDescription: LocalizedString;

  rarity: ArtifactRarity;
  icon: string;
  basePrice: number;
  scrapAmount: number;
  visualEffect?: VisualEffectType;
  allowedBiomes?: string[];

  effectDescription: LocalizedString;

  modifiers: {
    heatGenPct?: number;
    resourceMultPct?: number;
    drillSpeedPct?: number;
    clickPowerPct?: number;
    luckPct?: number;
    shopDiscountPct?: number;
  };
}

export interface InventoryItem {
  instanceId: string;
  defId: string;
  acquiredAt: number;
  isIdentified: boolean;
  isEquipped: boolean;
}

// --- DRILL PARTS ---

export enum DrillSlot {
  BIT = 'bit',
  ENGINE = 'engine',
  COOLING = 'cooling',
  HULL = 'hull',
  LOGIC = 'logic',
  CONTROL = 'control',
  GEARBOX = 'gearbox',
  POWER = 'power',
  ARMOR = 'armor',
  CARGO_BAY = 'cargoBay'
}

export interface BaseDrillPart {
  id: string;
  name: LocalizedString;
  tier: number;
  rarity: ItemRarity;
  description: LocalizedString;
  cost: Partial<Resources>;
  blueprintId?: string; // Required blueprint to unlock this part
  mass?: number; // [NEW v4.0.1] Масса детали (кг)
}


export interface DrillPart extends BaseDrillPart {
  baseStats: {
    damage: number;
    energyCost: number;
  };
  fxId?: DrillFX;
}

export interface EnginePart extends BaseDrillPart {
  baseStats: {
    speed: number;
    energyCost: number;
  };
}

export interface CoolerPart extends BaseDrillPart {
  baseStats: {
    cooling: number;
    energyCost: number;
  };
}

export interface HullPart extends BaseDrillPart {
  baseStats: {
    maxIntegrity: number;
    regen: number;
    slots: number;
    heatCap: number;
    cargoCapacity: number;  // [NEW v4.0] Грузоподъёмность для Global Map (tier-based: 500-10000)
  };
}

export interface LogicPart extends BaseDrillPart {
  baseStats: {
    critChance: number;
    luck: number;
    energyCost: number;
    predictionTime?: number;
  };
}

export interface ControlPart extends BaseDrillPart {
  baseStats: {
    clickMultiplier: number;
    ventSpeed: number;
    energyCost: number;
  };
}

export interface GearboxPart extends BaseDrillPart {
  baseStats: {
    torque: number;
    energyCost: number;
  };
}

export interface PowerCorePart extends BaseDrillPart {
  baseStats: {
    energyOutput: number;
    droneEfficiency: number;
  };
}

export interface ArmorPart extends BaseDrillPart {
  baseStats: {
    defense: number;
    hazardResist: number;
    energyCost: number;
  };
}

export interface CargoBayPart extends BaseDrillPart {
  baseStats: {
    cargoCapacity: number;
    energyCost: number;
  };
}

export interface DrillState {
  [DrillSlot.BIT]: DrillPart;
  [DrillSlot.ENGINE]: EnginePart;
  [DrillSlot.COOLING]: CoolerPart;
  [DrillSlot.HULL]: HullPart;
  [DrillSlot.LOGIC]: LogicPart;
  [DrillSlot.CONTROL]: ControlPart;
  [DrillSlot.GEARBOX]: GearboxPart;
  [DrillSlot.POWER]: PowerCorePart;
  [DrillSlot.ARMOR]: ArmorPart;
  [DrillSlot.CARGO_BAY]: CargoBayPart;
}

export type FusionConditionType = 'ZERO_HEAT' | 'MAX_HEAT' | 'DEPTH_REACHED' | 'NO_DAMAGE';

export interface FusionCondition {
  type: FusionConditionType;
  target: number;
  description: LocalizedString;
}

export interface MergeRecipe {
  id: string;
  resultId: string;
  componentAId: string;
  componentBId: string;
  catalyst: {
    resource: ResourceType;
    amount: number;
  };
  condition?: FusionCondition;
  description: LocalizedString;
}


export type HazardType = 'NONE' | 'CORROSION' | 'MAGNETIC' | 'HEAT_REFLECTION' | 'RADIATION' | 'VOID_PRESSURE';

export interface Biome {
  name: LocalizedString;
  depth: number;
  resource: ResourceType;
  color: string;
  description: LocalizedString;

  hub?: string;
  hazard: HazardType;
  hazardLevel: number;
  gemResource?: ResourceType;
}

export enum BossType {
  WORM = 'WORM',
  CORE = 'CORE',
  CONSTRUCT = 'CONSTRUCT',
  SWARM = 'SWARM',
  VOID_SENTINEL = 'VOID_SENTINEL'
}

// --- ABILITY SYSTEM ---
export type AbilityType = 'EMP_BURST' | 'THERMAL_STRIKE' | 'BARRIER' | 'OVERLOAD';

export interface AbilityDef {
  id: AbilityType;
  name: LocalizedString;
  description: LocalizedString;
  cooldownMs: number;
  energyCost: number; // For now maybe Heat or direct resource? Let's assume a new "Energy" or "Charge" or just Heat Cost
  heatCost: number;   // Adds heat
  icon: string;       // emoji for now
  unlockLevel: number;
}


export interface ActiveAbilityState {
  id: AbilityType;
  cooldownRemaining: number;
  isActive: boolean; // For duration-based skills like Barrier
  durationRemaining: number;
}

// --- COMBAT MINIGAMES ---
export type CombatMinigameType = 'TIMING' | 'MEMORY' | 'MASH' | 'ALIGN' | 'GLYPH' | 'WIRES';

export interface Boss {
  id: string;
  name: LocalizedString;
  type: BossType;
  color: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  attackSpeed: number;
  description: LocalizedString;
  isMob?: boolean;

  reward: {
    xp: number;
    resources: Partial<Resources>;
    guaranteedArtifactRarity?: ArtifactRarity;
  };
  phases: number[];
  isInvulnerable?: boolean;
  minigameWeakness: CombatMinigameType;
  weakPoints: WeakPoint[];
}

export interface WeakPoint {
  id: string;
  x: number; // Percentage 0-100 relative to boss center/size
  y: number; // Percentage 0-100 relative to boss center/size
  radius: number;
  currentHp: number;
  maxHp: number;
  isActive: boolean;
  phaseRequired?: number; // Only active in this phase
}

export type EventType = 'NOTIFICATION' | 'CHOICE' | 'WARNING' | 'ANOMALY' | 'ARTIFACT' | 'BUFF' | 'QUEST' | 'COMBAT_EVENT' | 'MARKET_EVENT' | 'DELAY';

export enum EventActionId {
  TECTONIC_HOLD = 'tectonic_hold',
  TECTONIC_PUSH = 'tectonic_push',
  POD_LASER = 'pod_laser',
  POD_HACK = 'pod_hack',
  ACCEPT_FLUCTUATION = 'accept_fluctuation',
  REJECT_FLUCTUATION = 'reject_fluctuation',
  AI_TRUST = 'ai_trust',
  AI_REBOOT = 'ai_reboot',
  PURGE_NANOMITES = 'purge_nanomites',
  CRYSTAL_ABSORB = 'crystal_absorb',
  TUNNEL_SAFE = 'tunnel_safe',
  TUNNEL_RISKY = 'tunnel_risky',

  // Новые действия для логистических событий
  BLACK_MARKET_BUY = 'black_market_buy',
  BLACK_MARKET_REFUSE = 'black_market_refuse',
  RESCUE_ACCEPT = 'rescue_accept',
  RESCUE_REFUSE = 'rescue_refuse',
  PIRATE_FIGHT = 'pirate_fight',
  PIRATE_BRIBE = 'pirate_bribe',
  WRECK_LOOT = 'wreck_loot',
  WRECK_IGNORE = 'wreck_ignore',
  BASE_DEFEND = 'base_defend',
  BASE_SURRENDER = 'base_surrender',
  ENCOUNTER_INVESTIGATE = 'encounter_investigate',
  ENCOUNTER_IGNORE = 'encounter_ignore',

  // Side Tunnel Actions (Phase 3.2)
  TUNNEL_CRYSTAL = 'tunnel_crystal',
  TUNNEL_MINE = 'tunnel_mine',
  TUNNEL_NEST = 'tunnel_nest'
}

export interface EventOption {
  label: LocalizedString;
  actionId: EventActionId | string; // allowing string for flexibility if needed, but preferring Enum
  risk?: LocalizedString;
}


export interface GameEvent {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  type: EventType;

  weight: number;  // Legacy: used for weighted random (will be deprecated)
  options?: EventOption[];
  biomes?: string[];
  minDepth?: number;
  rewardArtifactDefId?: string;
  forceArtifactDrop?: boolean;
  effectId?: string;
  imageUrl?: string; // NEW: Phase 6.1

  // HARDCORE FIELDS (instant effects)
  instantDamage?: number; // 0.0 - 1.0 (% of Max Integrity)
  instantDepth?: number;  // Meters added
  instantXp?: number;     // XP added
  instantHeat?: number;   // Heat added

  // === NEW: PROBABILITY SYSTEM ===

  // Triggers: когда может сработать событие
  triggers?: EventTrigger[];

  // Вероятностная модель
  probabilityModel?: {
    type: 'poisson' | 'exponential' | 'weighted' | 'conditional' | 'exponential_decay';
    lambda?: number;      // Для Poisson (events per hour)
    baseChance?: number;  // Для Exponential/Conditional (0-1)
    scale?: number;       // Для Exponential (decay scale)

    // Модификаторы
    depthModifier?: (depth: number) => number;  // Множитель от глубины
    calculateChance?: (context: any) => number;  // Динамический расчёт шанса
  };

  // Динамический шанс (функция от состояния игры)
  conditionalChance?: (state: GameState) => number;

  // Модификаторы шанса
  regions?: string[];  // Ограничение по регионам
  depthModifier?: (depth: number) => number;  // Множитель от глубины (deprecated, moved to probabilityModel)

  // === NEW: REWARDS ===

  // Мгновенное добавление ресурсов (расширенная структура)
  instantResource?: {
    type: string;  // Тип ресурса (coal, oil, gas, etc.)
    amountMin?: number;  // Минимальное количество
    amountMax?: number;  // Максимальное количество
    amountMean?: number;  // Среднее значение (для Normal distribution)
    amountStdDev?: number;  // Стандартное отклонение
  } | Partial<Resources> | (() => Partial<Resources>);

  // Караванные эффекты (для travel events)
  caravanEffect?: {
    type?: 'delay' | 'raid' | 'bonus';
    delay?: number;       // Задержка в минутах
    delayMinutes?: number;  // Альтернативное название для delay
    blockTravel?: boolean;  // Блокировка перемещения

    // Raid mechanics
    successChance?: number;  // Шанс успешной защиты от рейда (0-1)
    onSuccess?: string;  // ID результата при успехе
    onFailure?: string;  // ID результата при провале
    lossChance?: number;  // Шанс потери груза (0-1)
    bonus?: Partial<Resources>;  // Бонус к грузу
  };

  // Базовые эффекты (для base events)
  baseEffect?: {
    type?: 'raid' | 'upgrade' | 'damage';
    storageChange?: number;  // Изменение capacity
    damagePercent?: number;  // % урона базе

    // Raid/minigame mechanics
    minigameType?: string;  // Тип мини-игры
    onSuccess?: string;  // ID результата при успехе
    onFailure?: {
      storageLoss?: { min: number; max: number };  // Диапазон потерь (0-1)
      damageCredits?: number;  // Стоимость ремонта
    };
  };

  // Cooldown (минимальное время между повторами)
  cooldown?: number;  // В секундах
}

export interface ActiveEffect {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'BUFF' | 'DEBUFF' | 'NEUTRAL' | 'ANOMALY';
  modifiers: {
    heatGenMultiplier?: number;
    coolingDisabled?: boolean;
    resourceMultiplier?: number;
    drillSpeedMultiplier?: number;
    clickPowerMultiplier?: number;
    autoClickDisabled?: boolean;
    heatInstability?: boolean;
    consumableDropMultiplier?: number;
  };
}

export type FactionId = 'CORPORATE' | 'SCIENCE' | 'REBELS';

export interface ReputationState {
  [key: string]: number; // FactionId -> value (0-1000+)
}

// === QUEST SYSTEM (PHASE 3.1) ===

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type QuestType = 'DELIVERY' | 'COLLECTION' | 'EXPLORATION' | 'COMBAT' | 'STORY';

export type QuestObjectiveType = 'COLLECT' | 'DELIVER' | 'REACH_DEPTH' | 'DEFEAT_BOSS' | 'BUILD_BASE' | 'TRAVEL_TO';

export interface QuestObjective {
  id: string;
  description: LocalizedString;

  type: QuestObjectiveType;
  target: string;  // Resource ID, region ID, boss ID, etc.
  required: number;  // Количество
  current: number;   // Текущий прогресс
}

export type QuestRewardType = 'RESOURCE' | 'REPUTATION' | 'UNLOCK' | 'BLUEPRINT' | 'XP';

export interface QuestReward {
  type: QuestRewardType;
  target: string;   // resource ID, faction ID, unlock ID, blueprint ID, 'player' for XP
  amount?: number;  // Количество (для ресурсов, reputation, XP)
}

export interface Quest {
  id: string;
  title: LocalizedString;
  description: LocalizedString;

  status: QuestStatus;
  type: QuestType;

  objectives: QuestObjective[];
  rewards: QuestReward[];

  factionId?: FactionId;  // Какая фракция дала квест
  prerequisites?: string[];  // IDs других квестов
  expiresAt?: number;  // Таймер (опционально)
}

// === DEPRECATED: LEGACY QUEST TYPES (для обратной совместимости) ===
// Используются в старом коде citySlice.ts, будут удалены после миграции

/**  @deprecated Use Quest instead */
export enum QuestIssuer {
  CORP = 'CORP',
  SCIENCE = 'SCIENCE',
  REBELS = 'REBELS'
}

/** @deprecated Use QuestObjective instead */
export interface QuestRequirement {
  type: 'RESOURCE' | 'XP' | 'TECH' | 'DEPTH';
  target: string;
  amount: number;
}

export type SkillCategory = 'CORTEX' | 'MOTOR' | 'VISUAL' | 'CHRONOS';

export interface SkillDefinition {
  id: string;
  name: LocalizedString;
  description: LocalizedString;

  category: SkillCategory;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;

  position: { x: number; y: number };
  requiredParent?: string;
  requiredDepth?: number;

  getBonusText: (level: number) => string;
}

export interface AnalyzerState {
  activeItemInstanceId: string | null;
  timeLeft: number;
  maxTime: number;
}

export interface FlyingObject {
  id: string;
  x: number;
  y: number;
  type: 'GEODE_SMALL' | 'GEODE_LARGE' | 'SATELLITE_DEBRIS';
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
}

export enum DroneType {
  COLLECTOR = 'COLLECTOR',
  COOLER = 'COOLER',
  BATTLE = 'BATTLE',
  REPAIR = 'REPAIR',
  MINER = 'MINER'
}

export interface DroneDefinition {
  id: DroneType;
  name: LocalizedString;
  description: LocalizedString;
  baseCost: Partial<Resources>;
  costMultiplier: number;
  maxLevel: number;
  effectDescription: (level: number) => LocalizedString;
  color: string;
}


// --- EXPEDITION SYSTEM ---
export type ExpeditionDifficulty = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface Expedition {
  id: string; // unique ID
  difficulty: ExpeditionDifficulty;
  riskChance: number; // 0.05, 0.2, 0.4, 0.7
  droneCount: number;
  resourceTarget: ResourceType; // Primary resource sought
  startTime: number;
  duration: number; // ms
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  rewards?: Partial<Resources>;
  lostDrones?: number;
  log: string[]; // Narrative of what happened
}

// --- NARRATIVE ENGINE TYPES ---
export type AIState = 'LUCID' | 'MANIC' | 'DEPRESSED' | 'BROKEN';

export interface NarrativeContext {
  depth: number;
  heat: number;
  integrity: number;
  biome: string;
  eventActive: boolean;
  afkTime: number;
}

export interface LogFragment {
  id: string;
  text: string;
  tags: string[];
  weight: number;
}

// --- VISUAL PROPS ---
export type PropType = 'FOSSIL' | 'PIPE' | 'CRYSTAL' | 'RUIN' | 'TECH_DEBRIS';

// Phase 3.2: Side Tunnel Types
export type SideTunnelType = 'SAFE' | 'RISKY' | 'CRYSTAL' | 'MINE' | 'NEST';

export interface TunnelPropDef {
  type: PropType;
  minDepth: number;
  maxDepth: number;
  chance: number;
  color: string;
}

export interface SideTunnelState {
  type: SideTunnelType;
  progress: number;
  maxProgress: number;
  rewards: Record<string, number>;
  difficulty: number;
  name: LocalizedString;
}

// --- ACTIVE COOLING (RHYTHM) ---


// === PHASE 2.1: CRAFTING QUEUE ===

export interface CraftingJob {
  id: string;              // Уникальный ID задания (UUID)
  partId: string;          // Что крафтим (bit_5, engine_12, etc.)
  slotType: DrillSlot;     // Тип детали (BIT, ENGINE, HULL...)

  startTime: number;       // timestamp начала (Date.now())
  completionTime: number;  // startTime + T_craft (из mathEngine!)

  status: 'in_progress' | 'ready_to_collect';
}

// === PHASE 2.2: UNIFIED INVENTORY ===

export interface EquipmentItem {
  instanceId: string;      // Уникальный ID (UUID)
  partId: string;          // bit_5, engine_12, etc.
  slotType: DrillSlot;     // BIT, ENGINE, HULL...

  tier: number;            // 1-15

  acquiredAt: number;      // timestamp получения
  isEquipped: boolean;     // Установлен ли на буре

  // Scrap value для разборки
  scrapValue: number;      // Сколько Scrap даст при разборке (tier * 10)
}

// === PHASE 2.3: TRAVEL SYSTEM ===

export interface TravelState {
  targetRegion: RegionId;
  startTime: number;      // timestamp
  duration: number;       // ms
  fuelType: ResourceType;
  fuelCost: number;
  distance: number;
}

// === GAME STATE ===

export interface GameState {
  depth: number;
  resources: Resources;
  heat: number;
  integrity: number;
  currentCargoWeight: number;  // [CARGO SYSTEM] Текущий вес груза (обновляется автоматически)
  currentRegion: RegionId;     // [GLOBAL MAP] Текущий регион игрока

  // GLOBAL MAP (LICENSES & PERMITS)
  globalReputation: number;  // Глобальная репутация (для license tiers), отдельно от фракций
  unlockedLicenses: ZoneLicense[];
  activePermits: Partial<Record<RegionId, Permit>>;  // Частичный record - не все регионы обязательны

  // GLOBAL MAP (PLAYER BASES)
  playerBases: PlayerBase[];  // Базы игрока в регионах

  // === PHASE 2: MARKET \u0026 CARAVANS ===
  marketTransactionHistory: MarketTransaction[];  // История рыночных транзакций
  caravans: Caravan[];  // Активные караваны
  caravanUnlocks: CaravanUnlock[];  // Разблокированные тиры караванов

  activeAbilities: ActiveAbilityState[];

  // [BLUEPRINT SYSTEM] - Phase 3
  unlockedBlueprints: string[];

  // [DEV_CONTEXT: SHIELD]
  shieldCharge: number; // 0-100
  maxShieldCharge: number; // 100
  isShielding: boolean;

  drill: DrillState;

  skillLevels: Record<string, number>;

  /** @deprecated Use inventory instead */
  artifacts: string[];
  inventory: Record<string, InventoryItem>;
  equippedArtifacts: string[];
  discoveredArtifacts: string[];
  analyzer: AnalyzerState;

  activeQuests: Quest[];
  completedQuestIds: string[];
  failedQuestIds: string[];
  lastQuestRefresh: number;
  reputation: ReputationState;

  totalDrilled: number;
  xp: number;
  level: number;
  activeEffects: ActiveEffect[];
  eventQueue: GameEvent[];
  recentEventIds: string[];
  eventCooldowns: Record<string, number>;  // EventID -> timestamp окончания cooldown
  pendingPredictions: Array<{ event: GameEvent; triggerTime: number; predictionShown: boolean }>;  // [PREDICTION SYSTEM] Отложенные события
  flyingObjects: FlyingObject[];

  currentBoss: Boss | null;
  lastBossDepth: number;

  activeDrones: DroneType[];
  droneLevels: Record<DroneType, number>;
  activeExpeditions: Expedition[];
  defeatedBosses: string[]; // IDs побежденных боссов для Codex

  storageLevel: 0 | 1 | 2;
  forgeUnlocked: boolean;
  cityUnlocked: boolean;
  skillsUnlocked: boolean;

  // === PHASE 3: CONSUMABLES ===
  consumables: {
    repairKit: number;
    coolantPaste: number;
    advancedCoolant: number;
  };

  // NARRATIVE STATE
  aiState: AIState;

  // SETTINGS
  settings: GameSettings;

  // BIOME
  selectedBiome: string | null;

  // [DEV_CONTEXT: GOD_MODE]
  debugUnlocked: boolean;
  isGodMode: boolean;
  isInfiniteCoolant: boolean;
  isInfiniteFuel: boolean;  // [NEW] Бесконечное топливо
  isInfiniteEnergy: boolean; // [NEW] Бесконечная энергия
  isZeroWeight: boolean;    // [NEW] Нулевой вес груза
  isOverdrive: boolean;
  isDebugUIOpen: boolean;

  // [DEV_CONTEXT: ENGINE STATE]
  isDrilling: boolean;
  isOverheated: boolean;
  isBroken: boolean;
  isCoolingGameActive: boolean;

  // Timers & Ticks
  heatStabilityTimer: number;
  bossAttackTick: number;
  lastInteractTime: number;
  narrativeTick: number;
  eventCheckTick: number;



  combatMinigame: CombatMinigame | null;
  minigameCooldown: number;

  // === PHASE 2.1: CRAFTING QUEUE ===
  craftingQueue: CraftingJob[];  // Очередь крафта equipment с таймерами

  // === PHASE 2.2: UNIFIED INVENTORY ===
  equipmentInventory: EquipmentItem[];  // Inventory для equipment (запасные детали)

  // === PHASE 2.3: TRAVEL ===
  travel: TravelState | null;           // Текущее состояние путешествия (null если не в пути)

  // === PHASE 3: SIDE TUNNELS ===
  sideTunnel: SideTunnelState | null;   // Активный боковой туннель

  // === PHASE 4: FREE COOLING COOLDOWN ===
  freeCoolingLastUsed: number;          // Timestamp последнего использования бесплатного охлаждения (0 = доступно)

  // === PHASE 4.1: RAID TIMER ===
  lastRaidCheck: number;                // Timestamp последней проверки рейдов (для предотвращения спама)

  // === PERFORMANCE OPTIMIZATION ===
  stats: Stats;                        // Pre-calculated stats for each tick
}

export type VisualEvent =
  | { type: 'LOG'; msg: string; color?: string; icon?: string; timestamp?: boolean; detail?: string }
  | { type: 'TEXT'; x?: number; y?: number; position?: 'CENTER' | 'TOP_CENTER'; text: string; style?: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED'; color?: string }
  | { type: 'PARTICLE'; x?: number; y?: number; position?: 'CENTER' | 'DRILL_TIP'; color: string; kind: 'DEBRIS' | 'SPARK' | 'SMOKE'; count: number }
  | { type: 'BOSS_HIT' }
  | { type: 'SOUND'; sfx: 'LOG' | 'GLITCH' | 'ACHIEVEMENT' | 'RAID_ALARM' | 'RAID_SUCCESS' | 'RAID_FAILURE' | 'MARKET_TRADE' }
  | { type: 'SCREEN_SHAKE'; intensity: number; duration: number }
  | { type: 'VISUAL_EFFECT'; option: VisualEffectType }
  | { type: 'PREDICTION'; eventTitle: string; eventType: string; timeRemaining: number; detailLevel: 'BASIC' | 'MEDIUM' | 'FULL' };

