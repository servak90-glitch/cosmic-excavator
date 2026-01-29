
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore'; // Need store for lang
import { t, TEXT_IDS } from '../services/localization';
import { audioEngine } from '../services/audioEngine';
import { useEffect } from 'react';

interface HelpModalProps {
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
    const lang = useGameStore(s => s.settings.language);

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full h-full md:max-w-2xl md:h-[85vh] bg-zinc-950 md:border-2 md:border-zinc-700 shadow-[0_0_50px_rgba(0,255,255,0.1)] flex flex-col overflow-hidden"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* CRT Scanline Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                    {/* HEADER */}
                    <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/80 z-10">
                        <div>
                            <h2 className="pixel-text text-lg md:text-xl text-cyan-400 tracking-widest">{t(TEXT_IDS.MANUAL_BUTTON, lang)}</h2>
                            <p className="text-[10px] text-zinc-500 font-mono">АКТУАЛЬНО ДЛЯ: v5.1.0 (VISUAL REVOLUTION)</p>
                        </div>
                        <button onClick={() => { audioEngine.playUIPanelClose(); onClose(); }} className="text-zinc-500 hover:text-white text-xl px-2">✕</button>
                    </div>

                    {/* CONTENT SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 font-mono text-xs md:text-sm text-zinc-300 z-10 scrollbar-hide touch-pan-y max-h-[calc(100vh-200px)] md:max-h-[calc(85vh-150px)]">

                        {/* 1. OBJECTIVE & HUB */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">1. ЦЕЛЬ И ХАБ</h3>
                            <p className="mb-2"><span className="text-cyan-400 font-bold">ОСНОВНАЯ ЦЕЛЬ:</span> Пробиться сквозь 5 регионов к Радиоактивному Ядру на глубине <span className="text-white font-bold">100,000 метров</span>.</p>
                            <p className="mb-2"><span className="text-yellow-400 font-bold">КАК ПОПАСТЬ В ХАБ:</span> Нажмите кнопку <span className="text-white">"ГОРОД"</span> в нижней панели навигации. Хаб — это ваша главная база с доступом ко всем системам.</p>
                            <p className="text-[10px] md:text-xs"><span className="text-white font-bold">ЧТО ЕСТЬ В ХАБЕ:</span> Кузница (крафт оборудования), Рынок (торговля), Навыки (прокачка), Контракты (задания), Ювелир (обмен драгоценностей), Лицензии (доступ к регионам).</p>
                        </section>

                        {/* 2. HUD & INTERFACE */}
                        <section className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                            <h3 className="text-blue-400 font-bold mb-2 text-sm md:text-base pixel-text">2. ИНТЕРФЕЙС И КНОПКИ</h3>
                            <div className="space-y-3 text-[10px] md:text-xs">
                                <div>
                                    <p className="text-white font-bold mb-1">ВЕРХНЯЯ ПАНЕЛЬ (HUD):</p>
                                    <p><span className="text-green-400">HULL:</span> Прочность корпуса (0% = поражение)</p>
                                    <p><span className="text-orange-400">HEAT:</span> Температура (95% = блокировка, 100% = перегрев)</p>
                                    <p><span className="text-yellow-400">PWR:</span> Энергопотребление (больше 100% = перегрузка)</p>
                                    <p><span className="text-blue-400">CRGO:</span> Заполненность склада</p>
                                    <p><span className="text-amber-400">FUEL:</span> Запас топлива в процентах</p>
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-1">ПРАВЫЙ ВЕРХНИЙ УГОЛ:</p>
                                    <p><span className="text-cyan-400">💎 (Алмазик):</span> Открывает окно с балансом КРЕДИТОВ и всеми ресурсами</p>
                                    <p><span className="text-white">📦 (Коробка):</span> Инвентарь оборудования и артефактов</p>
                                    <p><span className="text-white">☰ (Меню):</span> Главное меню с настройками и СОХРАНЕНИЕМ</p>
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-1">ЛЕВЫЙ НИЖНИЙ УГОЛ (QUICKBAR):</p>
                                    <p><span className="text-green-400">Ремкомплект:</span> Восстанавливает прочность</p>
                                    <p><span className="text-cyan-400">Хладагент:</span> Мгновенно снижает температуру</p>
                                </div>
                            </div>
                        </section>

                        {/* 3. THERMODYNAMICS & SHIELD */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">3. ТЕРМОДИНАМИКА И ОХЛАЖДЕНИЕ</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <p><span className="text-orange-400 font-bold">НАГРЕВ:</span> Температура растет при бурении. Скорость зависит от мощности бура и окружающей среды.</p>
                                <p><span className="text-red-500 font-bold">95% HEAT:</span> Срабатывает блокировка Locked Out. Появляется мини-игра охлаждения.</p>
                                <p><span className="text-cyan-400 font-bold">БЕСПЛАТНОЕ ОХЛАЖДЕНИЕ:</span> При блокировке на 95% появляется мини-игра Cooling Purge. Успешное прохождение снижает температуру БЕЗ расхода ресурсов!</p>
                                <p><span className="text-red-600 font-bold">100% HEAT (ПЕРЕГРЕВ):</span> Бур плавится! ЕДИНОРАЗОВАЯ потеря 10% HP при достижении 100%. Затем температура сбрасывается.</p>
                                <p><span className="text-blue-300 font-bold">ХЛАДАГЕНТЫ:</span> Используйте через Quickbar (левый нижний угол) для мгновенного охлаждения.</p>
                                <div className="mt-2">
                                    <h4 className="text-blue-400 font-bold text-xs uppercase">СИСТЕМА ЩИТА</h4>
                                    <p><span className="text-white font-bold">ЗАРЯДКА:</span> Щит заряжается ТОЛЬКО во время бурения. Кольцо вокруг кнопки БУРИТЬ показывает уровень.</p>
                                    <p><span className="text-green-400 font-bold">АКТИВАЦИЯ:</span> Отпустите кнопку бурения перед столкновением. Щит поглотит 80-90% урона.</p>
                                    <p><span className="text-red-400 font-bold">УТЕЧКА:</span> Щит теряет 1% заряда в секунду, когда бур не работает.</p>
                                </div>
                            </div>
                        </section>

                        {/* 4. FORGE & MARKET */}
                        <section className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                            <h3 className="text-yellow-400 font-bold mb-2 text-sm md:text-base pixel-text">4. КУЗНИЦА И РЫНОК</h3>
                            <div className="space-y-3 text-[10px] md:text-xs">
                                <div>
                                    <p className="text-white font-bold mb-1">КУЗНИЦА (ГОРОД → КУЗНИЦА):</p>
                                    <p><span className="text-cyan-400">ОБОРУДОВАНИЕ:</span> Крафтится в реальном времени. После завершения нажмите COLLECT, чтобы забрать в инвентарь.</p>
                                    <p><span className="text-green-400">СНАБЖЕНИЕ:</span> Ремкомплекты и хладагенты. Используются через Quickbar (левый нижний угол).</p>
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-1">РЫНОК (ГОРОД → РЫНОК):</p>
                                    <p><span className="text-amber-400">ОСНОВНОЙ РЫНОК:</span> Покупка/продажа базовых ресурсов (железо, медь, уголь и т.д.). Доступен ВСЕГДА через Терминал Хаба.</p>
                                    <p><span className="text-purple-400">ЧЁРНЫЙ РЫНОК:</span> Контрабанда и редкие чертежи. Дорого, но уникально. Оплата драгоценностями.</p>
                                    <p className="text-zinc-400 italic">Два рынка = разные товары и валюты!</p>
                                </div>
                            </div>
                        </section>

                        {/* 5. SKILLS & PROGRESSION */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">5. НАВЫКИ И ПРОГРЕССИЯ</h3>
                            <p className="text-[10px] md:text-xs mb-2">За каждый уровень пилота вы получаете очки навыков. Прокачивайте их в меню <span className="text-purple-400 underline uppercase">Skills</span>:</p>
                            <ul className="list-disc pl-4 text-[10px] md:text-xs space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                                <li><span className="text-white">Driller:</span> Увеличивает множитель ресурсов (x1.1 ... x5.0).</li>
                                <li><span className="text-white">Engineer:</span> Повышает прочность и снижает стоимость ремонта.</li>
                                <li><span className="text-white">Chemist:</span> Усиливает эффект расходников и хладагентов.</li>
                                <li><span className="text-white">Architect:</span> Повышает эффективность ваших баз на поверхности.</li>
                            </ul>
                        </section>

                        {/* 6. ARTIFACTS & CODEX */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">6. АРТЕФАКТЫ И КОДЕКС</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <p><span className="text-cyan-300 font-bold">КАК ДОБЫТЬ:</span> Артефакты встречаются в <span className="text-white font-bold">дрифтовых событиях</span> при бурении и в <span className="text-purple-400 font-bold">Side Tunnels</span>. Шанс нахождения редких предметов растет с глубиной.</p>
                                <p><span className="text-yellow-400 font-bold">LUCK (Удача):</span> Стат удачи (от деталей или навыков) напрямую увеличивает шанс выпадения Rare/Epic предметов вместо Common.</p>
                                <p><span className="text-white font-bold">ЭФФЕКТЫ:</span> Экипируйте артефакты в слоты инвентаря для получения мощных пассивных бонусов.</p>
                            </div>
                        </section>

                        {/* 7. GLOBAL MAP & LOGISTICS */}
                        <section className="bg-amber-950/10 border border-amber-900/40 p-3 rounded">
                            <h3 className="text-amber-500 font-bold mb-2 text-sm md:text-base pixel-text">7. ЛОГИСТИКА И ФИЗИКА МИРА</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <div className="flex gap-2">
                                    <span className="text-white font-bold w-16 shrink-0">[ МАССА ]</span>
                                    <span>Вес — ваш главный враг. Каждый кусок угля и каждый установленный двигатель увеличивают массу. Тяжелый бур потребляет больше топлива и медленнее перемещается.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-white font-bold w-16 shrink-0">[ ПЕРЕЕЗД ]</span>
                                    <span>При переезде между регионами рассчитывается время пути. Вы не можете бурить во время перемещения.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-white font-bold w-16 shrink-0">[ РИСКИ ]</span>
                                    <span>Каждый километр пути несет риск "Инцидента" (поломка системы, кража груза). Риск выше в нестабильных регионах.</span>
                                </div>
                            </div>
                        </section>

                        {/* 8. FACTIONS & REPUTATION */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">8. ФРАКЦИИ И РЕПУТАЦИЯ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px] md:text-[10px]">
                                <div className="border border-amber-900/50 p-2">
                                    <span className="text-amber-500 font-bold">VOID IND.</span>
                                    <p className="text-zinc-500 italic">Экономика и логистика. Дают скидки в магазинах.</p>
                                </div>
                                <div className="border border-cyan-900/50 p-2">
                                    <span className="text-cyan-400 font-bold">AEGIS COLL.</span>
                                    <p className="text-zinc-500 italic">Наука и Артефакты. Ускоряют исследования.</p>
                                </div>
                                <div className="border border-red-900/50 p-2">
                                    <span className="text-red-500 font-bold">FREE MINERS</span>
                                    <p className="text-zinc-500 italic">Выживание и контрабанда. Экономят топливо.</p>
                                </div>
                            </div>
                        </section>

                        {/* 9. SIDE TUNNELS & HAZARDS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">9. АНОМАЛИИ В ТУННЕЛЯХ</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <p><span className="text-cyan-400">SIDE TUNNELS:</span> Случайные ответвления. Основной источник артефактов и редких ресурсов, таких как <span className="text-white">Ancient Tech</span> и <span className="text-blue-300">Ice</span>.</p>
                                <p><span className="text-zinc-400">НОВЫЕ РЕСУРСЫ:</span> <span className="text-blue-300">Ice (Лёд)</span> нужен для крафта хладагента, а <span className="text-zinc-500">Scrap (Металлолом)</span> — для ремкомплектов. Добываются при бурении или разборке оборудования.</p>
                                <p><span className="text-red-500 font-bold">HAZARDS:</span> Газовые карманы, магма и обвалы. Требуют определенных навыков или расходников для нейтрализации.</p>
                            </div>
                        </section>

                        {/* 10. COMBAT & BOSSES */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">10. БОЕВАЯ СИСТЕМА</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <p>В конце каждого региона вас ждет <span className="text-red-500 font-bold uppercase">Страж</span>.</p>
                                <p><span className="text-white font-bold">МЕХАНИКА:</span> Это КЛИКЕР. Кликайте по слабым точкам босса как можно быстрее. Кто закликает быстрее — тот победит.</p>
                                <p><span className="text-cyan-400 font-bold">ЩИТ:</span> Держите щит заряженным перед боем. Отпускайте бурение перед атаками босса для парирования.</p>
                                <p><span className="text-yellow-400 font-bold">СОВЕТ:</span> Чем выше ваш DPS (урон в секунду), тем быстрее победа. Улучшайте бур!</p>
                            </div>
                        </section>

                        {/* 11. BASES & CARAVANS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">11. БАЗЫ И КАРАВАНЫ</h3>
                            <div className="space-y-1 text-[10px] md:text-xs">
                                <p><span className="text-white font-bold">Outposts:</span> Точки сохранения и переработки ресурсов.</p>
                                <p><span className="text-white font-bold">Caravans:</span> Автоматические курьеры. Позволяют отправлять излишки ресурсов на главную базу, пока вы бурите.</p>
                            </div>
                        </section>

                        {/* 12. IMPORTANT: SAVE SYSTEM */}
                        <section className="bg-red-600/20 border-2 border-red-500 p-4 rounded-lg animate-pulse">
                            <h3 className="text-red-400 font-bold mb-2 text-sm md:text-base pixel-text uppercase">❗ КРИТИЧЕСКИ ВАЖНО: СОХРАНЕНИЯ ❗</h3>
                            <div className="space-y-2 text-[11px] md:text-[13px] text-white">
                                <p className="font-bold underline italic">ИГРА НЕ СОХРАНЯЕТСЯ АВТОМАТИЧЕСКИ!</p>
                                <p>Вы ОБЯЗАНЫ нажимать кнопку <span className="text-cyan-400 font-bold">"ЗАПИСЬ" (RECORD)</span> в меню (☰) → Настройки перед выходом.</p>
                                <p className="text-zinc-300">Ваш прогресс хранится в локальной памяти браузера.</p>
                                <p className="text-yellow-400 font-bold">РЕЗЕРВНОЕ КОПИРОВАНИЕ:</p>
                                <p>Меню → Настройки → кнопка <span className="text-green-400">"EXPORT"</span> → скопируйте Base64-код.</p>
                                <p>Для переноса на другое устройство: Меню → Настройки → <span className="text-blue-400">"IMPORT"</span> → вставьте код.</p>
                                <p className="text-red-300 italic font-bold">Aegis-7 не прощает ошибок. Вы БУДЕТЕ страдать, плакать и испытывать трудности. ВСЕГДА.</p>
                            </div>
                        </section>


                    </div>

                    {/* FOOTER */}
                    <div className="md:p-4 border-t border-zinc-800 bg-zinc-900/80 z-10 flex justify-end p-6">
                        <button
                            onClick={() => { audioEngine.playUIPanelClose(); onClose(); }}
                            className="w-full md:w-auto px-6 py-4 md:py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold pixel-text text-xs transition-colors"
                        >
                            {t(TEXT_IDS.BTN_OK, lang)}
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HelpModal;
