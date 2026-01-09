
import { GameEvent, ActiveEffect } from '../types';

// База данных событий с весами
export const EVENTS: GameEvent[] = [
  // --- ГЕОЛОГИЯ (ВЕС: ВЫСОКИЙ) ---
  {
    id: 'GAS_POCKET',
    title: 'ГАЗОВЫЙ КАРМАН',
    description: '[WARN] Обнаружен горючий газ. Эффективность бурения x1.5, но нагрев x2.',
    type: 'WARNING',
    weight: 60, // Очень частое
    minDepth: 200
  },
  {
    id: 'GOLD_VEIN',
    title: 'ЗОЛОТАЯ ЖИЛА',
    description: '[SCAN] Высокая концентрация ценных минералов. x5 ресурсов на следующие 20 кликов.',
    type: 'NOTIFICATION',
    weight: 50, // Частое
    minDepth: 100
  },

  // --- ПРЕДМЕТЫ И АРТЕФАКТЫ (ДЛЯ ОТКРЫТИЯ СКЛАДА) ---
  {
    id: 'FOSSIL_FIND',
    title: 'СТРАННЫЙ ОБЪЕКТ',
    description: 'Бур наткнулся на аномальное уплотнение. Сканеры фиксируют технологическую сигнатуру.',
    type: 'ARTIFACT',
    weight: 20, // Частое, чтобы наполнять инвентарь
    minDepth: 50,
    forceArtifactDrop: true // Динамическая генерация
  },

  // --- ТЕХНИЧЕСКИЕ СБОИ (ВЕС: СРЕДНИЙ) ---
  {
    id: 'QUANTUM_FLUCTUATION',
    title: 'КВАНТОВАЯ ФЛУКТУАЦИЯ',
    description: 'Бур проходит через нестабильную область пространства. Система охлаждения отключена, но добыча увеличена в 5 раз.',
    type: 'WARNING',
    weight: 15, // Реже
    options: [
      { label: 'РИСКНУТЬ (10 сек)', actionId: 'accept_fluctuation', risk: 'Перегрев неизбежен' },
      { label: 'СТАБИЛИЗИРОВАТЬ', actionId: 'reject_fluctuation' }
    ],
    minDepth: 500
  },
  {
    id: 'MAGNETIC_STORM',
    title: 'МАГНИТНАЯ БУРЯ',
    description: '[ERROR] Помехи ионосферы. Авто-системы отключены на 30 сек.',
    type: 'WARNING',
    weight: 15,
    minDepth: 50
  },

  // --- АНОМАЛИИ И ЛОР (ВЕС: НИЗКИЙ) ---
  {
    id: 'NANOMITE_SWARM',
    title: 'НАШЕСТВИЕ НАНОКЛЕЩЕЙ',
    description: 'Рой роботов-вредителей атакует обшивку. Скорость снижена. Активировать протокол очистки?',
    type: 'ANOMALY',
    weight: 5, // Редкое
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
    weight: 3, // Очень редкое
    minDepth: 3000
  },
  {
    id: 'PRECURSOR_ECHO',
    title: 'ЭХО ПРЕДТЕЧ',
    description: '[INFO] Перехвачен архивный пакет данных цивилизации III типа.',
    type: 'NOTIFICATION',
    weight: 2, // Почти уникальное
    minDepth: 100
  },
  {
    id: 'QUANTUM_JUMP',
    title: 'КВАНТОВЫЙ СКАЧОК',
    description: 'Прорыв пространственной метрики. Мгновенное погружение.',
    type: 'NOTIFICATION',
    weight: 1, // Легендарное
    minDepth: 1000
  },

  // --- СОБЫТИЯ ЯДРА (ВЕС: МИНИМАЛЬНЫЙ, ТОЛЬКО ГЛУБИНА) ---
  {
    id: 'CORE_RESONANCE',
    title: 'РЕЗОНАНС ЯДРА',
    description: '[FATAL] Синхронизация с планетарным ядром. Урон x10, но охлаждение невозможно.',
    type: 'ANOMALY',
    weight: 2,
    minDepth: 100000 // Критическая глубина
  }
];

// Генератор эффектов
export const createEffect = (id: string): ActiveEffect | null => {
  switch (id) {
    case 'QUANTUM_FLUCTUATION_EFFECT':
      return {
        id: 'q_fluct', name: 'Квантовая Нестабильность', description: 'Ресурсы x5, Охлаждение ОТКЛ',
        type: 'BUFF', duration: 100, // 10 сек
        modifiers: { resourceMultiplier: 5, coolingDisabled: true }
      };
    case 'GAS_BURN':
      return {
        id: 'gas_burn', name: 'Сгорание Газа', description: 'Скорость x1.5, Нагрев x2',
        type: 'DEBUFF', duration: 150, // 15 сек
        modifiers: { drillSpeedMultiplier: 1.5, heatGenMultiplier: 2 }
      };
    case 'NANOMITE_DAMAGE':
      return {
        id: 'nano_dmg', name: 'Наноклещи', description: 'Скорость -30%, Нагрев',
        type: 'DEBUFF', duration: 300, // 30 сек
        modifiers: { drillSpeedMultiplier: 0.7, heatGenMultiplier: 1.2 }
      };
    case 'GRAVITY_DESTABILIZATION':
      return {
        id: 'grav_dest', name: 'Грави-сбой', description: 'Тепловая нестабильность',
        type: 'ANOMALY', duration: 150,
        modifiers: { heatInstability: true }
      };
    case 'MAGNETIC_INTERFERENCE':
      return {
        id: 'mag_int', name: 'Магнитная Буря', description: 'Авто-бурение отключено',
        type: 'DEBUFF', duration: 300,
        modifiers: { autoClickDisabled: true }
      };
    case 'GOLD_RUSH':
      return {
        id: 'gold_rush', name: 'Богатство', description: 'Ресурсы x5',
        type: 'BUFF', duration: 50, // 5 сек (быстро проходит)
        modifiers: { resourceMultiplier: 5 }
      };
    // Новый эффект для ядра
    case 'CORE_OVERLOAD':
      return {
        id: 'core_overload', name: 'ПЕРЕГРУЗКА ЯДРА', description: 'Урон x10, Нет охлаждения',
        type: 'ANOMALY', duration: 100,
        modifiers: { clickPowerMultiplier: 10, coolingDisabled: true }
      };
    default:
      return null;
  }
};

export const rollRandomEvent = (depth: number, currentHeat: number): GameEvent | null => {
  if (Math.random() > 0.005) return null; 

  // Фильтруем доступные события по глубине
  const availableEvents = EVENTS.filter(e => (!e.minDepth || depth >= e.minDepth));
  
  if (availableEvents.length === 0) return null;

  const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  for (const event of availableEvents) {
    if (randomWeight < event.weight) {
      return event;
    }
    randomWeight -= event.weight;
  }

  return availableEvents[0]; 
};
