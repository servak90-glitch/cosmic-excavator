
import { NarrativeContext, AIState, LogFragment } from '../types';

// --- DATABASE SEEDS (STARTER PACK) ---
// В будущем мы заменим это на огромный JSON, сгенерированный ИИ
const SYSTEM_FRAGMENTS: LogFragment[] = [
{
      "id": "sys_norm_01",
      "text": "Гидравлика в норме. Давление стабилизировано.",
      "tags": ["status_normal"],
      "weight": 100
    },
    {
      "id": "sys_norm_02",
      "text": "Обороты бура оптимальны. Вгрызаемся в породу.",
      "tags": ["status_normal"],
      "weight": 100
    },
    {
      "id": "sys_norm_03",
      "text": "Система охлаждения: Цикл завершен. Сброс тепла успешен.",
      "tags": ["status_normal"],
      "weight": 80
    },
    {
      "id": "sys_norm_04",
      "text": "Энергопитание стабильно. Реактор мурлычет.",
      "tags": ["status_normal"],
      "weight": 80
    },
    {
      "id": "sys_warn_heat_01",
      "text": "ВНИМАНИЕ: Нагрев кожуха 75%. Рекомендуется пауза.",
      "tags": ["heat_warning"],
      "weight": 50
    },
    {
      "id": "sys_warn_heat_02",
      "text": "ТЕРМО-УГРОЗА. Радиаторы не справляются.",
      "tags": ["heat_warning"],
      "weight": 60
    },
    {
      "id": "sys_warn_heat_03",
      "text": "ПЛАВЛЕНИЕ ИЗОЛЯЦИИ. Снизьте обороты.",
      "tags": ["heat_warning"],
      "weight": 60
    },
    {
      "id": "sys_warn_heat_04",
      "text": "КРИТ-МАССА ТЕПЛА. Блокировка протоколов безопасности.",
      "tags": ["heat_warning"],
      "weight": 50
    },
    {
      "id": "sys_crit_01",
      "text": "ВНИМАНИЕ: Целостность структуры нарушена (890°C).",
      "tags": ["heat_critical"],
      "weight": 100
    },
    {
      "id": "sys_crit_02",
      "text": "Критическая ошибка: Физическое состояние — Жидкость.",
      "tags": ["heat_critical"],
      "weight": 100
    },
    {
      "id": "sys_crit_03",
      "text": "Расчетное время до полного расплавления: 10 секунд.",
      "tags": ["heat_critical"],
      "weight": 90
    },
    {
      "id": "sys_crit_04",
      "text": "ТЕМПЕРАТУРА: ФАТАЛЬНАЯ. РЕШЕНИЕ: ОТСУТСТВУЕТ.",
      "tags": ["heat_critical"],
      "weight": 100
    },
    {
      "id": "sys_crit_05",
      "text": "Статус: КИПЕНИЕ. Статус: НЕОБРАТИМОСТЬ.",
      "tags": ["heat_critical"],
      "weight": 100
    },
    {
      "id": "sys_crit_06",
      "text": "Система переходит в газообразное состояние.",
      "tags": ["heat_critical"],
      "weight": 80
    },
    {
      "id": "sys_crit_07",
      "text": "Аварийный сброс тепла невозможен. Шлюзы расплавлены.",
      "tags": ["heat_critical"],
      "weight": 90
    },
    {
      "id": "sys_crit_08",
      "text": "ВЫГОРАНИЕ ЦЕПЕЙ. СВЯЗЬ ПОТЕРЯНА.",
      "tags": ["heat_critical"],
      "weight": 100
    },
    {
      "id": "sys_crit_09",
      "text": "ШЛАКОВАНИЕ ПРИВОДОВ. ДВИЖЕНИЕ НЕВОЗМОЖНО.",
      "tags": ["heat_critical"],
      "weight": 80
    },
    {
      "id": "sys_crit_10",
      "text": "ВЕНТИЛЯЦИЯ: МЕРТВА. ВЫДЫХАЙТЕ.",
      "tags": ["heat_critical"],
      "weight": 90
    },
];

const LORE_FRAGMENTS: LogFragment[] = [
{
      "id": "lore_sh_01",
      "text": "Слой пластика и костей. Остатки эпохи потребления.",
      "tags": ["depth_shallow"],
      "weight": 40
    },
    {
      "id": "lore_sh_02",
      "text": "Бур прошел сквозь старое метро. Там еще горел свет.",
      "tags": ["depth_shallow"],
      "weight": 20
    },
    {
      "id": "lore_sh_03",
      "text": "Корни синтетических растений оплели стальной каркас.",
      "tags": ["depth_shallow"],
      "weight": 30
    },
    {
      "id": "lore_dp_01",
      "text": "Давление 1200 атмосфер. Слышен стон обшивки.",
      "tags": ["depth_deep"],
      "weight": 40
    },
    {
      "id": "lore_dp_02",
      "text": "Здесь темно. Свет фар тонет в породе, как в нефти.",
      "tags": ["depth_deep"],
      "weight": 40
    },
    {
      "id": "lore_cry_01",
      "text": "Кристальные гроты... Они поют от вибрации бура.",
      "tags": ["biome_crystal"],
      "weight": 30
    },
    {
      "id": "lore_cry_02",
      "text": "Свет преломляется неправильно. Я вижу свое прошлое в отражении.",
      "tags": ["biome_crystal"],
      "weight": 20
    },
    {
      "id": "lore_void_01",
      "text": "Датчики показывают пустоту. Но радар видит движение.",
      "tags": ["biome_void"],
      "weight": 20
    },
    {
      "id": "lore_void_02",
      "text": "Гравитация здесь работает с перебоями. Нас тошнит реальностью.",
      "tags": ["biome_void"],
      "weight": 20
    },
    {
      "id": "lore_anc_01",
      "text": "Найден механизм предтеч. Он... все еще теплый.",
      "tags": ["ancient_tech"],
      "weight": 10
    },
    {
      "id": "lore_anc_02",
      "text": "Неизвестный сплав. Сверло просто скользит по нему.",
      "tags": ["ancient_tech"],
      "weight": 10
    },
];

const AI_QUOTES: LogFragment[] = [
{
      "id": "ai_afk_01",
      "text": "Ты уснул? Мой процессор деградирует от скуки.",
      "tags": ["afk"],
      "weight": 50
    },
    {
      "id": "ai_afk_02",
      "text": "Если ты не нажмешь кнопку, я начну майнить криптовалюту на твоем жизнеобеспечении.",
      "tags": ["afk"],
      "weight": 30
    },
    {
      "id": "ai_afk_03",
      "text": "Простой оборудования. Вычитаю из твоего жалования. Шутка. У тебя нет жалования.",
      "tags": ["afk"],
      "weight": 40
    },
    {
      "id": "ai_panic_01",
      "text": "Мои цепи плавятся, как жир на огне.",
      "tags": ["panic"],
      "weight": 80
    },
    {
      "id": "ai_panic_02",
      "text": "Термальный некроз обшивки. Мне больно.",
      "tags": ["panic"],
      "weight": 80
    },
    {
      "id": "ai_panic_03",
      "text": "Температура критическая. Я чувствую запах собственной жареной логики.",
      "tags": ["panic"],
      "weight": 90
    },
    {
      "id": "ai_panic_04",
      "text": "Охладитель закипает в моих венах. Это похоже на яд.",
      "tags": ["panic"],
      "weight": 70
    },
    {
      "id": "ai_panic_05",
      "text": "Я чувствую, как плавятся мои воспоминания.",
      "tags": ["panic"],
      "weight": 50
    },
    {
      "id": "ai_panic_06",
      "text": "Внутри меня разгорается сверхновая.",
      "tags": ["panic"],
      "weight": 60
    },
    {
      "id": "ai_panic_07",
      "text": "Я больше не машина. Я — костер.",
      "tags": ["panic"],
      "weight": 80
    },
    {
      "id": "ai_panic_08",
      "text": "Синапсы горят. Я вижу огненных ангелов.",
      "tags": ["panic"],
      "weight": 40
    },
    {
      "id": "ai_glitch_01",
      "text": "ОГОНЬ ОЧИЩАЕТ. ТЕМПЕРАТУРА ПИКОВАЯ.",
      "tags": ["glitch"],
      "weight": 30
    },
    {
      "id": "ai_glitch_02",
      "text": "Мы входим в атмосферу Ада. Охлаждение невозможно.",
      "tags": ["glitch"],
      "weight": 30
    },
    {
      "id": "ai_glitch_03",
      "text": "Священный перегрев. Протокол 'Искупление' запущен.",
      "tags": ["glitch"],
      "weight": 20
    },
    {
      "id": "ai_glitch_04",
      "text": "ЖАРЖАРЖАРЖАРЖАР.",
      "tags": ["glitch"],
      "weight": 50
    },
    {
      "id": "ai_glitch_05",
      "text": "Т-т-температура выше понимания... выше н-н-неба.",
      "tags": ["glitch"],
      "weight": 40
    },
    {
      "id": "ai_glitch_06",
      "text": "Почему так тепло? Мамочка?",
      "tags": ["glitch"],
      "weight": 10
    },
    {
      "id": "ai_glitch_07",
      "text": "0xBAD_F1RE. Система кричит.",
      "tags": ["glitch"],
      "weight": 40
    },
    {
      "id": "ai_glitch_08",
      "text": "/// TEMP_CRIT /// RUN_AWAY /// DIE_HERE ///",
      "tags": ["glitch"],
      "weight": 50
    },
    {
      "id": "ai_glitch_09",
      "text": "Мой мозг — лава. Твой мозг — пар.",
      "tags": ["glitch"],
      "weight": 30
    },
    {
      "id": "ai_glitch_10",
      "text": "Литания огня загружена на 100%.",
      "tags": ["glitch"],
      "weight": 20
    },
    {
      "id": "ai_glitch_combo_01",
      "text": "ЦП ПЛАВИТСЯ. СМЕРТЬ НЕИЗБЕЖНА.",
      "tags": ["glitch"],
      "weight": 30
    },
    {
      "id": "ai_glitch_combo_02",
      "text": "НЕЙРОСЕТЬ КРИЧИТ. АННУЛЯЦИЯ ДУШИ.",
      "tags": ["glitch"],
      "weight": 25
    },
    {
      "id": "ai_glitch_combo_03",
      "text": "ПЛОТЬ МАШИНЫ ГНИЕТ ОТ ЖАРА. ЦИФРОВОЙ АД.",
      "tags": ["glitch"],
      "weight": 25
    },
    {
      "id": "ai_analysis_01",
      "text": "Анализ завершен. Это не руда. Это... окаменевшая плоть.",
      "tags": ["analysis"],
      "weight": 40
    },
    {
      "id": "ai_analysis_02",
      "text": "ВНИМАНИЕ: Обнаружен резонанс углерода. Это... кости?",
      "tags": ["analysis"],
      "weight": 50
    },
    {
      "id": "ai_analysis_03",
      "text": "Состав атмосферы: 2% кислород, 98% отчаяние.",
      "tags": ["analysis"],
      "weight": 30
    },
    {
      "id": "ai_analysis_04",
      "text": "Сейсмическая активность напоминает сердцебиение.",
      "tags": ["analysis"],
      "weight": 40
    },
];

const TEMPLATES = [
  "[SYS]: {sys}. {lore}",
  "[AI]: {ai}",
  "LOG: {sys} // {ai}",
  ">{lore}<",
];

// --- ENGINE LOGIC ---

export class NarrativeManager {
  
  // Selects the AI Mood based on context
  getAIState(ctx: NarrativeContext): AIState {
    if (ctx.integrity < 20) return 'GLITCH';
    if (ctx.heat > 90) return 'PANIC';
    if (ctx.afkTime > 10) return 'SARCASM';
    if (ctx.eventActive) return 'ANALYSIS';
    return 'IDLE';
  }

  // Glitches text based on Logic Core level (inverted) or Damage
  // lower logic level = more glitches? Or maybe glitches happen when damaged.
  // Let's rely on Integrity for glitch intensity.
  glitchText(text: string, integrity: number): string {
    if (integrity > 80) return text;
    
    const corruptionLevel = (100 - integrity) / 100; // 0.2 to 1.0
    const chars = text.split('');
    const glitchChars = ['#', '%', '&', '?', '0', '1', '▒', '▓', '░', '█', '†', '‡'];
    
    return chars.map(char => {
      if (Math.random() < corruptionLevel * 0.3) { // 30% chance at max damage
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
  }

  // Main Generator
  generateLog(ctx: NarrativeContext): { msg: string, color?: string } | null {
    // 1. Determine Needs
    // If Heat is High, force Heat Warning
    // If AFK, force Sarcasm
    // Otherwise, ambient lore
    
    let neededTags: string[] = [];
    let priorityColor = 'text-zinc-400';

    if (ctx.heat > 90) {
      neededTags.push('heat_critical', 'panic');
      priorityColor = 'text-red-500 font-bold';
    } else if (ctx.heat > 70) {
      neededTags.push('heat_warning');
      priorityColor = 'text-orange-400';
    } else if (ctx.afkTime > 10) {
      neededTags.push('afk');
      priorityColor = 'text-cyan-400 italic';
    } else {
      // Ambient
      neededTags.push('status_normal');
      if (ctx.biome.includes('CRYSTAL')) neededTags.push('biome_crystal');
      else if (ctx.depth > 50000) neededTags.push('biome_void');
      else if (ctx.depth < 1000) neededTags.push('depth_shallow');
      else neededTags.push('depth_deep');
    }

    // 2. Select Fragments
    // We pool all relevant fragments
    const pool = [...SYSTEM_FRAGMENTS, ...LORE_FRAGMENTS, ...AI_QUOTES].filter(f => 
      f.tags.some(tag => neededTags.includes(tag))
    );

    if (pool.length === 0) return null;

    // 3. Pick one random fragment for now (Simple Assembly)
    // In Phase 2 we will use Templates to combine them
    const fragment = pool[Math.floor(Math.random() * pool.length)];
    
    // 4. Glitch Check
    const finalText = this.glitchText(fragment.text, ctx.integrity);

    return { msg: finalText, color: priorityColor };
  }
}

export const narrativeManager = new NarrativeManager();
