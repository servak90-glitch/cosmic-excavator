import { Quest, QuestIssuer, ResourceType } from '../types';
import { STORY_QUESTS } from '../constants/quests';

// Export Static Quests for easy access
export const QUESTS = [...STORY_QUESTS];

export const getQuestById = (id: string): Quest | undefined => {
  return QUESTS.find(q => q.id === id);
};

export const getQuestsByFaction = (factionId: string): Quest[] => {
  return QUESTS.filter(q => q.factionId === factionId);
};

export const getAvailableQuests = (completedQuestIds: string[]): Quest[] => {
  return QUESTS.filter(quest => {
    if (quest.status !== 'available') return false;
    // Note: status in static definition is default 'available'. 
    // Actual status is managed in slice, but this helper filters static definition availability logic (prereqs).

    if (quest.prerequisites) {
      return quest.prerequisites.every(prereqId => completedQuestIds.includes(prereqId));
    }
    return true;
  });
};

// --- DYNAMIC QUEST GENERATION (Legacy + New) ---

// Тексты для атмосферности
const CORP_TITLES = [
  "Квота на добычу", "Заказ с орбиты", "Военный подряд", "Строительство Сектора-7", "Топливный кризис"
];
const SCIENCE_TITLES = [
  "Нейро-сбор данных", "Аномальный образец", "Тест на перегрузку", "Архивация знаний", "Поиск изотопов"
];
const REBEL_TITLES = [
  "Саботаж поставок", "Контрабанда", "Помощь беженцам", "Скрытый резерв", "Взрывчатка для шлюза"
];

// Ресурсы по тирам (глубине)
const TIER_1_RES: ResourceType[] = ['clay', 'stone'];
const TIER_2_RES: ResourceType[] = ['copper', 'iron'];
const TIER_3_RES: ResourceType[] = ['silver', 'gold'];
const TIER_4_RES: ResourceType[] = ['titanium', 'uranium'];

const getResourcesForDepth = (depth: number): ResourceType[] => {
  const pool = [...TIER_1_RES];
  if (depth > 500) pool.push(...TIER_2_RES);
  if (depth > 5000) pool.push(...TIER_3_RES);
  if (depth > 20000) pool.push(...TIER_4_RES);
  return pool;
};

// Генератор уникального ID
const uuid = () => Math.random().toString(36).substr(2, 9);

export const generateQuest = (depth: number, level: number): Quest => {
  // Use 'CORPORATE' | 'SCIENCE' | 'REBELS' directly for now as QuestIssuer enum is deprecated
  const issuers = ['CORPORATE', 'SCIENCE', 'REBELS'] as const;
  const issuer = issuers[Math.floor(Math.random() * issuers.length)];

  const availableRes = getResourcesForDepth(depth);
  const targetRes = availableRes[Math.floor(Math.random() * availableRes.length)];

  // Ensure reward resource is DIFFERENT from target resource
  let rewardRes = availableRes[Math.floor(Math.random() * availableRes.length)];
  while (rewardRes === targetRes && availableRes.length > 1) {
    rewardRes = availableRes[Math.floor(Math.random() * availableRes.length)];
  }

  // Базовый мультипликатор сложности от глубины и уровня
  const scale = 1 + (depth / 1000) + (level * 0.5);

  const quest: Quest = {
    id: `rnd_${uuid()}`,
    title: 'Unknown Contract',
    description: '...',
    status: 'available',
    type: 'COLLECTION', // Default
    objectives: [],
    rewards: [],
    factionId: issuer
  };

  if (issuer === 'CORPORATE') {
    // КОРПОРАЦИЯ: Хочет много ресурсов, платит другими ресурсами или Tech
    const amount = Math.floor((100 + Math.random() * 200) * scale);
    quest.title = CORP_TITLES[Math.floor(Math.random() * CORP_TITLES.length)];
    quest.description = `Департамент логистики требует поставку ${targetRes.toUpperCase()}. Сроки сжатые.`;
    quest.type = 'DELIVERY'; // Better fit
    quest.objectives = [{
      id: uuid(),
      type: 'COLLECT',
      description: `Собрать ${amount} ${targetRes}`,
      target: targetRes,
      required: amount,
      current: 0
    }];

    // Reward
    if (Math.random() > 0.5) {
      quest.rewards = [{ type: 'RESOURCE', target: rewardRes, amount: Math.floor(amount * 0.6) }];
    } else {
      quest.rewards = [{ type: 'RESOURCE', target: 'ancientTech', amount: Math.floor(5 + scale) }]; // mapped to RESOURCE type for now if tech is resource
    }
  }
  else if (issuer === 'SCIENCE') {
    // УЧЕНЫЕ
    quest.title = SCIENCE_TITLES[Math.floor(Math.random() * SCIENCE_TITLES.length)];
    quest.type = 'COLLECTION';

    if (Math.random() > 0.5) {
      // Требуют XP (данные) -> Платят Ресурсами
      // Note: XP as requirement not fully supported in engine yet (needs 'XP' objective type)
      // Fallback to Resource
      const amount = Math.floor(50 * scale);
      quest.description = `Для калибровки спектрометра необходим чистый ${targetRes.toUpperCase()}.`;
      quest.objectives = [{
        id: uuid(),
        type: 'COLLECT',
        description: `Собрать ${amount} ${targetRes}`,
        target: targetRes,
        required: amount,
        current: 0
      }];
      quest.rewards = [{ type: 'XP', target: 'player', amount: Math.floor(amount * 5) }];
    } else {
      // Требуют ресурсы -> Платят XP
      const amount = Math.floor(50 * scale);
      quest.description = `Нам нужно проанализировать образцы ${targetRes.toUpperCase()}.`;
      quest.objectives = [{
        id: uuid(),
        type: 'COLLECT',
        description: `Собрать ${amount} ${targetRes}`,
        target: targetRes,
        required: amount,
        current: 0
      }];
      quest.rewards = [{ type: 'XP', target: 'player', amount: Math.floor(amount * 5) }];
    }
  }
  else if (issuer === 'REBELS') {
    // ПОДПОЛЬЕ
    quest.title = REBEL_TITLES[Math.floor(Math.random() * REBEL_TITLES.length)];
    quest.type = 'DELIVERY';

    // Resource Dump
    const amount = Math.floor(200 * scale);
    quest.description = `Спрячьте у себя ${targetRes.toUpperCase()} до нашего прихода.`;
    quest.objectives = [{
      id: uuid(),
      type: 'COLLECT',
      description: `Иметь ${amount} ${targetRes}`,
      target: targetRes,
      required: amount,
      current: 0
    }];

    if (rewardRes === targetRes) {
      quest.rewards = [{ type: 'RESOURCE', target: 'ancientTech', amount: Math.floor(5 + scale) }];
    } else {
      quest.rewards = [{ type: 'RESOURCE', target: rewardRes, amount: Math.floor(amount * 0.8) }];
    }
  }

  return quest;
};

export const generateQuestBatch = (depth: number, level: number): Quest[] => {
  return [
    generateQuest(depth, level),
    generateQuest(depth, level),
    generateQuest(depth, level)
  ];
};
