
import { Biome, DrillPart, EnginePart, CoolerPart, HullPart, LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, DroneDefinition, MergeRecipe, TunnelPropDef, DroneType } from './types';

export const BIOMES: Biome[] = [
  {
    depth: 0, name: "ПОВЕРХНОСТЬ", resource: "clay", color: "#8B4513",
    description: "Пыльный горизонт, где всё начинается.", hub: "БАЗА 'ГОРИЗОНТ'",
    hazard: 'CORROSION', hazardLevel: 1, gemResource: 'rubies'
  },
  {
    depth: 500, name: "ТВЕРДЫЙ КАМЕНЬ", resource: "stone", color: "#555555",
    description: "Непрощающая кора. Проверь свою решимость.",
    hazard: 'NONE', hazardLevel: 0, gemResource: 'rubies'
  },
  {
    depth: 1500, name: "МЕДНЫЕ ЖИЛЫ", resource: "copper", color: "#B87333",
    description: "Проводящие пути в глубине. Осторожно: ЭМ-поля.",
    hazard: 'MAGNETIC', hazardLevel: 15, gemResource: 'emeralds'
  },
  {
    depth: 4000, name: "ЗАЛЕЖИ ЖЕЛЕЗА", resource: "iron", color: "#A19D94",
    description: "Позвоночник машины.",
    hazard: 'CORROSION', hazardLevel: 10, gemResource: 'emeralds'
  },
  {
    depth: 10000, name: "КРИСТАЛЬНЫЕ ГРОТЫ", resource: "silver", color: "#00CED1",
    description: "Сияние в темноте. Отражают тепло.", hub: "КРИСТАЛЬНАЯ ГАВАНЬ",
    hazard: 'HEAT_REFLECTION', hazardLevel: 25, gemResource: 'diamonds'
  },
  {
    depth: 20000, name: "ЗОЛОТАЯ ЗЕМЛЯ", resource: "gold", color: "#FFD700",
    description: "Богатства спрессованной пустоты.",
    hazard: 'MAGNETIC', hazardLevel: 30, gemResource: 'diamonds'
  },
  {
    depth: 50000, name: "ПЛАСТЫ ПУСТОТЫ", resource: "titanium", color: "#1A1A1A",
    description: "Здесь свет гаснет. Давление критическое.", hub: "КУЗНИЦА МАГМЫ",
    hazard: 'VOID_PRESSURE', hazardLevel: 50, gemResource: 'diamonds'
  },
  {
    depth: 100000, name: "РАДИОАКТИВНОЕ ЯДРО", resource: "uranium", color: "#32CD32",
    description: "Последний барьер. Сердце бытия.", hub: "СВЯТИЛИЩЕ ЯДРА",
    hazard: 'RADIATION', hazardLevel: 100, gemResource: 'emeralds'
  }
];

// --- VISUAL PROPS REGISTRY (NEW) ---
export const TUNNEL_PROPS: TunnelPropDef[] = [
  { type: 'FOSSIL', minDepth: 10, maxDepth: 800, chance: 0.05, color: '#A0A0A0' }, // Bones/Shells
  { type: 'PIPE', minDepth: 100, maxDepth: 2000, chance: 0.03, color: '#554433' }, // Rusted Pipes
  { type: 'TECH_DEBRIS', minDepth: 2000, maxDepth: 10000, chance: 0.02, color: '#40E0D0' }, // Old Robots
  { type: 'CRYSTAL', minDepth: 8000, maxDepth: 25000, chance: 0.08, color: '#E0FFFF' }, // Giant Crystals
  { type: 'RUIN', minDepth: 15000, maxDepth: 100000, chance: 0.01, color: '#FFD700' } // Precursor Statues
];

// ... (REST OF THE FILE REMAINS UNCHANGED - BITS, ENGINES, ETC.)
// RE-EXPORTING EXISTING ARRAYS FOR BREVITY IN XML
export const BITS: DrillPart[] = [
  { id: 'bit_1', tier: 1, rarity: 'Common', name: 'Ржавое жало', description: 'Для тех, кому нечего терять.', cost: { clay: 50 }, baseStats: { damage: 1, energyCost: 1 }, fxId: 'pixel_sparks_brown' },
  { id: 'bit_2', tier: 2, rarity: 'Common', name: 'Стальной Крот', description: 'Стандарт шахтерских союзов.', cost: { clay: 200, stone: 50 }, baseStats: { damage: 5, energyCost: 3 }, fxId: 'none' },
  { id: 'bit_3', tier: 3, rarity: 'Common', name: 'Зуб Мамонта', description: 'Усиленный сплав, тяжелый и надежный.', cost: { stone: 300, copper: 100 }, baseStats: { damage: 12, energyCost: 5 }, fxId: 'none' },
  { id: 'bit_4', tier: 4, rarity: 'Rare', name: 'Победитовое сверло', description: 'Классика индустриальной эпохи.', cost: { copper: 500, iron: 200 }, baseStats: { damage: 25, energyCost: 8 }, fxId: 'blue_glint' },
  { id: 'bit_5', tier: 5, rarity: 'Rare', name: 'Титановый Клык', description: 'Легкий, быстрый, острый.', cost: { iron: 800, silver: 300 }, baseStats: { damage: 45, energyCost: 12 }, fxId: 'blue_glint' },
  { id: 'bit_6', tier: 6, rarity: 'Rare', name: 'Алмазный Конус', description: 'Пробивает почти всё на верхних слоях.', cost: { silver: 1200, gold: 400, diamonds: 5 }, baseStats: { damage: 80, energyCost: 18 }, fxId: 'blue_glint' },
  { id: 'bit_7', tier: 7, rarity: 'Epic', name: 'Вибро-бур "Сверчок"', description: 'Разрушает породу ультразвуком.', cost: { gold: 2000, titanium: 500, rubies: 10 }, baseStats: { damage: 120, energyCost: 25 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_8', tier: 8, rarity: 'Epic', name: 'Лазерный долот', description: 'Испаряет породу, не касаясь её.', cost: { titanium: 3000, uranium: 200, rubies: 30 }, baseStats: { damage: 200, energyCost: 35 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_9', tier: 9, rarity: 'Epic', name: 'Плазменный Резак', description: 'Температура на острие — как на Солнце.', cost: { uranium: 1000, rubies: 50, nanoSwarm: 100 }, baseStats: { damage: 350, energyCost: 50 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_10', tier: 10, rarity: 'Legendary', name: 'Молекулярный Дезинтегратор', description: 'Расщепляет молекулярные связи.', cost: { ancientTech: 10, emeralds: 30, nanoSwarm: 300 }, baseStats: { damage: 600, energyCost: 70 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_11', tier: 11, rarity: 'Legendary', name: 'Гравитационное Шило', description: 'Создает микро-разрыв в пространстве.', cost: { ancientTech: 50, diamonds: 50, nanoSwarm: 500 }, baseStats: { damage: 1200, energyCost: 100 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_12', tier: 12, rarity: 'Legendary', name: 'Антиматериевое перо', description: 'Аннигиляция при каждом касании.', cost: { ancientTech: 150, nanoSwarm: 1000, diamonds: 100 }, baseStats: { damage: 2500, energyCost: 150 }, fxId: 'fractal_rainbow_trail' },
  // FUSION ONLY
  { id: 'bit_13', tier: 13, rarity: 'Godly', name: 'Разлом Реальности', description: 'Стирает материю из истории.', cost: { ancientTech: 500, rubies: 500, diamonds: 200 }, baseStats: { damage: 6000, energyCost: 300 }, fxId: 'white_hole_distortion' },
  { id: 'bit_14', tier: 14, rarity: 'Godly', name: 'Спираль Судьбы', description: 'Урон растет от глубины. Тот самый бур.', cost: { ancientTech: 1000, emeralds: 500, nanoSwarm: 2000 }, baseStats: { damage: 15000, energyCost: 500 }, fxId: 'white_hole_distortion' },
  { id: 'bit_15', tier: 15, rarity: 'Godly', name: 'Пронзающий Пустоту', description: 'Когда преград больше не осталось.', cost: { ancientTech: 5000, diamonds: 1000, nanoSwarm: 5000 }, baseStats: { damage: 50000, energyCost: 1000 }, fxId: 'white_hole_distortion' }
];

export const ENGINES: EnginePart[] = [
  { id: 'eng_1', tier: 1, rarity: 'Common', name: 'Ручной привод', description: 'Твоя ярость — его топливо.', cost: { clay: 50 }, baseStats: { speed: 0.2, energyCost: 0 } },
  { id: 'eng_2', tier: 2, rarity: 'Common', name: 'Паровой котел', description: 'Пыхтит, но крутит.', cost: { stone: 100 }, baseStats: { speed: 0.5, energyCost: 5 } },
  { id: 'eng_3', tier: 3, rarity: 'Common', name: 'Дизель "Старый Джо"', description: 'Дымный, но неубиваемый.', cost: { copper: 300 }, baseStats: { speed: 1.0, energyCost: 10 } },
  { id: 'eng_4', tier: 4, rarity: 'Rare', name: 'Электромотор "Искра"', description: 'Чистая энергия, тихий ход.', cost: { iron: 600 }, baseStats: { speed: 1.5, energyCost: 15 } },
  { id: 'eng_5', tier: 5, rarity: 'Rare', name: 'Турбина "Циклон"', description: 'Высокие обороты, свист металла.', cost: { silver: 1000 }, baseStats: { speed: 2.5, energyCost: 25 } },
  { id: 'eng_6', tier: 6, rarity: 'Rare', name: 'Ротор "Вихрь"', description: 'Двойная система вращения.', cost: { gold: 1500, rubies: 5 }, baseStats: { speed: 4.0, energyCost: 40 } },
  { id: 'eng_7', tier: 7, rarity: 'Epic', name: 'Магнитный драйв', description: 'Никакого трения, только мощь.', cost: { titanium: 2500, nanoSwarm: 50 }, baseStats: { speed: 6.0, energyCost: 60 } },
  { id: 'eng_8', tier: 8, rarity: 'Epic', name: 'Ионный ускоритель', description: 'Синее свечение и бешеная скорость.', cost: { uranium: 1000, emeralds: 20 }, baseStats: { speed: 9.0, energyCost: 80 } },
  { id: 'eng_9', tier: 9, rarity: 'Epic', name: 'Фотонный двигатель', description: 'Энергия света в механическом теле.', cost: { ancientTech: 20, rubies: 30 }, baseStats: { speed: 12.0, energyCost: 100 } },
  { id: 'eng_10', tier: 10, rarity: 'Legendary', name: 'Варп-привод', description: 'Схлопывает время между оборотами.', cost: { ancientTech: 50, rubies: 50, nanoSwarm: 200 }, baseStats: { speed: 18.0, energyCost: 150 } },
  { id: 'eng_11', tier: 11, rarity: 'Legendary', name: 'Тахионный ротор', description: 'Вращается до того, как ты нажал кнопку.', cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 400 }, baseStats: { speed: 25.0, energyCost: 200 } },
  { id: 'eng_12', tier: 12, rarity: 'Legendary', name: 'Темная материя', description: 'Пожирает пространство вокруг себя.', cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 800 }, baseStats: { speed: 40.0, energyCost: 300 } },
  { id: 'fus_eng_13', tier: 13, rarity: 'Godly', name: 'Нулевая точка', description: 'Энергия из вакуума.', cost: { ancientTech: 1000, nanoSwarm: 2000, rubies: 200 }, baseStats: { speed: 60.0, energyCost: 500 } },
  { id: 'fus_eng_14', tier: 14, rarity: 'Godly', name: 'Квантовый суперпозитор', description: 'Вращается во всех направлениях сразу.', cost: { ancientTech: 2500, rubies: 1000, diamonds: 500 }, baseStats: { speed: 100.0, energyCost: 800 } },
  { id: 'fus_eng_15', tier: 15, rarity: 'Godly', name: 'Двигатель Воли', description: 'Бесконечный драйв.', cost: { ancientTech: 9999, nanoSwarm: 5000 }, baseStats: { speed: 200.0, energyCost: 1500 } }
];

export const COOLERS: CoolerPart[] = [
  { id: 'cool_1', tier: 1, rarity: 'Common', name: 'Дырявый бак', description: 'Поливай его водой вручную.', cost: { clay: 20 }, baseStats: { cooling: 1, energyCost: 0 } },
  { id: 'cool_2', tier: 2, rarity: 'Common', name: 'Медный радиатор', description: 'Базовая теплоотдача.', cost: { copper: 100 }, baseStats: { cooling: 3, energyCost: 1 } },
  { id: 'cool_3', tier: 3, rarity: 'Common', name: 'Вентилятор "Тайфун"', description: 'Активный обдув горячего вала.', cost: { iron: 300 }, baseStats: { cooling: 5, energyCost: 3 } },
  { id: 'cool_4', tier: 4, rarity: 'Rare', name: 'Масляный контур', description: 'Более вязкая и эффективная система.', cost: { silver: 600 }, baseStats: { cooling: 8, energyCost: 6 } },
  { id: 'cool_5', tier: 5, rarity: 'Rare', name: 'Фреоновая петля', description: 'Холод старых холодильников.', cost: { gold: 1000, emeralds: 5 }, baseStats: { cooling: 12, energyCost: 10 } },
  { id: 'cool_6', tier: 6, rarity: 'Rare', name: 'Жидкий Азот', description: 'Бур покрывается инеем.', cost: { titanium: 1500, emeralds: 10 }, baseStats: { cooling: 18, energyCost: 15 } },
  { id: 'cool_7', tier: 7, rarity: 'Epic', name: 'Гелиевый инжектор', description: 'Для экстремальных нагрузок.', cost: { uranium: 500, diamonds: 5 }, baseStats: { cooling: 25, energyCost: 20 } },
  { id: 'cool_8', tier: 8, rarity: 'Epic', name: 'Крио-капсула', description: 'Замораживает даже звук трения.', cost: { ancientTech: 15, diamonds: 10 }, baseStats: { cooling: 35, energyCost: 30 } },
  { id: 'cool_9', tier: 9, rarity: 'Epic', name: 'Тепловой насос "Бездна"', description: 'Сбрасывает жар в почву.', cost: { ancientTech: 40, rubies: 20, nanoSwarm: 50 }, baseStats: { cooling: 50, energyCost: 45 } },
  { id: 'cool_10', tier: 10, rarity: 'Legendary', name: 'Эндотермический реактор', description: 'Превращает тепло в энергию.', cost: { ancientTech: 100, emeralds: 50, nanoSwarm: 100 }, baseStats: { cooling: 70, energyCost: 0 } },
  { id: 'cool_11', tier: 11, rarity: 'Legendary', name: 'Абсолютный ноль', description: 'Движение атомов почти замирает.', cost: { ancientTech: 300, diamonds: 50, nanoSwarm: 200 }, baseStats: { cooling: 100, energyCost: 80 } },
  { id: 'cool_12', tier: 12, rarity: 'Legendary', name: 'Стрингер Пустоты', description: 'Тепло уходит в параллельный мир.', cost: { ancientTech: 800, nanoSwarm: 1000, rubies: 50 }, baseStats: { cooling: 150, energyCost: 120 } },
  { id: 'cool_13', tier: 13, rarity: 'Godly', name: 'Энтропийный якорь', description: 'Запрещает металлу нагреваться.', cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1500 }, baseStats: { cooling: 250, energyCost: 200 } },
  { id: 'cool_14', tier: 14, rarity: 'Godly', name: 'Ледяное сердце звезды', description: 'Холод межгалактического пространства.', cost: { ancientTech: 5000, emeralds: 500, diamonds: 200 }, baseStats: { cooling: 400, energyCost: 300 } },
  { id: 'cool_15', tier: 15, rarity: 'Godly', name: 'Смерть Вселенной', description: 'Нагрев невозможен. Абсолютная тишина.', cost: { ancientTech: 10000, nanoSwarm: 5000 }, baseStats: { cooling: 999, energyCost: 500 } }
];

export const HULLS: HullPart[] = [
  { id: 'hull_1', tier: 1, rarity: 'Common', name: 'Каркас из труб', description: '1 слот. Скрежещет, но держит.', cost: { clay: 50 }, baseStats: { maxIntegrity: 50, slots: 1, heatCap: 100, regen: 0 } },
  { id: 'hull_2', tier: 2, rarity: 'Common', name: 'Грузовой бокс', description: '1 слот. Простой и дешевый.', cost: { stone: 200 }, baseStats: { maxIntegrity: 150, slots: 1, heatCap: 150, regen: 0 } },
  { id: 'hull_3', tier: 3, rarity: 'Common', name: 'Сплав "Шахтер"', description: '2 слота. Рабочая лошадка.', cost: { copper: 500 }, baseStats: { maxIntegrity: 200, slots: 2, heatCap: 200, regen: 0.1 } },
  { id: 'hull_4', tier: 4, rarity: 'Rare', name: 'Укрепленный кокон', description: '2 слота. Выдержит обвал.', cost: { iron: 1000 }, baseStats: { maxIntegrity: 400, slots: 2, heatCap: 250, regen: 0.2 } },
  { id: 'hull_5', tier: 5, rarity: 'Rare', name: 'Рама "Авангард"', description: '3 слота. Для передовой.', cost: { silver: 1500 }, baseStats: { maxIntegrity: 500, slots: 3, heatCap: 300, regen: 0.5 } },
  { id: 'hull_6', tier: 6, rarity: 'Rare', name: 'Корпус "Бункер"', description: '3 слота. Тяжелый и надежный.', cost: { gold: 2500, emeralds: 5 }, baseStats: { maxIntegrity: 1000, slots: 3, heatCap: 400, regen: 1 } },
  { id: 'hull_7', tier: 7, rarity: 'Epic', name: 'Штурмовой дек', description: '4 слота. Боевая платформа.', cost: { titanium: 4000, emeralds: 20 }, baseStats: { maxIntegrity: 800, slots: 4, heatCap: 350, regen: 2 } },
  { id: 'hull_8', tier: 8, rarity: 'Epic', name: 'Оболочка "Стелс"', description: '4 слота. Гасит вибрации.', cost: { uranium: 1500, nanoSwarm: 50 }, baseStats: { maxIntegrity: 600, slots: 4, heatCap: 500, regen: 3 } },
  { id: 'hull_9', tier: 9, rarity: 'Epic', name: 'Титановый Монолит', description: '5 слотов. Несокрушимый.', cost: { ancientTech: 50, rubies: 10, diamonds: 20 }, baseStats: { maxIntegrity: 1500, slots: 5, heatCap: 600, regen: 5 } },
  { id: 'hull_10', tier: 10, rarity: 'Legendary', name: 'Экзо-скелет "Атлант"', description: '5 слотов. Поднимает горы.', cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 200 }, baseStats: { maxIntegrity: 2500, slots: 5, heatCap: 700, regen: 10 } },
  { id: 'hull_11', tier: 11, rarity: 'Legendary', name: 'Живая броня', description: '6 слотов. Регенерация структуры.', cost: { ancientTech: 400, diamonds: 30, nanoSwarm: 500 }, baseStats: { maxIntegrity: 3000, slots: 6, heatCap: 800, regen: 25 } },
  { id: 'hull_12', tier: 12, rarity: 'Legendary', name: 'Композит "Зеркало"', description: '6 слотов. Отражает реальность.', cost: { ancientTech: 1000, nanoSwarm: 1500, rubies: 100 }, baseStats: { maxIntegrity: 3500, slots: 6, heatCap: 900, regen: 50 } },
  { id: 'hull_13', tier: 13, rarity: 'Godly', name: 'Ковчег Предтеч', description: '7 слотов. Дом в пустоте.', cost: { ancientTech: 3000, rubies: 1000, diamonds: 500 }, baseStats: { maxIntegrity: 5000, slots: 7, heatCap: 1200, regen: 100 } },
  { id: 'hull_14', tier: 14, rarity: 'Godly', name: 'Сингулярная оболочка', description: '8 слотов. Поглощает урон в энергию.', cost: { ancientTech: 8000, emeralds: 1000, nanoSwarm: 3000 }, baseStats: { maxIntegrity: 8000, slots: 8, heatCap: 2000, regen: 250 } },
  { id: 'hull_15', tier: 15, rarity: 'Godly', name: 'Несокрушимый', description: '10 слотов. Вечность.', cost: { ancientTech: 20000, diamonds: 1000, nanoSwarm: 8000 }, baseStats: { maxIntegrity: 20000, slots: 10, heatCap: 5000, regen: 1000 } }
];

export const LOGIC_CORES: LogicPart[] = [
  { id: 'cpu_1', tier: 1, rarity: 'Common', name: 'Калькулятор', description: 'Считает на пальцах.', cost: { clay: 50 }, baseStats: { critChance: 1, energyCost: 1, luck: 0, predictionTime: 0 } },
  { id: 'cpu_2', tier: 2, rarity: 'Common', name: 'Блок "Сигнал"', description: 'Ловит эхо породы.', cost: { copper: 150 }, baseStats: { critChance: 3, energyCost: 3, luck: 0, predictionTime: 0 } },
  { id: 'cpu_3', tier: 3, rarity: 'Common', name: 'Логика "Скан"', description: 'Видит структуру.', cost: { iron: 300 }, baseStats: { critChance: 4, energyCost: 5, luck: 1, predictionTime: 0 } },
  { id: 'cpu_4', tier: 4, rarity: 'Rare', name: 'Процессор "Вектор"', description: 'Быстрые вычисления.', cost: { silver: 600 }, baseStats: { critChance: 5, energyCost: 8, luck: 2, predictionTime: 0 } },
  { id: 'cpu_5', tier: 5, rarity: 'Rare', name: 'ИИ "Геолог"', description: 'Подсвечивает руду.', cost: { gold: 1000, emeralds: 5 }, baseStats: { critChance: 7, energyCost: 12, luck: 5, predictionTime: 0 } },
  { id: 'cpu_6', tier: 6, rarity: 'Rare', name: 'Матрица "Поиск"', description: 'Лучший лут.', cost: { titanium: 1500, emeralds: 10 }, baseStats: { critChance: 10, energyCost: 18, luck: 8, predictionTime: 0 } },
  { id: 'cpu_7', tier: 7, rarity: 'Epic', name: 'Ядро "Ритм"', description: 'Синхронизация с пульсом.', cost: { uranium: 800, nanoSwarm: 20 }, baseStats: { critChance: 12, energyCost: 25, luck: 10, predictionTime: 2 } },
  { id: 'cpu_8', tier: 8, rarity: 'Epic', name: 'Квантовый чип', description: 'Вероятностные удары.', cost: { ancientTech: 20, nanoSwarm: 50 }, baseStats: { critChance: 15, energyCost: 35, luck: 15, predictionTime: 3 } },
  { id: 'cpu_9', tier: 9, rarity: 'Epic', name: 'Нейросеть "Видение"', description: 'Обучается в процессе.', cost: { ancientTech: 50, nanoSwarm: 100 }, baseStats: { critChance: 18, energyCost: 50, luck: 20, predictionTime: 4 } },
  { id: 'cpu_10', tier: 10, rarity: 'Legendary', name: 'Анализатор "Слабость"', description: 'Бьет в уязвимости.', cost: { ancientTech: 100, rubies: 50, nanoSwarm: 200 }, baseStats: { critChance: 22, energyCost: 80, luck: 30, predictionTime: 5 } },
  { id: 'cpu_11', tier: 11, rarity: 'Legendary', name: 'Кибер-мозг "Альфа"', description: 'Чистый интеллект.', cost: { ancientTech: 250, emeralds: 50, nanoSwarm: 400 }, baseStats: { critChance: 25, energyCost: 120, luck: 40, predictionTime: 7 } },
  { id: 'cpu_12', tier: 12, rarity: 'Legendary', name: 'Предсказатель', description: 'Видит будущее на 10с.', cost: { ancientTech: 600, diamonds: 50, nanoSwarm: 800 }, baseStats: { critChance: 30, energyCost: 180, luck: 50, predictionTime: 10 } },
  { id: 'cpu_13', tier: 13, rarity: 'Godly', name: 'Система "Доминация"', description: 'Каждый крит сильнее.', cost: { ancientTech: 1500, nanoSwarm: 2000 }, baseStats: { critChance: 35, energyCost: 250, luck: 75, predictionTime: 15 } },
  { id: 'cpu_14', tier: 14, rarity: 'Godly', name: 'Матрица Братана', description: 'Режим пафоса.', cost: { ancientTech: 4000, diamonds: 500, nanoSwarm: 3000 }, baseStats: { critChance: 50, energyCost: 400, luck: 100, predictionTime: 20 } },
  { id: 'cpu_15', tier: 15, rarity: 'Godly', name: 'Божественный Архитектор', description: 'Все просчитано.', cost: { ancientTech: 10000, nanoSwarm: 8000 }, baseStats: { critChance: 100, energyCost: 800, luck: 200, predictionTime: 30 } }
];

export const CONTROL_UNITS: ControlPart[] = [
  { id: 'ctrl_1', tier: 1, rarity: 'Common', name: 'Старая кнопка', description: 'x1.0', cost: { clay: 10 }, baseStats: { clickMultiplier: 1.0, energyCost: 0, ventSpeed: 1.0 } },
  { id: 'ctrl_2', tier: 2, rarity: 'Common', name: 'Механический тумблер', description: 'x1.2', cost: { stone: 50 }, baseStats: { clickMultiplier: 1.2, energyCost: 1, ventSpeed: 1.1 } },
  { id: 'ctrl_3', tier: 3, rarity: 'Common', name: 'Педаль газа', description: 'x1.5', cost: { copper: 150 }, baseStats: { clickMultiplier: 1.5, energyCost: 2, ventSpeed: 1.2 } },
  { id: 'ctrl_4', tier: 4, rarity: 'Rare', name: 'Джойстик "Ретро"', description: 'x2.0', cost: { iron: 300 }, baseStats: { clickMultiplier: 2.0, energyCost: 3, ventSpeed: 1.5 } },
  { id: 'ctrl_5', tier: 5, rarity: 'Rare', name: 'Сенсорный ввод', description: 'x2.5', cost: { silver: 600 }, baseStats: { clickMultiplier: 2.5, energyCost: 5, ventSpeed: 1.8 } },
  { id: 'ctrl_6', tier: 6, rarity: 'Rare', name: 'Кинетик-сенсор', description: 'x3.0', cost: { gold: 1000 }, baseStats: { clickMultiplier: 3.0, energyCost: 8, ventSpeed: 2.0 } },
  { id: 'ctrl_7', tier: 7, rarity: 'Epic', name: 'Голо-панель', description: 'x4.0', cost: { titanium: 1500, nanoSwarm: 20 }, baseStats: { clickMultiplier: 4.0, energyCost: 12, ventSpeed: 3.0 } },
  { id: 'ctrl_8', tier: 8, rarity: 'Epic', name: 'Перчатка силы', description: 'x6.0', cost: { uranium: 800, rubies: 10 }, baseStats: { clickMultiplier: 6.0, energyCost: 20, ventSpeed: 4.0 } },
  { id: 'ctrl_9', tier: 9, rarity: 'Epic', name: 'Мысленный шлем', description: 'x10.0', cost: { ancientTech: 25, nanoSwarm: 50 }, baseStats: { clickMultiplier: 10.0, energyCost: 35, ventSpeed: 6.0 } },
  { id: 'ctrl_10', tier: 10, rarity: 'Legendary', name: 'Нейро-имплант', description: 'x15.0', cost: { ancientTech: 100, nanoSwarm: 200 }, baseStats: { clickMultiplier: 15.0, energyCost: 50, ventSpeed: 8.0 } },
  { id: 'ctrl_11', tier: 11, rarity: 'Legendary', name: 'Прямое подключение', description: 'x25.0', cost: { ancientTech: 250, nanoSwarm: 400 }, baseStats: { clickMultiplier: 25.0, energyCost: 80, ventSpeed: 12.0 } },
  { id: 'ctrl_12', tier: 12, rarity: 'Legendary', name: 'Волевой интерфейс', description: 'x50.0', cost: { ancientTech: 600, nanoSwarm: 800, diamonds: 50 }, baseStats: { clickMultiplier: 50.0, energyCost: 120, ventSpeed: 20.0 } },
  { id: 'ctrl_13', tier: 13, rarity: 'Godly', name: 'Симбиоз', description: 'x100.0', cost: { ancientTech: 1500, nanoSwarm: 2000, emeralds: 200 }, baseStats: { clickMultiplier: 100.0, energyCost: 200, ventSpeed: 50.0 } },
  { id: 'ctrl_14', tier: 14, rarity: 'Godly', name: 'Единство души', description: 'x500.0', cost: { ancientTech: 5000, nanoSwarm: 5000 }, baseStats: { clickMultiplier: 500.0, energyCost: 400, ventSpeed: 100.0 } },
  { id: 'ctrl_15', tier: 15, rarity: 'Godly', name: 'Творец', description: '1 клик = 1 слой.', cost: { ancientTech: 20000, nanoSwarm: 10000 }, baseStats: { clickMultiplier: 1000.0, energyCost: 800, ventSpeed: 500.0 } }
];

export const GEARBOXES: GearboxPart[] = [
  { id: 'gear_1', tier: 1, rarity: 'Common', name: 'Ремни и шкивы', description: 'Игнор 2%', cost: { clay: 50 }, baseStats: { torque: 2, energyCost: 1 } },
  { id: 'gear_2', tier: 2, rarity: 'Common', name: 'Шестерни из меди', description: 'Игнор 5%', cost: { copper: 200 }, baseStats: { torque: 5, energyCost: 2 } },
  { id: 'gear_3', tier: 3, rarity: 'Common', name: 'Стальной червяк', description: 'Игнор 10%', cost: { iron: 400 }, baseStats: { torque: 10, energyCost: 4 } },
  { id: 'gear_4', tier: 4, rarity: 'Rare', name: 'Планетарная передача', description: 'Игнор 15%', cost: { silver: 800 }, baseStats: { torque: 15, energyCost: 7 } },
  { id: 'gear_5', tier: 5, rarity: 'Rare', name: 'Гидравлика "Напор"', description: 'Игнор 20%', cost: { gold: 1200 }, baseStats: { torque: 20, energyCost: 12 } },
  { id: 'gear_6', tier: 6, rarity: 'Rare', name: 'Магнитная муфта', description: 'Игнор 25%', cost: { titanium: 2000, diamonds: 5 }, baseStats: { torque: 25, energyCost: 18 } },
  { id: 'gear_7', tier: 7, rarity: 'Epic', name: 'Титановый редуктор', description: 'Игнор 30%', cost: { uranium: 1000, diamonds: 10 }, baseStats: { torque: 30, energyCost: 25 } },
  { id: 'gear_8', tier: 8, rarity: 'Epic', name: 'Алмазные зубья', description: 'Игнор 40%', cost: { ancientTech: 20, diamonds: 30 }, baseStats: { torque: 40, energyCost: 35 } },
  { id: 'gear_9', tier: 9, rarity: 'Epic', name: 'Герметичный привод', description: 'Игнор 50%', cost: { ancientTech: 60, nanoSwarm: 50 }, baseStats: { torque: 50, energyCost: 50 } },
  { id: 'gear_10', tier: 10, rarity: 'Legendary', name: 'Грави-стабилизатор', description: 'Игнор 60%', cost: { ancientTech: 150, emeralds: 50 }, baseStats: { torque: 60, energyCost: 70 } },
  { id: 'gear_11', tier: 11, rarity: 'Legendary', name: 'Модуль "Прорыв"', description: 'Игнор 70%', cost: { ancientTech: 400, diamonds: 100 }, baseStats: { torque: 70, energyCost: 100 } },
  { id: 'gear_12', tier: 12, rarity: 'Legendary', name: 'Вариатор "Тьма"', description: 'Игнор 80%', cost: { ancientTech: 1000, nanoSwarm: 500, rubies: 50 }, baseStats: { torque: 80, energyCost: 150 } },
  { id: 'gear_13', tier: 13, rarity: 'Godly', name: 'Разрушитель связей', description: 'Игнор 90%', cost: { ancientTech: 3000, diamonds: 300, nanoSwarm: 1000 }, baseStats: { torque: 90, energyCost: 200 } },
  { id: 'gear_14', tier: 14, rarity: 'Godly', name: 'Нулевое сопротивление', description: 'Игнор 95%', cost: { ancientTech: 8000, nanoSwarm: 3000 }, baseStats: { torque: 95, energyCost: 300 } },
  { id: 'gear_15', tier: 15, rarity: 'Godly', name: 'Абсолютная тяга', description: 'Игнор 100%', cost: { ancientTech: 20000, diamonds: 1000 }, baseStats: { torque: 100, energyCost: 500 } }
];

export const POWER_CORES: PowerCorePart[] = [
  { id: 'pwr_1', tier: 1, rarity: 'Common', name: 'Батарейка АА', description: '10 ед.', cost: { clay: 50 }, baseStats: { energyOutput: 10, droneEfficiency: 1.0 } },
  { id: 'pwr_2', tier: 2, rarity: 'Common', name: 'Свинцовый АКБ', description: '25 ед.', cost: { copper: 150 }, baseStats: { energyOutput: 25, droneEfficiency: 1.05 } },
  { id: 'pwr_3', tier: 3, rarity: 'Common', name: 'Бензогенератор', description: '50 ед.', cost: { iron: 300 }, baseStats: { energyOutput: 50, droneEfficiency: 1.1 } },
  { id: 'pwr_4', tier: 4, rarity: 'Rare', name: 'Солнечная панель', description: '80 ед.', cost: { silver: 600 }, baseStats: { energyOutput: 80, droneEfficiency: 1.2 } },
  { id: 'pwr_5', tier: 5, rarity: 'Rare', name: 'Изотопный элемент', description: '120 ед.', cost: { gold: 1000 }, baseStats: { energyOutput: 120, droneEfficiency: 1.3 } },
  { id: 'pwr_6', tier: 6, rarity: 'Rare', name: 'Ядерная ячейка', description: '180 ед.', cost: { titanium: 1500, rubies: 5 }, baseStats: { energyOutput: 180, droneEfficiency: 1.5 } },
  { id: 'pwr_7', tier: 7, rarity: 'Epic', name: 'Термоядерный узел', description: '300 ед.', cost: { uranium: 1000, rubies: 15 }, baseStats: { energyOutput: 300, droneEfficiency: 1.8 } },
  { id: 'pwr_8', tier: 8, rarity: 'Epic', name: 'Плазменный шар', description: '500 ед.', cost: { ancientTech: 20, rubies: 30 }, baseStats: { energyOutput: 500, droneEfficiency: 2.2 } },
  { id: 'pwr_9', tier: 9, rarity: 'Epic', name: 'Антиматериевый бак', description: '800 ед.', cost: { ancientTech: 50, nanoSwarm: 50 }, baseStats: { energyOutput: 800, droneEfficiency: 2.6 } },
  { id: 'pwr_10', tier: 10, rarity: 'Legendary', name: 'Кварковая ячейка', description: '1200 ед.', cost: { ancientTech: 120, rubies: 50, nanoSwarm: 100 }, baseStats: { energyOutput: 1200, droneEfficiency: 3.5 } },
  { id: 'pwr_11', tier: 11, rarity: 'Legendary', name: 'Звездное ядро', description: '1800 ед.', cost: { ancientTech: 300, rubies: 100, diamonds: 50 }, baseStats: { energyOutput: 1800, droneEfficiency: 4.5 } },
  { id: 'pwr_12', tier: 12, rarity: 'Legendary', name: 'Сингулярность', description: '3000 ед.', cost: { ancientTech: 800, nanoSwarm: 500, emeralds: 50 }, baseStats: { energyOutput: 3000, droneEfficiency: 6.0 } },
  { id: 'pwr_13', tier: 13, rarity: 'Godly', name: 'Энергия Пустоты', description: '6000 ед.', cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1000 }, baseStats: { energyOutput: 6000, droneEfficiency: 10.0 } },
  { id: 'pwr_14', tier: 14, rarity: 'Godly', name: 'Дыхание Вселенной', description: '15000 ед.', cost: { ancientTech: 5000, rubies: 1000, diamonds: 500 }, baseStats: { energyOutput: 15000, droneEfficiency: 20.0 } },
  { id: 'pwr_15', tier: 15, rarity: 'Godly', name: 'Вечный Двигатель', description: '∞', cost: { ancientTech: 15000, nanoSwarm: 5000 }, baseStats: { energyOutput: 99999, droneEfficiency: 50.0 } }
];

export const ARMORS: ArmorPart[] = [
  { id: 'arm_1', tier: 1, rarity: 'Common', name: 'Фольга', description: '1% защиты', cost: { clay: 50 }, baseStats: { defense: 1, energyCost: 0, hazardResist: 0 } },
  { id: 'arm_2', tier: 2, rarity: 'Common', name: 'Листы стали', description: '5%', cost: { iron: 200 }, baseStats: { defense: 5, energyCost: 2, hazardResist: 0 } },
  { id: 'arm_3', tier: 3, rarity: 'Common', name: 'Керамика', description: 'Жар +10%', cost: { stone: 400 }, baseStats: { defense: 10, energyCost: 5, hazardResist: 5 } },
  { id: 'arm_4', tier: 4, rarity: 'Rare', name: 'Свинец', description: 'Радиация +20%', cost: { copper: 600 }, baseStats: { defense: 15, energyCost: 10, hazardResist: 10 } },
  { id: 'arm_5', tier: 5, rarity: 'Rare', name: 'Титан', description: '15% защиты', cost: { titanium: 800 }, baseStats: { defense: 15, energyCost: 15, hazardResist: 15 } },
  { id: 'arm_6', tier: 6, rarity: 'Rare', name: 'Композит', description: '25% защиты', cost: { silver: 1200 }, baseStats: { defense: 25, energyCost: 20, hazardResist: 20 } },
  { id: 'arm_7', tier: 7, rarity: 'Epic', name: 'Магнитное поле', description: 'Отражение', cost: { gold: 2000, emeralds: 10 }, baseStats: { defense: 30, energyCost: 30, hazardResist: 30 } },
  { id: 'arm_8', tier: 8, rarity: 'Epic', name: 'Ионный щит', description: 'Энерго-защита', cost: { uranium: 1000, rubies: 20 }, baseStats: { defense: 35, energyCost: 40, hazardResist: 40 } },
  { id: 'arm_9', tier: 9, rarity: 'Epic', name: 'Вольфрамовая броня', description: '40% защиты', cost: { ancientTech: 20, diamonds: 20 }, baseStats: { defense: 40, energyCost: 50, hazardResist: 50 } },
  { id: 'arm_10', tier: 10, rarity: 'Legendary', name: 'Силовое поле "Зенит"', description: '50% погл.', cost: { ancientTech: 60, rubies: 50, nanoSwarm: 50 }, baseStats: { defense: 50, energyCost: 70, hazardResist: 60 } },
  { id: 'arm_11', tier: 11, rarity: 'Legendary', name: 'Нейтронный слой', description: 'Неуязвим для рад.', cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 100 }, baseStats: { defense: 60, energyCost: 90, hazardResist: 70 } },
  { id: 'arm_12', tier: 12, rarity: 'Legendary', name: 'Пространственный сдвиг', description: 'Уклонение 20%', cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 300 }, baseStats: { defense: 70, energyCost: 120, hazardResist: 80 } },
  { id: 'arm_13', tier: 13, rarity: 'Godly', name: 'Щит "Абсолют"', description: '80% защиты', cost: { ancientTech: 1000, emeralds: 300, diamonds: 200 }, baseStats: { defense: 80, energyCost: 200, hazardResist: 90 } },
  { id: 'arm_14', tier: 14, rarity: 'Godly', name: 'Фрактальная броня', description: 'Распред. урон', cost: { ancientTech: 3000, nanoSwarm: 2000 }, baseStats: { defense: 90, energyCost: 300, hazardResist: 95 } },
  { id: 'arm_15', tier: 15, rarity: 'Godly', name: 'Божественная длань', description: 'Иммунитет', cost: { ancientTech: 10000, rubies: 1000, emeralds: 1000, diamonds: 1000 }, baseStats: { defense: 100, energyCost: 600, hazardResist: 100 } }
];

export const FUSION_RECIPES: MergeRecipe[] = [
  // BITS
  { id: 'fus_bit_13', resultId: 'bit_13', componentAId: 'bit_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Разрыв реальности требует жертв.' },
  { id: 'fus_bit_14', resultId: 'bit_14', componentAId: 'bit_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Спираль судьбы закручивается.', condition: { type: 'DEPTH_REACHED', target: 20000, description: 'Глубина > 20,000м' } },
  { id: 'fus_bit_15', resultId: 'bit_15', componentAId: 'bit_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Последний рубеж материи.', condition: { type: 'DEPTH_REACHED', target: 50000, description: 'Глубина > 50,000м' } },
  // ENGINES
  { id: 'fus_eng_13', resultId: 'eng_13', componentAId: 'eng_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Движение без инерции.' },
  { id: 'fus_eng_14', resultId: 'eng_14', componentAId: 'eng_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Вращение в 4-х измерениях.' },
  { id: 'fus_eng_15', resultId: 'eng_15', componentAId: 'eng_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Чистая воля как топливо.', condition: { type: 'ZERO_HEAT', target: 30, description: 'Температура 0% (30 сек)' } },
  // COOLERS
  { id: 'fus_cool_13', resultId: 'cool_13', componentAId: 'cool_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Остановка молекул.', condition: { type: 'ZERO_HEAT', target: 15, description: 'Температура 0% (15 сек)' } },
  { id: 'fus_cool_14', resultId: 'cool_14', componentAId: 'cool_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Холод мертвой звезды.', condition: { type: 'ZERO_HEAT', target: 60, description: 'Температура 0% (60 сек)' } },
  { id: 'fus_cool_15', resultId: 'cool_15', componentAId: 'cool_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Конец термодинамики.', condition: { type: 'ZERO_HEAT', target: 120, description: 'Температура 0% (120 сек)' } },
  // HULLS
  { id: 'fus_hull_13', resultId: 'hull_13', componentAId: 'hull_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Материя, сплетенная со временем.', condition: { type: 'NO_DAMAGE', target: 100, description: 'Целостность 100%' } },
  { id: 'fus_hull_14', resultId: 'hull_14', componentAId: 'hull_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Поглощение ударов любой реальности.' },
  { id: 'fus_hull_15', resultId: 'hull_15', componentAId: 'hull_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Вечность в металле.', condition: { type: 'NO_DAMAGE', target: 100, description: 'Целостность 100%' } },
  // LOGIC
  { id: 'fus_cpu_13', resultId: 'cpu_13', componentAId: 'cpu_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Доминация над вероятностями.' },
  { id: 'fus_cpu_14', resultId: 'cpu_14', componentAId: 'cpu_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Братский код вселенной.' },
  { id: 'fus_cpu_15', resultId: 'cpu_15', componentAId: 'cpu_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Архитектура бога.', condition: { type: 'ZERO_HEAT', target: 60, description: 'Температура 0% (60 сек)' } },
  // CONTROL
  { id: 'fus_ctrl_13', resultId: 'ctrl_13', componentAId: 'ctrl_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Полный симбиоз с машиной.' },
  { id: 'fus_ctrl_14', resultId: 'ctrl_14', componentAId: 'ctrl_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Душа стала кодом.' },
  { id: 'fus_ctrl_15', resultId: 'ctrl_15', componentAId: 'ctrl_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Мысль материальна.' },
  // GEARBOXES
  { id: 'fus_gear_13', resultId: 'gear_13', componentAId: 'gear_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Разрыв межатомных связей.' },
  { id: 'fus_gear_14', resultId: 'gear_14', componentAId: 'gear_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Сопротивление бесполезно.', condition: { type: 'DEPTH_REACHED', target: 10000, description: 'Глубина > 10,000м' } },
  { id: 'fus_gear_15', resultId: 'gear_15', componentAId: 'gear_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Тяга черной дыры.', condition: { type: 'DEPTH_REACHED', target: 40000, description: 'Глубина > 40,000м' } },
  // POWER
  { id: 'fus_pwr_13', resultId: 'pwr_13', componentAId: 'pwr_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Энергия самой Пустоты.' },
  { id: 'fus_pwr_14', resultId: 'pwr_14', componentAId: 'pwr_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Дыхание рождающейся вселенной.' },
  { id: 'fus_pwr_15', resultId: 'pwr_15', componentAId: 'pwr_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Вечный двигатель первого рода.' },
  // ARMOR
  { id: 'fus_arm_13', resultId: 'arm_13', componentAId: 'arm_12', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 500 }, description: 'Абсолютная защита.' },
  { id: 'fus_arm_14', resultId: 'arm_14', componentAId: 'arm_13', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 1000 }, description: 'Фрактальное поглощение урона.', condition: { type: 'NO_DAMAGE', target: 100, description: 'Целостность 100%' } },
  { id: 'fus_arm_15', resultId: 'arm_15', componentAId: 'arm_14', componentBId: 'NONE', catalyst: { resource: 'ancientTech', amount: 5000 }, description: 'Божественная неуязвимость.', condition: { type: 'NO_DAMAGE', target: 100, description: 'Целостность 100%' } }
];

export const DRONES: DroneDefinition[] = [
  {
    id: DroneType.COLLECTOR,
    name: 'СБОРЩИК MK-1',
    description: 'Требуется: Медь + Изумруды (сенсоры).',
    baseCost: { clay: 500, copper: 200, emeralds: 5 },
    costMultiplier: 1.5,
    maxLevel: 10,
    color: '#00FF00',
    effectDescription: (lvl) => `Множитель сбора: x${(1 + lvl * 0.2).toFixed(1)}`
  },
  {
    id: DroneType.COOLER,
    name: 'КРИО-БОТ MK-2',
    description: 'Требуется: Серебро + Железо (радиатор).',
    baseCost: { iron: 800, silver: 400 },
    costMultiplier: 1.6,
    maxLevel: 10,
    color: '#00FFFF',
    effectDescription: (lvl) => `Охлаждение: -${(1.5 * lvl).toFixed(1)}/сек`
  },
  {
    id: DroneType.BATTLE,
    name: 'ОХРАННИК MK-3',
    description: 'Требуется: Титан + Рубины (лазер).',
    baseCost: { gold: 1500, titanium: 600, rubies: 10 },
    costMultiplier: 1.8,
    maxLevel: 10,
    color: '#FF0000',
    effectDescription: (lvl) => `Урон боссам: ${(50 * lvl)}/сек`
  },
  {
    id: DroneType.REPAIR,
    name: 'НАНО-ВРАЧ MK-4',
    description: 'Требуется: Уран + Нано-рой.',
    baseCost: { uranium: 1000, nanoSwarm: 200 },
    costMultiplier: 2.0,
    maxLevel: 10,
    color: '#FFD700',
    effectDescription: (lvl) => `Ремонт: +${(0.2 * lvl).toFixed(1)}/сек`
  },
  {
    id: DroneType.MINER,
    name: 'БУР-ДРОН MK-5',
    description: 'Требуется: Ancient Tech + Алмазы (бур).',
    baseCost: { ancientTech: 50, diamonds: 20 },
    costMultiplier: 2.5,
    maxLevel: 10,
    color: '#FF00FF',
    effectDescription: (lvl) => `Добыча: ${(lvl * 5)}/сек`
  }
];

export const GAME_VERSION = '0.1.0';
