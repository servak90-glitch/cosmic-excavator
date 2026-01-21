
import { RegionId } from '../types';

export const TL = {
  regions: {
    [RegionId.RUST_VALLEY]: { RU: "Ржавая Долина", EN: "Rust Valley" },
    [RegionId.CRYSTAL_WASTES]: { RU: "Кристальные Пустоши", EN: "Crystal Wastes" },
    [RegionId.IRON_GATES]: { RU: "Железные Врата", EN: "Iron Gates" },
    [RegionId.MAGMA_CORE]: { RU: "Магматическое Ядро", EN: "Magma Core" },
    [RegionId.VOID_CHASM]: { RU: "Разлом Пустоты", EN: "Void Chasm" }
  },
  regionDescriptions: {
    [RegionId.RUST_VALLEY]: { RU: "Стартовый регион. Зона нелегальных бурильщиков, бандиты и коррозия.", EN: "Starting region. Zone of illegal drillers, bandits, and corrosion." },
    [RegionId.CRYSTAL_WASTES]: { RU: "Заброшенные кристаллические шахты Science Faction. Изумруды ×3, магнитные аномалии.", EN: "Abandoned crystal mines of the Science Faction. Emeralds ×3, magnetic anomalies." },
    [RegionId.IRON_GATES]: { RU: "Военная зона Void Industries. Железо ×2, контроль корпораций, патрули дронов.", EN: "Military zone of Void Industries. Iron ×2, corporate control, drone patrols." },
    [RegionId.MAGMA_CORE]: { RU: "Вулканический регион. Экстремальные температуры, древние руины, лавовые потоки.", EN: "Volcanic region. Extreme temperatures, ancient ruins, lava flows." },
    [RegionId.VOID_CHASM]: { RU: "Аномальная зона. Пространственные разрывы, Ancient Tech ×3, подготовка к порталу.", EN: "Anomalous zone. Spatial ruptures, Ancient Tech ×3, portal preparation." }
  },
  baseTypes: {
    outpost: { RU: "Аванпост", EN: "Outpost" },
    station: { RU: "Станция", EN: "Station" },
    camp: { RU: "Лагерь", EN: "Camp" },
    citadel: { RU: "Цитадель", EN: "Citadel" }
  },
  ui: {
    map: { RU: "Карта", EN: "Map" },
    market: { RU: "Рынок", EN: "Market" },
    caravans: { RU: "Караваны", EN: "Caravans" },
    quests: { RU: "Квесты", EN: "Quests" },
    factions: { RU: "Фракции", EN: "Factions" },
    sector: { RU: "СЕКТОР", EN: "SECTOR" },
    status: { RU: "СТАТУС", EN: "STATUS" },
    active: { RU: "АКТИВЕН", EN: "ACTIVE" },
    currentRegion: { RU: "Текущий регион", EN: "Current Region" },
    cargo: { RU: "Груз", EN: "Cargo" },
    fuel: { RU: "Топливо", EN: "Fuel" },
    level: { RU: "Уровень", EN: "Level" },
    travelTo: { RU: "Перемещение в", EN: "Travel To" },
    distance: { RU: "Расстояние", EN: "Distance" },
    startTravel: { RU: "НАЧАТЬ ПЕРЕМЕЩЕНИЕ", EN: "START TRAVEL" },
    overloaded: { RU: "ПЕРЕГРУЗ! СБРОСЬТЕ ГРУЗ", EN: "OVERLOADED! DUMP CARGO" },
    selectFuel: { RU: "Выбор топлива:", EN: "Select Fuel:" },
    cargoState: { RU: "Состояние груза:", EN: "Cargo State:" },
    loaded: { RU: "загружен", EN: "loaded" },
    consumption: { RU: "расход", EN: "consumption" },
    locked: { RU: "🔒", EN: "🔒" },
    available: { RU: "Доступно", EN: "Available" },
    cost: { RU: "Стоимость", EN: "Cost" },
    sell: { RU: "Продать", EN: "Sell" },
    buy: { RU: "Купить", EN: "Buy" },
    price: { RU: "Цена", EN: "Price" }
  },
  resources: {
    coal: { RU: "Уголь", EN: "Coal" },
    iron: { RU: "Железо", EN: "Iron" },
    copper: { RU: "Медь", EN: "Copper" },
    gold: { RU: "Золото", EN: "Gold" },
    oil: { RU: "Нефть", EN: "Oil" },
    uranium: { RU: "Уран", EN: "Uranium" },
    diamonds: { RU: "Алмазы", EN: "Diamonds" },
    ancientTech: { RU: "Древние Технологии", EN: "Ancient Tech" },
    nanoSwarm: { RU: "Нано-Рой", EN: "Nano-Swarm" },
    stone: { RU: "Камень", EN: "Stone" },
    clay: { RU: "Глина", EN: "Clay" },
    gas: { RU: "Газ", EN: "Gas" },
    XP: { RU: "Опыт", EN: "XP" },
    rubies: { RU: "Рубины", EN: "Rubies" },
    emeralds: { RU: "Изумруды", EN: "Emeralds" },
    silver: { RU: "Серебро", EN: "Silver" },
    titanium: { RU: "Титан", EN: "Titanium" },
    ice: { RU: "Лёд", EN: "Ice" },
    scrap: { RU: "Металлолом", EN: "Scrap" },
    repairKit: { RU: "Ремкомплект", EN: "Repair Kit" },
    coolantPaste: { RU: "Охлаждающая паста", EN: "Coolant Paste" },
    advancedCoolant: { RU: "Активный хладагент", EN: "Active Coolant" },
    credits: { RU: "Кредиты", EN: "Credits" }
  },
  caravan: {
    title: { RU: "КАРАВАННАЯ ЛОГИСТИКА", EN: "CARAVAN LOGISTICS" },
    subtitle: { RU: "Транспортировка ресурсов между базами", EN: "Transporting resources between bases" },
    send: { RU: "Отправить Караван", EN: "Send Caravan" },
    capacity: { RU: "Вместимость", EN: "Capacity" },
    risk: { RU: "Риск", EN: "Risk" },
    duration: { RU: "Время", EN: "Duration" },
    status: {
      idle: { RU: "Ожидание", EN: "Idle" },
      in_transit: { RU: "В пути", EN: "In Transit" },
      returning: { RU: "Возвращается", EN: "Returning" }
    }
  },
  factions: {
    title: { RU: "Фракции", EN: "Factions" },
    names: {
      CORPORATE: { RU: "Void Industries", EN: "Void Industries" },
      SCIENCE: { RU: "Aegis Collegium", EN: "Aegis Collegium" },
      REBELS: { RU: "Свободные Шахтеры", EN: "Free Miners" }
    },
    descriptions: {
      CORPORATE: { RU: "Мега-корпорация, контролирующая логистику и права на добычу.", EN: "Mega-corporation controlling logistics and mining rights." },
      SCIENCE: { RU: "Научный орден, изучающий Пустоту и древние артефакты.", EN: "Scientific order studying the Void and ancient artifacts." },
      REBELS: { RU: "Независимые шахтеры, борющиеся за свободу от корпоративного контроля.", EN: "Independent miners fighting for freedom from corporate control." }
    },
    perks: {
      CORP_EXCHANGE: { name: { RU: "Корпоративный обмен", EN: "Corporate Exchange" }, desc: { RU: "Цены на рынке снижены на 5%", EN: "Market prices reduced by 5%" } },
      BULK_LOGISTICS: { name: { RU: "Массовая логистика", EN: "Bulk Logistics" }, desc: { RU: "Вместимость караванов увеличена на 20%", EN: "Caravan capacity increased by 20%" } },
      INSURANCE: { name: { RU: "Страхование грузов", EN: "Cargo Insurance" }, desc: { RU: "Риск потери каравана снижен на 50%", EN: "Caravan loss risk reduced by 50%" } },
      EXECUTIVE: { name: { RU: "Исполнительный доступ", EN: "Executive Access" }, desc: { RU: "Пассивная генерация ресурсов x2", EN: "Passive resource generation x2" } },
      RESEARCH_GRANT: { name: { RU: "Научные гранты", EN: "Research Grants" }, desc: { RU: "Стоимость продажи артефактов +10%", EN: "Artifact sale value +10%" } },
      AUTO_ANALYSIS: { name: { RU: "Авто-анализ", EN: "Auto-Analysis" }, desc: { RU: "Время анализа артефактов снижено на 25%", EN: "Artifact analysis time reduced by 25%" } },
      ANOMALY_SCANNER: { name: { RU: "Сканер аномалий", EN: "Anomaly Scanner" }, desc: { RU: "Раскрывает уровень риска в туннелях", EN: "Reveals risk levels in tunnels" } },
      QUANTUM_STABILITY: { name: { RU: "Квантовая стабильность", EN: "Quantum Stability" }, desc: { RU: "Частота тектонических событий снижена на 50%", EN: "Tectonic event frequency reduced by 50%" } },
      BLACK_MARKET: { name: { RU: "Черный рынок", EN: "Black Market" }, desc: { RU: "Открывает торговлю нелегальными товарами", EN: "Unlocks black market trade" } },
      SMUGGLER: { name: { RU: "Контрабандист", EN: "Smuggler" }, desc: { RU: "Расход топлива снижен на 20%", EN: "Fuel consumption reduced by 20%" } },
      SABOTAGE: { name: { RU: "Саботаж", EN: "Sabotage" }, desc: { RU: "Шанс успеха в опасных туннелях +10%", EN: "Success chance in dangerous tunnels +10%" } },
      LIBERATION: { name: { RU: "Герой освобождения", EN: "Liberation Hero" }, desc: { RU: "Эффективность защиты базы +50%", EN: "Base defense efficiency +50%" } }
    },
    standing: { RU: "Текущий статус", EN: "Current Standing" },
    reputation: { RU: "Репутация", EN: "Reputation" },
    nextTier: { RU: "След. уровень", EN: "Next Tier" },
    max: { RU: "МАКС", EN: "MAX" },
    perkTitle: { RU: "Фракционные навыки", EN: "Faction Perks" },
    rivalry: { RU: "ВРАЖДА: Повышение репутации здесь снижает отношения с", EN: "RIVALRY: Increasing reputation here reduces relations with" },
    rivalryWarning: { RU: "ПРОТИВОСТОЯНИЕ", EN: "CONFRONTATION" }
  },
  quests: {
    title: { RU: "Центр Управления", EN: "Command Center" },
    tabs: {
      available: { RU: "Доступные", EN: "Available" },
      active: { RU: "Активные", EN: "Active" },
      completed: { RU: "Завершенные", EN: "Completed" }
    },
    accept: { RU: "ПРИНЯТЬ КОНТРАКТ", EN: "ACCEPT CONTRACT" },
    complete: { RU: "ЗАВЕРШИТЬ", EN: "COMPLETE" },
    rewards: { RU: "Награды", EN: "Rewards" },
    ready: { RU: "ГОТОВО", EN: "READY" },
    noAvailable: { RU: "Нет доступных контрактов. Выполните текущие или исследуйте мир.", EN: "No contracts available. Complete current ones or explore the world." },
    noActive: { RU: "Нет активных квестов.", EN: "No active quests." },
    emptyHistory: { RU: "История пуста.", EN: "History is empty." },
    completedStatus: { RU: "ЗАВЕРШЕНО", EN: "COMPLETED" }
  }
};

// Локализованные текстовые строки с поддержкой RU/EN
export const TEXT_IDS = {
  // Меню и навигация
  SETTINGS_TITLE: { RU: 'НАСТРОЙКИ', EN: 'SETTINGS' },
  SETTINGS_BUTTON: { RU: 'НАСТРОЙКИ', EN: 'SETTINGS' },
  MANUAL_BUTTON: { RU: 'РУКОВОДСТВО', EN: 'MANUAL' },
  EXIT_BUTTON: { RU: 'ВЫХОД', EN: 'EXIT' },
  MENU_DRILL: { RU: 'БУР', EN: 'DRILL' },
  MENU_CITY: { RU: 'ГОРОД', EN: 'CITY' },
  MENU_FORGE: { RU: 'КУЗНИЦА', EN: 'FORGE' },
  MENU_SKILLS: { RU: 'НАВЫКИ', EN: 'SKILLS' },
  MENU_ARTIFACTS: { RU: 'АРТЕФАКТЫ', EN: 'ARTIFACTS' },
  MENU_MAP: { RU: 'КАРТА', EN: 'MAP' },
  MENU_ARCHIVE: { RU: 'АРХИВ', EN: 'ARCHIVE' },

  // Заголовки разделов
  HEADER_RARE_RESOURCES: { RU: 'РЕДКИЕ / ЦЕННЫЕ', EN: 'RARE / PRECIOUS' },
  ARCHIVE_TITLE: { RU: 'АРХИВ ЭКСПЕДИЦИЙ', EN: 'EXPEDITION ARCHIVE' },
  COLLECTION_STATUS: { RU: 'СТАТУС КОЛЛЕКЦИИ', EN: 'COLLECTION STATUS' },
  UNKNOWN_ITEM: { RU: 'НЕИЗВЕСТНО', EN: 'UNKNOWN' },
  LOCKED_ITEM: { RU: 'ЗАБЛОКИРОВАНО', EN: 'LOCKED' },

  // Городские службы
  CITY_COOLING_SYSTEM: { RU: 'СИСТЕМА ОХЛАЖДЕНИЯ', EN: 'COOLING SYSTEM' },
  CITY_REPAIR_DOCK: { RU: 'РЕМОНТНЫЙ ДОК', EN: 'REPAIR DOCK' },
  CITY_PREMIUM_SERVICE: { RU: 'ПРЕМИУМ ОБСЛУЖИВАНИЕ', EN: 'PREMIUM SERVICE' },
  CITY_LICENSES: { RU: 'ЛИЦЕНЗИОННЫЙ ЦЕНТР', EN: 'LICENSE CENTER' },
  CITY_CURRENT_HEAT: { RU: 'ТЕКУЩИЙ НАГРЕВ', EN: 'CURRENT HEAT' },
  CITY_HULL_INTEGRITY: { RU: 'ЦЕЛОСТНОСТЬ ОБШИВКИ', EN: 'HULL INTEGRITY' },
  CITY_COST: { RU: 'СТОИМОСТЬ', EN: 'COST' },
  CITY_FULL_REPAIR: { RU: 'ПОЛНЫЙ РЕМОНТ', EN: 'FULL REPAIR' },
  CITY_REPAIR_BTN: { RU: 'ВОССТАНОВИТЬ ОБШИВКУ', EN: 'REPAIR HULL' },
  CITY_COOLING_BTN: { RU: 'ЭКСТРЕННЫЙ СБРОС ТЕПЛА', EN: 'EMERGENCY HEAT PURGE' },
  CITY_FREE: { RU: 'БЕСПЛАТНО', EN: 'FREE' },
  CITY_NO_DAMAGE: { RU: 'ПОВРЕЖДЕНИЙ НЕТ', EN: 'NO DAMAGE' },
  CITY_SYSTEM_OK: { RU: 'СИСТЕМА В НОРМЕ', EN: 'SYSTEM OK' },
  CITY_LICENSE_ZONE: { RU: 'ЛИЦЕНЗИЯ ЗОНЫ', EN: 'ZONE LICENSE' },
  CITY_PERMIT_REGION: { RU: 'РАЗРЕШЕНИЕ РЕГИОНА', EN: 'REGION PERMIT' },
  CITY_OWNED: { RU: 'КУПЛЕНО', EN: 'OWNED' },
  CITY_REQUIREMENT: { RU: 'ТРЕБУЕТСЯ', EN: 'REQUIRED' },
  CITY_PERMANENT: { RU: 'БЕССРОЧНО', EN: 'PERMANENT' },
  CITY_TEMPORARY: { RU: 'ВРЕМЕННО (7Д)', EN: 'TEMPORARY (7D)' },

  // Системные логи
  LOG_INSUFFICIENT_RESOURCES: { RU: 'НЕДОСТАТОЧНО РЕСУРСОВ', EN: 'INSUFFICIENT RESOURCES' },
  LOG_EFFECT_ACTIVATED: { RU: 'ЭФФЕКТ', EN: 'EFFECT' },
  LOG_GAMBLE_WIN: { RU: 'ВЫИГРЫШ!', EN: 'WIN!' },
  LOG_GAMBLE_LOSS: { RU: 'ПРОИГРЫШ...', EN: 'LOSS...' },
  LOG_CRAFT_SUCCESS: { RU: 'СОЗДАНО', EN: 'CRAFTED' },
  LOG_SYSTEM_RESTORED: { RU: 'СИСТЕМА ВОССТАНОВЛЕНА', EN: 'SYSTEM RESTORED' },
  LOG_PROGRESS_SAVED: { RU: 'ПРОГРЕСС ЗАПИСАН В ЧЕРНЫЙ ЯЩИК', EN: 'PROGRESS SAVED TO BLACK BOX' },
  LOG_SAVE_ERROR: { RU: 'ОШИБКА ЗАПИСИ ДАННЫХ', EN: 'DATA SAVE ERROR' },

  // Настройки аудио
  MUSIC_VOLUME: { RU: 'МУЗЫКА', EN: 'MUSIC' },
  SFX_VOLUME: { RU: 'ЗВУКИ', EN: 'SFX' },
  DRILL_VOLUME: { RU: 'БУР И МОТОР', EN: 'DRILL & MOTOR' },

  // Сброс прогресса
  RESET_PROGRESS: { RU: 'СБРОСИТЬ ПРОГРЕСС', EN: 'RESET PROGRESS' },
  RESET_CONFIRM_TITLE: { RU: 'ПОДТВЕРЖДЕНИЕ', EN: 'CONFIRMATION' },
  RESET_CONFIRM_BODY: { RU: 'Все данные будут удалены навсегда. Это действие необратимо!', EN: 'All data will be permanently deleted. This action cannot be undone!' },

  // Кнопки
  BTN_OK: { RU: 'ОК', EN: 'OK' },
  BTN_CANCEL: { RU: 'ОТМЕНА', EN: 'CANCEL' },
  BTN_DATA_BACKUP: { RU: 'РЕЗЕРВНОЕ КОПИРОВАНИЕ', EN: 'DATA BACKUP' },
  BTN_COPY_CLIPBOARD: { RU: 'СКОПИРОВАТЬ В БУФЕР', EN: 'COPY TO CLIPBOARD' },
  BTN_APPLY_CODE: { RU: 'ПРИМЕНИТЬ КОД', EN: 'APPLY CODE' },

  // Справка
  HELP_SECTION_SAVE_TITLE: { RU: 'СОХРАНЕНИЕ', EN: 'SAVING' },
  HELP_SECTION_SAVE_BODY: { RU: 'Игра НЕ сохраняется автоматически. Используйте кнопку "ЗАПИСЬ" в настройках.', EN: 'The game does NOT auto-save. Use the "SAVE" button in settings.' },
  HELP_SECTION_EXPORT_TITLE: { RU: 'ЭКСПОРТ/ИМПОРТ', EN: 'EXPORT/IMPORT' },
  HELP_SECTION_EXPORT_BODY: { RU: 'Вы можете экспортировать сохранение как текстовый код и импортировать его позже.', EN: 'You can export your save as a text code and import it later.' },

  // Начальный экран / AI
  AI_INIT: { RU: 'ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...', EN: 'INITIALIZING SYSTEM...' },
  AI_READY: { RU: 'СИСТЕМА ГОТОВА', EN: 'SYSTEM READY' },
  HARDCORE_WARNING: { RU: '⚠️ ВНИМАНИЕ: Прогресс НЕ сохраняется автоматически!', EN: '⚠️ WARNING: Progress is NOT auto-saved!' },
  INIT_BUTTON: { RU: 'НАЧАТЬ СПУСК', EN: 'BEGIN DESCENT' },
  FIRST_RUN_TITLE: { RU: 'ПЕРВЫЙ ЗАПУСК', EN: 'FIRST RUN' },
  FIRST_RUN_BODY: { RU: 'Добро пожаловать в Пустоту. Это хардкорный опыт без автосохранения. Удачи.', EN: 'Welcome to the Void. This is a hardcore experience without auto-save. Good luck.' },
  BTN_ACKNOWLEDGE: { RU: 'ПОНЯЛ', EN: 'UNDERSTOOD' },

  // Дополнительные строки для настроек
  SETTINGS_BLACK_BOX: { RU: 'ЧЕРНЫЙ ЯЩИК', EN: 'BLACK BOX' },
  SETTINGS_MANUAL_MEM: { RU: 'РУЧНОЕ УПРАВЛЕНИЕ ПАМЯТЬЮ', EN: 'MANUAL MEMORY CONTROL' },
  SETTINGS_SAVE_BTN: { RU: '[ ЗАПИСЬ ]', EN: '[ RECORD ]' },
  SETTINGS_SAVE_SUB: { RU: 'СОХРАНИТЬ ТЕКУЩЕЕ', EN: 'SAVE CURRENT' },
  SETTINGS_LOAD_BTN: { RU: '[ ЧТЕНИЕ ]', EN: '[ READ ]' },
  SETTINGS_LOAD_SUB: { RU: 'ЗАГРУЗИТЬ ПОСЛЕДНЕЕ', EN: 'LOAD LATEST' },
  SETTINGS_SAVE_WARNING: { RU: 'ВНИМАНИЕ: ПРОГРЕСС НЕ СОХРАНЯЕТСЯ АВТОМАТИЧЕСКИ.', EN: 'WARNING: PROGRESS IS NOT AUTO-SAVED.' },
  SETTINGS_BACKUP_TITLE: { RU: 'РЕЗЕРВНОЕ КОПИРОВАНИЕ', EN: 'DATA BACKUP' },
  SETTINGS_CODE_LABEL: { RU: 'КОД (BASE64)', EN: 'CODE (BASE64)' },
  SETTINGS_RESTORE_LABEL: { RU: 'ВОССТАНОВЛЕНИЕ', EN: 'RESTORE' },
  SETTINGS_IMPORT_PLACEHOLDER: { RU: 'Вставьте код сохранения...', EN: 'Paste save code here...' },
  SETTINGS_APPLY_CODE: { RU: 'ПРИМЕНИТЬ КОД', EN: 'APPLY CODE' },
  SETTINGS_COPY_CLIPBOARD: { RU: 'СКОПИРОВАТЬ В БУФЕР', EN: 'COPY TO CLIPBOARD' },

  // Уведомления настроек
  MSG_COPIED: { RU: 'СКОПИРОВАНО В БУФЕР!', EN: 'COPIED TO CLIPBOARD!' },
  MSG_EXPORT_ERROR: { RU: 'ОШИБКА ЭКСПОРТА', EN: 'EXPORT ERROR' },
  MSG_IMPORT_ERROR: { RU: 'НЕВЕРНЫЙ ФОРМАТ СОХРАНЕНИЯ', EN: 'INVALID SAVE FORMAT' },
  MSG_DATA_SAVED: { RU: 'ДАННЫЕ ЗАПИСАНЫ', EN: 'DATA RECORDED' },
  MSG_DATA_LOADED: { RU: 'ДАННЫЕ ЗАГРУЖЕНЫ', EN: 'DATA LOADED' },
  MSG_NO_DATA: { RU: 'НЕТ ДАННЫХ ДЛЯ ЗАГРУЗКИ', EN: 'NO DATA TO LOAD' },
  LABEL_EFFECT: { RU: 'ЭФФЕКТ:', EN: 'EFFECT:' },
  AI_ERROR: { RU: '[ ОШИБКА ]', EN: '[ ERROR ]' },
  AI_CORE_LABEL: { RU: 'ИИ-ЯДРО', EN: 'AI-CORE' },

  // Fusion System
  FORGE_FUSION: { RU: 'СЛИЯНИЕ', EN: 'FUSION' },
  FUSION_TITLE: { RU: 'СИНТЕЗ ДЕТАЛЕЙ', EN: 'PART FUSION' },
  FUSION_DESCRIPTION: { RU: 'Объедините две детали одного типа для создания улучшенной версии', EN: 'Combine two parts of the same type to create an improved version' },
  FUSION_CONDITION_ZERO_HEAT: { RU: 'Нулевой нагрев', EN: 'Zero Heat' },
  FUSION_CONDITION_MAX_HEAT: { RU: 'Максимальный нагрев', EN: 'Max Heat' },
  FUSION_CONDITION_DEPTH: { RU: 'Глубина', EN: 'Depth' },
  FUSION_CONDITION_NO_DAMAGE: { RU: 'Без повреждений', EN: 'No Damage' },
  FUSION_CATALYST: { RU: 'Катализатор', EN: 'Catalyst' },
  FUSION_COMPONENTS: { RU: 'Компоненты', EN: 'Components' },
  FUSION_RESULT: { RU: 'Результат', EN: 'Result' },
  FUSION_BUTTON: { RU: 'СЛИТЬ', EN: 'FUSE' },
  FUSION_REQUIREMENTS: { RU: 'Требования', EN: 'Requirements' },
  FUSION_CONDITION_MET: { RU: 'Выполнено', EN: 'Met' },
  FUSION_CONDITION_NOT_MET: { RU: 'Не выполнено', EN: 'Not Met' },
  FUSION_NO_RECIPES: { RU: 'Нет доступных рецептов слияния', EN: 'No fusion recipes available' },
  FUSION_SUCCESS: { RU: 'Слияние успешно!', EN: 'Fusion successful!' },
  FUSION_FAILED: { RU: 'Слияние не удалось', EN: 'Fusion failed' },

  // Transmutation
  TRANSMUTATION_TITLE: { RU: 'ТРАНСМУТАЦИЯ', EN: 'TRANSMUTATION' },
  TRANSMUTATION_DESC: { RU: 'Выберите 3 артефакта одной редкости, чтобы получить 1 более редкий.', EN: 'Select 3 artifacts of the same rarity to get 1 rarer artifact.' },
  TRANSMUTATION_BUTTON: { RU: 'ЗАПУСК СИНТЕЗА', EN: 'START SYNTHESIS' },
  TRANSMUTATION_NO_ARTIFACTS: { RU: 'НЕТ ДОСТУПНЫХ АРТЕФАКТОВ', EN: 'NO AVAILABLE ARTIFACTS' },

  // Fusion Tab
  FUSION_ATOMIC_RECONSTRUCTOR: { RU: 'АТОМНЫЙ РЕКОНСТРУКТОР', EN: 'ATOMIC RECONSTRUCTOR' },
  FUSION_REQUIRED: { RU: 'ТРЕБУЕТСЯ:', EN: 'REQUIRED:' },
  FUSION_STATUS: { RU: 'СТАТУС:', EN: 'STATUS:' },
  FUSION_COMPLETED: { RU: 'ВЫПОЛНЕНО', EN: 'COMPLETED' },
  FUSION_HULL_DAMAGED: { RU: 'ОБШИВКА ПОВРЕЖДЕНА', EN: 'HULL DAMAGED' },
  FUSION_PREVIOUS_TIER_REQUIRED: { RU: 'ПРЕДЫДУЩИЙ ТИР', EN: 'PREVIOUS TIER' },
  FUSION_ALREADY_UPGRADED: { RU: 'УЖЕ УЛУЧШЕНО', EN: 'ALREADY UPGRADED' },
  FUSION_INSTALLED: { RU: 'УСТАНОВЛЕНО', EN: 'INSTALLED' },
  FUSION_SYNTHESIZE: { RU: 'СИНТЕЗИРОВАТЬ', EN: 'SYNTHESIZE' },
  FUSION_UNAVAILABLE: { RU: 'НЕДОСТУПНО', EN: 'UNAVAILABLE' }
} as const;




// Тип для ключей TEXT_IDS
type TextIdKey = keyof typeof TEXT_IDS;
type Language = 'RU' | 'EN';

// Функция локализации с поддержкой языка
export const t = (textId: { RU: string; EN: string } | string, lang: Language = 'RU'): string => {
  // Если это простая строка, возвращаем как есть
  if (typeof textId === 'string') return textId;
  // Если это объект с локализацией, возвращаем нужный язык
  return textId[lang] || textId.RU;
};
