
import { ArtifactDefinition, ArtifactRarity } from '../types';

export const ARTIFACTS: ArtifactDefinition[] = [
  // --- COMMON (Industrial Trash & Basic Tech) ---
  {
    id: 'broken_servo',
    name: 'Сломанный Сервопривод',
    description: 'Грязный механизм. Кажется, он еще дергается.',
    loreDescription: 'Стандартный привод буровых установок прошлого поколения. Содержит полезные микросхемы.',
    rarity: ArtifactRarity.COMMON,
    icon: '⚙️',
    basePrice: 50,
    scrapAmount: 5,
    effectDescription: 'Скорость бурения +2%',
    modifiers: { drillSpeedPct: 2 }
  },
  {
    id: 'fossilized_leaf',
    name: 'Каменная Флора',
    description: 'Отпечаток листа в камне.',
    loreDescription: 'Доказательство того, что на этой глубине когда-то была жизнь. Или симуляция жизни.',
    rarity: ArtifactRarity.COMMON,
    icon: '🌿',
    basePrice: 80,
    scrapAmount: 8,
    allowedBiomes: ['ПОВЕРХНОСТЬ', 'ТВЕРДЫЙ КАМЕНЬ'],
    effectDescription: 'Получение XP +5%',
    modifiers: {} // Special handling in logic
  },
  {
    id: 'cooling_paste',
    name: 'Тюбик Термопасты',
    description: 'Старая маркировка. Внутри что-то холодное.',
    loreDescription: 'Военная термопаста "Айсберг-9". Срок годности истек 200 лет назад, но свойства сохранились.',
    rarity: ArtifactRarity.COMMON,
    icon: '❄️',
    basePrice: 60,
    scrapAmount: 6,
    visualEffect: 'FROST_BLUE',
    allowedBiomes: ['КРИСТАЛЬНЫЕ ГРОТЫ'],
    effectDescription: 'Охлаждение +3%',
    modifiers: { heatGenPct: 3 }
  },
  {
    id: 'copper_wire_spool',
    name: 'Катушка Провода',
    description: 'Мотки окислившейся меди.',
    loreDescription: 'Проводка из древнего дата-центра. Высокая проводимость.',
    rarity: ArtifactRarity.COMMON,
    icon: '➰',
    basePrice: 40,
    scrapAmount: 4,
    allowedBiomes: ['МЕДНЫЕ ЖИЛЫ'],
    effectDescription: 'Шанс крита +1%',
    modifiers: { clickPowerPct: 1 }
  },
  // NEW COMMON
  {
    id: 'obsidian_coating',
    name: 'Обсидиановая Пыль',
    description: 'Мешочек с черным порошком.',
    loreDescription: 'Вулканическое стекло, измельченное до наночастиц. Отлично полирует бур.',
    rarity: ArtifactRarity.COMMON,
    icon: '🌑',
    basePrice: 70,
    scrapAmount: 7,
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: 'Сила клика +2%',
    modifiers: { clickPowerPct: 2 }
  },

  // --- RARE (Useful Modules) ---
  {
    id: 'lens_optics',
    name: 'Линза Сканера',
    description: 'Идеально гладкое стекло. Не царапается.',
    loreDescription: 'Часть гео-сканера. Позволяет лучше видеть структуру породы.',
    rarity: ArtifactRarity.RARE,
    icon: '🔍',
    basePrice: 200,
    scrapAmount: 25,
    allowedBiomes: ['КРИСТАЛЬНЫЕ ГРОТЫ'],
    effectDescription: 'Добыча ресурсов +10%',
    modifiers: { resourceMultPct: 10 }
  },
  {
    id: 'magnetic_coil',
    name: 'Магнитная Катушка',
    description: 'Притягивает мелкую металлическую пыль.',
    loreDescription: 'Стабилизатор магнитного поля. Уменьшает вибрацию бура.',
    rarity: ArtifactRarity.RARE,
    icon: '🧲',
    basePrice: 250,
    scrapAmount: 30,
    allowedBiomes: ['МЕДНЫЕ ЖИЛЫ', 'ЗОЛОТАЯ ЗЕМЛЯ'],
    effectDescription: 'Сила клика +15%',
    modifiers: { clickPowerPct: 15 }
  },
  {
    id: 'trade_chip',
    name: 'Чип Торговца',
    description: 'Зашифрованный кредитный ключ.',
    loreDescription: 'Лицензия гильдии торговцев. Дает привилегии в автоматических киосках.',
    rarity: ArtifactRarity.RARE,
    icon: '💳',
    basePrice: 300,
    scrapAmount: 35,
    effectDescription: 'Скидки в городе -10%',
    modifiers: { shopDiscountPct: 10 }
  },
  {
    id: 'isotope_cell',
    name: 'Изотопная Ячейка',
    description: 'Слабое зеленое свечение.',
    loreDescription: 'Батарея аварийного питания. Все еще активна.',
    rarity: ArtifactRarity.RARE,
    icon: '🔋',
    basePrice: 350,
    scrapAmount: 40,
    visualEffect: 'MATRIX_GREEN',
    allowedBiomes: ['РАДИОАКТИВНОЕ ЯДРО'],
    effectDescription: 'Авто-бурение +15%',
    modifiers: { drillSpeedPct: 15 }
  },
  // NEW RARE
  {
    id: 'thermal_converter',
    name: 'Термо-конвертер',
    description: 'Преобразует тепло в кинетическую энергию.',
    loreDescription: 'Экспериментальный модуль. Чем горячее бур, тем быстрее он вращается.',
    rarity: ArtifactRarity.RARE,
    icon: '♨️',
    basePrice: 400,
    scrapAmount: 45,
    visualEffect: 'GLOW_GOLD',
    effectDescription: 'Авто-бурение +10%, Нагрев -5%',
    modifiers: { drillSpeedPct: 10, heatGenPct: 5 }
  },
  // NEW RARE
  {
    id: 'void_compass',
    name: 'Компас Пустоты',
    description: 'Стрелка всегда указывает вниз.',
    loreDescription: 'Помогает находить аномалии в пространстве-времени.',
    rarity: ArtifactRarity.RARE,
    icon: '🧭',
    basePrice: 450,
    scrapAmount: 50,
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: 'Удача (События) +20%',
    modifiers: { luckPct: 20 }
  },

  // --- EPIC (Precursor Tech) ---
  {
    id: 'void_battery',
    name: 'Батарея Пустоты',
    description: 'Черный куб. Тяжелее, чем выглядит.',
    loreDescription: 'Источник энергии, работающий на распаде вакуума. Никогда не разряжается.',
    rarity: ArtifactRarity.EPIC,
    icon: '⬛',
    basePrice: 1000,
    scrapAmount: 150,
    visualEffect: 'GLOW_PURPLE',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: 'Скорость бурения +25%, Нагрев -10%',
    modifiers: { drillSpeedPct: 25, heatGenPct: 10 }
  },
  {
    id: 'chronos_gear',
    name: 'Шестерня Времени',
    description: 'Она вращается, но зубцы не двигаются.',
    loreDescription: 'Механизм, игнорирующий энтропию. Позволяет предсказывать будущее.',
    rarity: ArtifactRarity.EPIC,
    icon: '⏳',
    basePrice: 1200,
    scrapAmount: 180,
    effectDescription: 'Шанс удачи (событий) +50%',
    modifiers: { luckPct: 50 }
  },
  {
    id: 'nano_queen',
    name: 'Матка Нанитов',
    description: 'Колба с серебристой жидкостью.',
    loreDescription: 'Координационный центр роя. Заставляет нанитов чинить бур, а не есть его.',
    rarity: ArtifactRarity.EPIC,
    icon: '🦠',
    basePrice: 1500,
    scrapAmount: 200,
    visualEffect: 'MATRIX_GREEN',
    allowedBiomes: ['ЗАЛЕЖИ ЖЕЛЕЗА', 'ЗОЛОТАЯ ЗЕМЛЯ'],
    effectDescription: 'Авто-бурение +40%',
    modifiers: { drillSpeedPct: 40 }
  },
  {
    id: 'graviton_anchor',
    name: 'Гравитонный Якорь',
    description: 'Невозможно сдвинуть с места, если активирован.',
    loreDescription: 'Устройство для фиксации реальности. Предотвращает квантовые сбои.',
    rarity: ArtifactRarity.EPIC,
    icon: '⚓',
    basePrice: 1400,
    scrapAmount: 170,
    effectDescription: 'Стабильность нагрева (снижение)',
    modifiers: { heatGenPct: 10 }
  },
  // NEW EPIC
  {
    id: 'gravity_damper',
    name: 'Грави-демпфер',
    description: 'Вокруг него искажается свет.',
    loreDescription: 'Поглощает инерцию ударов. Позволяет бить со страшной силой без отдачи.',
    rarity: ArtifactRarity.EPIC,
    icon: '🌌',
    basePrice: 1600,
    scrapAmount: 190,
    effectDescription: 'Сила клика +75%',
    modifiers: { clickPowerPct: 75 }
  },

  // --- LEGENDARY (Unique Anomalies) ---
  {
    id: 'heart_of_star',
    name: 'Сердце Звезды',
    description: 'Слепит глаза, даже если закрыть их.',
    loreDescription: 'Фрагмент нейтронной звезды, удерживаемый в стазис-поле. Бесконечная мощь.',
    rarity: ArtifactRarity.LEGENDARY,
    icon: '🌟',
    basePrice: 5000,
    scrapAmount: 1000,
    visualEffect: 'GLOW_GOLD',
    allowedBiomes: ['РАДИОАКТИВНОЕ ЯДРО'],
    effectDescription: 'ВСЕ ХАРАКТЕРИСТИКИ +50%',
    modifiers: { drillSpeedPct: 50, resourceMultPct: 50, clickPowerPct: 50 }
  },
  {
    id: 'singularity_shard',
    name: 'Осколок Сингулярности',
    description: 'В нем отражается то, чего нет позади вас.',
    loreDescription: 'Кусок горизонта событий. Ломает законы физики ради вашей выгоды.',
    rarity: ArtifactRarity.LEGENDARY,
    icon: '🌀',
    basePrice: 6666,
    scrapAmount: 1200,
    visualEffect: 'GLOW_PURPLE',
    allowedBiomes: ['ПЛАСТЫ ПУСТОТЫ'],
    effectDescription: 'Крит. удары бура x5 урона',
    modifiers: { clickPowerPct: 100 }
  },

  // --- ANOMALOUS (Dangerous / Glitch) ---
  {
    id: 'glitch_cube',
    name: '0xDEADBEEF',
    description: 'Ошибка рендеринга реальности.',
    loreDescription: 'ОБЪЕКТ НАРУШАЕТ 4-Ю СТЕНУ. НЕ СМОТРИТЕ НА НЕГО ДОЛГО.',
    rarity: ArtifactRarity.ANOMALOUS,
    icon: '👾',
    basePrice: 9999,
    scrapAmount: 666,
    visualEffect: 'GLITCH_RED',
    effectDescription: 'Добыча x10, но нагрев x5',
    modifiers: { resourceMultPct: 1000, heatGenPct: -400 }
  }
];

export const getArtifactColor = (rarity: ArtifactRarity): string => {
  switch (rarity) {
    case ArtifactRarity.COMMON: return 'border-zinc-500 text-zinc-400 shadow-zinc-900';
    case ArtifactRarity.RARE: return 'border-cyan-500 text-cyan-400 shadow-cyan-900/50';
    case ArtifactRarity.EPIC: return 'border-purple-500 text-purple-400 shadow-purple-900/50';
    case ArtifactRarity.LEGENDARY: return 'border-amber-400 text-amber-300 shadow-amber-500/50';
    case ArtifactRarity.ANOMALOUS: return 'border-red-500 text-red-500 shadow-red-900 animate-pulse';
    default: return 'border-zinc-500';
  }
};

export const rollArtifact = (depth: number, luck: number = 0, currentBiomeName?: string): ArtifactDefinition => {
  const rand = Math.random();
  // Luck influence: Each 1 luck reduces "Common" range by 0.1% and shifts it to upper tiers
  const luckFactor = luck / 1000; 
  
  // 1. FILTER BY BIOME FIRST
  let eligibleArtifacts = ARTIFACTS.filter(a => {
      // If artifact has allowedBiomes, check if currentBiomeName is in it.
      if (a.allowedBiomes && a.allowedBiomes.length > 0) {
          if (!currentBiomeName) return false;
          return a.allowedBiomes.includes(currentBiomeName);
      }
      // If artifact has NO allowedBiomes, it drops everywhere
      return true;
  });

  // If pool is empty (shouldn't happen given global items), fallback to global
  if (eligibleArtifacts.length === 0) {
      eligibleArtifacts = ARTIFACTS.filter(a => !a.allowedBiomes);
  }

  let pool: ArtifactDefinition[] = [];

  // Base Chances:
  // Legendary: 1% (>20k)
  // Epic: 5% (>5k)
  // Rare: 20%
  // Common: 74%

  if ((rand < 0.01 + luckFactor) && depth > 20000) { 
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.LEGENDARY || a.rarity === ArtifactRarity.ANOMALOUS);
  } else if ((rand < 0.06 + luckFactor) && depth > 5000) { 
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.EPIC);
  } else if ((rand < 0.26 + luckFactor)) { 
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.RARE);
  } else { 
    pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.COMMON);
  }

  // Fallback to lower rarity if high tier roll failed (empty pool)
  if (pool.length === 0) pool = eligibleArtifacts.filter(a => a.rarity === ArtifactRarity.COMMON);
  // Absolute Fallback
  if (pool.length === 0) pool = ARTIFACTS.filter(a => a.rarity === ArtifactRarity.COMMON);

  return pool[Math.floor(Math.random() * pool.length)];
};
