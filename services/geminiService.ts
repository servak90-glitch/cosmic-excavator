
import { GoogleGenAI } from "@google/genai";

// Сервис подготовлен, но не активен без явной команды.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSystemMotivationalQuote = async (context: string) => {
  // Функция заглушена до востребования
  return "";
};

export const getForgeComment = async (partName: string) => {
  // Функция заглушена до востребования
  return "";
};
