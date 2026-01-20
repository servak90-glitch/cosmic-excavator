
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useGameStore } from './store/gameStore';
import {
    useGameCore,
    useDrillState,
    useDrillActions,
    useCombatState,
    useCombatActions,
    useCityState,
    useCityActions,
    useSettingsActions,
    useAIState
} from './store/selectors';
import { View, Language } from './types';
import { calculateStats, calculateShieldRechargeCost, formatCompactNumber } from './services/gameMath';
import { BIOMES } from './constants';
import { audioEngine } from './services/audioEngine';
import { t, TEXT_IDS } from './services/localization';
import { useResponsive } from './services/hooks/useResponsive';

// Components
import DrillRenderer from './components/DrillRenderer';
import BossRenderer from './components/BossRenderer';
import PixiOverlay, { PixiOverlayHandle } from './components/PixiOverlay';
import FloatingTextOverlay, { FloatingTextHandle } from './components/FloatingTextOverlay';
import EventModal from './components/EventModal';
import ArtifactsView from './components/ArtifactsView';
import CityView from './components/CityView';
import SkillsView from './components/SkillsView';
import AICompanion from './components/AICompanion';
import SettingsModal from './components/SettingsModal';
import CodexView from './components/CodexView';
import CoolingMinigame from './components/CoolingMinigame';
import CombatMinigameOverlay from './components/CombatMinigameOverlay';
import HelpModal from './components/HelpModal';
import DevTools from './components/DevTools';
import ForgeView from './components/ForgeView';
import GameHeader from './components/layout/GameHeader';
import GameFooter from './components/layout/GameFooter';
import StatusStrip from './components/layout/StatusStrip';
import ActiveEffects from './components/layout/ActiveEffects';
import MenuOverlay from './components/MenuOverlay';
import CombatOverlay from './components/CombatOverlay';
import { GlobalMapView } from './components/GlobalMapView';

const GAME_VERSION = "v3.0.0 (MODULAR)";

const App: React.FC = () => {
    // --- OPTIMIZED STORE ACCESS (Grouped Selectors) ---
    const { isGameActive, activeView, settings, enterGame, manualLoad, tick } = useGameCore();
    const lang = settings.language;

    const { depth, heat, shieldCharge, resources, drill, xp, integrity } = useDrillState();
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
    const [showFirstRunModal, setShowFirstRunModal] = useState(false);
    const [logs, setLogs] = useState<{ msg: string, color?: string }[]>([
        { msg: t(TEXT_IDS.AI_INIT, lang), color: 'text-zinc-400' }
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
    const addLog = useCallback((msg: string, color?: string) => {
        setLogs(prev => [...prev.slice(-12), {
            msg: `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${msg}`,
            color
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
                if (e.type === 'LOG') addLog(e.msg, e.color);
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
                        y = window.innerHeight * 0.35 + 100; // Below center
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
    const stats = useMemo(() => calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth), [drill, skillLevels, equippedArtifacts, inventory, depth]);
    const forgeStats = { prod: drill.power.baseStats.energyOutput, cons: stats.energyCons };
    const energyLoad = forgeStats.prod > 0 ? (forgeStats.cons / forgeStats.prod) * 100 : 100;
    const isLowPower = energyLoad > 100;

    // Interaction Logic
    const handleDrillStart = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        if (e.cancelable) e.preventDefault();

        if (isLowPower) {
            let x = 0, y = 0;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = (e as React.MouseEvent).clientX;
                y = (e as React.MouseEvent).clientY;
            }
            textRef.current?.addText(x, y - 50, "ПЕРЕГРУЗКА!", "DAMAGE");
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
                    </div>
                )}
            </div>

            {/* --- LAYER 2: UI (Z-10) --- */}
            <div className="absolute inset-0 z-10 flex flex-col pointer-events-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

                {/* NEW HEADER & STATUS STRIP */}
                <GameHeader onOpenMenu={() => setIsMenuOpen(true)} />

                {/* Mobile Menu Trigger (убрано, т.к. GameHeader всегда виден) */}

                {(activeView === View.DRILL || activeView === View.COMBAT) && <StatusStrip />}
                <ActiveEffects />

                {/* MAIN VIEWPORT */}
                <div className="flex-1 relative min-h-0 pointer-events-none">

                    {/* DRILL HUD */}
                    {activeView === View.DRILL && (
                        <>
                            {/* AMBIENT TICKER PLACEHOLDER (To be implemented next) */}
                            <div className="absolute top-2 left-0 right-0 h-6 flex justify-center items-center pointer-events-none opacity-80">
                                {/* Future Ticker Location */}
                            </div>

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

                            {/* DRILL BUTTON */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center justify-center">
                                <button
                                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center pixel-text text-sm md:text-lg font-black tracking-widest transition-transform active:scale-95 touch-none select-none relative
                                ${isLowPower
                                            ? 'bg-zinc-900 border-orange-600 text-orange-500 cursor-not-allowed opacity-90 animate-pulse'
                                            : isOverheated
                                                ? 'bg-zinc-800 border-red-900 text-red-500 cursor-not-allowed opacity-80'
                                                : heat > 90
                                                    ? 'bg-red-900 border-red-500 text-red-100 animate-pulse'
                                                    : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-cyan-500 hover:text-white'}
                                ${isDrilling && !isOverheated && !isLowPower ? 'scale-95 border-cyan-400 text-cyan-400 bg-zinc-900 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : ''}
                            `}
                                    onPointerDown={handleDrillStart}
                                    onPointerUp={handleDrillEnd}
                                    onPointerLeave={handleDrillEnd}
                                >
                                    {isLowPower ? 'ПЕРЕГРУЗКА!' : isOverheated ? 'ОСТЫВАНИЕ' : (heat > 90 ? '!!!' : 'БУРИТЬ')}

                                    {/* SHIELD CAPACITOR INDICATOR (RING) */}
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

                    {/* FULL SCREENS */}
                    <div className={`w-full h-full ${isNavOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                        {activeView === View.FORGE && <ForgeView />}
                        {activeView === View.CITY && (
                            <CityView
                                biome={currentBiome} resources={resources} heat={heat} integrity={integrity} maxIntegrity={stats.integrity} xp={xp} depth={depth}
                                onTrade={tradeCity} onHeal={healCity} onRepair={repairHull}
                            />
                        )}
                        {activeView === View.SKILLS && <SkillsView />}
                        {activeView === View.ARTIFACTS && <ArtifactsView />}
                        {activeView === View.CODEX && <CodexView discoveredArtifacts={discoveredArtifacts} />}
                        {activeView === View.GLOBAL_MAP && <GlobalMapView />}
                    </div>
                </div>

                <GameFooter logs={logs} />
            </div>

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

            {!isGameActive && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold"
                        >
                            {t(TEXT_IDS.MANUAL_BUTTON, lang)}
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold">{t(TEXT_IDS.SETTINGS_BUTTON, lang)}</button>
                        {(['RU', 'EN'] as Language[]).map(l => (
                            <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-2 border text-xs font-bold ${lang === l ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'border-zinc-700 text-zinc-500 hover:text-white'}`}>{l}</button>
                        ))}
                    </div>
                    <h1 className="text-2xl md:text-5xl mb-4 text-center px-4 leading-tight pixel-text text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">COSMIC<br /><span className="text-cyan-400">EXCAVATOR</span></h1>

                    <div className="max-w-md px-4 text-center mb-8">
                        <p className="text-[10px] md:text-xs text-red-500 font-mono border border-red-900 bg-red-950/20 p-2 animate-pulse">
                            {t(TEXT_IDS.HARDCORE_WARNING, lang)}
                        </p>
                    </div>

                    <div className="text-zinc-500 font-mono text-xs mb-8">{GAME_VERSION}</div>

                    <button onClick={handleInitClick} className="px-8 py-4 bg-white text-black font-black text-xl hover:bg-cyan-400 transition-colors pixel-text">{t(TEXT_IDS.INIT_BUTTON, lang)}</button>
                </div>
            )}

            {showFirstRunModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-6">
                    <div className="max-w-md w-full border-2 border-red-600 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(255,0,0,0.3)]">
                        <h2 className="text-red-500 font-black pixel-text text-lg mb-4 flex items-center gap-2">
                            <span>⚠️</span> {t(TEXT_IDS.FIRST_RUN_TITLE, lang)}
                        </h2>
                        <p className="text-white font-mono text-sm leading-relaxed mb-6">
                            {t(TEXT_IDS.FIRST_RUN_BODY, lang)}
                        </p>
                        <button
                            onClick={handleFirstRunConfirm}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-black font-black pixel-text text-sm transition-colors"
                        >
                            {t(TEXT_IDS.BTN_ACKNOWLEDGE, lang)}
                        </button>
                    </div>
                </div>
            )}

            {isSettingsOpen && <SettingsModal settings={settings} onClose={() => setIsSettingsOpen(false)} onUpdateSettings={updateSettings} onResetProgress={resetProgress} language={lang} onSetLanguage={setLanguage} />}
            {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
        </div>
    );
};

export default App;
