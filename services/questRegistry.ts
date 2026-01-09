
import { Quest, QuestIssuer, Resources, ResourceType } from '../types';

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
  let pool = [...TIER_1_RES];
  if (depth > 500) pool.push(...TIER_2_RES);
  if (depth > 5000) pool.push(...TIER_3_RES);
  if (depth > 20000) pool.push(...TIER_4_RES);
  return pool;
};

// Генератор уникального ID
const uuid = () => Math.random().toString(36).substr(2, 9);

export const generateQuest = (depth: number, level: number): Quest => {
  const issuers: QuestIssuer[] = ['CORP', 'SCIENCE', 'REBELS'];
  const issuer = issuers[Math.floor(Math.random() * issuers.length)];
  
  const availableRes = getResourcesForDepth(depth);
  const targetRes = availableRes[Math.floor(Math.random() * availableRes.length)];
  const rewardRes = availableRes[Math.floor(Math.random() * availableRes.length)];
  
  // Базовый мультипликатор сложности от глубины и уровня
  const scale = 1 + (depth / 1000) + (level * 0.5);
  
  let quest: Quest = {
    id: uuid(),
    issuer,
    title: 'Unknown Contract',
    description: '...',
    requirements: [],
    rewards: []
  };

  if (issuer === 'CORP') {
    // КОРПОРАЦИЯ: Хочет много ресурсов, платит другими ресурсами или Tech
    const amount = Math.floor((100 + Math.random() * 200) * scale);
    quest.title = CORP_TITLES[Math.floor(Math.random() * CORP_TITLES.length)];
    quest.description = `Департамент логистики требует поставку ${targetRes.toUpperCase()}. Сроки сжатые.`;
    quest.requirements = [{ type: 'RESOURCE', target: targetRes, amount }];
    
    // Награда: 50% шанс ресурсы, 50% шанс Tech
    if (Math.random() > 0.5) {
       quest.rewards = [{ type: 'RESOURCE', target: rewardRes, amount: Math.floor(amount * 0.4) }]; // Корпы жадные, курс невыгодный
    } else {
       quest.rewards = [{ type: 'TECH', target: 'ancientTech', amount: Math.floor(5 + scale) }];
    }
  } 
  else if (issuer === 'SCIENCE') {
    // УЧЕНЫЕ: Хотят XP или Редкие ресурсы, платят XP или Tech
    quest.title = SCIENCE_TITLES[Math.floor(Math.random() * SCIENCE_TITLES.length)];
    
    if (Math.random() > 0.5) {
      // Требуют XP (данные)
      const xpCost = Math.floor(100 * scale);
      quest.description = `Нам нужно проанализировать ваши нейро-паттерны при бурении. Это может быть... неприятно.`;
      quest.requirements = [{ type: 'XP', target: 'XP', amount: xpCost }];
      quest.rewards = [{ type: 'RESOURCE', target: targetRes, amount: Math.floor(xpCost * 2) }]; // Платят сырьем за мозги
    } else {
      // Требуют ресурсы
      const amount = Math.floor(50 * scale);
      quest.description = `Для калибровки спектрометра необходим чистый ${targetRes.toUpperCase()}.`;
      quest.requirements = [{ type: 'RESOURCE', target: targetRes, amount }];
      quest.rewards = [{ type: 'XP', target: 'XP', amount: Math.floor(amount * 5) }]; // Платят опытом
    }
  } 
  else if (issuer === 'REBELS') {
    // ПОДПОЛЬЕ: Хотят Tech или Странные обмены, платят много Ресурсов (краденых)
    quest.title = REBEL_TITLES[Math.floor(Math.random() * REBEL_TITLES.length)];
    
    if (Math.random() > 0.7 && depth > 1000) {
      // High Risk: Tech Request
      const techCost = Math.floor(5 + scale/2);
      quest.description = `Нам нужны детали для бомбы... то есть, для "фейерверка". Не задавай вопросов.`;
      quest.requirements = [{ type: 'TECH', target: 'ancientTech', amount: techCost }];
      quest.rewards = [{ type: 'RESOURCE', target: 'gold', amount: Math.floor(100 * scale) }]; // Платят золотом
    } else {
      // Resource Dump
      const amount = Math.floor(200 * scale);
      quest.description = `Корпорация завышает цены. Помоги нам создать резерв ${targetRes.toUpperCase()}.`;
      quest.requirements = [{ type: 'RESOURCE', target: targetRes, amount }];
      quest.rewards = [{ type: 'RESOURCE', target: rewardRes, amount: Math.floor(amount * 1.5) }]; // Честный обмен (или даже в плюс)
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
