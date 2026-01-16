
import { GameEvent, ActiveEffect, EventActionId } from '../types';

// База данных событий с весами
export const EVENTS: GameEvent[] = [
  // --- ГЕОЛОГИЯ (ВЕС: ВЫСОКИЙ) ---
  {
    id: 'GAS_POCKET',
    title: 'ГАЗОВЫЙ КАРМАН',
    description: '[WARN] Обнаружен горючий газ. ВЗРЫВ! Целостность нарушена.',
    type: 'WARNING',
    weight: 15, // Was 40. Reduced for hardcore balance.
    minDepth: 200,
    instantDamage: 0.15, // 15% Max HP
    instantHeat: 20 // +20 Heat
  },
  {
    id: 'GOLD_VEIN',
    title: 'ЗОЛОТАЯ ЖИЛА',
    description: '[SCAN] Высокая концентрация ценных минералов. x5 ресурсов на следующие 20 секунд.',
    type: 'NOTIFICATION',
    weight: 35, // Was 40. Slightly reduced.
    minDepth: 100,
    effectId: 'GOLD_RUSH_EFFECT'
  },
  {
    id: 'TECTONIC_SHIFT',
    title: 'ТЕКТОНИЧЕСКИЙ СДВИГ',
    description: 'Плиты приходят в движение! Глубина увеличивается, но обшивка страдает.',
    type: 'WARNING',
    weight: 25,
    minDepth: 1000,
    options: [
      { label: 'УДЕРЖАТЬ ПОЗИЦИЮ', actionId: EventActionId.TECTONIC_HOLD, risk: 'Урон обшивке' },
      { label: 'ФОРСАЖ', actionId: EventActionId.TECTONIC_PUSH, risk: 'Огромный перегрев' }
    ]
  },

  // --- ПРЕДМЕТЫ И АРТЕФАКТЫ ---
  {
    id: 'FOSSIL_FIND',
    title: 'СТРАННЫЙ ОБЪЕКТ',
    description: 'Бур наткнулся на аномальное уплотнение. Сканеры фиксируют технологическую сигнатуру.',
    type: 'ARTIFACT',
    weight: 20,
    minDepth: 10,
    forceArtifactDrop: true
  },
  {
    id: 'DORMANT_POD',
    title: 'СПЯЩАЯ КАПСУЛА',
    description: 'Древний контейнер снабжения. Вскрыть лазером или аккуратно разобрать?',
    type: 'CHOICE',
    weight: 30,
    minDepth: 50,
    options: [
      { label: 'ВСКРЫТЬ ЛАЗЕРОМ', actionId: EventActionId.POD_LASER, risk: 'Шанс уничтожить лут' },
      { label: 'ДЕШИФРОВКА', actionId: EventActionId.POD_HACK }
    ]
  },

  // --- ТЕХНИЧЕСКИЕ СБОИ ---
  {
    id: 'QUANTUM_FLUCTUATION',
    title: 'КВАНТОВАЯ ФЛУКТУАЦИЯ',
    description: 'Бур проходит через нестабильную область пространства. Система охлаждения отключена, но добыча увеличена в 5 раз.',
    type: 'WARNING',
    weight: 20,
    options: [
      { label: 'РИСКНУТЬ (10 сек)', actionId: EventActionId.ACCEPT_FLUCTUATION, risk: 'Перегрев неизбежен' },
      { label: 'СТАБИЛИЗИРОВАТЬ', actionId: EventActionId.REJECT_FLUCTUATION }
    ],
    minDepth: 500
  },
  {
    id: 'MAGNETIC_STORM',
    title: 'МАГНИТНАЯ БУРЯ',
    description: '[ERROR] Помехи ионосферы. Дроны и авто-системы отключены на 30 сек.',
    type: 'WARNING',
    weight: 20,
    minDepth: 50,
    effectId: 'MAGNETIC_INTERFERENCE'
  },
  {
    id: 'AI_GLITCH',
    title: 'СБОЙ ИИ',
    description: 'Логическое ядро ведет себя странно. Предлагает оптимизацию маршрута через магму.',
    type: 'CHOICE',
    weight: 15,
    minDepth: 2000,
    options: [
      { label: 'ДОВЕРИТЬСЯ ИИ', actionId: EventActionId.AI_TRUST, risk: 'Крит. температура' },
      { label: 'ПЕРЕЗАГРУЗКА', actionId: EventActionId.AI_REBOOT, risk: 'Потеря прогресса' }
    ]
  },

  // --- АНОМАЛИИ И ЛОР ---
  {
    id: 'NANOMITE_SWARM',
    title: 'НАШЕСТВИЕ НАНОКЛЕЩЕЙ',
    description: 'Рой роботов-вредителей атакует обшивку. Скорость снижена. Активировать протокол очистки?',
    type: 'ANOMALY',
    weight: 10,
    minDepth: 1000,
    options: [
      { label: 'ОЧИСТИТЬ (+Нано-железо)', actionId: EventActionId.PURGE_NANOMITES }
    ],
  },
  {
    id: 'GRAVITY_ANOMALY',
    title: 'ГРАВИТАЦИОННАЯ АНОМАЛИЯ',
    description: 'Зонд теряет устойчивость. Шкала тепла нестабильна.',
    type: 'ANOMALY',
    weight: 10,
    minDepth: 3000,
    effectId: 'GRAVITY_WARP'
  },
  {
    id: 'CRYSTAL_OVERLOAD',
    title: 'КРИСТАЛЬНЫЙ РЕЗОНАНС',
    description: 'Окружающие кристаллы вибрируют в унисон с буром. Энергия переполняет системы!',
    type: 'ANOMALY',
    weight: 15,
    minDepth: 8000,
    options: [
      { label: 'ПОГЛОТИТЬ ЭНЕРГИЮ', actionId: EventActionId.CRYSTAL_ABSORB }
    ]
  },
  {
    id: 'PRECURSOR_ECHO',
    title: 'ЭХО ПРЕДТЕЧ',
    description: '[INFO] Перехвачен архивный пакет данных цивилизации III типа. (XP +500)',
    type: 'NOTIFICATION',
    weight: 5,
    minDepth: 100,
    instantXp: 500
  },
  {
    id: 'QUANTUM_JUMP',
    title: 'КВАНТОВЫЙ СКАЧОК',
    description: 'Прорыв пространственной метрики. Мгновенное погружение (+5000м).',
    type: 'NOTIFICATION',
    weight: 2, // Very Rare
    minDepth: 1000,
    instantDepth: 5000
  },

  // --- HORIZONTAL PROGRESSION (SIDE TUNNELS) ---
  {
    id: 'SIDE_TUNNEL_DISCOVERY',
    title: 'ПОБОЧНЫЙ ТОННЕЛЬ',
    description: 'Сканеры обнаружили ответвление. Структура стен нестабильна, но возможны находки.',
    type: 'CHOICE',
    weight: 25,
    minDepth: 300,
    options: [
      { label: 'БЕЗОПАСНАЯ ДОБЫЧА', actionId: EventActionId.TUNNEL_SAFE, risk: 'Мало ресурсов' },
      { label: 'РИСКОВАННАЯ РАЗВЕДКА', actionId: EventActionId.TUNNEL_RISKY, risk: 'Обвал / Артефакт' }
    ]
  },

  // --- СОБЫТИЯ ЯДРА (ВЕС: МИНИМАЛЬНЫЙ, ТОЛЬКО ГЛУБИНА) ---
  {
    id: 'CORE_RESONANCE',
    title: 'РЕЗОНАНС ЯДРА',
    description: '[FATAL] Синхронизация с планетарным ядром. Урон x10, но охлаждение невозможно.',
    type: 'ANOMALY',
    weight: 5,
    minDepth: 100000
  }
];

// Генератор эффектов
export const createEffect = (id: string): ActiveEffect | null => {
  switch (id) {
    // --- BASIC EVENTS ---
    case 'QUANTUM_FLUCTUATION_EFFECT':
      return {
        id: 'q_fluct', name: 'Квантовая Нестабильность', description: 'Ресурсы x5, Охлаждение ОТКЛ',
        type: 'BUFF', duration: 100,
        modifiers: { resourceMultiplier: 5, coolingDisabled: true }
      };
    case 'GAS_BURN':
      return {
        id: 'gas_burn', name: 'Сгорание Газа', description: 'Скорость x1.5, Нагрев x2',
        type: 'DEBUFF', duration: 150,
        modifiers: { drillSpeedMultiplier: 1.5, heatGenMultiplier: 2 }
      };
    case 'NANOMITE_DAMAGE':
      return {
        id: 'nano_dmg', name: 'Повреждение Нанитами', description: 'Скорость снижена на 30%',
        type: 'DEBUFF', duration: 300,
        modifiers: { drillSpeedMultiplier: 0.7 }
      };
    case 'GOLD_RUSH_EFFECT':
      return {
        id: 'gold_rush', name: 'Золотая Лихорадка', description: 'Ресурсы x5',
        type: 'BUFF', duration: 200,
        modifiers: { resourceMultiplier: 5 }
      };
    case 'AI_OVERCLOCK':
      return {
        id: 'ai_oc', name: 'Разгон ИИ', description: 'Скорость x3, Нагрев x2',
        type: 'BUFF', duration: 150,
        modifiers: { drillSpeedMultiplier: 3, heatGenMultiplier: 2 }
      };
    case 'MAGNETIC_INTERFERENCE':
      return {
        id: 'mag_storm', name: 'Магнитные Помехи', description: 'Дроны и Авто-системы ОТКЛ',
        type: 'DEBUFF', duration: 300,
        modifiers: { autoClickDisabled: true }
      };
    case 'GRAVITY_WARP':
      return {
        id: 'grav_warp', name: 'Грави-искажение', description: 'Нестабильный нагрев',
        type: 'ANOMALY', duration: 200,
        modifiers: { heatInstability: true }
      };

    // --- PREMIUM BUFFS (CITY SERVICES) ---
    case 'PREMIUM_NANO_REPAIR': return { id: 'buff_regen', name: 'Нано-Сварка', description: 'Восстанавливает обшивку со временем', type: 'BUFF', duration: 6000, modifiers: {} };
    case 'PREMIUM_DIAMOND_COAT': return { id: 'buff_sharp', name: 'Алмазное Напыление', description: 'Скорость бурения x2', type: 'BUFF', duration: 3000, modifiers: { drillSpeedMultiplier: 2.0 } };
    case 'PREMIUM_VOID_SHIELD': return { id: 'buff_shield', name: 'Щит Пустоты', description: 'Блокирует 50% урона от опасностей', type: 'BUFF', duration: 1800, modifiers: {} };
    case 'PREMIUM_QUANTUM_LUCK': return { id: 'buff_luck', name: 'Квантовая Удача', description: 'Огромный шанс находок', type: 'BUFF', duration: 3000, modifiers: {} };
    case 'PREMIUM_ABSOLUTE_ZERO': return { id: 'buff_cold', name: 'Абсолютный Ноль', description: 'Нагрев полностью отключен', type: 'BUFF', duration: 1200, modifiers: { heatGenMultiplier: 0 } };
    case 'PREMIUM_MAGNETIC_STORM': return { id: 'buff_magnet', name: 'Магнитный Шторм', description: 'Множитель ресурсов x3', type: 'BUFF', duration: 3000, modifiers: { resourceMultiplier: 3.0 } };
    case 'PREMIUM_OVERDRIVE': return { id: 'buff_power', name: 'Инъекция Ядра', description: 'Сила клика x5', type: 'BUFF', duration: 600, modifiers: { clickPowerMultiplier: 5.0 } };
    case 'PREMIUM_CHRONOS': return { id: 'buff_time', name: 'Хронос-Поле', description: 'Ускорение авто-добычи x3', type: 'BUFF', duration: 3000, modifiers: { drillSpeedMultiplier: 3.0 } };

    // --- BAR DRINKS (High Risk / High Reward) ---
    case 'BAR_OIL_STOUT':
      return {
        id: 'bar_oil', name: 'Масляный Стаут', description: 'Реген HP, но Нагрев x2',
        type: 'BUFF', duration: 600, // 1 min
        modifiers: { heatGenMultiplier: 2.0 } // Healing logic handles separately
      };
    case 'BAR_RUSTY_NAIL':
      return {
        id: 'bar_rusty', name: 'Ржавый Гвоздь', description: 'Клик x3, но Авто-бур x0.5',
        type: 'BUFF', duration: 600,
        modifiers: { clickPowerMultiplier: 3.0, drillSpeedMultiplier: 0.5 }
      };
    case 'BAR_NUCLEAR_WHISKEY':
      return {
        id: 'bar_nuke', name: 'Ядерный Виски', description: 'Скорость x5, но Обшивка разрушается',
        type: 'ANOMALY', duration: 300, // 30 sec
        modifiers: { drillSpeedMultiplier: 5.0 } // Damage logic needs to check for this ID
      };
    case 'BAR_VOID_COCKTAIL':
      return {
        id: 'bar_void', name: 'Коктейль Пустоты', description: 'Множитель ресурсов x10, но слепота',
        type: 'BUFF', duration: 450, // 45 sec
        modifiers: { resourceMultiplier: 10.0 }
      };

    default:
      return null;
  }
};

export const rollRandomEvent = (recentEventIds: string[], depth: number, heat: number): GameEvent | null => {
  const validEvents = EVENTS.filter(e => {
    // Prevent recent repetition
    if (recentEventIds.includes(e.id)) return false;
    // Depth check
    if (e.minDepth && depth < e.minDepth) return false;
    return true;
  });

  if (validEvents.length === 0) return null;

  const totalWeight = validEvents.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const event of validEvents) {
    if (random < event.weight) return event;
    random -= event.weight;
  }

  return null;
};
