
import { GoogleGenAI } from "@google/genai";

// ВАЖНО: Не инициализируем client глобально, так как process.env может отсутствовать в браузере
// и вызвать краш всего приложения (черный экран).
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    // Безопасное получение ключа, если он есть (для локальной разработки)
    // В продакшене ключ должен быть вшит или передан через бэкенд прокси
    const key = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
    if (key) {
        ai = new GoogleGenAI({ apiKey: key });
    }
  }
  return ai;
};

export const getSystemMotivationalQuote = async (context: string) => {
  const client = getAI();
  if (!client) return ""; // Тихо выходим, если нет ключа
  return "";
};

export const getForgeComment = async (partName: string) => {
  const client = getAI();
  if (!client) return "";
  return "";
};
