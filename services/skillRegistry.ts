
import { SkillDefinition } from '../types';

export const SKILLS: SkillDefinition[] = [
  // === 1. CORTEX (CENTER) - CONTROL ===
  {
    id: 'neural_link',
    name: 'НЕЙРО-ИНТЕРФЕЙС',
    description: 'Прямое подключение. Старт дерева.',
    category: 'CORTEX',
    maxLevel: 999,
    baseCost: 100,
    costMultiplier: 1.3,
    position: { x: 0, y: 0 }, // Center
    getBonusText: (lvl) => `Мощность клика: +${(lvl * 5).toFixed(0)}%`
  },
  {
    id: 'synaptic_overclock',
    name: 'СИНАПТИЧЕСКИЙ РАЗГОН',
    description: 'Рискованный разгон нейронов.',
    category: 'CORTEX',
    maxLevel: 50,
    baseCost: 500,
    costMultiplier: 1.4,
    requiredParent: 'neural_link',
    position: { x: 0, y: 2 }, // Down
    getBonusText: (lvl) => `Крит. шанс клика: +${(lvl * 1).toFixed(0)}%`
  },
  {
    id: 'creator_protocol',
    name: 'ПРОТОКОЛ "ТВОРЕЦ"',
    description: 'Единство души и машины. Требуется для управления легендарными блоками.',
    category: 'CORTEX',
    maxLevel: 5,
    baseCost: 50000,
    costMultiplier: 2.5,
    requiredParent: 'synaptic_overclock',
    position: { x: 0, y: 4 }, // Further Down
    getBonusText: (lvl) => `Эфф. слияния: +${(lvl * 10).toFixed(0)}%`
  },

  // === 2. MOTOR (LEFT) - ENGINE/HEAT ===
  {
    id: 'servo_optimization',
    name: 'СЕРВО-ОПТИМИЗАЦИЯ',
    description: 'Плавность движений.',
    category: 'MOTOR',
    maxLevel: 999,
    baseCost: 150,
    costMultiplier: 1.25,
    requiredParent: 'neural_link',
    position: { x: -2, y: 0 }, // Left
    getBonusText: (lvl) => `Скорость авто: +${(lvl * 2).toFixed(0)}%`
  },
  {
    id: 'vibration_dampening',
    name: 'ГАШЕНИЕ ВИБРАЦИЙ',
    description: 'Стабилизация бура.',
    category: 'MOTOR',
    maxLevel: 100,
    baseCost: 800,
    costMultiplier: 1.35,
    requiredParent: 'servo_optimization',
    position: { x: -3, y: 1 }, // Left-Down
    getBonusText: (lvl) => `Нагрев: -${(lvl * 0.5).toFixed(1)}%`
  },
  {
    id: 'heat_regulation',
    name: 'ТЕРМО-КОНТРОЛЬ',
    description: 'Управление клапанами.',
    category: 'MOTOR',
    maxLevel: 20,
    baseCost: 1000,
    costMultiplier: 1.5,
    requiredParent: 'vibration_dampening',
    position: { x: -4, y: 2 }, 
    getBonusText: (lvl) => `Пасс. холод: +${(lvl * 5).toFixed(0)}%`
  },

  // === 3. VISUAL (RIGHT) - RESOURCES ===
  {
    id: 'mineral_scanner',
    name: 'СПЕКТРАЛЬНЫЙ СКАНЕР',
    description: 'Фильтры восприятия руды.',
    category: 'VISUAL',
    maxLevel: 999,
    baseCost: 200,
    costMultiplier: 1.3,
    requiredParent: 'neural_link',
    position: { x: 2, y: 0 }, // Right
    getBonusText: (lvl) => `Добыча: +${(lvl * 5).toFixed(0)}%`
  },
  {
    id: 'residue_filter',
    name: 'СЕПАРАТОР ШЛАКА',
    description: 'Сбор осыпающейся породы.',
    category: 'VISUAL',
    maxLevel: 50,
    baseCost: 600,
    costMultiplier: 1.4,
    requiredParent: 'mineral_scanner',
    position: { x: 3, y: 1 }, // Right-Down
    getBonusText: (lvl) => `Шлак: +${(lvl * 2).toFixed(0)}%`
  },
  {
    id: 'artifact_resonance',
    name: 'РЕЗОНАНС АРТЕФАКТОВ',
    description: 'Чувствительность к аномалиям.',
    category: 'VISUAL',
    maxLevel: 5,
    baseCost: 10000,
    costMultiplier: 3.0,
    requiredParent: 'mineral_scanner',
    position: { x: 3, y: -1 }, // Right-Up
    getBonusText: (lvl) => `Шанс дропа: +${(lvl * 10).toFixed(0)}%`
  },

  // === 4. CHRONOS (TOP) - META ===
  {
    id: 'synaptic_plasticity',
    name: 'НЕЙРОПЛАСТИЧНОСТЬ',
    description: 'Быстрое обучение.',
    category: 'CHRONOS',
    maxLevel: 999,
    baseCost: 1000,
    costMultiplier: 1.5,
    requiredParent: 'neural_link',
    position: { x: 0, y: -2 }, // Up
    getBonusText: (lvl) => `XP: +${(lvl * 1).toFixed(0)}%`
  },
  {
    id: 'temporal_dilation',
    name: 'ТЕМПОРАЛЬНАЯ ДИЛАТАЦИЯ',
    description: 'Замедление времени.',
    category: 'CHRONOS',
    maxLevel: 20,
    baseCost: 2500,
    costMultiplier: 1.6,
    requiredParent: 'synaptic_plasticity',
    position: { x: -1, y: -3 }, // Up-Left
    getBonusText: (lvl) => `Длит. баффов: +${(lvl * 5).toFixed(0)}%`
  },
  {
    id: 'void_whisper',
    name: 'ШЕПОТ ПУСТОТЫ',
    description: 'Интуитивное понимание вселенной.',
    category: 'CHRONOS',
    maxLevel: 100,
    baseCost: 10000,
    costMultiplier: 1.2,
    requiredParent: 'synaptic_plasticity',
    position: { x: 1, y: -3 }, // Up-Right
    getBonusText: (lvl) => `Скор. игры: +${(lvl * 0.5).toFixed(1)}%`
  }
];

export const getSkillCost = (skill: SkillDefinition, currentLevel: number): number => {
  if (currentLevel >= skill.maxLevel) return Infinity;
  return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, currentLevel));
};

export const calculateSkillModifiers = (skillLevels: Record<string, number>) => {
  const mods = {
    clickPowerPct: 0,
    autoSpeedPct: 0,
    heatGenReductionPct: 0,
    resourceMultPct: 0,
    residueEffPct: 0,
    xpGainPct: 0,
    buffDurationPct: 0,
    critChance: 0,
    coolingPowerPct: 0,
    globalSpeedPct: 0
  };

  mods.clickPowerPct += (skillLevels['neural_link'] || 0) * 5;
  mods.critChance += (skillLevels['synaptic_overclock'] || 0) * 1;
  mods.coolingPowerPct += (skillLevels['heat_regulation'] || 0) * 5;
  mods.autoSpeedPct += (skillLevels['servo_optimization'] || 0) * 2;
  mods.heatGenReductionPct += (skillLevels['vibration_dampening'] || 0) * 0.5;
  mods.resourceMultPct += (skillLevels['mineral_scanner'] || 0) * 5;
  mods.residueEffPct += (skillLevels['residue_filter'] || 0) * 2;
  mods.xpGainPct += (skillLevels['synaptic_plasticity'] || 0) * 1;
  mods.buffDurationPct += (skillLevels['temporal_dilation'] || 0) * 5;
  mods.globalSpeedPct += (skillLevels['void_whisper'] || 0) * 0.5;

  return mods;
};
