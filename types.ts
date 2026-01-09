
export enum View {
  DRILL = 'DRILL',
  CITY = 'CITY',
  FORGE = 'FORGE',
  SKILLS = 'SKILLS',
  ARTIFACTS = 'ARTIFACTS',
  COMBAT = 'COMBAT' 
}

export interface Resources {
  clay: number;
  stone: number;
  copper: number;
  iron: number;
  silver: number;
  gold: number;
  titanium: number;
  uranium: number;
  nanoSwarm: number; 
  ancientTech: number; 
  rubies: number;
  emeralds: number;
  diamonds: number;
}

export type ResourceType = keyof Resources;

export enum ArtifactRarity {
  COMMON = 'COMMON',       
  RARE = 'RARE',           
  EPIC = 'EPIC',           
  LEGENDARY = 'LEGENDARY', 
  ANOMALOUS = 'ANOMALOUS'  
}

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Godly';

export type VisualEffectType = 'NONE' | 'GLOW_PURPLE' | 'GLOW_GOLD' | 'GLITCH_RED' | 'MATRIX_GREEN' | 'FROST_BLUE';

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
  name: string;
  description: string; 
  loreDescription: string; 
  rarity: ArtifactRarity;
  icon: string;
  basePrice: number; 
  scrapAmount: number; 
  visualEffect?: VisualEffectType; 
  
  effectDescription: string;
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

// --- BASE DRILL PART ---
export interface BaseDrillPart {
  id: string;
  name: string;
  tier: number;
  rarity: ItemRarity;
  description: string;
  cost: Partial<Resources>;
}

// 1. BITS (Damage, Shape)
export interface DrillPart extends BaseDrillPart {
  baseStats: {
    damage: number; // DPC
    energyCost: number;
  };
  fxId?: DrillFX;
}

// 2. ENGINES (Speed, Auto)
export interface EnginePart extends BaseDrillPart {
  baseStats: {
    speed: number; // DPS
    energyCost: number;
  };
}

// 3. COOLERS (Heat Dissipation)
export interface CoolerPart extends BaseDrillPart {
  baseStats: {
    cooling: number;
    energyCost: number; // Some coolers use energy (active), some don't (passive)
  };
}

// 4. HULLS (Slots, Integrity)
export interface HullPart extends BaseDrillPart {
  baseStats: {
    maxIntegrity: number;
    slots: number; // Limits total modules (abstractly)
    heatCap: number; // Thermal mass
  };
}

// 5. LOGIC CORES (Crit, Intelligence)
export interface LogicPart extends BaseDrillPart {
  baseStats: {
    critChance: number; // %
    energyCost: number;
    predictionTime?: number; // For events
  };
}

// 6. CONTROL UNITS (Click Multiplier)
export interface ControlPart extends BaseDrillPart {
  baseStats: {
    clickMultiplier: number;
    energyCost: number;
  };
}

// 7. GEARBOXES (Torque / Hardness Pierce)
export interface GearboxPart extends BaseDrillPart {
  baseStats: {
    torque: number; // % hardness ignore
    energyCost: number; // Efficiency loss
  };
}

// 8. POWER CORES (Energy Capacity)
export interface PowerCorePart extends BaseDrillPart {
  baseStats: {
    energyOutput: number;
  };
}

// 9. ARMOR (Resistances)
export interface ArmorPart extends BaseDrillPart {
  baseStats: {
    defense: number; // % Damage reduction
    radResist?: number;
    heatResist?: number;
    energyCost: number; // Heavy armor might need servos
  };
}

export interface DrillState {
  bit: DrillPart;
  engine: EnginePart;
  cooling: CoolerPart;
  hull: HullPart;
  logic: LogicPart;
  control: ControlPart;
  gearbox: GearboxPart;
  power: PowerCorePart;
  armor: ArmorPart;
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
  description: string;
}

export type HazardType = 'NONE' | 'CORROSION' | 'MAGNETIC' | 'HEAT_REFLECTION' | 'RADIATION' | 'VOID_PRESSURE';

export interface Biome {
  name: string;
  depth: number;
  resource: ResourceType;
  color: string;
  description: string;
  hub?: string;
  hazard: HazardType; 
  hazardLevel: number; 
  gemResource?: 'rubies' | 'emeralds' | 'diamonds'; 
}

export type BossType = 'WORM' | 'CORE' | 'CONSTRUCT' | 'SWARM';

export interface Boss {
  id: string;
  name: string;
  type: BossType;
  color: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  attackSpeed: number;
  description: string;
  reward: {
    xp: number;
    resources: Partial<Resources>;
    guaranteedArtifactRarity?: ArtifactRarity;
  };
}

export type EventType = 'NOTIFICATION' | 'CHOICE' | 'WARNING' | 'ANOMALY' | 'ARTIFACT';

export interface EventOption {
  label: string;
  actionId: string; 
  risk?: string; 
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  weight: number; 
  options?: EventOption[]; 
  biomes?: string[]; 
  minDepth?: number;
  rewardArtifactDefId?: string; 
  forceArtifactDrop?: boolean;  
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
  };
}

export type QuestIssuer = 'CORP' | 'SCIENCE' | 'REBELS';

export interface QuestRequirement {
  type: 'RESOURCE' | 'XP' | 'TECH' | 'DEPTH';
  target: string; 
  amount: number;
}

export interface QuestReward {
  type: 'RESOURCE' | 'XP' | 'TECH';
  target: string;
  amount: number;
}

export interface Quest {
  id: string;
  issuer: QuestIssuer;
  title: string;
  description: string;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  deadline?: number; 
}

export type SkillCategory = 'CORTEX' | 'MOTOR' | 'VISUAL' | 'CHRONOS';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
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
  vx: number; 
  vy: number;
}

export type DroneType = 'COLLECTOR' | 'COOLER' | 'BATTLE';

export interface DroneDefinition {
  id: DroneType;
  name: string;
  description: string;
  cost: Partial<Resources>;
  color: string;
}

export interface GameState {
  depth: number;
  resources: Resources;
  heat: number;
  integrity: number; 
  drill: DrillState;
  
  skillLevels: Record<string, number>; 
  
  artifacts: string[]; // Deprecated
  inventory: InventoryItem[]; 
  equippedArtifacts: string[]; 
  analyzer: AnalyzerState; 

  activeQuests: Quest[];
  lastQuestRefresh: number;

  totalDrilled: number;
  xp: number;
  level: number;
  activeEffects: ActiveEffect[];
  eventQueue: GameEvent[];
  flyingObjects: FlyingObject[];
  
  currentBoss: Boss | null; 
  lastBossDepth: number;    

  activeDrones: DroneType[]; 

  storageLevel: 0 | 1 | 2; 
  forgeUnlocked: boolean; 
  cityUnlocked: boolean; 
  skillsUnlocked: boolean; 
}
