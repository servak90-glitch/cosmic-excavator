
import { Boss, BossType, Resources, ArtifactRarity } from '../types';

const BOSS_NAMES: Record<BossType, string[]> = {
  WORM: ["ГЛУБИННЫЙ ПОЖИРАТЕЛЬ", "ОБСИДИАНОВЫЙ ЗМЕЙ", "ТИТАНОВЫЙ ЧЕРВЬ", "ДРЕВНИЙ БУРИЛЬЩИК"],
  CORE: ["СТРАЖ ЯДРА", "ПЫЛАЮЩАЯ СФЕРА", "СИНГУЛЯРНОСТЬ-1", "СЕРДЦЕ ГОРЫ"],
  CONSTRUCT: ["ГЕОМЕТРИЧЕСКИЙ УЖАС", "ХРАНИТЕЛЬ ПРОТОКОЛА", "КУБ ПУСТОТЫ", "МОНОЛИТ"],
  SWARM: ["КОРОЛЕВА УЛЬЯ", "НАНО-ЛЕГИОН", "РОЙ СМЕРТИ", "КОЛЛЕКТИВНЫЙ РАЗУМ"]
};

const BOSS_COLORS: Record<BossType, string> = {
  WORM: "#8B4513",
  CORE: "#FF4500",
  CONSTRUCT: "#00FFFF",
  SWARM: "#32CD32"
};

export const generateBoss = (depth: number, biomeName: string): Boss => {
  // Выбор типа босса на основе глубины
  let type: BossType = 'WORM';
  if (depth > 50000) type = 'CORE';
  else if (depth > 20000) type = 'CONSTRUCT';
  else if (depth > 5000) type = 'SWARM';
  else type = 'WORM';

  // Рандомизация типа для разнообразия
  if (Math.random() > 0.7) {
     const types: BossType[] = ['WORM', 'CONSTRUCT', 'SWARM'];
     type = types[Math.floor(Math.random() * types.length)];
  }

  const namePool = BOSS_NAMES[type];
  const name = namePool[Math.floor(Math.random() * namePool.length)];

  // Скалирование характеристик
  // HP растет экспоненциально
  const hpBase = 1000;
  const hpGrowth = Math.pow(depth / 500, 1.3);
  const maxHp = Math.floor(hpBase + hpGrowth * 50);

  // Урон растет медленнее
  const dmgBase = 2;
  const dmgGrowth = Math.pow(depth / 1000, 0.8);
  const damage = parseFloat((dmgBase + dmgGrowth).toFixed(1));

  // Награда
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
    attackSpeed: 20, // Каждые 20 тиков (2 сек)
    description: `ОБНАРУЖЕНА УГРОЗА КЛАССА [${type}]. ПРОТОКОЛ "УНИЧТОЖЕНИЕ".`,
    reward: {
      xp: xpReward,
      resources,
      guaranteedArtifactRarity: rarity
    }
  };
};
