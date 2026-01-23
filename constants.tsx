
import { Biome, DrillPart, EnginePart, CoolerPart, HullPart, LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, CargoBayPart, DroneDefinition, MergeRecipe, TunnelPropDef, DroneType, ResourceType } from './types';

export const BIOMES: Biome[] = [
  {
    depth: 0, name: { RU: "ПОВЕРХНОСТЬ", EN: "SURFACE" }, resource: ResourceType.CLAY, color: "#8B4513",
    description: { RU: "Пыльный горизонт, где всё начинается.", EN: "Dusty horizon where it all begins." }, hub: "БАЗА 'ГОРИЗОНТ'",
    hazard: 'CORROSION', hazardLevel: 1, gemResource: ResourceType.RUBIES
  },
  {
    depth: 500, name: { RU: "ТВЕРДЫЙ КАМЕНЬ", EN: "HARD ROCK" }, resource: ResourceType.STONE, color: "#555555",
    description: { RU: "Непрощающая кора. Проверь свою решимость.", EN: "Unforgiving crust. Test your resolve." },
    hazard: 'NONE', hazardLevel: 0, gemResource: ResourceType.RUBIES
  },
  {
    depth: 1500, name: { RU: "МЕДНЫЕ ЖИЛЫ", EN: "COPPER VEINS" }, resource: ResourceType.COPPER, color: "#B87333",
    description: { RU: "Проводящие пути в глубине. Осторожно: ЭМ-поля.", EN: "Conductive paths in the deep. Caution: EM fields." },
    hazard: 'MAGNETIC', hazardLevel: 15, gemResource: ResourceType.EMERALDS
  },
  {
    depth: 4000, name: { RU: "ЗАЛЕЖИ ЖЕЛЕЗА", EN: "IRON DEPOSITS" }, resource: ResourceType.IRON, color: "#A19D94",
    description: { RU: "Позвоночник машины.", EN: "The backbone of the machine." },
    hazard: 'CORROSION', hazardLevel: 10, gemResource: ResourceType.EMERALDS
  },
  {
    depth: 10000, name: { RU: "КРИСТАЛЬНЫЕ ГРОТЫ", EN: "CRYSTAL GROTTOES" }, resource: ResourceType.SILVER, color: "#00CED1",
    description: { RU: "Сияние в темноте. Отражают тепло.", EN: "Glitter in the dark. Reflect heat." }, hub: "КРИСТАЛЬНАЯ ГАВАНЬ",
    hazard: 'HEAT_REFLECTION', hazardLevel: 25, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 20000, name: { RU: "ЗОЛОТАЯ ЗЕМЛЯ", EN: "GOLDEN LAND" }, resource: ResourceType.GOLD, color: "#FFD700",
    description: { RU: "Богатства спрессованной пустоты.", EN: "Riches of compressed void." },
    hazard: 'MAGNETIC', hazardLevel: 30, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 50000, name: { RU: "ПЛАСТЫ ПУСТОТЫ", EN: "VOID LAYERS" }, resource: ResourceType.TITANIUM, color: "#1A1A1A",
    description: { RU: "Здесь свет гаснет. Давление критическое.", EN: "Where the light fades. Critical pressure." }, hub: "КУЗНИЦА МАГМЫ",
    hazard: 'VOID_PRESSURE', hazardLevel: 50, gemResource: ResourceType.DIAMONDS
  },
  {
    depth: 100000, name: { RU: "РАДИОАКТИВНОЕ ЯДРО", EN: "RADIOACTIVE CORE" }, resource: ResourceType.URANIUM, color: "#32CD32",
    description: { RU: "Последний барьер. Сердце бытия.", EN: "The final barrier. Heart of existence." }, hub: "СВЯТИЛИЩЕ ЯДРА",
    hazard: 'RADIATION', hazardLevel: 100, gemResource: ResourceType.EMERALDS
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
  { id: 'bit_1', tier: 1, mass: 10, rarity: 'Common', name: { RU: 'Ржавое жало', EN: 'Rusty Sting' }, description: { RU: 'Для тех, кому нечего терять.', EN: 'For those with nothing to lose.' }, cost: { clay: 50 }, baseStats: { damage: 1, energyCost: 1 }, fxId: 'pixel_sparks_brown' },
  { id: 'bit_2', tier: 2, mass: 17, rarity: 'Common', name: { RU: 'Стальной Крот', EN: 'Steel Mole' }, description: { RU: 'Стандарт шахтерских союзов.', EN: 'Standard of miner unions.' }, cost: { clay: 200, stone: 50 }, baseStats: { damage: 5, energyCost: 3 }, fxId: 'none' },
  { id: 'bit_3', tier: 3, mass: 23, rarity: 'Common', name: { RU: 'Зуб Мамонта', EN: 'Mammoth Tooth' }, description: { RU: 'Усиленный сплав, тяжелый и надежный.', EN: 'Reinforced alloy, heavy and reliable.' }, cost: { stone: 300, copper: 100 }, baseStats: { damage: 12, energyCost: 5 }, fxId: 'none' },
  { id: 'bit_4', tier: 4, mass: 28, rarity: 'Rare', name: { RU: 'Победитовое сверло', EN: 'Widia Drill' }, description: { RU: 'Классика индустриальной эпохи.', EN: 'Industrial age classic.' }, cost: { copper: 500, iron: 200 }, baseStats: { damage: 25, energyCost: 8 }, fxId: 'blue_glint' },
  { id: 'bit_5', tier: 5, mass: 33, rarity: 'Rare', name: { RU: 'Титановый Клык', EN: 'Titanium Fang' }, description: { RU: 'Легкий, быстрый, острый.', EN: 'Light, fast, sharp.' }, cost: { iron: 800, silver: 300 }, baseStats: { damage: 45, energyCost: 12 }, fxId: 'blue_glint' },
  { id: 'bit_6', tier: 6, mass: 38, rarity: 'Rare', name: { RU: 'Алмазный Конус', EN: 'Diamond Cone' }, description: { RU: 'Пробивает почти всё на верхних слоях.', EN: 'Bores through almost anything on upper layers.' }, cost: { silver: 1200, gold: 400, diamonds: 5 }, baseStats: { damage: 80, energyCost: 18 }, fxId: 'blue_glint' },
  { id: 'bit_7', tier: 7, mass: 43, rarity: 'Epic', name: { RU: 'Вибро-бур "Сверчок"', EN: 'Vibro-drill "Cricket"' }, description: { RU: 'Разрушает породу ультразвуком.', EN: 'Destroys rock with ultrasound.' }, cost: { gold: 2000, titanium: 500, rubies: 10 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 120, energyCost: 25 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_8', tier: 8, mass: 48, rarity: 'Epic', name: { RU: 'Лазерный долот', EN: 'Laser Chisel' }, description: { RU: 'Испаряет породу, не касаясь её.', EN: 'Vaporizes rock without touching it.' }, cost: { titanium: 3000, uranium: 200, rubies: 30 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 200, energyCost: 35 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_9', tier: 9, mass: 52, rarity: 'Epic', name: { RU: 'Плазменный Резак', EN: 'Plasma Cutter' }, description: { RU: 'Температура на острие — как на Солнце.', EN: 'The tip temperature is like the Sun.' }, cost: { uranium: 1000, rubies: 50, nanoSwarm: 100 }, blueprintId: 'blueprint_advanced_drilling', baseStats: { damage: 350, energyCost: 50 }, fxId: 'golden_aura_vfx' },
  { id: 'bit_10', tier: 10, mass: 56, rarity: 'Legendary', name: { RU: 'Молекулярный Дезинтегратор', EN: 'Molecular Disintegrator' }, description: { RU: 'Расщепляет молекулярные связи.', EN: 'Splits molecular bonds.' }, cost: { ancientTech: 10, emeralds: 30, nanoSwarm: 300 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 600, energyCost: 70 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_11', tier: 11, mass: 60, rarity: 'Legendary', name: { RU: 'Гравитационное Шило', EN: 'Gravitational Awl' }, description: { RU: 'Создает микро-разрыв в пространстве.', EN: 'Creates a micro-rupture in space.' }, cost: { ancientTech: 50, diamonds: 50, nanoSwarm: 500 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 1200, energyCost: 100 }, fxId: 'fractal_rainbow_trail' },
  { id: 'bit_12', tier: 12, mass: 64, rarity: 'Legendary', name: { RU: 'Антиматериевое перо', EN: 'Antimatter Nib' }, description: { RU: 'Аннигиляция при каждом касании.', EN: 'Annihilation with every touch.' }, cost: { ancientTech: 150, nanoSwarm: 1000, diamonds: 100 }, blueprintId: 'blueprint_quantum_drilling', baseStats: { damage: 2500, energyCost: 150 }, fxId: 'fractal_rainbow_trail' },
  // FUSION ONLY
  { id: 'bit_13', tier: 13, mass: 68, rarity: 'Godly', name: { RU: 'Разлом Реальности', EN: 'Reality Breach' }, description: { RU: 'Стирает материю из истории.', EN: 'Erases matter from history.' }, cost: { ancientTech: 500, rubies: 500, diamonds: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 6000, energyCost: 300 }, fxId: 'white_hole_distortion' },
  { id: 'bit_14', tier: 14, mass: 72, rarity: 'Godly', name: { RU: 'Спираль Судьбы', EN: 'Spiral of Fate' }, description: { RU: 'Урон растет от глубины. Тот самый бур.', EN: 'Damage grows with depth. The drill.' }, cost: { ancientTech: 1000, emeralds: 500, nanoSwarm: 2000 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 15000, energyCost: 500 }, fxId: 'white_hole_distortion' },
  { id: 'bit_15', tier: 15, mass: 76, rarity: 'Godly', name: { RU: 'Пронзающий Пустоту', EN: 'Void Piercer' }, description: { RU: 'Когда преград больше не осталось.', EN: 'When no obstacles remain.' }, cost: { ancientTech: 5000, diamonds: 1000, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { damage: 50000, energyCost: 1000 }, fxId: 'white_hole_distortion' }
];


export const ENGINES: EnginePart[] = [
  { id: 'eng_1', tier: 1, mass: 80, rarity: 'Common', name: { RU: 'Ручной привод', EN: 'Manual Drive' }, description: { RU: 'Твоя ярость — его топливо.', EN: 'Your rage is its fuel.' }, cost: { clay: 50 }, baseStats: { speed: 1.0, energyCost: 0 } },
  { id: 'eng_2', tier: 2, mass: 139, rarity: 'Common', name: { RU: 'Паровой котел', EN: 'Steam Boiler' }, description: { RU: 'Пыхтит, но крутит.', EN: 'Puffs, but turns.' }, cost: { stone: 100 }, baseStats: { speed: 2.5, energyCost: 5 } },
  { id: 'eng_3', tier: 3, mass: 193, rarity: 'Common', name: { RU: 'Дизель "Старый Джо"', EN: 'Diesel "Old Joe"' }, description: { RU: 'Дымный, но неубиваемый.', EN: 'Smoky, but indestructible.' }, cost: { copper: 300 }, baseStats: { speed: 1.0, energyCost: 10 } },
  { id: 'eng_4', tier: 4, mass: 243, rarity: 'Rare', name: { RU: 'Электромотор "Искра"', EN: 'Electric Motor "Spark"' }, description: { RU: 'Чистая энергия, тихий ход.', EN: 'Clean energy, silent running.' }, cost: { iron: 600 }, baseStats: { speed: 1.5, energyCost: 15 } },
  { id: 'eng_5', tier: 5, mass: 290, rarity: 'Rare', name: { RU: 'Турбина "Циклон"', EN: 'Turbine "Cyclone"' }, description: { RU: 'Высокие обороты, свист металла.', EN: 'High RPM, whistling metal.' }, cost: { silver: 1000 }, baseStats: { speed: 2.5, energyCost: 25 } },
  { id: 'eng_6', tier: 6, mass: 335, rarity: 'Rare', name: { RU: 'Ротор "Вихрь"', EN: 'Rotor "Whirl"' }, description: { RU: 'Двойная система вращения.', EN: 'Double rotation system.' }, cost: { gold: 1500, rubies: 5 }, baseStats: { speed: 4.0, energyCost: 40 } },
  { id: 'eng_7', tier: 7, mass: 379, rarity: 'Epic', name: { RU: 'Магнитный драйв', EN: 'Magnetic Drive' }, description: { RU: 'Никакого трения, только мощь.', EN: 'No friction, only power.' }, cost: { titanium: 2500, nanoSwarm: 50 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 6.0, energyCost: 60 } },
  { id: 'eng_8', tier: 8, mass: 422, rarity: 'Epic', name: { RU: 'Ионный ускоритель', EN: 'Ionic Accelerator' }, description: { RU: 'Синее свечение и бешеная скорость.', EN: 'Blue glow and insane speed.' }, cost: { uranium: 1000, emeralds: 20 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 9.0, energyCost: 80 } },
  { id: 'eng_9', tier: 9, mass: 464, rarity: 'Epic', name: { RU: 'Фотонный двигатель', EN: 'Photonic Engine' }, description: { RU: 'Энергия света в механическом теле.', EN: 'Light energy in a mechanical body.' }, cost: { ancientTech: 20, rubies: 30 }, blueprintId: 'blueprint_high_power_engines', baseStats: { speed: 12.0, energyCost: 100 } },
  { id: 'eng_10', tier: 10, mass: 505, rarity: 'Legendary', name: { RU: 'Варп-привод', EN: 'Warp Drive' }, description: { RU: 'Схлопывает время между оборотами.', EN: 'Collapses time between rotations.' }, cost: { ancientTech: 50, rubies: 50, nanoSwarm: 200 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 18.0, energyCost: 150 } },
  { id: 'eng_11', tier: 11, mass: 545, rarity: 'Legendary', name: { RU: 'Тахионный ротор', EN: 'Tachyon Rotor' }, description: { RU: 'Вращается до того, как ты нажал кнопку.', EN: 'Turns before you press the button.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 400 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 25.0, energyCost: 200 } },
  { id: 'eng_12', tier: 12, mass: 584, rarity: 'Legendary', name: { RU: 'Темная материя', EN: 'Dark Matter' }, description: { RU: 'Пожирает пространство вокруг себя.', EN: 'Devours space around itself.' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 800 }, blueprintId: 'blueprint_quantum_engines', baseStats: { speed: 40.0, energyCost: 300 } },
  { id: 'fus_eng_13', tier: 13, mass: 623, rarity: 'Godly', name: { RU: 'Нулевая точка', EN: 'Zero Point' }, description: { RU: 'Энергия из вакуума.', EN: 'Energy from vacuum.' }, cost: { ancientTech: 1000, nanoSwarm: 2000, rubies: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 60.0, energyCost: 500 } },
  { id: 'fus_eng_14', tier: 14, mass: 661, rarity: 'Godly', name: { RU: 'Квантовый суперпозитор', EN: 'Quantum Superpositor' }, description: { RU: 'Вращается во всех направлениях сразу.', EN: 'Rotates in all directions at once.' }, cost: { ancientTech: 2500, rubies: 1000, diamonds: 500 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 100.0, energyCost: 800 } },
  { id: 'fus_eng_15', tier: 15, mass: 698, rarity: 'Godly', name: { RU: 'Двигатель Воли', EN: 'Engine of Will' }, description: { RU: 'Бесконечный драйв.', EN: 'Infinite drive.' }, cost: { ancientTech: 9999, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { speed: 200.0, energyCost: 1500 } }
];


export const COOLERS: CoolerPart[] = [
  { id: 'cool_1', tier: 1, mass: 30, rarity: 'Common', name: { RU: 'Дырявый бак', EN: 'Leaky Tank' }, description: { RU: 'Поливай его водой вручную.', EN: 'Pour water on it manually.' }, cost: { clay: 20 }, baseStats: { cooling: 1, energyCost: 0 } },
  { id: 'cool_2', tier: 2, mass: 49, rarity: 'Common', name: { RU: 'Медный радиатор', EN: 'Copper Radiator' }, description: { RU: 'Базовая теплоотдача.', EN: 'Basic heat dissipation.' }, cost: { copper: 100 }, baseStats: { cooling: 3, energyCost: 1 } },
  { id: 'cool_3', tier: 3, mass: 65, rarity: 'Common', name: { RU: 'Вентилятор "Тайфун"', EN: 'Turbine "Typhoon"' }, description: { RU: 'Активный обдув горячего вала.', EN: 'Active cooling of the hot shaft.' }, cost: { iron: 300 }, baseStats: { cooling: 5, energyCost: 3 } },
  { id: 'cool_4', tier: 4, mass: 79, rarity: 'Rare', name: { RU: 'Масляный контур', EN: 'Oil Circuit' }, description: { RU: 'Более вязкая и эффективная система.', EN: 'More viscous and efficient system.' }, cost: { silver: 600 }, baseStats: { cooling: 8, energyCost: 6 } },
  { id: 'cool_5', tier: 5, mass: 93, rarity: 'Rare', name: { RU: 'Фреоновая петля', EN: 'Freon Loop' }, description: { RU: 'Холод старых холодильников.', EN: 'Cold of old refrigerators.' }, cost: { gold: 1000, emeralds: 5 }, baseStats: { cooling: 12, energyCost: 10 } },
  { id: 'cool_6', tier: 6, mass: 105, rarity: 'Rare', name: { RU: 'Жидкий Азот', EN: 'Liquid Nitrogen' }, description: { RU: 'Бур покрывается инеем.', EN: 'The drill gets covered in frost.' }, cost: { titanium: 1500, emeralds: 10 }, baseStats: { cooling: 18, energyCost: 15 } },
  { id: 'cool_7', tier: 7, mass: 117, rarity: 'Epic', name: { RU: 'Гелиевый инжектор', EN: 'Helium Injector' }, description: { RU: 'Для экстремальных нагрузок.', EN: 'For extreme loads.' }, cost: { uranium: 500, diamonds: 5 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 25, energyCost: 20 } },
  { id: 'cool_8', tier: 8, mass: 129, rarity: 'Epic', name: { RU: 'Крио-капсула', EN: 'Cryo-Capsule' }, description: { RU: 'Замораживает даже звук трения.', EN: 'Freezes even the sound of friction.' }, cost: { ancientTech: 15, diamonds: 10 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 35, energyCost: 30 } },
  { id: 'cool_9', tier: 9, mass: 140, rarity: 'Epic', name: { RU: 'Тепловой насос "Бездна"', EN: 'Heat Pump "Abyss"' }, description: { RU: 'Сбрасывает жар в почву.', EN: 'Dumps heat into the ground.' }, cost: { ancientTech: 40, rubies: 20, nanoSwarm: 50 }, blueprintId: 'blueprint_quantum_cooling', baseStats: { cooling: 50, energyCost: 45 } },
  { id: 'cool_10', tier: 10, mass: 150, rarity: 'Legendary', name: { RU: 'Эндотермический реактор', EN: 'Endothermic Reactor' }, description: { RU: 'Превращает тепло в энергию.', EN: 'Turns heat into energy.' }, cost: { ancientTech: 100, emeralds: 50, nanoSwarm: 100 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 70, energyCost: 0 } },
  { id: 'cool_11', tier: 11, mass: 161, rarity: 'Legendary', name: { RU: 'Абсолютный ноль', EN: 'Absolute Zero' }, description: { RU: 'Движение атомов почти замирает.', EN: 'Atomic movement almost stops.' }, cost: { ancientTech: 300, diamonds: 50, nanoSwarm: 200, ice: 500 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 100, energyCost: 80 } },
  { id: 'cool_12', tier: 12, mass: 171, rarity: 'Legendary', name: { RU: 'Стрингер Пустоты', EN: 'Void Stringer' }, description: { RU: 'Тепло уходит в параллельный мир.', EN: 'Heat goes to a parallel world.' }, cost: { ancientTech: 800, nanoSwarm: 1000, rubies: 50, ice: 2000 }, blueprintId: 'blueprint_cryogenic_tech', baseStats: { cooling: 150, energyCost: 120 } },
  { id: 'cool_13', tier: 13, mass: 181, rarity: 'Godly', name: { RU: 'Энтропийный якорь', EN: 'Entropy Anchor' }, description: { RU: 'Запрещает металлу нагреваться.', EN: 'Forbids metal from heating up.' }, cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1500 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 250, energyCost: 200 } },
  { id: 'cool_14', tier: 14, mass: 190, rarity: 'Godly', name: { RU: 'Ледяное сердце звезды', EN: 'Ice Heart of a Star' }, description: { RU: 'Холод межгалактического пространства.', EN: 'Cold of intergalactic space.' }, cost: { ancientTech: 5000, emeralds: 500, diamonds: 200 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 400, energyCost: 300 } },
  { id: 'cool_15', tier: 15, mass: 200, rarity: 'Godly', name: { RU: 'Смерть Вселенной', EN: 'Death of the Universe' }, description: { RU: 'Нагрев невозможен. Абсолютная тишина.', EN: 'Heating is impossible. Absolute silence.' }, cost: { ancientTech: 10000, nanoSwarm: 5000 }, blueprintId: 'blueprint_fusion_core', baseStats: { cooling: 999, energyCost: 500 } }
];


export const HULLS: HullPart[] = [
  { id: 'hull_1', tier: 1, mass: 500, rarity: 'Common', name: { RU: 'Каркас из труб', EN: 'Pipe Frame' }, description: { RU: '1 слот. Скрежещет, но держит.', EN: '1 slot. Creaks, but holds.' }, cost: { clay: 50 }, baseStats: { maxIntegrity: 50, slots: 1, heatCap: 100, regen: 0, cargoCapacity: 5000 } },
  { id: 'hull_2', tier: 2, mass: 917, rarity: 'Common', name: { RU: 'Грузовой бокс', EN: 'Cargo Box' }, description: { RU: '1 слот. Простой и дешевый.', EN: '1 slot. Simple and cheap.' }, cost: { stone: 200 }, baseStats: { maxIntegrity: 150, slots: 1, heatCap: 150, regen: 0, cargoCapacity: 6000 } },
  { id: 'hull_3', tier: 3, mass: 1308, rarity: 'Common', name: { RU: 'Сплав "Шахтер"', EN: 'Alloy "Miner"' }, description: { RU: '2 слота. Рабочая лошадка.', EN: '2 slots. Workhorse.' }, cost: { copper: 500 }, baseStats: { maxIntegrity: 200, slots: 2, heatCap: 200, regen: 0.1, cargoCapacity: 7500 } },
  { id: 'hull_4', tier: 4, mass: 1682, rarity: 'Rare', name: { RU: 'Укрепленный кокон', EN: 'Reinforced Cocoon' }, description: { RU: '2 слота. Выдержит обвал.', EN: '2 slots. Can withstand a cave-in.' }, cost: { iron: 1000 }, baseStats: { maxIntegrity: 400, slots: 2, heatCap: 250, regen: 0.2, cargoCapacity: 10000 } },
  { id: 'hull_5', tier: 5, mass: 2044, rarity: 'Rare', name: { RU: 'Рама "Авангард"', EN: 'Frame "Vanguard"' }, description: { RU: '3 слота. Для передовой.', EN: '3 slots. For the frontline.' }, cost: { silver: 1500 }, baseStats: { maxIntegrity: 500, slots: 3, heatCap: 300, regen: 0.5, cargoCapacity: 15000 } },
  { id: 'hull_6', tier: 6, mass: 2398, rarity: 'Rare', name: { RU: 'Корпус "Бункер"', EN: 'Hull "Bunker"' }, description: { RU: '3 слота. Тяжелый и надежный.', EN: '3 slots. Heavy and reliable.' }, cost: { gold: 2500, emeralds: 5 }, baseStats: { maxIntegrity: 1000, slots: 3, heatCap: 400, regen: 1, cargoCapacity: 25000 } },
  { id: 'hull_7', tier: 7, mass: 2744, rarity: 'Epic', name: { RU: 'Штурмовой дек', EN: 'Assault Deck' }, description: { RU: '4 слота. Боевая платформа.', EN: '4 slots. Combat platform.' }, cost: { titanium: 4000, emeralds: 20 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 800, slots: 4, heatCap: 350, regen: 2, cargoCapacity: 40000 } },
  { id: 'hull_8', tier: 8, mass: 3084, rarity: 'Epic', name: { RU: 'Оболочка "Стелс"', EN: 'Hull "Stealth"' }, description: { RU: '4 слота. Гасит вибрации.', EN: '4 slots. Dampens vibrations.' }, cost: { uranium: 1500, nanoSwarm: 50 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 600, slots: 4, heatCap: 500, regen: 3, cargoCapacity: 70000 } },
  { id: 'hull_9', tier: 9, mass: 3419, rarity: 'Epic', name: { RU: 'Титановый Монолит', EN: 'Titanium Monolith' }, description: { RU: '5 слотов. Несокрушимый.', EN: '5 slots. Indestructible.' }, cost: { ancientTech: 50, rubies: 10, diamonds: 20 }, blueprintId: 'blueprint_titanium_hull', baseStats: { maxIntegrity: 1500, slots: 5, heatCap: 600, regen: 5, cargoCapacity: 120000 } },
  { id: 'hull_10', tier: 10, mass: 3749, rarity: 'Legendary', name: { RU: 'Экзо-скелет "Атлант"', EN: 'Exo-skeleton "Atlas"' }, description: { RU: '5 слотов. Поднимает горы.', EN: '5 slots. Lifts mountains.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 200 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 2500, slots: 5, heatCap: 700, regen: 10, cargoCapacity: 250000 } },
  { id: 'hull_11', tier: 11, mass: 4076, rarity: 'Legendary', name: { RU: 'Живая броня', EN: 'Living Armor' }, description: { RU: '6 слотов. Регенерация структуры.', EN: '6 slots. Structural regeneration.' }, cost: { ancientTech: 400, diamonds: 30, nanoSwarm: 500, scrap: 1000 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 3000, slots: 6, heatCap: 800, regen: 25, cargoCapacity: 500000 } },
  { id: 'hull_12', tier: 12, mass: 4398, rarity: 'Legendary', name: { RU: 'Композит "Зеркало"', EN: 'Composite "Mirror"' }, description: { RU: '6 слотов. Отражает реальность.', EN: '6 slots. Reflects reality.' }, cost: { ancientTech: 1000, nanoSwarm: 1500, rubies: 100, scrap: 4000 }, blueprintId: 'blueprint_adaptive_armor', baseStats: { maxIntegrity: 3500, slots: 6, heatCap: 900, regen: 50, cargoCapacity: 1000000 } },
  { id: 'hull_13', tier: 13, mass: 4717, rarity: 'Godly', name: { RU: 'Ковчег Предтеч', EN: 'Ark of the Precursors' }, description: { RU: '7 слотов. Дом в пустоте.', EN: '7 slots. Home in the void.' }, cost: { ancientTech: 3000, rubies: 1000, diamonds: 500 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 5000, slots: 7, heatCap: 1200, regen: 100, cargoCapacity: 2500000 } },
  { id: 'hull_14', tier: 14, mass: 5033, rarity: 'Godly', name: { RU: 'Сингулярная оболочка', EN: 'Singular Shell' }, description: { RU: '8 слотов. Поглощает урон в энергию.', EN: '8 slots. Absorbs damage into energy.' }, cost: { ancientTech: 8000, emeralds: 1000, nanoSwarm: 3000 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 8000, slots: 8, heatCap: 2000, regen: 250, cargoCapacity: 6000000 } },
  { id: 'hull_15', tier: 15, mass: 5346, rarity: 'Godly', name: { RU: 'Несокрушимый', EN: 'Indestructible' }, description: { RU: '10 слотов. Вечность.', EN: '10 slots. Eternity.' }, cost: { ancientTech: 20000, diamonds: 1000, nanoSwarm: 8000 }, blueprintId: 'blueprint_fusion_core', baseStats: { maxIntegrity: 20000, slots: 10, heatCap: 5000, regen: 1000, cargoCapacity: 15000000 } }
];


export const LOGIC_CORES: LogicPart[] = [
  { id: 'cpu_1', tier: 1, mass: 5, rarity: 'Common', name: { RU: 'Калькулятор', EN: 'Calculator' }, description: { RU: 'Считает на пальцах.', EN: 'Counts on fingers.' }, cost: { clay: 50 }, baseStats: { critChance: 1, energyCost: 1, luck: 0, predictionTime: 0 } },
  { id: 'cpu_2', tier: 2, mass: 8, rarity: 'Common', name: { RU: 'Блок "Сигнал"', EN: 'Unit "Signal"' }, description: { RU: 'Ловит эхо породы.', EN: 'Catches rock echoes.' }, cost: { copper: 150 }, baseStats: { critChance: 3, energyCost: 3, luck: 0, predictionTime: 0 } },
  { id: 'cpu_3', tier: 3, mass: 10, rarity: 'Common', name: { RU: 'Логика "Скан"', EN: 'Logic "Scan"' }, description: { RU: 'Видит структуру.', EN: 'Sees the structure.' }, cost: { iron: 300 }, baseStats: { critChance: 4, energyCost: 5, luck: 1, predictionTime: 0 } },
  { id: 'cpu_4', tier: 4, mass: 11, rarity: 'Rare', name: { RU: 'Процессор "Вектор"', EN: 'Processor "Vector"' }, description: { RU: 'Быстрые вычисления.', EN: 'Fast calculations.' }, cost: { silver: 600 }, baseStats: { critChance: 5, energyCost: 8, luck: 2, predictionTime: 0 } },
  { id: 'cpu_5', tier: 5, mass: 13, rarity: 'Rare', name: { RU: 'ИИ "Геолог"', EN: 'AI "Geologist"' }, description: { RU: 'Подсвечивает руду.', EN: 'Highlights ore.' }, cost: { gold: 1000, emeralds: 5 }, baseStats: { critChance: 7, energyCost: 12, luck: 5, predictionTime: 0 } },
  { id: 'cpu_6', tier: 6, mass: 15, rarity: 'Rare', name: { RU: 'Матрица "Поиск"', EN: 'Matrix "Search"' }, description: { RU: 'Лучший лут.', EN: 'Best loot.' }, cost: { titanium: 1500, emeralds: 10 }, baseStats: { critChance: 10, energyCost: 18, luck: 8, predictionTime: 0 } },
  { id: 'cpu_7', tier: 7, mass: 16, rarity: 'Epic', name: { RU: 'Ядро "Ритм"', EN: 'Core "Rhythm"' }, description: { RU: 'Синхронизация с пульсом.', EN: 'Sync with the pulse.' }, cost: { uranium: 800, nanoSwarm: 20 }, baseStats: { critChance: 12, energyCost: 25, luck: 10, predictionTime: 2 } },
  { id: 'cpu_8', tier: 8, mass: 17, rarity: 'Epic', name: { RU: 'Квантовый чип', EN: 'Quantum Chip' }, description: { RU: 'Вероятностные удары.', EN: 'Probabilistic strikes.' }, cost: { ancientTech: 20, nanoSwarm: 50 }, baseStats: { critChance: 15, energyCost: 35, luck: 15, predictionTime: 3 } },
  { id: 'cpu_9', tier: 9, mass: 19, rarity: 'Epic', name: { RU: 'Нейросеть "Видение"', EN: 'Neural Network "Vision"' }, description: { RU: 'Обучается в процессе.', EN: 'Learns as it goes.' }, cost: { ancientTech: 50, nanoSwarm: 100 }, baseStats: { critChance: 18, energyCost: 50, luck: 20, predictionTime: 4 } },
  { id: 'cpu_10', tier: 10, mass: 20, rarity: 'Legendary', name: { RU: 'Анализатор "Слабость"', EN: 'Analyzer "Weakness"' }, description: { RU: 'Бьет в уязвимости.', EN: 'Strikes at vulnerabilities.' }, cost: { ancientTech: 100, rubies: 50, nanoSwarm: 200 }, baseStats: { critChance: 22, energyCost: 80, luck: 30, predictionTime: 5 } },
  { id: 'cpu_11', tier: 11, mass: 21, rarity: 'Legendary', name: { RU: 'Кибер-мозг "Альфа"', EN: 'Cyberbrain "Alpha"' }, description: { RU: 'Чистый интеллект.', EN: 'Pure intelligence.' }, cost: { ancientTech: 250, emeralds: 50, nanoSwarm: 400 }, baseStats: { critChance: 25, energyCost: 120, luck: 40, predictionTime: 7 } },
  { id: 'cpu_12', tier: 12, mass: 22, rarity: 'Legendary', name: { RU: 'Предсказатель', EN: 'Forecaster' }, description: { RU: 'Видит будущее на 10с.', EN: 'Sees 10s into the future.' }, cost: { ancientTech: 600, diamonds: 50, nanoSwarm: 800 }, baseStats: { critChance: 30, energyCost: 180, luck: 50, predictionTime: 10 } },
  { id: 'cpu_13', tier: 13, mass: 23, rarity: 'Godly', name: { RU: 'Система "Доминация"', EN: 'System "Domination"' }, description: { RU: 'Каждый крит сильнее.', EN: 'Each crit is stronger.' }, cost: { ancientTech: 1500, nanoSwarm: 2000 }, baseStats: { critChance: 35, energyCost: 250, luck: 75, predictionTime: 15 } },
  { id: 'cpu_14', tier: 14, mass: 24, rarity: 'Godly', name: { RU: 'Матрица Братана', EN: 'Brotan Matrix' }, description: { RU: 'Режим пафоса.', EN: 'Pathos mode.' }, cost: { ancientTech: 4000, diamonds: 500, nanoSwarm: 3000 }, baseStats: { critChance: 50, energyCost: 400, luck: 100, predictionTime: 20 } },
  { id: 'cpu_15', tier: 15, mass: 25, rarity: 'Godly', name: { RU: 'Божественный Архитектор', EN: 'Divine Architect' }, description: { RU: 'Все просчитано.', EN: 'Everything is calculated.' }, cost: { ancientTech: 10000, nanoSwarm: 8000 }, baseStats: { critChance: 100, energyCost: 800, luck: 200, predictionTime: 30 } }
];


export const CONTROL_UNITS: ControlPart[] = [
  { id: 'ctrl_1', tier: 1, mass: 8, rarity: 'Common', name: { RU: 'Старая кнопка', EN: 'Old Button' }, description: { RU: 'x1.0', EN: 'x1.0' }, cost: { clay: 10 }, baseStats: { clickMultiplier: 1.0, energyCost: 0, ventSpeed: 1.0 } },
  { id: 'ctrl_2', tier: 2, mass: 13, rarity: 'Common', name: { RU: 'Механический тумблер', EN: 'Mechanical Toggle' }, description: { RU: 'x1.2', EN: 'x1.2' }, cost: { stone: 50 }, baseStats: { clickMultiplier: 1.2, energyCost: 1, ventSpeed: 1.1 } },
  { id: 'ctrl_3', tier: 3, mass: 16, rarity: 'Common', name: { RU: 'Педаль газа', EN: 'Gas Pedal' }, description: { RU: 'x1.5', EN: 'x1.5' }, cost: { copper: 150 }, baseStats: { clickMultiplier: 1.5, energyCost: 2, ventSpeed: 1.2 } },
  { id: 'ctrl_4', tier: 4, mass: 20, rarity: 'Rare', name: { RU: 'Джойстик "Ретро"', EN: 'Retro Joystick' }, description: { RU: 'x2.0', EN: 'x2.0' }, cost: { iron: 300 }, baseStats: { clickMultiplier: 2.0, energyCost: 3, ventSpeed: 1.5 } },
  { id: 'ctrl_5', tier: 5, mass: 23, rarity: 'Rare', name: { RU: 'Сенсорный ввод', EN: 'Touch Input' }, description: { RU: 'x2.5', EN: 'x2.5' }, cost: { silver: 600 }, baseStats: { clickMultiplier: 2.5, energyCost: 5, ventSpeed: 1.8 } },
  { id: 'ctrl_6', tier: 6, mass: 26, rarity: 'Rare', name: { RU: 'Кинетик-сенсор', EN: 'Kinetic Sensor' }, description: { RU: 'x3.0', EN: 'x3.0' }, cost: { gold: 1000 }, baseStats: { clickMultiplier: 3.0, energyCost: 8, ventSpeed: 2.0 } },
  { id: 'ctrl_7', tier: 7, mass: 28, rarity: 'Epic', name: { RU: 'Голо-панель', EN: 'Holo Panel' }, description: { RU: 'x4.0', EN: 'x4.0' }, cost: { titanium: 1500, nanoSwarm: 20 }, baseStats: { clickMultiplier: 4.0, energyCost: 12, ventSpeed: 3.0 } },
  { id: 'ctrl_8', tier: 8, mass: 31, rarity: 'Epic', name: { RU: 'Перчатка силы', EN: 'Power Glove' }, description: { RU: 'x6.0', EN: 'x6.0' }, cost: { uranium: 800, rubies: 10 }, baseStats: { clickMultiplier: 6.0, energyCost: 20, ventSpeed: 4.0 } },
  { id: 'ctrl_9', tier: 9, mass: 33, rarity: 'Epic', name: { RU: 'Мысленный шлем', EN: 'Thought Helmet' }, description: { RU: 'x10.0', EN: 'x10.0' }, cost: { ancientTech: 25, nanoSwarm: 50 }, baseStats: { clickMultiplier: 10.0, energyCost: 35, ventSpeed: 6.0 } },
  { id: 'ctrl_10', tier: 10, mass: 36, rarity: 'Legendary', name: { RU: 'Нейро-имплант', EN: 'Neuro-implant' }, description: { RU: 'x15.0', EN: 'x15.0' }, cost: { ancientTech: 100, nanoSwarm: 200 }, baseStats: { clickMultiplier: 15.0, energyCost: 50, ventSpeed: 8.0 } },
  { id: 'ctrl_11', tier: 11, mass: 38, rarity: 'Legendary', name: { RU: 'Прямое подключение', EN: 'Direct Connection' }, description: { RU: 'x25.0', EN: 'x25.0' }, cost: { ancientTech: 250, nanoSwarm: 400 }, baseStats: { clickMultiplier: 25.0, energyCost: 80, ventSpeed: 12.0 } },
  { id: 'ctrl_12', tier: 12, mass: 40, rarity: 'Legendary', name: { RU: 'Волевой интерфейс', EN: 'Will Interface' }, description: { RU: 'x50.0', EN: 'x50.0' }, cost: { ancientTech: 600, nanoSwarm: 800, diamonds: 50 }, baseStats: { clickMultiplier: 50.0, energyCost: 120, ventSpeed: 20.0 } },
  { id: 'ctrl_13', tier: 13, mass: 42, rarity: 'Godly', name: { RU: 'Симбиоз', EN: 'Symbiosis' }, description: { RU: 'x100.0', EN: 'x100.0' }, cost: { ancientTech: 1500, nanoSwarm: 2000, emeralds: 200 }, baseStats: { clickMultiplier: 100.0, energyCost: 200, ventSpeed: 50.0 } },
  { id: 'ctrl_14', tier: 14, mass: 44, rarity: 'Godly', name: { RU: 'Единство души', EN: 'Unity of Soul' }, description: { RU: 'x500.0', EN: 'x500.0' }, cost: { ancientTech: 5000, nanoSwarm: 5000 }, baseStats: { clickMultiplier: 500.0, energyCost: 400, ventSpeed: 100.0 } },
  { id: 'ctrl_15', tier: 15, mass: 47, rarity: 'Godly', name: { RU: 'Творец', EN: 'Creator' }, description: { RU: '1 клик = 1 слой.', EN: '1 click = 1 layer.' }, cost: { ancientTech: 20000, nanoSwarm: 10000 }, baseStats: { clickMultiplier: 1000.0, energyCost: 800, ventSpeed: 500.0 } }
];


export const GEARBOXES: GearboxPart[] = [
  { id: 'gear_1', tier: 1, mass: 50, rarity: 'Common', name: { RU: 'Ремни и шкивы', EN: 'Belts and Pulleys' }, description: { RU: 'Игнор 2%', EN: 'Ignore 2%' }, cost: { clay: 50 }, baseStats: { torque: 2, energyCost: 1 } },
  { id: 'gear_2', tier: 2, mass: 87, rarity: 'Common', name: { RU: 'Шестерни из меди', EN: 'Copper Gears' }, description: { RU: 'Игнор 5%', EN: 'Ignore 5%' }, cost: { copper: 200 }, baseStats: { torque: 5, energyCost: 2 } },
  { id: 'gear_3', tier: 3, mass: 120, rarity: 'Common', name: { RU: 'Стальной червяк', EN: 'Steel Worm' }, description: { RU: 'Игнор 10%', EN: 'Ignore 10%' }, cost: { iron: 400 }, baseStats: { torque: 10, energyCost: 4 } },
  { id: 'gear_4', tier: 4, mass: 152, rarity: 'Rare', name: { RU: 'Планетарная передача', EN: 'Planetary Gear' }, description: { RU: 'Игнор 15%', EN: 'Ignore 15%' }, cost: { silver: 800 }, baseStats: { torque: 15, energyCost: 7 } },
  { id: 'gear_5', tier: 5, mass: 181, rarity: 'Rare', name: { RU: 'Гидравлика "Напор"', EN: 'Hydraulics "Pressure"' }, description: { RU: 'Игнор 20%', EN: 'Ignore 20%' }, cost: { gold: 1200 }, baseStats: { torque: 20, energyCost: 12 } },
  { id: 'gear_6', tier: 6, mass: 210, rarity: 'Rare', name: { RU: 'Магнитная муфта', EN: 'Magnetic Clutch' }, description: { RU: 'Игнор 25%', EN: 'Ignore 25%' }, cost: { titanium: 2000, diamonds: 5 }, baseStats: { torque: 25, energyCost: 18 } },
  { id: 'gear_7', tier: 7, mass: 237, rarity: 'Epic', name: { RU: 'Титановый редуктор', EN: 'Titanium Reducer' }, description: { RU: 'Игнор 30%', EN: 'Ignore 30%' }, cost: { uranium: 1000, diamonds: 10 }, baseStats: { torque: 30, energyCost: 25 } },
  { id: 'gear_8', tier: 8, mass: 264, rarity: 'Epic', name: { RU: 'Алмазные зубья', EN: 'Diamond Teeth' }, description: { RU: 'Игнор 40%', EN: 'Ignore 40%' }, cost: { ancientTech: 20, diamonds: 30 }, baseStats: { torque: 40, energyCost: 35 } },
  { id: 'gear_9', tier: 9, mass: 290, rarity: 'Epic', name: { RU: 'Герметичный привод', EN: 'Hermetic Drive' }, description: { RU: 'Игнор 50%', EN: 'Ignore 50%' }, cost: { ancientTech: 60, nanoSwarm: 50 }, baseStats: { torque: 50, energyCost: 50 } },
  { id: 'gear_10', tier: 10, mass: 315, rarity: 'Legendary', name: { RU: 'Грави-стабилизатор', EN: 'Gravi-stabilizer' }, description: { RU: 'Игнор 60%', EN: 'Ignore 60%' }, cost: { ancientTech: 150, emeralds: 50 }, baseStats: { torque: 60, energyCost: 70 } },
  { id: 'gear_11', tier: 11, mass: 340, rarity: 'Legendary', name: { RU: 'Модуль "Прорыв"', EN: 'Module "Breakthrough"' }, description: { RU: 'Игнор 70%', EN: 'Ignore 70%' }, cost: { ancientTech: 400, diamonds: 100, scrap: 800 }, baseStats: { torque: 70, energyCost: 100 } },
  { id: 'gear_12', tier: 12, mass: 365, rarity: 'Legendary', name: { RU: 'Вариатор "Тьма"', EN: 'Variator "Darkness"' }, description: { RU: 'Игнор 80%', EN: 'Ignore 80%' }, cost: { ancientTech: 1000, nanoSwarm: 500, rubies: 50, scrap: 2500 }, baseStats: { torque: 80, energyCost: 150 } },
  { id: 'gear_13', tier: 13, mass: 389, rarity: 'Godly', name: { RU: 'Разрушитель связей', EN: 'Bond Breaker' }, description: { RU: 'Игнор 90%', EN: 'Ignore 90%' }, cost: { ancientTech: 3000, diamonds: 300, nanoSwarm: 1000 }, baseStats: { torque: 90, energyCost: 200 } },
  { id: 'gear_14', tier: 14, mass: 413, rarity: 'Godly', name: { RU: 'Нулевое сопротивление', EN: 'Zero Resistance' }, description: { RU: 'Игнор 95%', EN: 'Ignore 95%' }, cost: { ancientTech: 8000, nanoSwarm: 3000 }, baseStats: { torque: 95, energyCost: 300 } },
  { id: 'gear_15', tier: 15, mass: 436, rarity: 'Godly', name: { RU: 'Абсолютная тяга', EN: 'Absolute Traction' }, description: { RU: 'Игнор 100%', EN: 'Ignore 100%' }, cost: { ancientTech: 20000, diamonds: 1000 }, baseStats: { torque: 100, energyCost: 500 } }
];


export const POWER_CORES: PowerCorePart[] = [
  { id: 'pwr_1', tier: 1, mass: 100, rarity: 'Common', name: { RU: 'Батарейка АА', EN: 'AA Battery' }, description: { RU: '10 ед.', EN: '10 units.' }, cost: { clay: 50 }, baseStats: { energyOutput: 10, droneEfficiency: 1.0 } },
  { id: 'pwr_2', tier: 2, mass: 180, rarity: 'Common', name: { RU: 'Свинцовый АКБ', EN: 'Lead Battery' }, description: { RU: '25 ед.', EN: '25 units.' }, cost: { copper: 150 }, baseStats: { energyOutput: 25, droneEfficiency: 1.05 } },
  { id: 'pwr_3', tier: 3, mass: 254, rarity: 'Common', name: { RU: 'Бензогенератор', EN: 'Gasoline Generator' }, description: { RU: '50 ед.', EN: '50 units.' }, cost: { iron: 300 }, baseStats: { energyOutput: 50, droneEfficiency: 1.1 } },
  { id: 'pwr_4', tier: 4, mass: 325, rarity: 'Rare', name: { RU: 'Солнечная панель', EN: 'Solar Panel' }, description: { RU: '80 ед.', EN: '80 units.' }, cost: { silver: 600 }, baseStats: { energyOutput: 80, droneEfficiency: 1.2 } },
  { id: 'pwr_5', tier: 5, mass: 393, rarity: 'Rare', name: { RU: 'Изотопный элемент', EN: 'Isotope Element' }, description: { RU: '120 ед.', EN: '120 units.' }, cost: { gold: 1000 }, baseStats: { energyOutput: 120, droneEfficiency: 1.3 } },
  { id: 'pwr_6', tier: 6, mass: 459, rarity: 'Rare', name: { RU: 'Ядерная ячейка', EN: 'Nuclear Cell' }, description: { RU: '180 ед.', EN: '180 units.' }, cost: { titanium: 1500, rubies: 5 }, baseStats: { energyOutput: 180, droneEfficiency: 1.5 } },
  { id: 'pwr_7', tier: 7, mass: 523, rarity: 'Epic', name: { RU: 'Термоядерный узел', EN: 'Thermonuclear Node' }, description: { RU: '300 ед.', EN: '300 units.' }, cost: { uranium: 1000, rubies: 15 }, baseStats: { energyOutput: 300, droneEfficiency: 1.8 } },
  { id: 'pwr_8', tier: 8, mass: 586, rarity: 'Epic', name: { RU: 'Плазменный шар', EN: 'Plasma Sphere' }, description: { RU: '50 ед.', EN: '500 units.' }, cost: { ancientTech: 20, rubies: 30 }, baseStats: { energyOutput: 500, droneEfficiency: 2.2 } },
  { id: 'pwr_9', tier: 9, mass: 647, rarity: 'Epic', name: { RU: 'Антиматериевый бак', EN: 'Antimatter Tank' }, description: { RU: '800 ед.', EN: '800 units.' }, cost: { ancientTech: 50, nanoSwarm: 50 }, baseStats: { energyOutput: 800, droneEfficiency: 2.6 } },
  { id: 'pwr_10', tier: 10, mass: 708, rarity: 'Legendary', name: { RU: 'Кварковая ячейка', EN: 'Quark Cell' }, description: { RU: '1200 ед.', EN: '1200 units.' }, cost: { ancientTech: 120, rubies: 50, nanoSwarm: 100 }, baseStats: { energyOutput: 1200, droneEfficiency: 3.5 } },
  { id: 'pwr_11', tier: 11, mass: 768, rarity: 'Legendary', name: { RU: 'Звездное ядро', EN: 'Star Core' }, description: { RU: '1800 ед.', EN: '1800 units.' }, cost: { ancientTech: 300, rubies: 100, diamonds: 50 }, baseStats: { energyOutput: 1800, droneEfficiency: 4.5 } },
  { id: 'pwr_12', tier: 12, mass: 827, rarity: 'Legendary', name: { RU: 'Сингулярность', EN: 'Singularity' }, description: { RU: '3000 ед.', EN: '3000 units.' }, cost: { ancientTech: 800, nanoSwarm: 500, emeralds: 50 }, baseStats: { energyOutput: 3000, droneEfficiency: 6.0 } },
  { id: 'pwr_13', tier: 13, mass: 885, rarity: 'Godly', name: { RU: 'Энергия Пустоты', EN: 'Void Energy' }, description: { RU: '6000 ед.', EN: '6000 units.' }, cost: { ancientTech: 2000, rubies: 500, nanoSwarm: 1000 }, baseStats: { energyOutput: 6000, droneEfficiency: 10.0 } },
  { id: 'pwr_14', tier: 14, mass: 942, rarity: 'Godly', name: { RU: 'Дыхание Вселенной', EN: 'Breath of the Universe' }, description: { RU: '15000 ед.', EN: '15000 units.' }, cost: { ancientTech: 5000, rubies: 1000, diamonds: 500 }, baseStats: { energyOutput: 15000, droneEfficiency: 20.0 } },
  { id: 'pwr_15', tier: 15, mass: 999, rarity: 'Godly', name: { RU: 'Вечный Двигатель', EN: 'Perpetual Motion' }, description: { RU: '∞', EN: '∞' }, cost: { ancientTech: 15000, nanoSwarm: 5000 }, baseStats: { energyOutput: 99999, droneEfficiency: 50.0 } }
];


export const ARMORS: ArmorPart[] = [
  { id: 'arm_1', tier: 1, mass: 150, rarity: 'Common', name: { RU: 'Фольга', EN: 'Foil' }, description: { RU: '1% защиты', EN: '1% defense' }, cost: { clay: 50 }, baseStats: { defense: 1, energyCost: 0, hazardResist: 0 } },
  { id: 'arm_2', tier: 2, mass: 280, rarity: 'Common', name: { RU: 'Листы стали', EN: 'Steel Sheets' }, description: { RU: '5%', EN: '5%' }, cost: { iron: 200 }, baseStats: { defense: 5, energyCost: 2, hazardResist: 0 } },
  { id: 'arm_3', tier: 3, mass: 403, rarity: 'Common', name: { RU: 'Керамика', EN: 'Ceramics' }, description: { RU: 'Жар +10%', EN: 'Heat +10%' }, cost: { stone: 400 }, baseStats: { defense: 10, energyCost: 5, hazardResist: 5 } },
  { id: 'arm_4', tier: 4, mass: 522, rarity: 'Rare', name: { RU: 'Свинец', EN: 'Lead' }, description: { RU: 'Радиация +20%', EN: 'Radiation +20%' }, cost: { copper: 600 }, baseStats: { defense: 15, energyCost: 10, hazardResist: 10 } },
  { id: 'arm_5', tier: 5, mass: 639, rarity: 'Rare', name: { RU: 'Титан', EN: 'Titanium' }, description: { RU: '15% защиты', EN: '15% defense' }, cost: { titanium: 800 }, baseStats: { defense: 15, energyCost: 15, hazardResist: 15 } },
  { id: 'arm_6', tier: 6, mass: 752, rarity: 'Rare', name: { RU: 'Композит', EN: 'Composite' }, description: { RU: '25% защиты', EN: '25% defense' }, cost: { silver: 1200 }, baseStats: { defense: 25, energyCost: 20, hazardResist: 20 } },
  { id: 'arm_7', tier: 7, mass: 864, rarity: 'Epic', name: { RU: 'Магнитное поле', EN: 'Magnetic Field' }, description: { RU: 'Отражение', EN: 'Reflection' }, cost: { gold: 2000, emeralds: 10 }, baseStats: { defense: 30, energyCost: 30, hazardResist: 30 } },
  { id: 'arm_8', tier: 8, mass: 975, rarity: 'Epic', name: { RU: 'Ионный щит', EN: 'Ionic Shield' }, description: { RU: 'Энерго-защита', EN: 'Energy Protection' }, cost: { uranium: 1000, rubies: 20 }, baseStats: { defense: 35, energyCost: 40, hazardResist: 40 } },
  { id: 'arm_9', tier: 9, mass: 1084, rarity: 'Epic', name: { RU: 'Вольфрамовая броня', EN: 'Tungsten Armor' }, description: { RU: '40% защиты', EN: '40% defense' }, cost: { ancientTech: 20, diamonds: 20 }, baseStats: { defense: 40, energyCost: 50, hazardResist: 50 } },
  { id: 'arm_10', tier: 10, mass: 1191, rarity: 'Legendary', name: { RU: 'Силовое поле "Зенит"', EN: 'Force Field "Zenith"' }, description: { RU: '50% погл.', EN: '50% absorption' }, cost: { ancientTech: 60, rubies: 50, nanoSwarm: 50 }, baseStats: { defense: 50, energyCost: 70, hazardResist: 60 } },
  { id: 'arm_11', tier: 11, mass: 1298, rarity: 'Legendary', name: { RU: 'Нейтронный слой', EN: 'Neutron Layer' }, description: { RU: 'Неуязвим для рад.', EN: 'Immune to radiation' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 100 }, baseStats: { defense: 60, energyCost: 90, hazardResist: 70 } },
  { id: 'arm_12', tier: 12, mass: 1404, rarity: 'Legendary', name: { RU: 'Пространственный сдвиг', EN: 'Spatial Shift' }, description: { RU: 'Уклонение 20%', EN: 'Evasion 20%' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 300 }, baseStats: { defense: 70, energyCost: 120, hazardResist: 80 } },
  { id: 'arm_13', tier: 13, mass: 1509, rarity: 'Godly', name: { RU: 'Щит "Абсолют"', EN: 'Shield "Absolute"' }, description: { RU: '80% защиты', EN: '80% defense' }, cost: { ancientTech: 1000, emeralds: 300, diamonds: 200 }, baseStats: { defense: 80, energyCost: 200, hazardResist: 90 } },
  { id: 'arm_14', tier: 14, mass: 1613, rarity: 'Godly', name: { RU: 'Фрактальная броня', EN: 'Fractal Armor' }, description: { RU: 'Распред. урон', EN: 'Distr. damage' }, cost: { ancientTech: 3000, nanoSwarm: 2000 }, baseStats: { defense: 90, energyCost: 300, hazardResist: 95 } },
  { id: 'arm_15', tier: 15, mass: 1716, rarity: 'Godly', name: { RU: 'Божественная длань', EN: 'Divine Hand' }, description: { RU: 'Иммунитет', EN: 'Immunity' }, cost: { ancientTech: 10000, rubies: 1000, emeralds: 1000, diamonds: 1000 }, baseStats: { defense: 100, energyCost: 600, hazardResist: 100 } }
];


export const CARGO_BAYS: CargoBayPart[] = [
  { id: 'cargo_1', tier: 1, mass: 200, rarity: 'Common', name: { RU: 'Ржавый ящик', EN: 'Rusty Crate' }, description: { RU: 'Грубо сваренные листы металла.', EN: 'Roughly welded metal sheets.' }, cost: { clay: 20 }, baseStats: { cargoCapacity: 1000, energyCost: 2 } },
  { id: 'cargo_2', tier: 2, mass: 361, rarity: 'Common', name: { RU: 'Сварной контейнер', EN: 'Welded Container' }, description: { RU: 'Лучше, чем ничего.', EN: 'Better than nothing.' }, cost: { stone: 100 }, baseStats: { cargoCapacity: 2000, energyCost: 4 } },
  { id: 'cargo_3', tier: 3, mass: 509, rarity: 'Common', name: { RU: 'Сетчатый органайзер', EN: 'Mesh Organizer' }, description: { RU: 'Оптимизирует пространство.', EN: 'Optimizes space.' }, cost: { copper: 300 }, baseStats: { cargoCapacity: 3500, energyCost: 8 } },
  { id: 'cargo_4', tier: 4, mass: 650, rarity: 'Rare', name: { RU: 'Стальной сейф', EN: 'Steel Safe' }, description: { RU: 'Защищенный отсек.', EN: 'Protected compartment.' }, cost: { iron: 600 }, baseStats: { cargoCapacity: 6000, energyCost: 15 } },
  { id: 'cargo_5', tier: 5, mass: 786, rarity: 'Rare', name: { RU: 'Укрепленный модуль', EN: 'Reinforced Module' }, description: { RU: 'Для серьезных перевозок.', EN: 'For serious transport.' }, cost: { silver: 1200 }, baseStats: { cargoCapacity: 10000, energyCost: 25 } },
  { id: 'cargo_6', tier: 6, mass: 917, rarity: 'Rare', name: { RU: 'Титановая капсула', EN: 'Titanium Capsule' }, description: { RU: 'Легкость и прочность.', EN: 'Lightness and strength.' }, cost: { gold: 2000, emeralds: 5 }, baseStats: { cargoCapacity: 20000, energyCost: 40 } },
  { id: 'cargo_7', tier: 7, mass: 1046, rarity: 'Epic', name: { RU: 'Вакуумный компрессор', EN: 'Vacuum Compressor' }, description: { RU: 'Сжимает материю.', EN: 'Compresses matter.' }, cost: { titanium: 3500, emeralds: 15 }, baseStats: { cargoCapacity: 40000, energyCost: 70 } },
  { id: 'cargo_8', tier: 8, mass: 1171, rarity: 'Epic', name: { RU: 'Магнитный расширитель', EN: 'Magnetic Expander' }, description: { RU: 'Локальное искривление объема.', EN: 'Local volume curvature.' }, cost: { uranium: 1200, diamonds: 10 }, baseStats: { cargoCapacity: 80000, energyCost: 120 } },
  { id: 'cargo_9', tier: 9, mass: 1295, rarity: 'Epic', name: { RU: 'Нано-структурный блок', EN: 'Nano-structural Block' }, description: { RU: 'Самоорганизующийся груз.', EN: 'Self-organizing cargo.' }, cost: { ancientTech: 40, rubies: 20, nanoSwarm: 50 }, baseStats: { cargoCapacity: 150000, energyCost: 200 } },
  { id: 'cargo_10', tier: 10, mass: 1416, rarity: 'Legendary', name: { RU: 'Гравитационный стабилизатор', EN: 'Gravitational Stabilizer' }, description: { RU: 'Груз становится невесомым.', EN: 'Cargo becomes weightless.' }, cost: { ancientTech: 150, emeralds: 50, nanoSwarm: 200 }, baseStats: { cargoCapacity: 300000, energyCost: 350 } },
  { id: 'cargo_11', tier: 11, mass: 1535, rarity: 'Legendary', name: { RU: 'Пространственный карман', EN: 'Spatial Pocket' }, description: { RU: 'Больше внутри, чем снаружи.', EN: 'Bigger on the inside.' }, cost: { ancientTech: 400, diamonds: 50, nanoSwarm: 500 }, baseStats: { cargoCapacity: 600000, energyCost: 500 } },
  { id: 'cargo_12', tier: 12, mass: 1653, rarity: 'Legendary', name: { RU: 'Подпространственный склад', EN: 'Subspace Warehouse' }, description: { RU: 'Прямая связь с хранилищем.', EN: 'Direct link to storage.' }, cost: { ancientTech: 1200, nanoSwarm: 1500, rubies: 100 }, baseStats: { cargoCapacity: 1200000, energyCost: 800 } },
  // FUSION ONLY
  { id: 'cargo_13', tier: 13, mass: 1770, rarity: 'Godly', name: { RU: 'Квантовый накопитель', EN: 'Quantum Accumulator' }, description: { RU: 'Ресурсы существуют везде сразу.', EN: 'Resources exist everywhere at once.' }, cost: { ancientTech: 3000, rubies: 1000, diamonds: 500 }, baseStats: { cargoCapacity: 3000000, energyCost: 1200 } },
  { id: 'cargo_14', tier: 14, mass: 1885, rarity: 'Godly', name: { RU: 'Сингулярное хранилище', EN: 'Singular Storage' }, description: { RU: 'Бесконечная плотность.', EN: 'Infinite density.' }, cost: { ancientTech: 8000, emeralds: 1000, nanoSwarm: 3000 }, baseStats: { cargoCapacity: 8000000, energyCost: 2000 } },
  { id: 'cargo_15', tier: 15, mass: 1999, rarity: 'Godly', name: { RU: 'Бесконечный Горизонт', EN: 'Infinite Horizon' }, description: { RU: 'Объем целой планеты.', EN: 'Volume of an entire planet.' }, cost: { ancientTech: 20000, diamonds: 1000, nanoSwarm: 8000 }, baseStats: { cargoCapacity: 20000000, energyCost: 4000 } }
];


export const FUSION_RECIPES: MergeRecipe[] = [
  // === DRILL BITS ===
  {
    id: 'fusion_bit_13',
    resultId: 'bit_13',
    componentAId: 'bit_12',
    componentBId: 'bit_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1000 },
    condition: { type: 'DEPTH_REACHED', target: 100000, description: 'Достигните глубины 100,000м' },
    description: { RU: 'Два Антиматериевых пера создают Разлом Реальности', EN: 'Two Antimatter Nibs create Reality Breach' }
  },
  {
    id: 'fusion_bit_14',
    resultId: 'bit_14',
    componentAId: 'bit_13',
    componentBId: 'bit_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 2000 },
    condition: { type: 'ZERO_HEAT', target: 0, description: 'Слияние при нулевом нагреве' },
    description: { RU: 'Два Разлома создают Спираль Судьбы', EN: 'Two Breaches create Spiral of Fate' }
  },
  {
    id: 'fusion_bit_15',
    resultId: 'bit_15',
    componentAId: 'bit_14',
    componentBId: 'bit_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 500 },
    condition: { type: 'NO_DAMAGE', target: 100, description: 'Слияние при 100% HP' },
    description: { RU: 'Две Спирали создают Пронзающий Пустоту', EN: 'Two Spirals create Void Piercer' }
  },

  // === ENGINES ===
  {
    id: 'fusion_engine_13',
    resultId: 'fus_eng_13',
    componentAId: 'eng_12',
    componentBId: 'eng_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1500 },
    condition: { type: 'MAX_HEAT', target: 100, description: 'Слияние при максимальном нагреве' },
    description: { RU: 'Две Темные материи создают Нулевую точку', EN: 'Two Dark Matters create Zero Point' }
  },
  {
    id: 'fusion_engine_14',
    resultId: 'fus_eng_14',
    componentAId: 'fus_eng_13',
    componentBId: 'fus_eng_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 3000 },
    condition: { type: 'DEPTH_REACHED', target: 150000, description: 'Достигните глубины 150,000м' },
    description: { RU: 'Две Нулевые точки создают Квантовый суперпозитор', EN: 'Two Zero Points create Quantum Superpositor' }
  },
  {
    id: 'fusion_engine_15',
    resultId: 'fus_eng_15',
    componentAId: 'fus_eng_14',
    componentBId: 'fus_eng_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 5000 },
    description: { RU: 'Два Суперпозитора создают Двигатель Воли', EN: 'Two Superpositors create Engine of Will' }
  },

  // === COOLING ===
  {
    id: 'fusion_cooling_13',
    resultId: 'cool_13',
    componentAId: 'cool_12',
    componentBId: 'cool_12',
    catalyst: { resource: ResourceType.ICE, amount: 5000 },
    condition: { type: 'ZERO_HEAT', target: 0, description: 'Слияние при нулевом нагреве' },
    description: { RU: 'Два Стрингера Пустоты создают Энтропийный якорь', EN: 'Two Void Stringers create Entropy Anchor' }
  },
  {
    id: 'fusion_cooling_14',
    resultId: 'cool_14',
    componentAId: 'cool_13',
    componentBId: 'cool_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 3000 },
    description: { RU: 'Два Энтропийных якоря создают Ледяное сердце звезды', EN: 'Two Entropy Anchors create Ice Heart of a Star' }
  },
  {
    id: 'fusion_cooling_15',
    resultId: 'cool_15',
    componentAId: 'cool_14',
    componentBId: 'cool_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 1000 },
    description: { RU: 'Два Ледяных сердца создают Смерть Вселенной', EN: 'Two Ice Hearts create Death of the Universe' }
  },

  // === HULL ===
  {
    id: 'fusion_hull_13',
    resultId: 'hull_13',
    componentAId: 'hull_12',
    componentBId: 'hull_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2000 },
    condition: { type: 'NO_DAMAGE', target: 100, description: 'Слияние при 100% HP' },
    description: { RU: 'Два Зеркала создают Ковчег Предтеч', EN: 'Two Mirrors create Ark of the Precursors' }
  },
  {
    id: 'fusion_hull_14',
    resultId: 'hull_14',
    componentAId: 'hull_13',
    componentBId: 'hull_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 4000 },
    condition: { type: 'DEPTH_REACHED', target: 200000, description: 'Достигните глубины 200,000м' },
    description: { RU: 'Два Ковчега создают Сингулярную оболочку', EN: 'Two Arks create Singular Shell' }
  },
  {
    id: 'fusion_hull_15',
    resultId: 'hull_15',
    componentAId: 'hull_14',
    componentBId: 'hull_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 10000 },
    description: { RU: 'Две Оболочки создают Несокрушимый', EN: 'Two Shells create Indestructible' }
  },

  // === LOGIC ===
  {
    id: 'fusion_logic_13',
    resultId: 'cpu_13',
    componentAId: 'cpu_12',
    componentBId: 'cpu_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1200 },
    condition: { type: 'DEPTH_REACHED', target: 120000, description: 'Достигните глубины 120,000м' },
    description: { RU: 'Два Предсказателя создают Систему "Доминация"', EN: 'Two Forecasters create System "Domination"' }
  },
  {
    id: 'fusion_logic_14',
    resultId: 'cpu_14',
    componentAId: 'cpu_13',
    componentBId: 'cpu_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 2500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: 'Слияние при нулевом нагреве' },
    description: { RU: 'Две Системы создают Матрицу Братана', EN: 'Two Systems create Brotan Matrix' }
  },
  {
    id: 'fusion_logic_15',
    resultId: 'cpu_15',
    componentAId: 'cpu_14',
    componentBId: 'cpu_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 8000 },
    description: { RU: 'Две Матрицы создают Божественного Архитектора', EN: 'Two Matrices create Divine Architect' }
  },

  // === CONTROL ===
  {
    id: 'fusion_control_13',
    resultId: 'ctrl_13',
    componentAId: 'ctrl_12',
    componentBId: 'ctrl_12',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 1500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: 'Слияние при нулевом нагреве' },
    description: { RU: 'Два Волевых интерфейса создают Симбиоз', EN: 'Two Will Interfaces create Symbiosis' }
  },
  {
    id: 'fusion_control_14',
    resultId: 'ctrl_14',
    componentAId: 'ctrl_13',
    componentBId: 'ctrl_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 4000 },
    description: { RU: 'Два Симбиоза создают Единство души', EN: 'Two Symbioses create Unity of Soul' }
  },
  {
    id: 'fusion_control_15',
    resultId: 'ctrl_15',
    componentAId: 'ctrl_14',
    componentBId: 'ctrl_14',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 8000 },
    description: { RU: 'Два Единства создают Творца', EN: 'Two Unities create Creator' }
  },

  // === GEARBOX ===
  {
    id: 'fusion_gearbox_13',
    resultId: 'gear_13',
    componentAId: 'gear_12',
    componentBId: 'gear_12',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 300 },
    condition: { type: 'MAX_HEAT', target: 100, description: 'Слияние при максимальном нагреве' },
    description: { RU: 'Два Вариатора "Тьма" создают Разрушитель связей', EN: 'Two Variators "Darkness" create Bond Breaker' }
  },
  {
    id: 'fusion_gearbox_14',
    resultId: 'gear_14',
    componentAId: 'gear_13',
    componentBId: 'gear_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 6000 },
    description: { RU: 'Два Разрушителя создают Нулевое сопротивление', EN: 'Two Breakers create Zero Resistance' }
  },
  {
    id: 'fusion_gearbox_15',
    resultId: 'gear_15',
    componentAId: 'gear_14',
    componentBId: 'gear_14',
    catalyst: { resource: ResourceType.DIAMONDS, amount: 800 },
    description: { RU: 'Два Нулевых создают Абсолютную тягу', EN: 'Two Zeros create Absolute Traction' }
  },

  // === POWER CORE ===
  {
    id: 'fusion_power_13',
    resultId: 'pwr_13',
    componentAId: 'pwr_12',
    componentBId: 'pwr_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 1800 },
    condition: { type: 'NO_DAMAGE', target: 100, description: 'Слияние при 100% HP' },
    description: { RU: 'Две Сингулярности создают Энергию Пустоты', EN: 'Two Singularities create Void Energy' }
  },
  {
    id: 'fusion_power_14',
    resultId: 'pwr_14',
    componentAId: 'pwr_13',
    componentBId: 'pwr_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 3500 },
    description: { RU: 'Две Энергии создают Дыхание Вселенной', EN: 'Two Energies create Breath of the Universe' }
  },
  {
    id: 'fusion_power_15',
    resultId: 'pwr_15',
    componentAId: 'pwr_14',
    componentBId: 'pwr_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 12000 },
    description: { RU: 'Два Дыхания создают Вечный Двигатель', EN: 'Two Breaths create Perpetual Motion' }
  },

  // === ARMOR ===
  {
    id: 'fusion_armor_13',
    resultId: 'arm_13',
    componentAId: 'arm_12',
    componentBId: 'arm_12',
    catalyst: { resource: ResourceType.EMERALDS, amount: 300 },
    condition: { type: 'DEPTH_REACHED', target: 180000, description: 'Достигните глубины 180,000м' },
    description: { RU: 'Два Пространственных сдвига создают Щит "Абсолют"', EN: 'Two Spatial Shifts create Shield "Absolute"' }
  },
  {
    id: 'fusion_armor_14',
    resultId: 'arm_14',
    componentAId: 'arm_13',
    componentBId: 'arm_13',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2500 },
    condition: { type: 'NO_DAMAGE', target: 100, description: 'Слияние при 100% HP' },
    description: { RU: 'Два Щита создают Фрактальную броню', EN: 'Two Shields create Fractal Armor' }
  },
  {
    id: 'fusion_armor_15',
    resultId: 'arm_15',
    componentAId: 'arm_14',
    componentBId: 'arm_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 8000 },
    description: { RU: 'Две Брони создают Божественную длань', EN: 'Two Armors create Divine Hand' }
  },

  // === CARGO BAY ===
  {
    id: 'fusion_cargo_13',
    resultId: 'cargo_13',
    componentAId: 'cargo_12',
    componentBId: 'cargo_12',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 2500 },
    condition: { type: 'ZERO_HEAT', target: 0, description: 'Слияние при нулевом нагреве' },
    description: { RU: 'Два Подпространственных склада создают Квантовый накопитель', EN: 'Two Subspace Warehouses create Quantum Accumulator' }
  },
  {
    id: 'fusion_cargo_14',
    resultId: 'cargo_14',
    componentAId: 'cargo_13',
    componentBId: 'cargo_13',
    catalyst: { resource: ResourceType.NANO_SWARM, amount: 4000 },
    description: { RU: 'Два Накопителя создают Сингулярное хранилище', EN: 'Two Accumulators create Singular Storage' }
  },
  {
    id: 'fusion_cargo_15',
    resultId: 'cargo_15',
    componentAId: 'cargo_14',
    componentBId: 'cargo_14',
    catalyst: { resource: ResourceType.ANCIENT_TECH, amount: 15000 },
    description: { RU: 'Два Хранилища создают Бесконечный Горизонт', EN: 'Two Storages create Infinite Horizon' }
  }
];

export const DRONES: DroneDefinition[] = [
  {
    id: DroneType.COLLECTOR,
    name: { RU: 'СБОРЩИК MK-1', EN: 'COLLECTOR MK-1' },
    description: { RU: 'Требуется: Медь + Изумруды (сенсоры).', EN: 'Requires: Copper + Emeralds (sensors).' },
    baseCost: { clay: 500, copper: 200, emeralds: 5 },
    costMultiplier: 1.5,
    maxLevel: 10,
    color: '#00FF00',
    effectDescription: (lvl) => ({
      RU: `Множитель сбора: x${(1 + lvl * 0.2).toFixed(1)}`,
      EN: `Collection multiplier: x${(1 + lvl * 0.2).toFixed(1)}`
    })
  },
  {
    id: DroneType.COOLER,
    name: { RU: 'КРИО-БОТ MK-2', EN: 'CRYO-BOT MK-2' },
    description: { RU: 'Требуется: Серебро + Железо (радиатор).', EN: 'Requires: Silver + Iron (radiator).' },
    baseCost: { iron: 800, silver: 400 },
    costMultiplier: 1.6,
    maxLevel: 10,
    color: '#00FFFF',
    effectDescription: (lvl) => ({
      RU: `Охлаждение: -${(1.5 * lvl).toFixed(1)}/сек`,
      EN: `Cooling: -${(1.5 * lvl).toFixed(1)}/sec`
    })
  },
  {
    id: DroneType.BATTLE,
    name: { RU: 'ОХРАННИК MK-3', EN: 'GUARDIAN MK-3' },
    description: { RU: 'Требуется: Титан + Рубины (лазер).', EN: 'Requires: Titanium + Rubies (laser).' },
    baseCost: { gold: 1500, titanium: 600, rubies: 10 },
    costMultiplier: 1.8,
    maxLevel: 10,
    color: '#FF0000',
    effectDescription: (lvl) => ({
      RU: `Урон боссам: ${(50 * lvl)}/сек`,
      EN: `Boss damage: ${(50 * lvl)}/sec`
    })
  },
  {
    id: DroneType.REPAIR,
    name: { RU: 'НАНО-ВРАЧ MK-4', EN: 'NANO-DOCTOR MK-4' },
    description: { RU: 'Требуется: Уран + Нано-рой.', EN: 'Requires: Uranium + Nano-swarm.' },
    baseCost: { uranium: 1000, nanoSwarm: 200 },
    costMultiplier: 2.0,
    maxLevel: 10,
    color: '#FFD700',
    effectDescription: (lvl) => ({
      RU: `Ремонт: +${(0.2 * lvl).toFixed(1)}/сек`,
      EN: `Repair: +${(0.2 * lvl).toFixed(1)}/sec`
    })
  },
  {
    id: DroneType.MINER,
    name: { RU: 'БУР-ДРОН MK-5', EN: 'DRILL-DRONE MK-5' },
    description: { RU: 'Требуется: Ancient Tech + Алмазы (бур).', EN: 'Requires: Ancient Tech + Diamonds (drill).' },
    baseCost: { ancientTech: 50, diamonds: 20 },
    costMultiplier: 2.5,
    maxLevel: 10,
    color: '#FF00FF',
    effectDescription: (lvl) => ({
      RU: `Добыча: ${(lvl * 5)}/сек`,
      EN: `Mining: ${(lvl * 5)}/sec`
    })
  }
];

export const GAME_VERSION = '4.1.3';

