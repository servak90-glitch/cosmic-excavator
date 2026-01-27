
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
                            <p className="text-[10px] text-zinc-500 font-mono">АКТУАЛЬНО ДЛЯ: v4.0.0 (THE GREAT AUDIT UPDATE)</p>
                        </div>
                        <button onClick={() => { audioEngine.playUIPanelClose(); onClose(); }} className="text-zinc-500 hover:text-white text-xl px-2">✕</button>
                    </div>

                    {/* CONTENT SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 font-mono text-xs md:text-sm text-zinc-300 z-10 scrollbar-hide touch-pan-y max-h-[calc(100vh-200px)] md:max-h-[calc(85vh-150px)]">

                        {/* 1. OBJECTIVE */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">1. ЦЕЛЬ И ЗАДАЧИ</h3>
                            <p className="mb-2"><span className="text-cyan-400 font-bold">ОСНОВНАЯ ЦЕЛЬ:</span> Пробиться сквозь 5 регионов к Радиоактивному Ядру на глубине <span className="text-white font-bold">100,000 метров</span>.</p>
                            <p>Мир Aegis-7 живет по своим законам. Вы не просто кликаете — вы управляете сложной инженерной машиной в условиях агрессивной среды.</p>
                        </section>

                        {/* 2. HUD & INTERFACE */}
                        <section className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                            <h3 className="text-blue-400 font-bold mb-2 text-sm md:text-base pixel-text">2. ИНТЕРФЕЙС УПРАВЛЕНИЯ (HUD)</h3>
                            <div className="space-y-2 text-[10px] md:text-xs">
                                <p><span className="text-red-400 font-bold">HULL (HP):</span> Прочность бура. Падает при ударах, перегреве и инцидентах. 0% = Поражение.</p>
                                <p><span className="text-orange-400 font-bold">HEAT:</span> Температура. Растет при бурении. Выше 95% — блокировка спуска.</p>
                                <p><span className="text-blue-400 font-bold">SHIELD:</span> Энергополе. Поглощает урон. Заряжается только при работе бура.</p>
                                <p><span className="text-amber-500 font-bold">FUEL:</span> Запас топлива. Если кончится в пути — вы застрянете (шанс потери груза при эвакуации).</p>
                                <p><span className="text-purple-400 font-bold">XP / LEVEL:</span> Прогресс пилота. Дает очки навыков для прокачки в меню SKILLS.</p>
                            </div>
                        </section>

                        {/* 3. THERMODYNAMICS & SHIELD */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">3. ТЕРМОДИНАМИКА И ТАКТИКА</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-orange-400 font-bold text-xs uppercase tracking-tighter">НАГРЕВ И ОХЛАЖДЕНИЕ</h4>
                                    <ul className="list-disc pl-4 text-[10px] md:text-xs space-y-1">
                                        <li>При <span className="text-white">95%</span> срабатывает <span className="text-orange-400 italic">Locked Out</span>. Требуется мини-игра "Cooled Purge".</li>
                                        <li><span className="text-red-500 font-bold">ПЕРЕГРЕВ (100%):</span> Бур плавится. -10% HP каждые 5 сек.</li>
                                        <li><span className="text-cyan-400">ВЕНТИЛЯЦИЯ:</span> Скорость остывания зависит от стата <span className="text-white italic">Cooling</span> и региональных условий.</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-blue-400 font-bold text-xs uppercase tracking-tighter">СИСТЕМА ЩИТА</h4>
                                    <ul className="list-disc pl-4 text-[10px] md:text-xs space-y-1">
                                        <li><span className="text-white font-bold">АКТИВАЦИЯ:</span> Отпустите бурение за мгновение до столкновения.</li>
                                        <li><span className="text-green-400">ЭФФЕКТ:</span> Щит поглощает 80-90% входящего урона за счет накопленной энергии.</li>
                                        <li><span className="text-zinc-500 italic">LEAKAGE:</span> Щит теряет 1% заряда в секунду, если бур не работает.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 4. FORGE & TIMED CRAFTING */}
                        <section className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                            <h3 className="text-yellow-400 font-bold mb-2 text-sm md:text-base pixel-text">4. КУЗНИЦА И ПРОИЗВОДСТВО</h3>
                            <div className="space-y-3">
                                <p className="text-[11px]"><span className="text-white font-bold">TIMED CRAFTING:</span> Предметы крафтятся в реальном времени. Чем выше тир, тем дольше идет сборка.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                                    <div className="border border-zinc-800 p-2 bg-black/40">
                                        <div className="text-cyan-400 font-bold mb-1">ОБОРУДОВАНИЕ (BIT, ENG, TANK)</div>
                                        <p>Улучшает базовые статы. После крафта деталь нужно <span className="text-white underline">ЗАБРАТЬ</span> из очереди (Collect), чтобы она появилась в инвентаре.</p>
                                    </div>
                                    <div className="border border-zinc-800 p-2 bg-black/40">
                                        <div className="text-green-400 font-bold mb-1">СНАБЖЕНИЕ (SUPPLY)</div>
                                        <p>Ремкомплекты и хладагенты. Можно крафтить пачками. Используются через Quickbar (клавиши 1, 2, 3) прямо во время бурения.</p>
                                    </div>
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
                            <p className="text-[10px] md:text-xs">
                                В конце каждого региона вас ждет <span className="text-red-500 font-bold uppercase">Страж</span>.
                                Битва — это ритм-игра. Используйте щит для парирования атак и наносите ответные удары, когда босс открыт.
                            </p>
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
                            <h3 className="text-red-400 font-bold mb-2 text-sm md:text-base pixel-text uppercase">❗ ВНИМАНИЕ: СОХРАНЕНИЯ ❗</h3>
                            <div className="space-y-2 text-[11px] md:text-[13px] text-white">
                                <p className="font-bold underline italic">ИГРА НЕ СОХРАНЯЕТСЯ АВТОМАТИЧЕСКИ!</p>
                                <p>Вы должны нажимать кнопку <span className="text-cyan-400 font-bold">"ЗАПИСЬ" (RECORD)</span> в меню настроек перед выходом.</p>
                                <p className="text-zinc-300">Ваш прогресс хранится в локальной памяти браузера. Для надежности копируйте <span className="text-yellow-400">Base64-код</span> сохранения.</p>
                                <p className="text-zinc-500 text-[10px]">Бур не прощает забывчивости. Нет записи — нет прогресса.</p>
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
