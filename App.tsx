
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useGameStore } from './store/gameStore';
import {
    useGameCore,
    useDrillStats,
    useDrillDynamic,
    useDrillActions,
    useCombatState,
    useCombatActions,
    useCityState,
    useCityActions,
    useSettingsActions,
    useAIState,
    useStatsProperty
} from './store/selectors';
import { View, Language } from './types';
import { calculateStats, calculateShieldRechargeCost, formatCompactNumber, calculateTotalFuel } from './services/gameMath';
import { BIOMES } from './constants';
import { audioEngine } from './services/audioEngine';
import { t, TEXT_IDS } from './services/localization';
import { useResponsive } from './services/hooks/useResponsive';
import { AlertTriangle } from 'lucide-react';

// Components
import DrillRenderer from './components/DrillRenderer';
import BossRenderer from './components/BossRenderer';
import BossOverlay from './components/BossOverlay';
import PixiOverlay, { PixiOverlayHandle } from './components/PixiOverlay';
import FloatingTextOverlay, { FloatingTextHandle } from './components/FloatingTextOverlay';
import RootLayout from './components/layout/RootLayout';
import NavigationManager from './components/navigation/NavigationManager';
import OverlayManager from './components/overlays/OverlayManager';
import EventModal from './components/EventModal';
import SkillsView from './components/SkillsView';
import AICompanion from './components/AICompanion';
import SettingsModal from './components/SettingsModal';
import CodexView from './components/CodexView';
import CoolingMinigame from './components/CoolingMinigame';
import CombatMinigameOverlay from './components/CombatMinigameOverlay';
import HelpModal from './components/HelpModal';
import DevTools from './components/DevTools';
import GameHeader, { RareResourcesMenu } from './components/layout/GameHeader';
import GameFooter from './components/layout/GameFooter';
import StatusStrip from './components/layout/StatusStrip';
import ActiveEffects from './components/layout/ActiveEffects';
import MenuOverlay from './components/MenuOverlay';
import CombatOverlay from './components/CombatOverlay';
import { GlobalMapView } from './components/GlobalMapView';
import { EquipmentInventoryView } from './components/EquipmentInventoryView';
import { QuickAccessBar } from './components/QuickAccessBar';
import { PredictionAlert } from './components/PredictionAlert';
import { DrillStatsPanel } from './components/DrillStatsPanel';

const GAME_VERSION = "v5.1.0 (VISUAL REVOLUTION)";

const TravelProgressMini = ({ travel, lang }: { travel: any, lang: string }) => {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - travel.startTime;
            const p = Math.min(100, (elapsed / travel.duration) * 100);
            const remaining = Math.max(0, travel.duration - elapsed);
            setProgress(p);
            setTimeLeft(Math.ceil(remaining / 1000));
        }, 100);
        return () => clearInterval(interval);
    }, [travel]);

    return (
        <div className="w-48 p-2 bg-gray-900/90 border border-cyan-500 rounded shadow-[0_0_10px_rgba(6,182,212,0.3)] backdrop-blur-sm">
            <div className="flex justify-between text-[8px] text-cyan-400 font-bold mb-1 uppercase tracking-wider">
                <span>{lang === 'RU' ? 'В ПУТИ' : 'IN TRANSIT'}</span>
                <span>{timeLeft}s</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const TunnelAtmosphereOverlay = ({ type }: { type: string }) => {
    const theme = {
        SAFE: { color: 'rgba(234, 179, 8, 0.1)', shadow: 'rgba(234, 179, 8, 0.3)' },
        RISKY: { color: 'rgba(239, 68, 68, 0.15)', shadow: 'rgba(239, 68, 68, 0.4)' },
        CRYSTAL: { color: 'rgba(168, 85, 247, 0.2)', shadow: 'rgba(168, 85, 247, 0.5)' },
        MINE: { color: 'rgba(161, 157, 148, 0.15)', shadow: 'rgba(161, 157, 148, 0.3)' },
        NEST: { color: 'rgba(34, 197, 94, 0.2)', shadow: 'rgba(34, 197, 94, 0.5)' },
    }[type] || { color: 'transparent', shadow: 'transparent' };

    return (
        <div
            className="fixed inset-0 z-[55] pointer-events-none transition-colors duration-1000"
            style={{
                boxShadow: `inset 0 0 100px 30px ${theme.shadow}`,
                backgroundColor: theme.color
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
    );
};

const SideTunnelProgressMini = ({ tunnel, lang }: { tunnel: any, lang: string }) => {
    const progress = (tunnel.progress / tunnel.maxProgress) * 100;

    return (
        <div className="w-48 p-2 bg-zinc-900/90 border border-yellow-500 rounded shadow-[0_0_10px_rgba(234,179,8,0.3)] backdrop-blur-sm">
            <div className="flex justify-between text-[8px] text-yellow-500 font-bold mb-1 uppercase tracking-wider">
                <span>{typeof tunnel.name === 'object' ? (tunnel.name as any)[lang] || tunnel.name.EN : tunnel.name}</span>
                <span>{Math.floor(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,1)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};


const App: React.FC = () => {
    // --- ATOMIC STORE ACCESS (Phase 4.1 Stability) ---
    // Используем точечные селекторы для функций, чтобы они были 100% стабильны
    const isGameActive = useGameStore(s => s.isGameActive);
    const activeView = useGameStore(s => s.activeView);
    // Атомарная подписка на язык, чтобы не ререндерить App при смене других настроек
    const lang = useGameStore(s => s.settings.language);
    const settings = useGameStore(s => s.settings);
    const isZeroWeight = useGameStore(s => s.isZeroWeight);
    const isInfiniteEnergy = useGameStore(s => s.isInfiniteEnergy);

    const enterGame = useGameStore(s => s.enterGame);
    const manualLoad = useGameStore(s => s.manualLoad);
    const tick = useGameStore(s => s.tick);

    // Групповые селекторы для статических данных (useShallow внутри selectors.ts)
    const { drill, resources, xp, integrity, currentCargoWeight, sideTunnel } = useDrillStats();
    // Извлекаем только нужные поля из stats атомарно, чтобы App не ререндерился на каждом тике
    const totalCargoCapacity = useStatsProperty('totalCargoCapacity');
    const energyProd = useStatsProperty('energyProd');
    const energyCons = useStatsProperty('energyCons');
    const maxIntegrity = useStatsProperty('integrity');

    const { depth, heat, shieldCharge } = useDrillDynamic();
    const { isDrilling, isOverheated, setDrilling, manualClick, manualRechargeShield } = useDrillActions();

    const { currentBoss, combatMinigame, eventQueue, isCoolingGameActive, clickFlyingObject } = useCombatState();
    const { handleEventOption, completeCombatMinigame, setCoolingGame, forceVentHeat, triggerOverheat } = useCombatActions();

    const { skillLevels, equippedArtifacts, inventory, discoveredArtifacts } = useCityState();
    const { tradeCity, healCity, repairHull } = useCityActions();

    const { setLanguage, updateSettings, resetProgress, selectBiome, selectedBiome } = useSettingsActions();
    const { aiState } = useAIState();


    // --- LOCAL STATE ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false); // NEW: Equipment Inventory
    const [isRareOpen, setIsRareOpen] = useState(false);
    const [showFirstRunModal, setShowFirstRunModal] = useState(false);
    const [activePredictions, setActivePredictions] = useState<Array<{
        id: string;
        eventTitle: string;
        eventType: string;
        timeRemaining: number;
        detailLevel: 'BASIC' | 'MEDIUM' | 'FULL';
    }>>([]);
    const [logs, setLogs] = useState<{ msg: string; color?: string; icon?: string; detail?: string; timestamp?: string }[]>([
        { msg: t(TEXT_IDS.AI_INIT, lang), color: 'text-zinc-400', icon: '🤖', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    ]);
    const [bossHitEffect, setBossHitEffect] = useState(false);
    const [visualEffect, setVisualEffect] = useState<string>('NONE'); // VisualEffectType
    const [screenShake, setScreenShake] = useState<{ intensity: number, duration: number, startTime: number } | null>(null);
    const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

    // Screen Shake Loop
    useEffect(() => {
        if (!screenShake) return;
        let animId: number;
        const animate = () => {
            const now = Date.now();
            const elapsed = now - screenShake.startTime;
            if (elapsed > screenShake.duration) {
                setScreenShake(null);
                setShakeOffset({ x: 0, y: 0 });
                return;
            }
            const decay = 1 - (elapsed / screenShake.duration);
            const intensity = screenShake.intensity * decay;
            setShakeOffset({
                x: (Math.random() - 0.5) * intensity,
                y: (Math.random() - 0.5) * intensity
            });
            animId = requestAnimationFrame(animate);
        };
        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [screenShake]);

    // Refs
    const pixiOverlayRef = useRef<PixiOverlayHandle>(null);
    const textRef = useRef<FloatingTextHandle>(null);

    // Log Handler
    const addLog = useCallback((msg: string, color?: string, icon?: string, detail?: string) => {
        setLogs(prev => [...prev.slice(-15), {
            msg,
            color,
            icon,
            detail,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
    }, []);

    // --- INITIAL LOAD ---
    useEffect(() => {
        manualLoad();
    }, [manualLoad]);


    // --- GAME LOOP (LOGIC: 10FPS) ---
    useEffect(() => {
        if (!isGameActive) return;

        let lastTime = Date.now();
        const interval = setInterval(() => {
            const now = Date.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // Cap dt to prevent huge jumps if tab was inactive
            const safeDt = Math.min(dt, 0.5);

            const events = tick(safeDt);
            // ... process events ...
            events.forEach(e => {
                if (e.type === 'LOG') addLog(e.msg, e.color, e.icon, e.detail);
                else if (e.type === 'TEXT') {
                    let x = e.x || window.innerWidth / 2;
                    let y = e.y || window.innerHeight / 2;
                    if (e.position === 'CENTER') {
                        x = window.innerWidth / 2 + (Math.random() - 0.5) * 100; // Slight spread
                        y = window.innerHeight * 0.4;
                    }
                    if (e.position === 'TOP_CENTER') {
                        x = window.innerWidth / 2;
                        y = window.innerHeight * 0.2;
                    }
                    textRef.current?.addText(x, y, e.text, e.style);
                }
                else if (e.type === 'PARTICLE') {
                    let x = e.x || window.innerWidth / 2;
                    let y = e.y || window.innerHeight / 2;
                    // Drill tip is roughly at center X, 35% height + spread
                    if (e.position === 'DRILL_TIP') {
                        x = window.innerWidth / 2;
                        y = window.innerHeight * 0.35 + 205; // Calibrated for 0.45 scale
                    }
                    pixiOverlayRef.current?.emitParticle(x, y, e.color, e.kind, e.count);
                }
                else if (e.type === 'BOSS_HIT') { setBossHitEffect(true); setTimeout(() => setBossHitEffect(false), 100); }
                else if (e.type === 'VISUAL_EFFECT') {
                    setVisualEffect(e.option);
                    setTimeout(() => setVisualEffect('NONE'), 600);
                }
                else if (e.type === 'SCREEN_SHAKE') {
                    setScreenShake({ intensity: e.intensity, duration: e.duration, startTime: Date.now() });
                }
                else if (e.type === 'PREDICTION') {
                    setActivePredictions(prev => [...prev, {
                        id: `pred_${Date.now()}_${Math.random()}`,
                        eventTitle: e.eventTitle,
                        eventType: e.eventType,
                        timeRemaining: e.timeRemaining,
                        detailLevel: e.detailLevel
                    }]);
                }
                else if (e.type === 'SOUND') {
                    if (e.sfx === 'LOG') audioEngine.playLog();
                    if (e.sfx === 'GLITCH') audioEngine.playGlitch();
                    if (e.sfx === 'ACHIEVEMENT') audioEngine.playAchievement();
                    if (e.sfx === 'RAID_ALARM') audioEngine.playRaidAlarm();
                    if (e.sfx === 'RAID_SUCCESS') audioEngine.playRaidRepelled();
                    if (e.sfx === 'RAID_FAILURE') audioEngine.playRaidBreeched();
                    if (e.sfx === 'MARKET_TRADE') audioEngine.playMarketTrade();
                }
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isGameActive, tick, addLog]);

    const handleInitClick = async () => {
        try { await audioEngine.init(settings.musicVolume, settings.sfxVolume, settings.drillVolume, settings.musicMuted, settings.sfxMuted, settings.drillMuted); } catch (e) { console.warn(e); }

        const hasSeenDisclaimer = localStorage.getItem('HAS_SEEN_HARDCORE_DISCLAIMER');

        if (!hasSeenDisclaimer) {
            setShowFirstRunModal(true);
        } else {
            startActualGame();
        }
    };

    const handleFirstRunConfirm = () => {
        localStorage.setItem('HAS_SEEN_HARDCORE_DISCLAIMER', 'true');
        setShowFirstRunModal(false);
        startActualGame();
    };

    const startActualGame = () => {
        setLogs([{ msg: t(TEXT_IDS.AI_INIT, lang), color: 'text-zinc-400' }]);
        addLog(t(TEXT_IDS.AI_READY, lang));
        enterGame();

        // Попытка войти в полноэкранный режим на мобильных
        if (window.innerWidth < 1024) {
            try {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => { });
                }
            } catch (e) { }
        }
    };

    // Используем новый централизованный хук для responsive
    const { isMobile, isTablet, isTouchDevice } = useResponsive();

    // Авто-скрытие адресной панели (старый метод)
    useEffect(() => {
        if (isMobile) {
            window.scrollTo(0, 1);
        }
    }, [isMobile]);

    // [DEV_CONTEXT: HARDCORE MATH] Added depth to stats calc
    // stats is now replaced by atomic properties (Phase 4.1)
    const forgeStats = { prod: drill.power.baseStats.energyOutput, cons: energyCons };
    const energyLoad = forgeStats.prod > 0 ? (forgeStats.cons / forgeStats.prod) * 100 : 100;
    const isLowPower = energyLoad > 100 && !isInfiniteEnergy;

    // Interaction Logic
    const handleDrillStart = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        if (e.cancelable) e.preventDefault();

        // energyProd and totalCargoCapacity are already available from useStatsProperty (Phase 4.1)
        const energyLoadValue = energyProd > 0 ? (energyCons / energyProd) * 100 : 100;
        const isCargoFull = currentCargoWeight > totalCargoCapacity && !isZeroWeight;
        const totalFuel = calculateTotalFuel(resources);

        if (totalFuel < 1) {
            let x = 0, y = 0;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = (e as React.MouseEvent).clientX;
                y = (e as React.MouseEvent).clientY;
            }
            textRef.current?.addText(x, y - 50, "НЕТ ТОПЛИВА!", "DAMAGE");
            audioEngine.playError();
            return;
        }

        if ((energyLoadValue > 100 && !isInfiniteEnergy) || isCargoFull) {
            let x = 0, y = 0;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = (e as React.MouseEvent).clientX;
                y = (e as React.MouseEvent).clientY;
            }
            textRef.current?.addText(x, y - 50, (energyLoadValue > 100 && !isInfiniteEnergy) ? "ПЕРЕГРУЗКА!" : "СКЛАД ПОЛОН!", "DAMAGE");
            audioEngine.playError();
            return;
        }

        if (isOverheated) {
            let x = 0, y = 0;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = (e as React.MouseEvent).clientX;
                y = (e as React.MouseEvent).clientY;
            }
            textRef.current?.addText(x, y - 50, "ПЕРЕГРЕВ!", "DAMAGE");
            audioEngine.playError();
            return;
        }

        const travel = useGameStore.getState().travel;
        if (travel) {
            let x = 0, y = 0;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = (e as React.MouseEvent).clientX;
                y = (e as React.MouseEvent).clientY;
            }
            textRef.current?.addText(x, y - 50, lang === 'RU' ? "В ПУТИ!" : "IN TRANSIT!", "INFO");
            audioEngine.playError();
            return;
        }

        setDrilling(true);
        manualClick();
    };

    const handleDrillEnd = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        if (e.cancelable) e.preventDefault();
        setDrilling(false);
    };
    const availableBiomes = useMemo(() => BIOMES.filter(b => depth >= b.depth), [depth]);
    const currentBiome = selectedBiome
        ? BIOMES.find(b => (typeof b.name === 'string' ? b.name : b.name.EN) === selectedBiome) || BIOMES[0]
        : BIOMES.slice().reverse().find(b => depth >= b.depth) || BIOMES[0];

    const isNavOpen = activeView !== View.DRILL && activeView !== View.COMBAT;

    // [DEV_CONTEXT: SHIELD]
    const rechargeCost = calculateShieldRechargeCost(depth);
    const canAffordRecharge = resources[rechargeCost.resource] >= rechargeCost.cost;

    return (
        <div className="relative w-full h-full bg-black overflow-hidden font-mono select-none">

            <FloatingTextOverlay ref={textRef} />
            <DevTools />

            {/* --- LAYER 1: WORLD (Z-0) --- */}
            <div
                className="absolute inset-0 z-0 pointer-events-auto transition-transform duration-75 ease-linear"
                style={{ transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` }}
            >
                {activeView === View.DRILL && (
                    <div className="relative w-full h-full">
                        <PixiOverlay
                            ref={pixiOverlayRef}
                            onObjectClick={clickFlyingObject}
                            onDrillClick={() => { }}
                            visualEffect={visualEffect}
                        />
                        <DrillRenderer />
                    </div>
                )}

                {activeView === View.COMBAT && currentBoss && (
                    <div className="relative w-full h-full">
                        <PixiOverlay
                            ref={pixiOverlayRef}
                            onObjectClick={clickFlyingObject}
                            onDrillClick={() => { }}
                            visualEffect={visualEffect}
                        />
                        <BossRenderer
                            isHit={bossHitEffect}
                            visualEffect={visualEffect}
                        />
                        <BossOverlay onWeakPointClick={(wpId) => useGameStore.getState().hitWeakPoint(wpId)} />
                    </div>
                )}
            </div>

            {/* --- LAYER 2: UI (Z-10) --- */}
            <RootLayout
                activeView={activeView}
                logs={logs}
                onOpenMenu={() => setIsMenuOpen(true)}
                onOpenInventory={() => setIsInventoryOpen(true)}
                onOpenRare={() => setIsRareOpen(!isRareOpen)}
                isRareOpen={isRareOpen}
                resources={resources}
                discoveredArtifactsCount={discoveredArtifacts.length}
                lang={lang}
            >
                {/* DRILL HUD */}
                {activeView === View.DRILL && (
                    <>
                        <div className="absolute top-8 left-2 z-30 pointer-events-auto">
                            <div className="text-2xl md:text-6xl font-black text-white/90 drop-shadow-md font-mono">{Math.floor(depth)}<span className="text-sm md:text-2xl text-zinc-400 ml-1 md:ml-2">m</span></div>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="text-[10px] md:text-xs font-bold text-zinc-400 bg-black/50 px-2 py-1 inline-block border-l-2" style={{ borderColor: currentBiome.color }}>
                                    {t(currentBiome.name, lang)}
                                </div>
                                {availableBiomes.length > 1 && (
                                    <select
                                        value={selectedBiome || ''}
                                        onChange={(e) => selectBiome(e.target.value || null)}
                                        className="bg-black/50 text-white text-[9px] border border-zinc-700 px-1 py-1 font-mono outline-none"
                                    >
                                        <option value="">АВТО</option>
                                        {availableBiomes.map(b => <option key={typeof b.name === 'string' ? b.name : b.name.EN} value={typeof b.name === 'string' ? b.name : b.name.EN}>{t(b.name, lang)}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="pointer-events-auto"><AICompanion state={aiState} heat={heat} /></div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center justify-center">
                            <button
                                className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center pixel-text text-sm md:text-lg font-black tracking-widest transition-transform active:scale-95 touch-none select-none relative
                                ${isLowPower || (currentCargoWeight > totalCargoCapacity && !isZeroWeight)
                                        ? 'bg-zinc-900 border-orange-600 text-orange-500 cursor-not-allowed opacity-90 animate-pulse'
                                        : isOverheated
                                            ? 'bg-zinc-800 border-red-900 text-red-500 cursor-not-allowed opacity-80'
                                            : calculateTotalFuel(resources) < 1
                                                ? 'bg-zinc-900 border-orange-700 text-orange-600 animate-pulse cursor-not-allowed'
                                                : heat > 90
                                                    ? 'bg-red-900 border-red-500 text-red-100 animate-pulse'
                                                    : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-cyan-500 hover:text-white'}
                                ${isDrilling && !isOverheated && !isLowPower ? 'scale-95 border-cyan-400 text-cyan-400 bg-zinc-900 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : ''}
                            `}
                                onPointerDown={handleDrillStart}
                                onPointerUp={handleDrillEnd}
                                onPointerLeave={handleDrillEnd}
                            >
                                {calculateTotalFuel(resources) < 1 ? 'НЕТ ТОПЛИВА' : isLowPower ? 'ПЕРЕГРУЗКА!' : (currentCargoWeight > totalCargoCapacity && !isZeroWeight) ? 'СКЛАД ПОЛОН' : isOverheated ? 'ОСТЫВАНИЕ' : (heat > 90 ? '!!!' : 'БУРИТЬ')}

                                <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90 scale-110" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="#222" strokeWidth="3" />
                                    <circle
                                        cx="50" cy="50" r="48" fill="none"
                                        stroke={shieldCharge < 25 ? '#ef4444' : isDrilling ? '#22c55e' : '#3b82f6'}
                                        strokeWidth="3"
                                        strokeDasharray="301.59"
                                        strokeDashoffset={301.59 * (1 - shieldCharge / 100)}
                                        className="transition-all duration-100"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className={`absolute ${isMobile ? 'bottom-4 left-4' : 'bottom-4 left-4'} z-40 pointer-events-auto`}>
                            <QuickAccessBar orientation={isMobile ? 'vertical' : 'horizontal'} />
                        </div>

                        <DrillStatsPanel />

                        <CoolingMinigame isVisible={isCoolingGameActive} heat={heat} onSuccess={(amount) => forceVentHeat(amount)} onFail={triggerOverheat} onClose={() => setCoolingGame(false)} />
                    </>
                )}

                {/* COMBAT HUD */}
                {activeView === View.COMBAT && currentBoss && (
                    <CombatOverlay
                        onDrillStart={handleDrillStart}
                        onDrillEnd={handleDrillEnd}
                        onRechargeShield={manualRechargeShield}
                    />
                )}

                <NavigationManager
                    activeView={activeView}
                    lang={lang}
                    currentBiome={currentBiome}
                    resources={resources}
                    heat={heat}
                    integrity={integrity}
                    maxIntegrity={maxIntegrity}
                    xp={xp}
                    depth={depth}
                    discoveredArtifacts={discoveredArtifacts}
                    onTrade={tradeCity}
                    onHeal={healCity}
                    onRepair={repairHull}
                />
            </RootLayout>

            {/* --- LAYER 3: OVERLAYS (Z-50+) --- */}
            {combatMinigame && combatMinigame.active && <CombatMinigameOverlay type={combatMinigame.type} difficulty={combatMinigame.difficulty} onComplete={completeCombatMinigame} />}
            {eventQueue.length > 0 && <EventModal event={eventQueue[0]} onOptionSelect={handleEventOption} />}

            {/* MENUS */}
            <MenuOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenHelp={() => setIsHelpOpen(true)}
            />

            <OverlayManager
                eventQueue={eventQueue}
                combatMinigame={combatMinigame}
                isMenuOpen={isMenuOpen}
                isSettingsOpen={isSettingsOpen}
                isHelpOpen={isHelpOpen}
                isInventoryOpen={isInventoryOpen}
                isRareOpen={isRareOpen}
                settings={settings}
                lang={lang}
                resources={resources}
                discoveredArtifacts={discoveredArtifacts}
                onOptionSelect={handleEventOption}
                onCompleteMinigame={completeCombatMinigame}
                onCloseMenu={() => setIsMenuOpen(false)}
                onCloseSettings={() => setIsSettingsOpen(false)}
                onCloseHelp={() => setIsHelpOpen(false)}
                onCloseInventory={() => setIsInventoryOpen(false)}
                onCloseRare={() => setIsRareOpen(false)}
                onUpdateSettings={updateSettings}
                onResetProgress={resetProgress}
                onSetLanguage={setLanguage}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenHelp={() => setIsHelpOpen(true)}
            />

            {/* Splash Screens */}
            {!isGameActive && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-void overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className="text-5xl md:text-8xl font-black text-center leading-[0.85] font-technical tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            COSMIC<br /><span className="neon-text-cyan tracking-[-0.05em]">EXCAVATOR</span>
                        </h1>
                        <button onClick={handleInitClick} className="mt-12 group relative px-12 py-5 bg-transparent overflow-hidden active:scale-95 transition-transform">
                            <div className="absolute inset-0 bg-cyan-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            <div className="absolute inset-0 border-2 border-cyan-500 group-hover:border-white transition-colors duration-500" />
                            <span className="relative z-10 text-cyan-500 group-hover:text-black font-black font-technical text-2xl tracking-[0.2em] uppercase transition-colors duration-500">
                                {t(TEXT_IDS.INIT_BUTTON, lang)}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {showFirstRunModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-void/90 p-6">
                    <div className="max-w-md w-full glass-panel border-rose-500/30 p-8 shadow-[0_0_100px_rgba(244,63,94,0.1)] relative overflow-hidden">
                        <h2 className="text-rose-500 font-black font-technical text-2xl mb-6 flex items-center gap-3 uppercase tracking-tighter">
                            <AlertTriangle className="w-8 h-8" /> {t(TEXT_IDS.FIRST_RUN_TITLE, lang)}
                        </h2>
                        <p className="text-white font-mono text-sm leading-relaxed mb-8 opacity-90">
                            {t(TEXT_IDS.FIRST_RUN_BODY, lang)}
                        </p>
                        <button onClick={handleFirstRunConfirm} className="w-full py-5 bg-rose-600 text-white font-black font-technical text-sm tracking-[0.3em] uppercase">
                            {t(TEXT_IDS.BTN_ACKNOWLEDGE, lang)}
                        </button>
                    </div>
                </div>
            )}

            {activePredictions.map(pred => (
                <PredictionAlert key={pred.id} eventTitle={pred.eventTitle} eventType={pred.eventType} timeRemaining={pred.timeRemaining} detailLevel={pred.detailLevel} onDismiss={() => setActivePredictions(prev => prev.filter(p => p.id !== pred.id))} />
            ))}

            {sideTunnel && activeView === View.DRILL && (
                <>
                    <TunnelAtmosphereOverlay type={sideTunnel.type} />
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60]"><SideTunnelProgressMini tunnel={sideTunnel} lang={lang} /></div>
                </>
            )}

            {useGameStore(s => s.travel) && activeView !== View.GLOBAL_MAP && (
                <div className="fixed top-36 left-1/2 -translate-x-1/2 z-[60]"><TravelProgressMini travel={useGameStore(s => s.travel)!} lang={lang} /></div>
            )}

            {/* Global Modals that are not yet in OverlayManager (if any) */}
            {isSettingsOpen && <SettingsModal settings={settings} onClose={() => setIsSettingsOpen(false)} onUpdateSettings={updateSettings} onResetProgress={resetProgress} language={lang} onSetLanguage={setLanguage} />}
            {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
            {isInventoryOpen && <EquipmentInventoryView onClose={() => setIsInventoryOpen(false)} />}

            <RareResourcesMenu
                isOpen={isRareOpen}
                onClose={() => setIsRareOpen(false)}
                resources={resources}
                lang={lang}
            />
        </div>
    );
};

export default App;
