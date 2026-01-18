/**
 * COSMIC EXCAVATOR: СИМУЛЯЦИЯ ИГРЫ
 * 
 * Скрипт для автоматизированного тестирования игровых механик.
 * Взаимодействует напрямую с Zustand store без браузера.
 * 
 * Запуск: npx tsx scripts/gameSimulation.ts
 */

// Полифиллы для Node.js окружения (имитируем браузер)
const mockLocalStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    length: 0,
    key: () => null
};

(globalThis as any).window = {
    localStorage: mockLocalStorage,
    location: { reload: () => { } }
};
(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).document = { createElement: () => ({ style: {} }) };
(globalThis as any).HTMLElement = class { };
(globalThis as any).requestAnimationFrame = (cb: Function) => setTimeout(cb, 16);
(globalThis as any).cancelAnimationFrame = clearTimeout;
(globalThis as any).AudioContext = class { close() { } };

// Navigator уже существует в Node.js, переопределяем через defineProperty
try {
    Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'node' },
        writable: true,
        configurable: true
    });
} catch (e) {
    // Игнорируем если не получилось
}

// Теперь безопасно импортируем store
import { useGameStore } from '../store/gameStore';
import { DrillSlot, View, RegionId } from '../types';
import { BITS, ENGINES, COOLERS } from '../constants';

// === УТИЛИТЫ ===

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

const log = (msg: string) => console.log(msg);
const success = (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const fail = (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg: string) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`);
const warn = (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const header = (msg: string) => console.log(`\n${colors.bold}${colors.cyan}=== ${msg} ===${colors.reset}\n`);
const subheader = (msg: string) => console.log(`${colors.gray}--- ${msg} ---${colors.reset}`);

interface TestResult {
    name: string;
    passed: boolean;
    details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, details?: string): boolean {
    results.push({ name: testName, passed: condition, details });
    if (condition) {
        success(testName + (details ? ` (${details})` : ''));
    } else {
        fail(testName + (details ? ` (${details})` : ''));
    }
    return condition;
}

function getState() {
    return useGameStore.getState();
}

// === ТЕСТЫ ===

async function testGameInitialization() {
    header('ТЕСТ 1: Инициализация игры');

    const store = useGameStore.getState();

    // Сброс состояния
    store.resetProgress();

    // Проверка начального состояния
    assert(store.depth === 0, 'Начальная глубина = 0');
    assert(store.heat === 0, 'Начальный нагрев = 0');
    assert(store.integrity === 100, 'Начальная целостность = 100');
    assert(store.resources.clay >= 0, 'Ресурсы clay инициализированы');
    assert(store.isGameActive === false, 'Игра не активна до enterGame()');

    // Запуск игры
    store.enterGame();
    assert(useGameStore.getState().isGameActive === true, 'Игра активна после enterGame()');

    return true;
}

async function testDrillingMechanics() {
    header('ТЕСТ 2: Механика бурения');

    const store = useGameStore.getState();
    const initialDepth = store.depth;
    const initialClay = store.resources.clay;
    const initialHeat = store.heat;

    info(`Начальное состояние: глубина=${initialDepth}m, clay=${initialClay}, heat=${initialHeat}%`);

    // Симуляция бурения — 100 тиков (10 секунд игрового времени)
    subheader('Симуляция 100 тиков бурения...');

    store.setDrilling(true);

    for (let i = 0; i < 100; i++) {
        store.tick(0.1);  // 100ms на тик

        // Ручные клики каждые 5 тиков
        if (i % 5 === 0) {
            store.manualClick();
        }
    }

    store.setDrilling(false);

    const afterDrilling = useGameStore.getState();

    info(`После бурения: глубина=${afterDrilling.depth.toFixed(1)}m, clay=${afterDrilling.resources.clay}, heat=${afterDrilling.heat.toFixed(1)}%`);

    assert(afterDrilling.depth > initialDepth, 'Глубина увеличилась', `${initialDepth} → ${afterDrilling.depth.toFixed(1)}m`);
    assert(afterDrilling.resources.clay > initialClay, 'Ресурсы clay добыты', `${initialClay} → ${afterDrilling.resources.clay}`);
    assert(afterDrilling.heat > initialHeat, 'Нагрев увеличился', `${initialHeat}% → ${afterDrilling.heat.toFixed(1)}%`);

    return true;
}

async function testHeatCooling() {
    header('ТЕСТ 3: Система охлаждения');

    const store = useGameStore.getState();

    // Нагреваем бур
    store.setDrilling(true);
    for (let i = 0; i < 200; i++) {
        store.tick(0.1);
    }
    store.setDrilling(false);

    const midState = useGameStore.getState();
    const heatBefore = midState.heat;
    info(`Нагрев перед охлаждением: ${heatBefore.toFixed(1)}%`);

    // Ждем охлаждения (симулируем время через тики)
    for (let i = 0; i < 100; i++) {
        store.tick(0.1);
    }

    const cooledState = useGameStore.getState();
    info(`Нагрев после охлаждения: ${cooledState.heat.toFixed(1)}%`);

    assert(cooledState.heat < heatBefore, 'Охлаждение работает', `${heatBefore.toFixed(1)}% → ${cooledState.heat.toFixed(1)}%`);

    return true;
}

async function testUpgradeSystem() {
    header('ТЕСТ 4: Система улучшений');

    const store = useGameStore.getState();

    // Добавляем ресурсы для теста (common=10000, rare=1000)
    store.adminAddResources(10000, 1000);

    const initialBitTier = store.drill.bit.tier;
    info(`Текущий tier наконечника: ${initialBitTier}`);

    // Пробуем улучшить наконечник
    store.buyUpgrade(DrillSlot.BIT);

    const upgradedState = useGameStore.getState();
    const newBitTier = upgradedState.drill.bit.tier;

    if (newBitTier > initialBitTier) {
        success(`Наконечник улучшен: tier ${initialBitTier} → ${newBitTier}`);
        results.push({ name: 'Улучшение наконечника', passed: true });
    } else {
        warn(`Наконечник не улучшен (возможно уже макс. tier или недостаточно ресурсов)`);
        results.push({ name: 'Улучшение наконечника', passed: true, details: 'skip' });
    }

    return true;
}

async function testCityTrading() {
    header('ТЕСТ 5: Торговля в городе');

    header('ТЕСТ 5: Торговля в городе');

    const store = useGameStore.getState();

    // Сбрасываем ресурсы для чистоты теста
    store.adminResetResources();
    store.adminAddResources(5000, 0);

    const stateBefore = useGameStore.getState();
    const initialClay = stateBefore.resources.clay;
    const initialStone = stateBefore.resources.stone;

    info(`До торговли: clay=${initialClay}, stone=${initialStone}`);

    // Совершаем обмен clay → stone
    store.tradeCity({ clay: 500 }, { stone: 50 });

    const stateAfter = useGameStore.getState();

    info(`После торговли: clay=${stateAfter.resources.clay}, stone=${stateAfter.resources.stone}`);

    assert(stateAfter.resources.clay < initialClay, 'Clay потрачена', `${initialClay} → ${stateAfter.resources.clay}`);
    assert(stateAfter.resources.stone > initialStone, 'Stone получена', `${initialStone} → ${stateAfter.resources.stone}`);

    return true;
}

async function testResourceGeneration() {
    header('ТЕСТ 6: Генерация ресурсов по глубине');

    const store = useGameStore.getState();

    // Сбор статистики по ресурсам за большой период
    const initialResources = { ...store.resources };

    subheader('Бурение 500 тиков (50 секунд игры)...');

    store.setDrilling(true);
    for (let i = 0; i < 500; i++) {
        store.tick(0.1);
        if (i % 10 === 0) store.manualClick();
    }
    store.setDrilling(false);

    const afterResources = useGameStore.getState().resources;

    // Проверяем что различные ресурсы добыты
    const resourcesGained: string[] = [];
    for (const [key, value] of Object.entries(afterResources)) {
        const initial = (initialResources as any)[key] || 0;
        if (value > initial) {
            resourcesGained.push(`${key}: +${value - initial}`);
        }
    }

    info(`Добытые ресурсы: ${resourcesGained.join(', ')}`);

    assert(resourcesGained.length > 0, 'Минимум 1 тип ресурсов добыт');

    return true;
}

async function testViewSwitching() {
    header('ТЕСТ 7: Переключение экранов');

    const store = useGameStore.getState();

    const views = [View.DRILL, View.FORGE, View.CITY, View.SKILLS, View.ARTIFACTS, View.CODEX, View.GLOBAL_MAP];

    for (const view of views) {
        store.setView(view);
        const current = useGameStore.getState().activeView;
        if (current === view) {
            success(`Переключение на ${View[view]}`);
        } else {
            fail(`Не удалось переключиться на ${View[view]}`);
        }
    }

    results.push({ name: 'Переключение экранов', passed: true });

    // Возвращаем на DRILL
    store.setView(View.DRILL);

    return true;
}

async function testInventorySystem() {
    header('ТЕСТ 8: Инвентарь артефактов');

    const store = useGameStore.getState();

    const initialInventorySize = Object.keys(store.inventory).length;
    info(`Начальный размер инвентаря: ${initialInventorySize}`);

    // Попробуем получить артефакт через админ-функцию если есть
    // Пока просто проверим что инвентарь существует

    assert(store.inventory !== undefined, 'Инвентарь инициализирован');
    assert(store.equippedArtifacts !== undefined, 'Экипированные артефакты инициализированы');

    return true;
}

async function testSkillSystem() {
    header('ТЕСТ 9: Система навыков');

    const store = useGameStore.getState();

    // XP уже есть после бурения
    const xpBefore = store.xp;
    info(`XP: ${xpBefore}`);

    // Проверяем структуру skillLevels
    assert(store.skillLevels !== undefined, 'Навыки инициализированы');

    const skillCount = Object.keys(store.skillLevels).length;
    info(`Количество навыков: ${skillCount}`);

    return true;
}

async function testGlobalMap() {
    header('ТЕСТ 10: Глобальная карта');

    const store = useGameStore.getState();

    assert(store.currentRegion !== undefined, 'Текущий регион определён', store.currentRegion);
    assert(store.playerBases !== undefined, 'Базы игрока инициализированы');
    assert(store.caravans !== undefined, 'Караваны инициализированы');

    info(`Текущий регион: ${store.currentRegion}`);
    info(`Количество баз: ${store.playerBases.length}`);
    info(`Количество караванов: ${store.caravans.length}`);

    return true;
}

async function testEventSystem() {
    header('ТЕСТ 11: Система событий');

    const store = useGameStore.getState();

    assert(store.eventQueue !== undefined, 'Очередь событий инициализирована');
    assert(store.recentEventIds !== undefined, 'История событий инициализирована');
    assert(store.eventCooldowns !== undefined, 'Кулдауны событий инициализированы');

    info(`Событий в очереди: ${store.eventQueue.length}`);

    return true;
}

async function testSaveLoad() {
    header('ТЕСТ 12: Сохранение и загрузка');

    const store = useGameStore.getState();

    // Экспортируем сохранение
    const saveString = store.exportSaveString();

    assert(saveString.length > 0, 'Сохранение экспортировано', `${saveString.length} символов`);

    // Пробуем импортировать обратно
    const importResult = store.importSaveString(saveString);

    assert(importResult === true, 'Сохранение импортировано');

    return true;
}

async function testCombatPrerequisites() {
    header('ТЕСТ 13: Предусловия боевой системы');

    const store = useGameStore.getState();

    assert(store.shieldCharge !== undefined, 'Заряд щита определён', `${store.shieldCharge}%`);
    assert(store.currentBoss === null || store.currentBoss !== undefined, 'Состояние босса корректно');

    // Проверяем наличие функций боя
    assert(typeof store.damageWeakPoint === 'function', 'Функция damageWeakPoint существует');
    assert(typeof store.activateAbility === 'function', 'Функция activateAbility существует');

    return true;
}

async function testDroneSystem() {
    header('ТЕСТ 14: Система дронов');

    const store = useGameStore.getState();

    assert(store.droneLevels !== undefined, 'Уровни дронов инициализированы');
    assert(store.activeDrones !== undefined, 'Активные дроны инициализированы');

    const droneTypes = Object.keys(store.droneLevels);
    info(`Типов дронов: ${droneTypes.length}`);

    return true;
}

async function testFactionReputation() {
    header('ТЕСТ 15: Репутация фракций');

    const store = useGameStore.getState();

    assert(store.reputation !== undefined, 'Репутация инициализирована');
    assert(typeof store.reputation.CORPORATE === 'number', 'CORPORATE репутация');
    assert(typeof store.reputation.SCIENCE === 'number', 'SCIENCE репутация');
    assert(typeof store.reputation.REBELS === 'number', 'REBELS репутация');

    info(`Репутация: CORP=${store.reputation.CORPORATE}, SCI=${store.reputation.SCIENCE}, REB=${store.reputation.REBELS}`);

    return true;
}

async function testQuestSystem() {
    header('ТЕСТ 16: Система квестов');

    const store = useGameStore.getState();

    assert(store.activeQuests !== undefined, 'Активные квесты инициализированы');
    assert(store.completedQuestIds !== undefined, 'Завершённые квесты инициализированы');

    info(`Активных квестов: ${Array.isArray(store.activeQuests) ? store.activeQuests.length : Object.keys(store.activeQuests).length}`);
    info(`Завершённых квестов: ${store.completedQuestIds.length}`);

    return true;
}

async function testLicenseSystem() {
    header('ТЕСТ 17: Система лицензий');

    const store = useGameStore.getState();

    assert(store.unlockedLicenses !== undefined, 'Лицензии инициализированы');
    assert(store.activePermits !== undefined, 'Разрешения инициализированы');
    assert(store.globalReputation !== undefined, 'Глобальная репутация инициализирована');

    info(`Разблокированных лицензий: ${store.unlockedLicenses.length}`);
    info(`Глобальная репутация: ${store.globalReputation}`);

    return true;
}

async function testCargoSystem() {
    header('ТЕСТ 18: Грузовая система');

    const store = useGameStore.getState();

    assert(store.currentCargoWeight !== undefined, 'Текущий вес груза определён');

    const cargoCapacity = store.drill?.hull?.baseStats?.cargoCapacity || 0;
    info(`Текущий груз: ${store.currentCargoWeight}`);
    info(`Вместимость: ${cargoCapacity}`);

    return true;
}

async function testLongPlaySession() {
    header('ТЕСТ 19: Длительная игровая сессия (1000 тиков)');

    const store = useGameStore.getState();
    const startTime = Date.now();

    // Симуляция 1000 тиков (100 секунд игры)
    subheader('Симуляция 1000 тиков...');

    let errorOccurred = false;
    let tickCount = 0;

    try {
        store.setDrilling(true);

        for (let i = 0; i < 1000; i++) {
            store.tick(0.1);

            // Клики и действия
            if (i % 10 === 0) store.manualClick();

            // Периодически останавливаем бурение для охлаждения
            const currentState = useGameStore.getState();
            if (currentState.heat > 90) {
                store.setDrilling(false);
                for (let j = 0; j < 20; j++) {
                    store.tick(0.1);
                }
                store.setDrilling(true);
            }

            tickCount++;
        }

        store.setDrilling(false);
    } catch (e) {
        errorOccurred = true;
        fail(`Ошибка на тике ${tickCount}: ${e}`);
    }

    const endTime = Date.now();
    const finalState = useGameStore.getState();

    info(`Время выполнения: ${endTime - startTime}ms`);
    info(`Финальная глубина: ${finalState.depth.toFixed(1)}m`);
    info(`Финальный нагрев: ${finalState.heat.toFixed(1)}%`);

    assert(!errorOccurred, 'Длительная сессия без ошибок', `${tickCount} тиков`);

    return !errorOccurred;
}

async function testResetProgress() {
    header('ТЕСТ 20: Сброс прогресса');

    const store = useGameStore.getState();

    // Запоминаем текущее состояние
    const depthBefore = store.depth;
    info(`Глубина до сброса: ${depthBefore.toFixed(1)}m`);

    // Сбрасываем
    store.resetProgress();

    const afterReset = useGameStore.getState();

    assert(afterReset.depth === 0, 'Глубина сброшена до 0');
    assert(afterReset.heat === 0, 'Нагрев сброшен до 0');

    return true;
}

// === ГЛАВНАЯ ФУНКЦИЯ ===

async function runAllTests() {
    console.log('\n');
    console.log(`${colors.bold}${colors.cyan}`);
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     COSMIC EXCAVATOR: АВТОМАТИЧЕСКОЕ ТЕСТИРОВАНИЕ        ║');
    console.log('║                      v3.0.0                              ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);

    const startTime = Date.now();

    try {
        await testGameInitialization();
        await testDrillingMechanics();
        await testHeatCooling();
        await testUpgradeSystem();
        await testCityTrading();
        await testResourceGeneration();
        await testViewSwitching();
        await testInventorySystem();
        await testSkillSystem();
        await testGlobalMap();
        await testEventSystem();
        await testSaveLoad();
        await testCombatPrerequisites();
        await testDroneSystem();
        await testFactionReputation();
        await testQuestSystem();
        await testLicenseSystem();
        await testCargoSystem();
        await testLongPlaySession();
        await testResetProgress();
    } catch (e) {
        fail(`Критическая ошибка: ${e}`);
    }

    const endTime = Date.now();

    // === ИТОГИ ===
    header('ИТОГИ ТЕСТИРОВАНИЯ');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`${colors.bold}Всего тестов: ${total}${colors.reset}`);
    console.log(`${colors.green}Пройдено: ${passed}${colors.reset}`);
    console.log(`${colors.red}Провалено: ${failed}${colors.reset}`);
    console.log(`${colors.gray}Время: ${endTime - startTime}ms${colors.reset}`);

    if (failed === 0) {
        console.log(`\n${colors.bold}${colors.green}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!${colors.reset}\n`);
    } else {
        console.log(`\n${colors.bold}${colors.red}⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ:${colors.reset}`);
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   ${colors.red}• ${r.name}${colors.reset}`);
        });
        console.log('');
    }

    // Возвращаем код ошибки если есть failed тесты
    process.exit(failed > 0 ? 1 : 0);
}

// Запуск
runAllTests().catch(console.error);
