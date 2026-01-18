
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
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full max-w-2xl h-[85vh] bg-zinc-950 border-2 border-zinc-700 shadow-[0_0_50px_rgba(0,255,255,0.1)] flex flex-col overflow-hidden"
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
                            <p className="text-[10px] text-zinc-500 font-mono">АКТУАЛЬНО ДЛЯ: v0.3.0 (QUESTS & TUNNELS UPDATE)</p>
                        </div>
                        <button onClick={() => { audioEngine.playUIPanelClose(); onClose(); }} className="text-zinc-500 hover:text-white text-xl px-2">✕</button>
                    </div>

                    {/* CONTENT SCROLL AREA */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 font-mono text-xs md:text-sm text-zinc-300 z-10 scrollbar-hide touch-pan-y">

                        {/* 1. OBJECTIVE */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">1. ЦЕЛЬ И ЗАДАЧИ</h3>
                            <p className="mb-2"><span className="text-cyan-400 font-bold">ОСНОВНАЯ ЗАДАЧА:</span> Бурить вглубь до 100,000 метров (Радиоактивное Ядро).</p>
                            <p>Собирайте ресурсы, улучшайте бур в Цехе, изучайте древние технологии (Ancient Tech) и сражайтесь со стражами глубин.</p>
                        </section>

                        {/* 2. HUD & MECHANICS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">2. ИНТЕРФЕЙС И МЕХАНИКИ</h3>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>
                                    <span className="text-orange-400 font-bold">НАГРЕВ:</span> При бурении температура растет.
                                    <br /><span className="text-zinc-500 text-[10px]">95% &rarr; Активируется аварийная блокировка.</span>
                                    <br /><span className="text-zinc-500 text-[10px]">100% &rarr; Урон обшивке.</span>
                                </li>
                                <li>
                                    <span className="text-amber-400 font-bold">ЭНЕРГИЯ (LOAD):</span> Если потребление (Cons) превышает выработку (Prod), скорость бурения падает.
                                </li>
                            </ul>
                        </section>

                        {/* 2.1 COOLING TABLE */}
                        <section className="bg-cyan-950/10 border border-cyan-900/30 p-3 rounded">
                            <h3 className="text-cyan-400 font-bold mb-2 text-xs md:text-sm pixel-text">2.1 ТАЙМИНГИ ОХЛАЖДЕНИЯ (100% &rarr; 0%)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[10px] md:text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-zinc-500 text-left">
                                            <th className="pb-1 font-normal">СИСТЕМА</th>
                                            <th className="pb-1 font-normal text-right">ВРЕМЯ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-zinc-400">
                                        <tr className="border-b border-zinc-900/50">
                                            <td className="py-1">Дырявый бак (Старт)</td>
                                            <td className="py-1 text-right text-white">~5:30 мин</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900/50">
                                            <td className="py-1 text-cyan-800">Медный радиатор (T2)</td>
                                            <td className="py-1 text-right text-cyan-400">~2:20 мин</td>
                                        </tr>
                                        <tr className="border-b border-zinc-900/50">
                                            <td className="py-1 text-cyan-700">Вентилятор "Тайфун" (T3)</td>
                                            <td className="py-1 text-right text-cyan-300">~1:30 мин</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 text-cyan-400 font-bold">КРИО-БОТ (Дрон)</td>
                                            <td className="py-1 text-right text-green-400 font-bold">-1.5% / сек</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2 text-[9px] text-zinc-500 italic">* Глубина и горячая среда увеличивают время остывания.</p>
                        </section>

                        {/* 3. ARTIFACTS & LAB */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">3. СКЛАД И АРТЕФАКТЫ</h3>
                            <div className="space-y-2">
                                <p><span className="font-bold text-white">Неизвестные объекты:</span> Выпадают с боссов и событий. Требуют <span className="text-cyan-400">АНАЛИЗА</span> в лаборатории. Время анализа зависит от редкости (от 10 сек до 1 часа).</p>
                                <p><span className="font-bold text-white">Трансмутация:</span> В меню "ЦЕХ" &rarr; "СИНТЕЗ" можно объединить 3 артефакта одной редкости, чтобы получить 1 артефакт более высокой редкости.</p>
                                <p><span className="font-bold text-white">Сборка:</span> Вы можете экипировать до 3-х артефактов одновременно для получения пассивных бонусов.</p>
                            </div>
                        </section>

                        {/* 4. FORGE & FUSION */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">4. ЦЕХ (FORGE)</h3>
                            <p className="mb-2">Стандартные улучшения доступны до 12 Тира (Legendary).</p>
                            <div className="bg-purple-900/20 border border-purple-500/50 p-3 rounded">
                                <div className="text-purple-400 font-bold mb-1 pixel-text text-xs">АТОМНЫЙ РЕКОНСТРУКТОР</div>
                                <p className="text-[10px] md:text-xs">
                                    Для создания предметов божественного уровня (Godly, Tier 13-15) требуется <span className="text-white font-bold">СИНТЕЗ</span>.
                                    <br />Это требует редких ресурсов (Ancient Tech, Gems) и выполнения особых условий (например, достичь глубины без повреждений).
                                </p>
                            </div>
                        </section>

                        {/* 5. CITY */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">5. ГОРОД</h3>
                            <ul className="list-disc pl-4 space-y-1 text-[10px] md:text-xs">
                                <li><span className="text-amber-400">Рынок:</span> Обмен ресурсов. Цены меняются в зависимости от региона!</li>
                                <li><span className="text-purple-400">Ювелир:</span> Продажа самоцветов за Деньги или XP.</li>
                                <li><span className="text-white">Контракты:</span> Задания фракций. "Корпорация" платит ресурсами, "Ученые" — опытом.</li>
                                <li><span className="text-green-400">Бар:</span> Рискованные напитки с мощными временными эффектами. <span className="text-cyan-400 font-bold">+ КВЕСТЫ!</span></li>
                                <li><span className="text-cyan-400">Экспедиции:</span> Отправка дронов на добычу ресурсов. Требует Nano Swarm. Риск потери дронов!</li>
                            </ul>
                            <p className="mt-2 text-[10px] text-zinc-500 italic">* В разных городах разные цены на рынке. Используйте это для торговли!</p>
                        </section>

                        {/* 5.1 EXPEDITIONS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">5.1 ЭКСПЕДИЦИИ (NEW)</h3>
                            <p className="mb-2">Используйте <span className="text-cyan-400">Нановолокно (Nano Swarm)</span>, чтобы отправлять разведывательные дроны за пределы шахты.</p>
                            <div className="bg-zinc-900 border border-cyan-900/50 p-2 rounded text-[10px] md:text-xs">
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>
                                        <span className="text-white font-bold">Риск vs Награда:</span> Чем выше сложность, тем больше ресурсов, но выше шанс потерять дроны.
                                    </li>
                                    <li>
                                        <span className="text-white font-bold">Время:</span> Экспедиции проходят в реальном времени. Можно закрыть игру.
                                    </li>
                                    <li>
                                        <span className="text-red-400 font-bold">Опасность:</span> На сложности "СМЕРТЕЛЬНО" можно потерять всю группу и груз.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 6. COMBAT & DEFENSE */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">6. БОЕВАЯ СИСТЕМА И ЗАЩИТА</h3>
                            <p className="mb-2">Каждые ~500м глубины есть шанс встретить Босса.</p>

                            <div className="bg-zinc-900 border border-blue-900/50 p-3 mb-2 rounded">
                                <h4 className="text-blue-400 font-bold mb-1 text-xs">ПРОТОКОЛЫ ВЫЖИВАНИЯ</h4>
                                <ul className="list-disc pl-4 space-y-2 text-[10px] md:text-xs">
                                    <li>
                                        <span className="text-cyan-400 font-bold">КИНЕТИЧЕСКИЙ ЩИТ (ACTIVE):</span>
                                        <br />Бур накапливает заряд щита во время работы.
                                        <br /><b>ОТПУСТИТЕ КНОПКУ</b> прямо перед ударом босса, чтобы активировать щит. Это заблокирует <b>80%</b> урона.
                                    </li>
                                    <li>
                                        <span className="text-zinc-400 font-bold">УКЛОНЕНИЕ (PASSIVE):</span>
                                        <br />Шанс полностью избежать урона (MISS). Зависит от уровней <span className="text-white">Двигателя</span> и <span className="text-white">Логики</span>.
                                        <br /><span className="text-red-400">Внимание:</span> При перегреве шанс уклонения падает на 50%.
                                    </li>
                                </ul>
                            </div>

                            <ul className="list-disc pl-4 space-y-1 text-[10px] md:text-xs">
                                <li><span className="text-red-400">Атака:</span> Кликайте, чтобы наносить урон.</li>
                                <li><span className="text-purple-400">Взлом:</span> Если босс включает неуязвимость, выиграйте мини-игру, чтобы отключить его щит.</li>
                            </ul>
                        </section>

                        {/* 7. ACTIVE SKILLS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">7. АКТИВНЫЕ НАВЫКИ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] md:text-xs">
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-cyan-400 font-bold">⚡ EMP BURST</div>
                                    <div className="text-zinc-400">Сброс щитов босса, оглушение дронов.</div>
                                    <div className="mt-1 text-zinc-500">Кулдаун: 15с | Нагрев: +20</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-orange-400 font-bold">🔥 THERMAL STRIKE</div>
                                    <div className="text-zinc-400">Урон от текущего перегрева. Охлаждает систему (-25%).</div>
                                    <div className="mt-1 text-zinc-500">Кулдаун: 8с | Охлаждение</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-blue-400 font-bold">🛡️ VOID BARRIER</div>
                                    <div className="text-zinc-400">Неуязвимость на 4 секунды.</div>
                                    <div className="mt-1 text-zinc-500">Кулдаун: 20с | Нагрев: +10</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-red-400 font-bold">☢️ SYSTEM OVERLOAD</div>
                                    <div className="text-zinc-400">+200% Урона на 6 секунд. Экстремальный нагрев (+10/сек).</div>
                                    <div className="mt-1 text-zinc-500">Кулдаун: 30с | Опасно!</div>
                                </div>
                            </div>
                        </section>

                        {/* 8. BLACK BOX */}
                        <section className="bg-red-950/20 border border-red-900 p-2">
                            <h3 className="text-red-500 font-bold border-b border-red-900 pb-1 mb-2 text-sm md:text-base pixel-text">
                                8. {t(TEXT_IDS.HELP_SECTION_SAVE_TITLE, lang)}
                            </h3>
                            <p className="text-zinc-300">
                                {t(TEXT_IDS.HELP_SECTION_SAVE_BODY, lang)}
                            </p>
                        </section>

                        {/* 9. BACKUP (NEW) */}
                        <section className="bg-cyan-950/20 border border-cyan-900 p-2">
                            <h3 className="text-cyan-500 font-bold border-b border-cyan-900 pb-1 mb-2 text-sm md:text-base pixel-text">
                                9. {t(TEXT_IDS.HELP_SECTION_EXPORT_TITLE, lang)}
                            </h3>
                            <p className="text-zinc-300 whitespace-pre-wrap">
                                {t(TEXT_IDS.HELP_SECTION_EXPORT_BODY, lang)}
                            </p>
                        </section>

                        {/* 10. GLOBAL MAP */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">10. ГЛОБАЛЬНАЯ КАРТА</h3>
                            <p className="mb-2">Планета <span className="text-cyan-400 font-bold">Aegis-7</span> разделена на 5 регионов. Каждый регион имеет свои особенности и ресурсы.</p>

                            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded mb-2">
                                <h4 className="text-cyan-400 font-bold mb-2 text-xs">РЕГИОНЫ</h4>
                                <ul className="list-disc pl-4 space-y-1 text-[10px] md:text-xs">
                                    <li><span className="text-orange-400">🏜️ Rust Valley</span> - стартовый регион (безопасный)</li>
                                    <li><span className="text-cyan-400">💎 Crystal Wastes</span> - много кристаллов</li>
                                    <li><span className="text-zinc-400">⚙️ Iron Steppes</span> - металлы и руды</li>
                                    <li><span className="text-red-400">🔥 Molten Core</span> - экстремальная жара</li>
                                    <li><span className="text-purple-400">🌌 Void Chasm</span> - опасная зона</li>
                                </ul>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/50 p-2 rounded text-[10px] md:text-xs">
                                <p className="mb-1"><span className="text-amber-400 font-bold">⛽ ТОПЛИВО:</span> Путешествия расходуют топливо. Расход зависит от расстояния и веса груза.</p>
                                <p className="mb-1"><span className="text-orange-400 font-bold">📦 ВЕС ГРУЗА:</span> Перегрузка блокирует путешествия! Следите за весом ресурсов.</p>
                                <p><span className="text-green-400 font-bold">📜 ЛИЦЕНЗИИ:</span> Для доступа к опасным зонам (Yellow/Red) нужны лицензии.</p>
                            </div>
                        </section>

                        {/* 11. QUEST SYSTEM */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">11. СИСТЕМА КВЕСТОВ</h3>
                            <p className="mb-2">Квесты доступны в <span className="text-green-400">БАРЕ</span> городов. Выполнение квестов даёт награды и репутацию фракций.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-[10px] md:text-xs">
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-blue-400 font-bold">📦 DELIVERY</div>
                                    <div className="text-zinc-400">Доставить ресурсы в город</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-green-400 font-bold">⛏️ COLLECTION</div>
                                    <div className="text-zinc-400">Собрать определённые ресурсы</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-purple-400 font-bold">🗺️ EXPLORATION</div>
                                    <div className="text-zinc-400">Достичь глубины или посетить регион</div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-red-400 font-bold">⚔️ COMBAT</div>
                                    <div className="text-zinc-400">Победить определённых врагов</div>
                                </div>
                            </div>

                            <div className="bg-purple-950/20 border border-purple-900/50 p-2 rounded text-[10px] md:text-xs">
                                <p className="font-bold text-purple-400 mb-1">РЕПУТАЦИЯ ФРАКЦИЙ:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><span className="text-amber-400">CORPORATE</span> - корпорации (ресурсы, скидки)</li>
                                    <li><span className="text-cyan-400">SCIENCE</span> - учёные (опыт, технологии)</li>
                                    <li><span className="text-red-400">REBELS</span> - повстанцы (боевые бонусы)</li>
                                </ul>
                            </div>
                        </section>

                        {/* 12. SIDE TUNNELS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">12. БОКОВЫЕ ТУННЕЛИ</h3>
                            <p className="mb-2">Во время бурения можно обнаружить <span className="text-cyan-400 font-bold">боковые туннели</span> с уникальными наградами и рисками.</p>

                            <div className="space-y-2 text-[10px] md:text-xs">
                                <div className="bg-cyan-950/20 border border-cyan-900/50 p-2 rounded">
                                    <div className="text-cyan-400 font-bold mb-1">💎 CRYSTAL CAVES</div>
                                    <p className="text-zinc-400 mb-1">Пещеры с кристаллами. Высокий риск резонанса (урон щиту).</p>
                                    <p className="text-green-400">Награда: Много кристаллов (Rubies, Emeralds, Diamonds)</p>
                                </div>

                                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                    <div className="text-orange-400 font-bold mb-1">🏗️ ABANDONED MINES</div>
                                    <p className="text-zinc-400 mb-1">Заброшенные шахты. Риск обвалов.</p>
                                    <p className="text-green-400">Награда: Ancient Tech, чертежи снаряжения</p>
                                </div>

                                <div className="bg-red-950/20 border border-red-900/50 p-2 rounded">
                                    <div className="text-red-400 font-bold mb-1">🥚 ALIEN NESTS</div>
                                    <p className="text-zinc-400 mb-1">Гнёзда чужих. Очень опасно!</p>
                                    <p className="text-purple-400">Награда: Уникальный лут, артефакты</p>
                                </div>
                            </div>

                            <div className="bg-blue-950/20 border border-blue-900/50 p-2 rounded mt-2 text-[10px] md:text-xs">
                                <p><span className="text-blue-400 font-bold">🔍 ANOMALY SCANNER:</span> Разблокируйте чертёж сканера, чтобы видеть риски туннеля перед входом.</p>
                            </div>
                        </section>

                        {/* 13. HAZARDS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">13. ОПАСНОСТИ</h3>
                            <p className="mb-2">Глубины полны опасностей. Будьте готовы!</p>

                            <div className="space-y-2 text-[10px] md:text-xs">
                                <div className="bg-zinc-900 border border-orange-900/50 p-2 rounded">
                                    <div className="text-orange-400 font-bold">⚠️ CAVE-IN (Обвал)</div>
                                    <p className="text-zinc-400">Урон буру. Шанс растёт с глубиной. Атаки боссов могут вызвать обвал.</p>
                                </div>

                                <div className="bg-green-950/20 border border-green-900/50 p-2 rounded">
                                    <div className="text-green-400 font-bold">☠️ GAS (Газовый карман)</div>
                                    <p className="text-zinc-400">Урон со временем. Появляется случайно при раскопках. Требует вентиляции.</p>
                                </div>

                                <div className="bg-red-950/20 border border-red-900/50 p-2 rounded">
                                    <div className="text-red-400 font-bold">🔥 MAGMA (Магма)</div>
                                    <p className="text-zinc-400">Сильный перегрев. Появляется только на больших глубинах. Нужен мощный охладитель!</p>
                                </div>
                            </div>

                            <p className="mt-2 text-[10px] text-zinc-500 italic">* Опасности имеют кулдауны - не могут появиться одновременно.</p>
                        </section>

                        {/* 14. BASES & CARAVANS */}
                        <section>
                            <h3 className="text-white font-bold border-b border-zinc-700 pb-1 mb-2 text-sm md:text-base pixel-text">14. БАЗЫ И КАРАВАНЫ</h3>

                            <div className="mb-3">
                                <h4 className="text-cyan-400 font-bold mb-2 text-xs">БАЗЫ ИГРОКА</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] md:text-xs">
                                    <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                        <div className="text-green-400 font-bold">🏕️ OUTPOST</div>
                                        <div className="text-zinc-400">Базовое хранилище</div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                        <div className="text-blue-400 font-bold">🏭 STATION</div>
                                        <div className="text-zinc-400">Полный функционал + рынок</div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-700 p-2 rounded">
                                        <div className="text-red-400 font-bold">🏰 FORTRESS</div>
                                        <div className="text-zinc-400">Защита от рейдов</div>
                                    </div>
                                </div>
                                <p className="mt-2 text-[10px] text-zinc-400">Стройте базы в регионах для хранения ресурсов и производства топлива.</p>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/50 p-2 rounded text-[10px] md:text-xs">
                                <h4 className="text-amber-400 font-bold mb-2">🚚 КАРАВАНЫ</h4>
                                <p className="mb-2">Отправляйте караваны для транспортировки ресурсов между базами.</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><span className="text-white">1★ Shuttle</span> - базовый транспорт (малая вместимость)</li>
                                    <li><span className="text-cyan-400">2★ Hauler</span> - средний транспорт</li>
                                    <li><span className="text-purple-400">3★ Freighter</span> - тяжёлый транспорт (большая вместимость)</li>
                                </ul>
                                <p className="mt-2 text-red-400 font-bold">⚠️ Риск: Караваны могут быть атакованы в пути!</p>
                                <p className="text-green-400">✓ Работают в offline режиме</p>
                            </div>
                        </section>

                        {/* 15. FACTIONS (PREVIEW) */}
                        <section className="bg-purple-950/20 border border-purple-900 p-3">
                            <h3 className="text-purple-400 font-bold border-b border-purple-900 pb-1 mb-2 text-sm md:text-base pixel-text">15. ФРАКЦИИ (PREVIEW)</h3>
                            <p className="text-zinc-300 mb-2 text-[10px] md:text-xs">Три фракции борются за контроль над Aegis-7. Ваша репутация открывает уникальные перки.</p>

                            <div className="space-y-2 text-[10px] md:text-xs">
                                <div className="bg-zinc-900 border border-amber-900/50 p-2 rounded">
                                    <div className="text-amber-400 font-bold">🏢 CORPORATE (Корпорации)</div>
                                    <p className="text-zinc-400">Скидки на рынке, бонусы к ресурсам, доступ к премиум снаряжению</p>
                                </div>

                                <div className="bg-zinc-900 border border-cyan-900/50 p-2 rounded">
                                    <div className="text-cyan-400 font-bold">🔬 SCIENCE (Учёные)</div>
                                    <p className="text-zinc-400">Бонус к опыту, быстрый анализ артефактов, улучшенные сканеры</p>
                                </div>

                                <div className="bg-zinc-900 border border-red-900/50 p-2 rounded">
                                    <div className="text-red-400 font-bold">⚔️ REBELS (Повстанцы)</div>
                                    <p className="text-zinc-400">Боевые бонусы, защита караванов, доступ к чёрному рынку</p>
                                </div>
                            </div>

                            <p className="mt-2 text-[10px] text-purple-400 italic">* Система фракций находится в разработке. Больше контента скоро!</p>
                        </section>


                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 z-10 flex justify-end">
                        <button
                            onClick={() => { audioEngine.playUIPanelClose(); onClose(); }}
                            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold pixel-text text-xs transition-colors"
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
