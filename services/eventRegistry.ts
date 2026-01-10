
import { GameEvent, ActiveEffect } from '../types';

// База данных событий с весами
export const EVENTS: GameEvent[] = [
  // --- ГЕОЛОГИЯ (ВЕС: ВЫСОКИЙ) ---
  {
    id: 'GAS_POCKET',
    title: 'ГАЗОВЫЙ КАРМАН',
    description: '[WARN] Обнаружен горючий газ. Эффективность бурения x1.5, но нагрев x2.',
    type: 'WARNING',
    weight: 40,
    minDepth: 200
  },
  {
    id: 'GOLD_VEIN',
    title: 'ЗОЛОТАЯ ЖИЛА',
    description: '[SCAN] Высокая концентрация ценных минералов. x5 ресурсов на следующие 20 кликов.',
    type: 'NOTIFICATION',
    weight: 40, 
    minDepth: 100
  },
  {
    id: 'TECTONIC_SHIFT',
    title: 'ТЕКТОНИЧЕСКИЙ СДВИГ',
    description: 'Плиты приходят в движение! Глубина увеличивается, но обшивка страдает.',
    type: 'WARNING',
    weight: 25,
    minDepth: 1000,
    options: [
        { label: 'УДЕРЖАТЬ ПОЗИЦИЮ', actionId: 'tectonic_hold', risk: 'Урон обшивке' },
        { label: 'ФОРСАЖ', actionId: 'tectonic_push', risk: 'Огромный перегрев' }
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
        { label: 'ВСКРЫТЬ ЛАЗЕРОМ', actionId: 'pod_laser', risk: 'Шанс уничтожить лут' },
        { label: 'ДЕШИФРОВКА', actionId: 'pod_hack' }
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
      { label: 'РИСКНУТЬ (10 сек)', actionId: 'accept_fluctuation', risk: 'Перегрев неизбежен' },
      { label: 'СТАБИЛИЗИРОВАТЬ', actionId: 'reject_fluctuation' }
    ],
    minDepth: 500
  },
  {
    id: 'MAGNETIC_STORM',
    title: 'МАГНИТНАЯ БУРЯ',
    description: '[ERROR] Помехи ионосферы. Дроны и авто-системы отключены на 30 сек.',
    type: 'WARNING',
    weight: 20,
    minDepth: 50
  },
  {
    id: 'AI_GLITCH',
    title: 'СБОЙ ИИ',
    description: 'Логическое ядро ведет себя странно. Предлагает оптимизацию маршрута через магму.',
    type: 'CHOICE',
    weight: 15,
    minDepth: 2000,
    options: [
        { label: 'ДОВЕРИТЬСЯ ИИ', actionId: 'ai_trust', risk: 'Крит. температура' },
        { label: 'ПЕРЕЗАГРУЗКА', actionId: 'ai_reboot', risk: 'Потеря прогресса' }
    ]
  },

  // --- АНОМАЛИИ И ЛОР ---
  {
    id: 'NANOMITE_SWARM',
    title: 'НАШЕСТВИЕ НАНОКЛЕЩЕЙ',
    description: 'Рой роботов-вредителей атакует обшивку. Скорость снижена. Активировать протокол очистки?',
    type: 'ANOMALY',
    weight: 10,
    options: [
      { label: 'ОЧИСТИТЬ (+Нано-железо)', actionId: 'purge_nanomites' }
    ],
    minDepth: 1000
  },
  {
    id: 'GRAVITY_ANOMALY',
    title: 'ГРАВИТАЦИОННАЯ АНОМАЛИЯ',
    description: 'Зонд теряет устойчивость. Шкала тепла нестабильна.',
    type: 'ANOMALY',
    weight: 10, 
    minDepth: 3000
  },
  {
    id: 'CRYSTAL_OVERLOAD',
    title: 'КРИСТАЛЬНЫЙ РЕЗОНАНС',
    description: 'Окружающие кристаллы вибрируют в унисон с буром. Энергия переполняет системы!',
    type: 'ANOMALY',
    weight: 15,
    minDepth: 8000,
    options: [
        { label: 'ПОГЛОТИТЬ ЭНЕРГИЮ', actionId: 'crystal_absorb' }
    ]
  },
  {
    id: 'PRECURSOR_ECHO',
    title: 'ЭХО ПРЕДТЕЧ',
    description: '[INFO] Перехвачен архивный пакет данных цивилизации III типа.',
    type: 'NOTIFICATION',
    weight: 5,
    minDepth: 100
  },
  {
    id: 'QUANTUM_JUMP',
    title: 'КВАНТОВЫЙ СКАЧОК',
    description: 'Прорыв пространственной метрики. Мгновенное погружение.',
    type: 'NOTIFICATION',
    weight: 5, 
    minDepth: 1000
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
    default:
      return null;
  }
};

export const rollRandomEvent = (recentEventIds: string[], depth: number, heat: number): GameEvent | null => {
  // 5% chance per call to avoid spamming
  if (Math.random() > 0.005) return null;

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
