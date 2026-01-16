
import { Boss, BossType, Resources, ArtifactRarity, CombatMinigameType } from '../types';

const BOSS_NAMES: Record<BossType, string[]> = {
  [BossType.WORM]: ["ГЛУБИННЫЙ ПОЖИРАТЕЛЬ", "ОБСИДИАНОВЫЙ ЗМЕЙ", "ТИТАНОВЫЙ ЧЕРВЬ", "ДРЕВНИЙ БУРИЛЬЩИК"],
  [BossType.CORE]: ["СТРАЖ ЯДРА", "ПЫЛАЮЩАЯ СФЕРА", "СИНГУЛЯРНОСТЬ-1", "СЕРДЦЕ ГОРЫ"],
  [BossType.CONSTRUCT]: ["ГЕОМЕТРИЧЕСКИЙ УЖАС", "ХРАНИТЕЛЬ ПРОТОКОЛА", "КУБ ПУСТОТЫ", "МОНОЛИТ"],
  [BossType.SWARM]: ["КОРОЛЕВА УЛЬЯ", "НАНО-ЛЕГИОН", "РОЙ СМЕРТИ", "КОЛЛЕКТИВНЫЙ РАЗУМ"]
};

const MOB_NAMES: Record<BossType, string[]> = {
  [BossType.WORM]: ["СКАЛЬНЫЙ ЧЕРВЬ", "ЛИЧИНКА", "ПЕЩЕРНЫЙ ЗМЕЙ"],
  [BossType.CORE]: ["ОГНЕННЫЙ ДУХ", "ИСКРА", "МАГМОВЫЙ СЛИЗЕНЬ"],
  [BossType.CONSTRUCT]: ["ДРОН-ОХРАННИК", "АВТО-ТУРЕЛЬ", "БИТЫЙ ПИКСЕЛЬ"],
  [BossType.SWARM]: ["НАНО-РОЙ", "ЖУК-РУДОЕД", "ПАРАЗИТ"]
};

const BOSS_COLORS: Record<BossType, string> = {
  [BossType.WORM]: "#8B4513",
  [BossType.CORE]: "#FF4500",
  [BossType.CONSTRUCT]: "#00FFFF",
  [BossType.SWARM]: "#32CD32"
};

const MOB_COLORS: Record<BossType, string> = {
  [BossType.WORM]: "#A0522D",
  [BossType.CORE]: "#FFA500",
  [BossType.CONSTRUCT]: "#E0FFFF",
  [BossType.SWARM]: "#90EE90"
};

const BOSS_WEAKNESSES: Record<BossType, CombatMinigameType> = {
  [BossType.WORM]: 'MASH',
  [BossType.CORE]: 'TIMING',
  [BossType.CONSTRUCT]: 'MEMORY',
  [BossType.SWARM]: 'ALIGN'
};

export const generateBoss = (depth: number, biomeName: string): Boss => {
  let type: BossType = BossType.WORM;
  if (depth > 50000) type = BossType.CORE;
  else if (depth > 20000) type = BossType.CONSTRUCT;
  else if (depth > 5000) type = BossType.SWARM;
  else type = BossType.WORM;

  // Custom weight override
  if (Math.random() > 0.7) {
    const types: BossType[] = [BossType.WORM, BossType.CONSTRUCT, BossType.SWARM];
    type = types[Math.floor(Math.random() * types.length)];
  }

  const namePool = BOSS_NAMES[type];
  const name = namePool[Math.floor(Math.random() * namePool.length)];

  const hpBase = 1000;
  const hpGrowth = Math.pow(depth / 500, 1.3);
  const maxHp = Math.floor(hpBase + hpGrowth * 50);

  const dmgBase = 2;
  const dmgGrowth = Math.pow(depth / 1000, 0.8);
  const damage = parseFloat((dmgBase + dmgGrowth).toFixed(1));

  const xpReward = Math.floor(maxHp * 0.5);
  const resources: Partial<Resources> = {};

  if (depth > 1000) resources.ancientTech = Math.floor(10 + depth / 500);
  if (depth > 5000) resources.diamonds = Math.floor(1 + depth / 10000);
  resources.gold = Math.floor(100 + depth / 10);
  resources.titanium = Math.floor(depth / 50);

  let rarity: ArtifactRarity | undefined;
  if (depth > 20000) rarity = ArtifactRarity.LEGENDARY;
  else if (depth > 5000) rarity = ArtifactRarity.EPIC;
  else rarity = ArtifactRarity.RARE;

  return {
    id: `boss_${Date.now()}`,
    name,
    type,
    color: BOSS_COLORS[type],
    maxHp,
    currentHp: maxHp,
    damage,
    attackSpeed: 20,
    description: `ОБНАРУЖЕНА УГРОЗА КЛАССА [${type}]. ПРОТОКОЛ "УНИЧТОЖЕНИЕ".`,
    isMob: false,
    phases: [1],
    minigameWeakness: BOSS_WEAKNESSES[type],
    weakPoints: [],
    reward: {
      xp: xpReward,
      resources,
      guaranteedArtifactRarity: rarity
    }
  };
};

export const generateMob = (depth: number): Boss => {
  let type: BossType = BossType.WORM;
  if (depth > 40000) type = BossType.CORE;
  else if (depth > 10000) type = BossType.CONSTRUCT;
  else if (depth > 2000) type = BossType.SWARM;

  const namePool = MOB_NAMES[type];
  const name = namePool[Math.floor(Math.random() * namePool.length)];

  const hpBase = 200;
  const hpGrowth = Math.pow(depth / 500, 1.1);
  const maxHp = Math.floor(hpBase + hpGrowth * 10);
  const damage = 1 + (depth / 5000);

  const xpReward = Math.floor(maxHp * 0.2);
  const resources: Partial<Resources> = {};

  if (type === BossType.WORM) resources.stone = Math.floor(50 + depth / 10);
  if (type === BossType.CONSTRUCT) resources.iron = Math.floor(20 + depth / 20);
  if (type === BossType.SWARM) resources.copper = Math.floor(30 + depth / 20);
  if (type === BossType.CORE) resources.gold = Math.floor(10 + depth / 50);

  return {
    id: `mob_${Date.now()}`,
    name,
    type,
    color: MOB_COLORS[type],
    maxHp,
    currentHp: maxHp,
    damage,
    attackSpeed: 15,
    description: `ВРАЖДЕБНАЯ СУЩНОСТЬ.`,
    isMob: true,
    phases: [],
    minigameWeakness: 'MASH',
    weakPoints: [],
    reward: {
      xp: xpReward,
      resources
    }
  };
};
