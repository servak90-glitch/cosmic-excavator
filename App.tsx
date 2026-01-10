
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, GameState, Resources, ResourceType, FlyingObject, DroneType, HullPart, DrillPart, EnginePart, CoolerPart, LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, ArtifactRarity, AIState, InventoryItem, Quest, VisualEffectType } from './types';
import { BIOMES, BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, DRONES, FUSION_RECIPES } from './constants';
import DrillRenderer from './components/DrillRenderer';
import BossRenderer from './components/BossRenderer'; 
import FlyingObjectsRenderer from './components/FlyingObjectsRenderer'; 
import ParticleRenderer, { ParticleHandle } from './components/ParticleRenderer'; 
import DroneRenderer from './components/DroneRenderer'; 
import FloatingTextOverlay, { FloatingTextHandle } from './components/FloatingTextOverlay';
import { audioEngine } from './services/audioEngine'; 
import { rollRandomEvent, createEffect } from './services/eventRegistry';
import { calculateSkillModifiers, getSkillCost, SKILLS } from './services/skillRegistry';
import { ARTIFACTS, rollArtifact, getArtifactColor } from './services/artifactRegistry';
import { generateQuestBatch } from './services/questRegistry';
import { generateBoss } from './services/bossRegistry'; 
import { narrativeManager } from './services/narrativeManager';
import EventModal from './components/EventModal';
import ArtifactsView from './components/ArtifactsView';
import CityView from './components/CityView';
import SkillsView from './components/SkillsView';
import AICompanion from './components/AICompanion';

const INITIAL_STATE: GameState = {
  depth: 0,
  resources: {
    clay: 0, stone: 0, copper: 0, iron: 0, silver: 0, gold: 0, titanium: 0, uranium: 0,
    nanoSwarm: 0, ancientTech: 0,
    rubies: 0, emeralds: 0, diamonds: 0 
  },
  heat: 0,
  integrity: 100, 
  drill: {
    bit: BITS[0],
    engine: ENGINES[0],
    cooling: COOLERS[0],
    hull: HULLS[0],
    logic: LOGIC_CORES[0],
    control: CONTROL_UNITS[0],
    gearbox: GEARBOXES[0],
    power: POWER_CORES[0],
    armor: ARMORS[0]
  },
  skillLevels: {},
  inventory: [],
  equippedArtifacts: [], 
  analyzer: { activeItemInstanceId: null, timeLeft: 0, maxTime: 0 },
  
  activeQuests: [],
  lastQuestRefresh: 0,

  artifacts: [],
  totalDrilled: 0,
  xp: 0,
  level: 1,
  activeEffects: [],
  eventQueue: [],
  recentEventIds: [],
  flyingObjects: [],
  
  currentBoss: null,
  lastBossDepth: 0,
  
  activeDrones: [],
  droneLevels: {
    COLLECTOR: 0,
    COOLER: 0,
    BATTLE: 0,
    REPAIR: 0,
    MINER: 0
  },

  storageLevel: 0,
  forgeUnlocked: false,
  cityUnlocked: false,
  skillsUnlocked: false,
  
  aiState: 'IDLE'
};

const COMMON_RESOURCES: (keyof Resources)[] = ['clay', 'stone', 'copper', 'iron', 'silver', 'gold'];
const RARE_RESOURCES: (keyof Resources)[] = ['titanium', 'uranium', 'nanoSwarm', 'ancientTech', 'rubies', 'emeralds', 'diamonds'];

const ResourceItem: React.FC<{ name: string; amount: number; label: string; color?: string; compact?: boolean }> = ({ amount, label, color, compact }) => (
  <div className={`flex flex-col items-center justify-center border-zinc-900 ${compact ? 'border-b py-2' : 'border-r px-1 py-1 min-w-[14%] md:min-w-[10%]'} bg-black/40 backdrop-blur-sm`}>
    <span className={`text-[6px] md:text-[8px] uppercase font-black truncate w-full text-center mb-0.5 ${color || 'text-zinc-500'}`}>{label}</span>
    <span className="text-[9px] md:text-xs font-black text-white font-mono">{Math.floor(amount).toLocaleString()}</span>
  </div>
);

// --- UPGRADE CARD ---
const UpgradeCard: React.FC<{
  title: string;
  current: any;
  next?: any;
  type: string;
  resources: Resources;
  onBuy: (type: string) => void;
}> = ({ title, current, next, type, resources, onBuy }) => {
  if (!next) return (
    <div className="bg-zinc-900 p-3 md:p-4 border border-zinc-800 opacity-50 flex flex-col justify-between min-h-[160px] md:min-h-[200px]">
       <div>
         <h3 className="text-zinc-500 font-bold mb-2 pixel-text text-xs md:text-sm">{title}</h3>
         <div className="text-[10px] md:text-xs text-zinc-600 font-mono mb-2">TIER {current.tier}</div>
         <p className="text-[10px] md:text-xs text-zinc-600">МАКСИМУМ</p>
       </div>
    </div>
  );

  const isFusionLocked = next.tier >= 13;
  const canAfford = !isFusionLocked && (Object.keys(next.cost) as (keyof Resources)[]).every(r => resources[r] >= (next.cost[r] || 0));

  return (
    <div className="bg-zinc-900 p-3 md:p-4 border border-zinc-700 flex flex-col justify-between min-h-[180px] md:min-h-[220px] hover:border-zinc-500 transition-colors group relative">
       <div>
          <h3 className="text-cyan-400 font-bold mb-1 pixel-text text-xs md:text-sm group-hover:text-white transition-colors truncate">{title}</h3>
          <div className="text-[9px] md:text-[10px] text-zinc-500 mb-2 font-mono">
            TIER {current.tier} <span className="text-zinc-300">➔ {next.tier}</span>
          </div>
          
          <div className="bg-black/50 p-2 mb-2 border border-zinc-800 min-h-[40px] md:min-h-[50px]">
             <p className="text-[9px] md:text-[10px] text-zinc-300 italic leading-tight">"{next.description}"</p>
             {/* Stat Preview with NEW Stats */}
             <div className="mt-1 text-[8px] md:text-[9px] text-green-400 font-mono grid grid-cols-2 gap-x-2">
                {next.baseStats.damage && <span>DMG: {next.baseStats.damage}</span>}
                {next.baseStats.speed && <span>SPD: {next.baseStats.speed}</span>}
                {next.baseStats.cooling && <span>COOL: {next.baseStats.cooling}</span>}
                {next.baseStats.energyOutput && <span>PWR: {next.baseStats.energyOutput}</span>}
                
                {/* Secondary Stats */}
                {next.baseStats.torque && <span className="text-amber-400">TRQ: {next.baseStats.torque}%</span>}
                {next.baseStats.regen && <span className="text-emerald-400">REG: {next.baseStats.regen}/s</span>}
                {next.baseStats.luck && <span className="text-purple-400">LCK: {next.baseStats.luck}%</span>}
                {next.baseStats.predictionTime ? <span className="text-pink-400">PRED: {next.baseStats.predictionTime}s</span> : null}
                {next.baseStats.ventSpeed && <span className="text-cyan-300">VNT: x{next.baseStats.ventSpeed}</span>}
                {next.baseStats.droneEfficiency && <span className="text-blue-400">DRN: x{next.baseStats.droneEfficiency}</span>}
                {next.baseStats.hazardResist && <span className="text-red-400">RES: {next.baseStats.hazardResist}%</span>}
                
                {next.baseStats.energyCost > 0 && <span className="text-red-500 col-span-2">⚡-{next.baseStats.energyCost}</span>}
             </div>
          </div>
          
          <div className="space-y-1 mb-3">
             {isFusionLocked ? (
                <div className="text-[10px] text-purple-400 font-bold font-mono py-2 text-center animate-pulse">ТРЕБУЕТСЯ СЛИЯНИЕ</div>
             ) : (
                (Object.keys(next.cost) as (keyof Resources)[]).map(res => (
                   <div key={res} className="flex justify-between text-[9px] md:text-[10px] font-mono border-b border-zinc-800/50 pb-0.5">
                      <span className="text-zinc-500 uppercase">{res}</span>
                      <span className={resources[res] >= (next.cost[res] || 0) ? 'text-green-400' : 'text-red-500'}>
                         {next.cost[res]?.toLocaleString()}
                      </span>
                   </div>
                ))
             )}
          </div>
       </div>
       
       <button 
         disabled={!canAfford}
         onClick={() => onBuy(type)}
         className={`w-full py-2 md:py-3 text-[10px] md:text-xs font-bold pixel-text transition-all border active:scale-95
            ${isFusionLocked
               ? 'bg-zinc-950 border-purple-900/50 text-zinc-600 cursor-not-allowed opacity-50'
               : canAfford 
                 ? 'bg-cyan-900/50 border-cyan-500 hover:bg-cyan-500 hover:text-black text-cyan-400' 
                 : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'}
         `}
       >
         {isFusionLocked ? 'ТОЛЬКО СЛИЯНИЕ' : canAfford ? 'УЛУЧШИТЬ' : 'НЕДОСТУПНО'}
       </button>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [activeView, setActiveView] = useState<View>(View.DRILL);
  const [isDrilling, setIsDrilling] = useState(false);
  const [isOverheated, setIsOverheated] = useState(false);
  const [isBroken, setIsBroken] = useState(false); 
  const [hasStarted, setHasStarted] = useState(false);
  const [bossHitEffect, setBossHitEffect] = useState(false); 
  const [isRareMenuOpen, setIsRareMenuOpen] = useState(false); 
  const [forgeTab, setForgeTab] = useState<'DRILL' | 'SYSTEMS' | 'HULL' | 'FUSION' | 'DRONES'>('DRILL'); 
  const [selectedArtifactsForFusion, setSelectedArtifactsForFusion] = useState<string[]>([]);
  
  const [logs, setLogs] = useState<{msg: string, color?: string}[]>([
    {msg: "СИСТЕМА ИНИЦИАЛИЗИРОВАНА..."}, 
    {msg: "ОЖИДАНИЕ КОМАНД..."}
  ]);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const eventCheckTickRef = useRef(0); 
  const hazardTickRef = useRef(0);
  const bossAttackTickRef = useRef(0); 
  const droneTickRef = useRef(0);
  const narrativeTickRef = useRef(0); // Timer for narrative
  const afkTimerRef = useRef(0);      // AFK Timer
  const lastInteractTimeRef = useRef(Date.now()); // Interaction tracker

  // --- FUSION CONDITION TRACKERS ---
  const heatStabilityTimerRef = useRef(0); // Counts seconds of heat < 1%
  const [heatStabilityDisplay, setHeatStabilityDisplay] = useState(0);

  const forgeUnlockTriggered = useRef(false);
  const cityUnlockTriggered = useRef(false);
  const skillsUnlockTriggered = useRef(false);
  const node2UnlockTriggered = useRef(false);
  
  // REFS
  const particleRef = useRef<ParticleHandle>(null);
  const textRef = useRef<FloatingTextHandle>(null); // Floating Text Ref
  const drillContainerRef = useRef<HTMLDivElement>(null); 

  const addLog = useCallback((msg: string, color?: string) => {
    setLogs(prev => [...prev.slice(-12), {
      msg: `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${msg}`,
      color
    }]);
  }, []);

  useEffect(() => {
    if (activeView === View.DRILL || activeView === View.COMBAT) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeView]);

  // RESET AFK TIMER ON ACTION
  const resetAFK = () => {
    lastInteractTimeRef.current = Date.now();
  };

  useEffect(() => {
    const handleUserActivity = () => resetAFK();
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    return () => {
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  // --- CRT DYNAMIC EFFECT ---
  useEffect(() => {
      // Calculate visual distortion parameters
      const aberration = Math.min(10, state.heat / 10) + (100 - state.integrity) / 20;
      const warp = (100 - state.integrity) / 1000;
      const opacity = 0.1 + (state.heat / 200);

      document.documentElement.style.setProperty('--crt-aberration', `${aberration}px`);
      document.documentElement.style.setProperty('--crt-warp', `${warp}deg`);
      document.documentElement.style.setProperty('--crt-scanline-opacity', `${opacity}`);
  }, [state.heat, state.integrity]);

  // --- SAVE SYSTEM INIT ---
  useEffect(() => {
    const savedData = localStorage.getItem('cosmic_excavator_save');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const mergedState = { ...INITIAL_STATE, ...parsed, drill: { ...INITIAL_STATE.drill, ...parsed.drill } };
        
        const restorePart = (part: any, list: any[]) => list.find(p => p.id === part.id) || list[0];
        mergedState.drill.bit = restorePart(mergedState.drill.bit, BITS);
        mergedState.drill.engine = restorePart(mergedState.drill.engine, ENGINES);
        mergedState.drill.cooling = restorePart(mergedState.drill.cooling, COOLERS);
        mergedState.drill.hull = restorePart(mergedState.drill.hull, HULLS);
        mergedState.drill.logic = restorePart(mergedState.drill.logic, LOGIC_CORES);
        mergedState.drill.control = restorePart(mergedState.drill.control, CONTROL_UNITS);
        mergedState.drill.gearbox = restorePart(mergedState.drill.gearbox, GEARBOXES);
        mergedState.drill.power = restorePart(mergedState.drill.power, POWER_CORES);
        mergedState.drill.armor = restorePart(mergedState.drill.armor, ARMORS);

        if (!mergedState.droneLevels) {
            mergedState.droneLevels = { COLLECTOR: 0, COOLER: 0, BATTLE: 0, REPAIR: 0, MINER: 0 };
            mergedState.activeDrones.forEach((d: string) => {
                if (d === 'COLLECTOR') mergedState.droneLevels.COLLECTOR = 1;
                if (d === 'COOLER') mergedState.droneLevels.COOLER = 1;
                if (d === 'BATTLE') mergedState.droneLevels.BATTLE = 1;
            });
        }
        
        if (!mergedState.recentEventIds) mergedState.recentEventIds = [];

        setState(mergedState);
        setLogs([{msg: "ПРОТОКОЛ 'ЧЕРНЫЙ ЯЩИК': ЗАГРУЗКА УСПЕШНА", color: "text-green-500"}]);
        if (parsed.forgeUnlocked) forgeUnlockTriggered.current = true;
        if (parsed.cityUnlocked) cityUnlockTriggered.current = true;
        if (parsed.skillsUnlocked) skillsUnlockTriggered.current = true;
        if (parsed.storageLevel > 1) node2UnlockTriggered.current = true;
      } catch (e) {
        console.error("Save file corrupted", e);
        addLog("ОШИБКА ЧТЕНИЯ ПАМЯТИ. СБРОС.", "text-red-500");
      }
    }

    const saveInt = window.setInterval(() => {
       setState(curr => {
          localStorage.setItem('cosmic_excavator_save', JSON.stringify(curr));
          return curr;
       });
    }, 5000);
    return () => clearInterval(saveInt);
  }, []);

  const handleHardReset = () => {
     if (window.confirm("ВНИМАНИЕ: ЭТО УНИЧТОЖИТ ВСЕ ДАННЫЕ И ПРОГРЕСС. ПРОДОЛЖИТЬ?")) {
        localStorage.removeItem('cosmic_excavator_save');
        window.location.reload();
     }
  };

  const startGame = async () => {
    try {
      await audioEngine.init();
      setHasStarted(true);
      addLog("ПИТАНИЕ ПОДАНО. БУР ГОТОВ К РАБОТЕ.");
    } catch (e) {
      setHasStarted(true);
    }
  };

  const getResourceLabel = (res: keyof Resources): string => { const labels: Record<string, string> = { clay: 'ГЛИНА', stone: 'КАМЕНЬ', copper: 'МЕДЬ', iron: 'ЖЕЛЕЗО', silver: 'СЕРЕБРО', gold: 'ЗОЛОТО', titanium: 'ТИТАН', uranium: 'УРАН', nanoSwarm: 'НАНО', ancientTech: 'TECH', rubies: 'РУБИН', emeralds: 'ИЗУМР', diamonds: 'АЛМАЗ' }; return labels[res] || res; };

  const calculateStats = (drill: typeof INITIAL_STATE.drill) => {
     const energyProd = drill.power.baseStats.energyOutput;
     const energyCons = drill.bit.baseStats.energyCost + drill.engine.baseStats.energyCost + drill.cooling.baseStats.energyCost + drill.logic.baseStats.energyCost + drill.control.baseStats.energyCost + drill.gearbox.baseStats.energyCost + drill.armor.baseStats.energyCost;
     const energyEfficiency = energyProd >= energyCons ? 1.0 : (energyProd / Math.max(1, energyCons));
     
     return {
        energyProd,
        energyCons,
        energyEfficiency,
        totalDamage: drill.bit.baseStats.damage * energyEfficiency,
        totalSpeed: drill.engine.baseStats.speed * energyEfficiency,
        totalCooling: drill.cooling.baseStats.cooling * energyEfficiency,
        torque: drill.gearbox.baseStats.torque || 0,
        critChance: drill.logic.baseStats.critChance,
        luck: drill.logic.baseStats.luck || 0,
        predictionTime: drill.logic.baseStats.predictionTime || 0,
        clickMult: drill.control.baseStats.clickMultiplier,
        ventSpeed: drill.control.baseStats.ventSpeed || 1.0,
        defense: drill.armor.baseStats.defense,
        hazardResist: drill.armor.baseStats.hazardResist || 0,
        integrity: drill.hull.baseStats.maxIntegrity,
        regen: drill.hull.baseStats.regen || 0,
        droneEfficiency: drill.power.baseStats.droneEfficiency || 1.0
     };
  };

  const getActiveVisualEffects = (): VisualEffectType[] => {
    const effects: VisualEffectType[] = [];
    state.equippedArtifacts.forEach(id => {
       const item = state.inventory.find(i => i.instanceId === id);
       if (item) {
          const def = ARTIFACTS.find(a => a.id === item.defId);
          if (def && def.visualEffect) effects.push(def.visualEffect);
       }
    });
    return effects;
  };

  // --- GAME LOOP ---
  useEffect(() => {
    if (!hasStarted) return;

    const interval = setInterval(() => {
      setState(prev => {
        const stats = calculateStats(prev.drill);
        let newHeat = prev.heat;
        let newDepth = prev.depth;
        let newIntegrity = prev.integrity;
        let newResources = { ...prev.resources };
        let nextEffects = [...prev.activeEffects];
        const nextQueue = [...prev.eventQueue];
        let newXp = prev.xp;
        let nextObjects = [...prev.flyingObjects];
        let nextBoss = prev.currentBoss ? { ...prev.currentBoss } : null;
        let nextInventory = [...prev.inventory];
        let nextAnalyzer = { ...prev.analyzer };
        let nextActiveQuests = [...prev.activeQuests];
        let nextRecentEvents = [...(prev.recentEventIds || [])];
        
        const rect = drillContainerRef.current?.getBoundingClientRect();
        const centerX = rect ? rect.width / 2 : window.innerWidth / 2;
        const centerY = rect ? rect.height / 2 : window.innerHeight / 2;

        const isAutoDisabled = nextEffects.some(e => e.modifiers.autoClickDisabled);
        const isHeatUnstable = nextEffects.some(e => e.modifiers.heatInstability);
        const skillMods = calculateSkillModifiers(prev.skillLevels);
        
        const artifactMods = {
            clickPowerPct: 0,
            drillSpeedPct: 0,
            heatGenPct: 0,
            resourceMultPct: 0,
            luckPct: 0
        };
        prev.equippedArtifacts.forEach(id => {
            const item = prev.inventory.find(i => i.instanceId === id);
            if (item) {
                const def = ARTIFACTS.find(a => a.id === item.defId);
                if (def && def.modifiers) {
                    if (def.modifiers.clickPowerPct) artifactMods.clickPowerPct += def.modifiers.clickPowerPct;
                    if (def.modifiers.drillSpeedPct) artifactMods.drillSpeedPct += def.modifiers.drillSpeedPct;
                    if (def.modifiers.heatGenPct) artifactMods.heatGenPct += def.modifiers.heatGenPct;
                    if (def.modifiers.resourceMultPct) artifactMods.resourceMultPct += def.modifiers.resourceMultPct;
                    if (def.modifiers.luckPct) artifactMods.luckPct += def.modifiers.luckPct;
                }
            }
        });

        stats.luck += artifactMods.luckPct;

        // FUSION Conditions
        if (newHeat <= 1) {
            heatStabilityTimerRef.current += 0.1; 
        } else {
            heatStabilityTimerRef.current = 0;
        }
        setHeatStabilityDisplay(heatStabilityTimerRef.current);

        // NARRATIVE
        narrativeTickRef.current++;
        afkTimerRef.current = (Date.now() - lastInteractTimeRef.current) / 1000;
        
        const currentBiomeIndex = BIOMES.findIndex((b, i) => {
           const next = BIOMES[i + 1];
           return newDepth >= b.depth && (!next || newDepth < next.depth);
        });
        const actualBiomeIndex = currentBiomeIndex >= 0 ? currentBiomeIndex : 0;
        const currentBiome = BIOMES[actualBiomeIndex];

        const narrativeContext = {
            depth: newDepth,
            heat: newHeat,
            integrity: newIntegrity,
            biome: currentBiome.name,
            eventActive: nextQueue.length > 0,
            afkTime: afkTimerRef.current
        };
        const nextAIState = narrativeManager.getAIState(narrativeContext);

        if (narrativeTickRef.current > 30) {
            narrativeTickRef.current = 0;
            if (Math.random() < 0.3) { 
                const log = narrativeManager.generateLog(narrativeContext);
                if (log) addLog(log.msg, log.color);
            }
        }

        // AUTO-THROTTLE
        if (isDrilling && stats.predictionTime > 0 && !nextBoss && !isAutoDisabled) {
            const safetyMargin = Math.max(90, 100 - (stats.predictionTime * 2)); 
            if (newHeat >= safetyMargin) {
                setIsDrilling(false);
            }
        }
        
        // AUTO-START
        if (!isDrilling && !isOverheated && !isBroken && stats.predictionTime >= 5 && (activeView === View.DRILL || activeView === View.COMBAT) && !isAutoDisabled) {
            if (newHeat <= 5) { 
                setIsDrilling(true);
            }
        }

        if (prev.activeQuests.length === 0) {
            nextActiveQuests = generateQuestBatch(prev.depth, prev.level);
        }

        // SPAWNER
        if (Math.random() < 0.005 && nextObjects.length < 3) {
            const id = Math.random().toString(36).substr(2, 9);
            const r = Math.random();
            const type = r > 0.7 ? (r > 0.9 ? 'GEODE_LARGE' : 'SATELLITE_DEBRIS') : 'GEODE_SMALL';
            
            nextObjects.push({
                id,
                type,
                x: Math.random() * 80 + 10,
                y: 110, 
                vx: (Math.random() - 0.5) * 0.5,
                vy: -(Math.random() * 0.5 + 0.2) 
            });
        }
        
        nextObjects = nextObjects.map(obj => ({
            ...obj,
            x: obj.x + obj.vx,
            y: obj.y + obj.vy
        })).filter(obj => obj.y > -20); 

        // ANALYZER
        if (nextAnalyzer.activeItemInstanceId) {
            nextAnalyzer.timeLeft = Math.max(0, nextAnalyzer.timeLeft - 1); 
            if (nextAnalyzer.timeLeft <= 0) {
               const itemIndex = nextInventory.findIndex(i => i.instanceId === nextAnalyzer.activeItemInstanceId);
               if (itemIndex > -1) {
                  nextInventory[itemIndex] = { ...nextInventory[itemIndex], isIdentified: true };
                  audioEngine.playLegendary(); 
                  textRef.current?.addText(centerX, centerY, "АНАЛИЗ ЗАВЕРШЕН", 'INFO');
               }
               nextAnalyzer.activeItemInstanceId = null;
            }
        }
        
        // DRONES
        droneTickRef.current++;
        if (droneTickRef.current >= 10) { 
           droneTickRef.current = 0;
           if (!isAutoDisabled) {
               const levels = prev.droneLevels || { COLLECTOR:0, COOLER:0, BATTLE:0, REPAIR:0, MINER:0 };
               const efficiency = stats.droneEfficiency;

               if (levels.COLLECTOR > 0 && nextObjects.length > 0) {
                  const target = nextObjects[0];
                  const multiplier = (1 + (levels.COLLECTOR * 0.2)) * efficiency;
                  
                  if (target.type === 'GEODE_SMALL') { 
                      const gem = Math.random() > 0.5 ? 'rubies' : 'emeralds'; 
                      newResources[gem] += Math.floor(1 * multiplier); 
                      newXp += 25 * multiplier; 
                  } else if (target.type === 'GEODE_LARGE') { 
                      const gem = 'diamonds'; 
                      newResources[gem] += Math.floor(1 * multiplier); 
                      newXp += 100 * multiplier; 
                  } else { 
                      newResources.ancientTech += Math.floor(2 * multiplier); 
                      newXp += 50 * multiplier; 
                  }
                  nextObjects = nextObjects.filter(o => o.id !== target.id);
                  audioEngine.playClick();
               }

               if (levels.COOLER > 0 && newHeat > 0) {
                   const coolAmount = 1.5 * levels.COOLER * efficiency;
                   newHeat = Math.max(0, newHeat - coolAmount);
               }

               if (levels.BATTLE > 0 && nextBoss) {
                  const dmg = 50 * levels.BATTLE * efficiency;
                  nextBoss = { ...nextBoss, currentHp: Math.max(0, nextBoss.currentHp - dmg) };
                  setBossHitEffect(true); setTimeout(() => setBossHitEffect(false), 100);
                  textRef.current?.addText(centerX + (Math.random()-0.5)*100, centerY - 100, `-${dmg.toFixed(0)}`, 'DAMAGE');
               }

               if (levels.REPAIR > 0 && newIntegrity < stats.integrity) {
                   const repair = 0.2 * levels.REPAIR * efficiency; 
                   newIntegrity = Math.min(stats.integrity, newIntegrity + repair);
               }

               if (levels.MINER > 0) {
                   const b = BIOMES[currentBiomeIndex >= 0 ? currentBiomeIndex : 0];
                   const minerSpeedMod = (1 + (skillMods.autoSpeedPct + artifactMods.drillSpeedPct)/100);
                   const amount = levels.MINER * 5 * efficiency * minerSpeedMod;
                   newResources[b.resource] += amount; 
               }
           }
        }

        // PARTICLES
        if (activeView === View.DRILL && particleRef.current && drillContainerRef.current) {
          if (isDrilling && !isOverheated && !isBroken) particleRef.current.emit(centerX, centerY, currentBiome.color, 'DEBRIS', 2);
          if (prev.heat > 50 && Math.random() < (prev.heat / 200)) particleRef.current.emit(centerX, centerY, '#FFA500', 'SPARK', 1);
          if (prev.heat > 80 || isOverheated) particleRef.current.emit(centerX + (Math.random()-0.5)*50, centerY, '#333333', 'SMOKE', 1);
        }

        // BOSS SPAWN
        if (!nextBoss && prev.depth > 200 && (prev.depth - prev.lastBossDepth) >= 500 && nextQueue.length === 0) {
           nextBoss = generateBoss(prev.depth, currentBiome.name);
           addLog(`!!! ВНИМАНИЕ: ${nextBoss.description} !!!`, "text-red-500 font-bold");
           setActiveView(View.COMBAT);
           audioEngine.playAlarm(); 
        }

        if (nextBoss) {
           bossAttackTickRef.current++;
           if (bossAttackTickRef.current >= nextBoss.attackSpeed && !isBroken) {
              bossAttackTickRef.current = 0;
              const dmg = Math.max(1, nextBoss.damage * (1 - stats.defense / 100)); 
              newIntegrity -= dmg;
              setBossHitEffect(false); 
              if (dmg > 5) {
                  addLog(`УДАР ПО КОРПУСУ: -${dmg.toFixed(0)}%`, "text-red-500");
                  audioEngine.playBossHit(); 
                  textRef.current?.addText(centerX, centerY + 100, `УДАР! -${dmg.toFixed(0)}%`, 'CRIT');
              }
           }
           
           if (nextBoss.currentHp <= 0) {
              addLog(`ЦЕЛЬ УНИЧТОЖЕНА: ${nextBoss.name}`, "text-green-500 font-black");
              newXp += nextBoss.reward.xp;
              for (const [key, val] of Object.entries(nextBoss.reward.resources)) newResources[key as keyof Resources] = (newResources[key as keyof Resources] || 0) + (val || 0);
              nextBoss = null;
              setActiveView(View.DRILL);
              audioEngine.playLegendary(); 
              textRef.current?.addText(centerX, centerY, `БОСС УНИЧТОЖЕН`, 'CRIT');
              return { ...prev, currentBoss: null, lastBossDepth: Math.floor(prev.depth), xp: newXp, resources: newResources, inventory: nextInventory, activeEffects: nextEffects, eventQueue: nextQueue }; 
           }
        }

        // UNLOCKS
        let nextForgeUnlocked = prev.forgeUnlocked;
        let nextCityUnlocked = prev.cityUnlocked;
        let nextSkillsUnlocked = prev.skillsUnlocked;
        
        eventCheckTickRef.current++;
        if (eventCheckTickRef.current >= 10 && !nextBoss) { 
          eventCheckTickRef.current = 0;
          const randomEvent = rollRandomEvent(prev.recentEventIds || [], newDepth, newHeat);
          if (randomEvent) {
            nextQueue.push(randomEvent);
            nextRecentEvents.unshift(randomEvent.id);
            if (nextRecentEvents.length > 5) nextRecentEvents.pop();
          }
        }

        if (newDepth >= 20 && !prev.forgeUnlocked) { 
           nextForgeUnlocked = true; 
           nextQueue.unshift({ id: 'FORGE_UNLOCK', title: 'СИСТЕМА ОБНОВЛЕНА: КУЗНИЦА', description: '>> Диагностика завершена. Доступ к улучшениям.', type: 'NOTIFICATION', weight: 0 }); 
        }
        if (newDepth >= 100 && !prev.cityUnlocked) {
           nextCityUnlocked = true;
           nextQueue.unshift({ id: 'CITY_UNLOCK', title: 'СИГНАЛ: ПОСЕЛЕНИЕ', description: '>> Обнаружен подземный хаб. Торговля доступна.', type: 'NOTIFICATION', weight: 0 });
        }
        
        if (newDepth >= 300 && !prev.skillsUnlocked) {
            nextSkillsUnlocked = true;
            nextQueue.unshift({ id: 'SKILLS_UNLOCK', title: 'НЕЙРО-СЕТЬ: ОНЛАЙН', description: '>> Подключение к коре головного мозга установлено.', type: 'NOTIFICATION', weight: 0 });
        }

        // HAZARD LOGIC
        hazardTickRef.current++;
        if (hazardTickRef.current >= 10 && !isBroken && !isOverheated) {
           hazardTickRef.current = 0;
           if (currentBiome.hazard !== 'NONE' && !nextBoss) { 
              const hazardDmg = currentBiome.hazardLevel;
              const netDamage = Math.max(0, hazardDmg * (1 - stats.hazardResist / 100) * 0.1); 
              if (netDamage > 0) newIntegrity = Math.max(0, newIntegrity - netDamage);
           }
           
           if (stats.regen > 0 && newIntegrity < stats.integrity && !nextBoss) {
               newIntegrity = Math.min(stats.integrity, newIntegrity + stats.regen);
           } else if (currentBiome.hazard === 'NONE' && newIntegrity < stats.integrity && !nextBoss) {
               newIntegrity = Math.min(stats.integrity, newIntegrity + 1);
           }
        }

        // --- HULL DEPLETION LOGIC ---
        if (newIntegrity <= 0 && !isBroken) {
           setIsBroken(true); 
           setIsDrilling(false);
           
           // 1. Lose Depth
           const depthPenalty = Math.max(100, Math.floor(newDepth * 0.1));
           newDepth = Math.max(0, newDepth - depthPenalty);

           // 2. Lose Resources (Cargo Breach)
           const breachFactor = 0.25; // Lose 25% of commons
           COMMON_RESOURCES.forEach(res => {
              const amount = newResources[res];
              if (amount > 100) {
                 const lost = Math.floor(amount * breachFactor);
                 newResources[res] -= lost;
                 if (lost > 0) {
                    // Only show floating text for significant losses to avoid spam
                     if (Math.random() > 0.5) {
                        textRef.current?.addText(
                           centerX + (Math.random() - 0.5) * 150, 
                           centerY + (Math.random() - 0.5) * 100, 
                           `-${lost} ${getResourceLabel(res)}`, 
                           'CRIT'
                        );
                     }
                 }
              }
           });

           if (nextBoss) { 
               nextBoss = null; 
               setActiveView(View.DRILL); 
           }

           audioEngine.playAlarm();
           textRef.current?.addText(centerX, centerY, "КРИТИЧЕСКИЙ СБОЙ!", 'CRIT');
           textRef.current?.addText(centerX, centerY + 30, `АВАРИЙНОЕ ВСПЛЫТИЕ: -${depthPenalty}m`, 'CRIT');
           
           addLog(`!!! РАЗРУШЕНИЕ ОБШИВКИ !!!`, "text-red-600 font-black");
           addLog(`ПРОТОКОЛ СПАСЕНИЯ: -${depthPenalty}м ГЛУБИНЫ`, "text-orange-500");
           addLog(`РАЗГЕРМЕТИЗАЦИЯ ТРЮМА: ПОТЕРЯНО 25% ГРУЗА`, "text-orange-500");
        }
        
        if (isBroken) {
           // Slower repair
           newIntegrity += 0.2 + (stats.regen * 0.1); 
           if (newIntegrity >= stats.integrity) { 
               setIsBroken(false); 
               newIntegrity = stats.integrity; // Clamp
               addLog("ОБШИВКА ВОССТАНОВЛЕНА. СИСТЕМЫ В НОРМЕ.", "text-green-500"); 
           }
        }

        // PHYSICS
        nextEffects = nextEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0);

        if (isHeatUnstable && Math.random() < 0.1) {
            newHeat += (Math.random() - 0.5) * 10;
        }

        if (isOverheated) {
          newHeat = Math.max(0, newHeat - 0.25 * stats.ventSpeed); 
          if (newHeat <= 0) { setIsOverheated(false); addLog("СИСТЕМЫ ОХЛАЖДЕНЫ."); }
        } else if (!isBroken) {
          
          if (isDrilling && !nextBoss) {
            const hardness = Math.min(1.0, (newDepth / 10000));
            const torqueFactor = stats.torque / 100;
            const effectiveHardness = Math.max(0, hardness - torqueFactor);
            const speedPenalty = Math.max(0.1, 1.0 - effectiveHardness);
            
            let speedMult = 1;
            let heatGenMult = 1;
            let resMult = 1;
            let clickPowerMult = 1;
            
            nextEffects.forEach(e => {
                if (e.modifiers.drillSpeedMultiplier) speedMult *= e.modifiers.drillSpeedMultiplier;
                if (e.modifiers.heatGenMultiplier) heatGenMult *= e.modifiers.heatGenMultiplier;
                if (e.modifiers.resourceMultiplier) resMult *= e.modifiers.resourceMultiplier;
                if (e.modifiers.clickPowerMultiplier) clickPowerMult *= e.modifiers.clickPowerMultiplier;
            });

            const combinedClickPower = stats.clickMult * (1 + (skillMods.clickPowerPct + artifactMods.clickPowerPct)/100) * clickPowerMult;
            const drillPower = stats.totalSpeed * speedPenalty * combinedClickPower * speedMult;
            newDepth += drillPower;
            
            const baseHeat = 0.85;
            const heatReduction = (1 - (skillMods.heatGenReductionPct + artifactMods.heatGenPct)/100);
            newHeat += baseHeat * heatGenMult * heatReduction; 
            
            const totalResMult = (1 + (skillMods.resourceMultPct + artifactMods.resourceMultPct)/100) * resMult;
            const resAmount = drillPower * 0.3 * totalResMult;
            newResources[currentBiome.resource] += resAmount;
            
            if (Math.random() < 0.1) {
                textRef.current?.addText(centerX + (Math.random()-0.5)*100, centerY + 50, `+${resAmount.toFixed(1)}`, 'RESOURCE');
            }

            if (newHeat >= 100) { 
                newHeat = 100; 
                setIsOverheated(true); 
                setIsDrilling(false); 
                addLog("!!! КРИТИЧЕСКИЙ ПЕРЕГРЕВ !!!", "text-red-500 font-bold"); 
                audioEngine.playAlarm(); 
                textRef.current?.addText(centerX, centerY, "ПЕРЕГРЕВ!", 'CRIT');
            }
          } else {
             const coolingDisabled = nextEffects.some(e => e.modifiers.coolingDisabled);
             if (!coolingDisabled) {
                 newHeat = Math.max(0, newHeat - (stats.totalCooling * 0.2 + 0.1) * stats.ventSpeed);
             }
          }
        }

        audioEngine.update(newHeat, newDepth);

        return {
          ...prev, 
          depth: newDepth, 
          heat: newHeat, 
          integrity: newIntegrity, 
          resources: newResources, 
          activeEffects: nextEffects, 
          eventQueue: nextQueue, 
          xp: newXp, 
          forgeUnlocked: nextForgeUnlocked, 
          cityUnlocked: nextCityUnlocked,
          skillsUnlocked: nextSkillsUnlocked,
          inventory: nextInventory,
          analyzer: nextAnalyzer,
          flyingObjects: nextObjects, 
          activeQuests: nextActiveQuests,
          currentBoss: nextBoss,
          recentEventIds: nextRecentEvents,
          aiState: nextAIState
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isDrilling, isOverheated, isBroken, hasStarted, addLog, activeView]);

  const handleEventOption = (optionId?: string) => {
    const rng = Math.random();
    resetAFK();
    const currentEvent = state.eventQueue[0];
    if (!currentEvent) return;

    let logMsg = "";
    let logColor = "text-zinc-400";

    setState(prev => {
       const [_, ...remainingEvents] = prev.eventQueue;
       let nextEffects = [...prev.activeEffects];
       let nextResources = { ...prev.resources };
       let nextInventory = [...prev.inventory];
       let nextStorageLevel = prev.storageLevel;
       let nextHeat = prev.heat;
       let nextIntegrity = prev.integrity;
       let nextDepth = prev.depth;

       const baseLuck = prev.drill.logic.baseStats.luck;
       const luckBonus = baseLuck / 1000; 

       if (optionId === 'purge_nanomites') { 
           nextResources.nanoSwarm += 10; 
           logMsg = "ПРОТОКОЛ ОЧИСТКИ: +10 НАНО-РОЙ"; 
           logColor = "text-cyan-500";
       } 
       else if (optionId === 'accept_fluctuation') { 
           const effect = createEffect('QUANTUM_FLUCTUATION_EFFECT'); 
           if (effect) nextEffects.push(effect); 
           logMsg = "РИСК ПРИНЯТ: РЕСУРСЫ x5, ОХЛАЖДЕНИЕ ОТКЛ.";
           logColor = "text-amber-400";
       }
       else if (optionId === 'reject_fluctuation') {
           logMsg = "СИСТЕМЫ СТАБИЛИЗИРОВАНЫ.";
           logColor = "text-green-500";
       }
       else if (optionId === 'tectonic_push') {
           nextDepth += 250;
           nextHeat = Math.min(100, nextHeat + 40);
           logMsg = "ФОРСАЖ: +250м, +40% НАГРЕВ";
           logColor = "text-red-400";
       }
       else if (optionId === 'tectonic_hold') {
           nextIntegrity = Math.max(1, nextIntegrity - 10);
           logMsg = "УДЕРЖАНИЕ: -10% ОБШИВКИ";
           logColor = "text-amber-500";
       }
       else if (optionId === 'pod_laser') {
           if (rng < (0.5 + luckBonus)) {
               nextResources.ancientTech += 5;
               nextResources.titanium += 100;
               logMsg = "ВСКРЫТИЕ УСПЕШНО: +5 TECH, +100 ТИТАН";
               logColor = "text-green-400";
               audioEngine.playLegendary();
           } else {
               logMsg = "ОШИБКА ЛАЗЕРА: СОДЕРЖИМОЕ УНИЧТОЖЕНО";
               logColor = "text-red-500";
           }
       }
       else if (optionId === 'pod_hack') {
           nextResources.ancientTech += 8;
           logMsg = "ДЕШИФРОВКА: +8 TECH";
           logColor = "text-cyan-400";
       }
       else if (optionId === 'ai_trust') {
           const effect = createEffect('AI_OVERCLOCK');
           if (effect) nextEffects.push(effect);
           nextHeat = Math.min(100, nextHeat + 30);
           logMsg = "ДОВЕРИЕ ИИ: СКОРОСТЬ x3, НАГРЕВ КРИТИЧЕСКИЙ";
           logColor = "text-purple-400";
       }
       else if (optionId === 'ai_reboot') {
           nextHeat = 0;
           logMsg = "ПЕРЕЗАГРУЗКА: ТЕМПЕРАТУРА СБРОШЕНА";
           logColor = "text-cyan-500";
       }
       else if (optionId === 'crystal_absorb') {
           nextHeat = Math.max(0, nextHeat - 50);
           nextResources.ancientTech += 2;
           logMsg = "РЕЗОНАНС ПОГЛОЩЕН: -50% ТЕПЛА, +2 TECH";
           logColor = "text-purple-400";
       }

       if (!optionId) {
           if (currentEvent.id === 'GOLD_VEIN') {
               const effect = createEffect('GOLD_RUSH_EFFECT');
               if (effect) nextEffects.push(effect);
               logMsg = "ЗОЛОТАЯ ЖИЛА: РЕСУРСЫ x5 (20c)";
               logColor = "text-yellow-400";
           }
           else if (currentEvent.id === 'GAS_POCKET') {
               const effect = createEffect('GAS_BURN');
               if (effect) nextEffects.push(effect);
               logMsg = "ГАЗ ВОСПЛАМЕНЕН: СКОРОСТЬ ПОВЫШЕНА, ОХЛАЖДЕНИЕ СНИЖЕНО";
               logColor = "text-orange-500";
           }
           else if (currentEvent.id === 'MAGNETIC_STORM') {
               const effect = createEffect('MAGNETIC_INTERFERENCE');
               if (effect) nextEffects.push(effect);
               logMsg = "ЭМ-УДАР: АВТОМАТИКА ОТКЛЮЧЕНА";
               logColor = "text-red-500";
           }
           else if (currentEvent.id === 'GRAVITY_ANOMALY') {
               const effect = createEffect('GRAVITY_WARP');
               if (effect) nextEffects.push(effect);
               logMsg = "ГРАВИТАЦИЯ НАРУШЕНА: ТЕМПЕРАТУРНАЯ НЕСТАБИЛЬНОСТЬ";
               logColor = "text-purple-500";
           }
           else if (currentEvent.id === 'CORE_RESONANCE') {
               nextIntegrity = Math.max(1, nextIntegrity - 50);
               logMsg = "РЕЗОНАНС ЯДРА: КРИТИЧЕСКИЙ УРОН ОБШИВКЕ (-50%)";
               logColor = "text-red-600 font-black";
           }
       }

       if (currentEvent.forceArtifactDrop || currentEvent.type === 'ARTIFACT') {
           const currentBiomeIndex = BIOMES.findIndex((b, i) => {
              const next = BIOMES[i + 1];
              return prev.depth >= b.depth && (!next || prev.depth < next.depth);
           });
           const actualBiomeIndex = currentBiomeIndex >= 0 ? currentBiomeIndex : 0;
           const currentBiome = BIOMES[actualBiomeIndex];

           const def = rollArtifact(prev.depth, baseLuck, currentBiome.name);
           const newItem: InventoryItem = { instanceId: Math.random().toString(36).substr(2, 9), defId: def.id, acquiredAt: Date.now(), isIdentified: false, isEquipped: false };
           
           if (prev.inventory.length < 12) {
               nextInventory = [...prev.inventory, newItem];
               if (nextStorageLevel === 0) nextStorageLevel = 1;
               const artMsg = `АРТЕФАКТ ПОЛУЧЕН: [${def.rarity}]`;
               logMsg = logMsg ? `${logMsg} | ${artMsg}` : artMsg;
               if (!logColor || logColor === 'text-zinc-400') logColor = "text-amber-400";
           }
           else {
               const fullMsg = "СКЛАД ПЕРЕПОЛНЕН. АРТЕФАКТ УТЕРЯН.";
               logMsg = logMsg ? `${logMsg} | ${fullMsg}` : fullMsg;
               logColor = "text-red-500";
           }
       }
       
       if (logMsg) {
           addLog(logMsg, logColor);
       }

       return { 
           ...prev, 
           eventQueue: remainingEvents, 
           activeEffects: nextEffects, 
           resources: nextResources, 
           inventory: nextInventory,
           storageLevel: nextStorageLevel as 0|1|2,
           heat: nextHeat,
           integrity: nextIntegrity,
           depth: nextDepth
       };
    });
  };

  const handleBuyUpgrade = (type: string) => setState(prev => {
      let currentPart: any;
      let list: any[];
      switch(type) {
          case 'bit': currentPart = prev.drill.bit; list = BITS; break;
          case 'engine': currentPart = prev.drill.engine; list = ENGINES; break;
          case 'cooling': currentPart = prev.drill.cooling; list = COOLERS; break;
          case 'hull': currentPart = prev.drill.hull; list = HULLS; break;
          case 'logic': currentPart = prev.drill.logic; list = LOGIC_CORES; break;
          case 'control': currentPart = prev.drill.control; list = CONTROL_UNITS; break;
          case 'gearbox': currentPart = prev.drill.gearbox; list = GEARBOXES; break;
          case 'power': currentPart = prev.drill.power; list = POWER_CORES; break;
          case 'armor': currentPart = prev.drill.armor; list = ARMORS; break;
          default: return prev;
      }
      const currentIndex = list.findIndex(p => p.id === currentPart.id);
      const nextPart = list[currentIndex + 1];
      if (!nextPart) return prev; 
      if (nextPart.tier >= 13) return prev;

      const newResources = { ...prev.resources };
      let canAfford = true;
      (Object.keys(nextPart.cost) as (keyof Resources)[]).forEach(res => { if (newResources[res] < (nextPart?.cost[res] || 0)) canAfford = false; });
      if (!canAfford) return prev;
      (Object.keys(nextPart.cost) as (keyof Resources)[]).forEach(res => { newResources[res] -= (nextPart?.cost[res] || 0); });
      audioEngine.playClick();
      return { ...prev, resources: newResources, drill: { ...prev.drill, [type]: nextPart }, integrity: (type === 'hull' ? (nextPart as HullPart).baseStats.maxIntegrity : prev.integrity) };
  });

  const handleBuyDrone = (droneId: DroneType) => setState(prev => {
      const def = DRONES.find(d => d.id === droneId);
      if (!def) return prev;
      const currentLevel = prev.droneLevels[droneId] || 0;
      if (currentLevel >= def.maxLevel) return prev;
      const costMultiplier = Math.pow(def.costMultiplier, currentLevel);
      const scaledCost: Partial<Resources> = {};
      let canAfford = true;
      (Object.keys(def.baseCost) as (keyof Resources)[]).forEach(res => {
          const val = Math.floor((def.baseCost[res] || 0) * costMultiplier);
          scaledCost[res] = val;
          if (prev.resources[res] < val) canAfford = false;
      });
      if (!canAfford) return prev;
      const newResources = { ...prev.resources };
      (Object.keys(scaledCost) as (keyof Resources)[]).forEach(res => {
          newResources[res] -= (scaledCost[res] || 0);
      });
      audioEngine.playClick();
      const action = currentLevel === 0 ? "АКТИВИРОВАН" : "УЛУЧШЕН";
      addLog(`ДРОН [${def.name}] ${action}: УР.${currentLevel + 1}`, "text-cyan-400");
      const nextActiveDrones = prev.activeDrones.includes(droneId) ? prev.activeDrones : [...prev.activeDrones, droneId];
      return { 
          ...prev, 
          resources: newResources, 
          activeDrones: nextActiveDrones,
          droneLevels: { ...prev.droneLevels, [droneId]: currentLevel + 1 }
      };
  });

  const handleFusionUpgrade = (recipeId: string) => setState(prev => {
     const recipe = FUSION_RECIPES.find(r => r.id === recipeId);
     if (!recipe) return prev;
     const newResources = { ...prev.resources };
     if (newResources[recipe.catalyst.resource] < recipe.catalyst.amount) return prev;
     
     if (recipe.condition) {
         if (recipe.condition.type === 'ZERO_HEAT') {
             if (heatStabilityTimerRef.current < recipe.condition.target) return prev;
         }
         else if (recipe.condition.type === 'DEPTH_REACHED') {
             if (prev.depth < recipe.condition.target) return prev;
         }
         else if (recipe.condition.type === 'NO_DAMAGE') {
             if (prev.integrity < recipe.condition.target) return prev; 
         }
     }

     let partType = '';
     if (recipe.resultId.startsWith('bit')) partType = 'bit';
     else if (recipe.resultId.startsWith('eng')) partType = 'engine';
     else if (recipe.resultId.startsWith('cool')) partType = 'cooling';
     else if (recipe.resultId.startsWith('hull')) partType = 'hull';
     else if (recipe.resultId.startsWith('cpu')) partType = 'logic';
     else if (recipe.resultId.startsWith('ctrl')) partType = 'control';
     else if (recipe.resultId.startsWith('gear')) partType = 'gearbox';
     else if (recipe.resultId.startsWith('pwr')) partType = 'power';
     else if (recipe.resultId.startsWith('arm')) partType = 'armor';
     else return prev; 

     let list: any[] = [];
     if (partType === 'bit') list = BITS;
     else if (partType === 'engine') list = ENGINES;
     else if (partType === 'cooling') list = COOLERS;
     else if (partType === 'hull') list = HULLS;
     else if (partType === 'logic') list = LOGIC_CORES;
     else if (partType === 'control') list = CONTROL_UNITS;
     else if (partType === 'gearbox') list = GEARBOXES;
     else if (partType === 'power') list = POWER_CORES;
     else if (partType === 'armor') list = ARMORS;
     
     const nextPart = list.find(p => p.id === recipe.resultId);
     if (!nextPart) return prev;

     newResources[recipe.catalyst.resource] -= recipe.catalyst.amount;
     
     audioEngine.playFusion(); 
     addLog(`СЛИЯНИЕ ЗАВЕРШЕНО: ${nextPart.name}`, "text-purple-400 font-bold");
     
     return { ...prev, resources: newResources, drill: { ...prev.drill, [partType]: nextPart } };
  });

  const handleArtifactTransmutation = () => setState(prev => {
      if (selectedArtifactsForFusion.length !== 3) return prev;
      const firstItem = prev.inventory.find(i => i.instanceId === selectedArtifactsForFusion[0]);
      if (!firstItem) return prev;
      const firstDef = ARTIFACTS.find(a => a.id === firstItem.defId);
      if (!firstDef) return prev;

      let newRarity = ArtifactRarity.COMMON;
      if (firstDef.rarity === ArtifactRarity.COMMON) newRarity = ArtifactRarity.RARE;
      else if (firstDef.rarity === ArtifactRarity.RARE) newRarity = ArtifactRarity.EPIC;
      else if (firstDef.rarity === ArtifactRarity.EPIC) newRarity = ArtifactRarity.LEGENDARY;
      else return prev;

      const pool = ARTIFACTS.filter(a => a.rarity === newRarity);
      if (pool.length === 0) return prev;
      const newDef = pool[Math.floor(Math.random() * pool.length)];

      const newInventory = prev.inventory.filter(i => !selectedArtifactsForFusion.includes(i.instanceId));
      const newItem: InventoryItem = { 
          instanceId: Math.random().toString(36).substr(2, 9), 
          defId: newDef.id, 
          acquiredAt: Date.now(), 
          isIdentified: true, 
          isEquipped: false 
      };
      
      addLog(`ТРАНСМУТАЦИЯ: ПОЛУЧЕН [${newDef.name}]`, "text-amber-400");
      audioEngine.playFusion(); 
      setSelectedArtifactsForFusion([]);

      return { ...prev, inventory: [...newInventory, newItem] };
  });

  const toggleArtifactSelection = (id: string) => {
      setSelectedArtifactsForFusion(prev => {
          if (prev.includes(id)) return prev.filter(x => x !== id);
          if (prev.length >= 3) return prev;
          
          const item = state.inventory.find(i => i.instanceId === id);
          if (!item) return prev;
          const def = ARTIFACTS.find(a => a.id === item.defId);
          
          if (prev.length > 0) {
              const firstItem = state.inventory.find(i => i.instanceId === prev[0]);
              const firstDef = ARTIFACTS.find(a => a.id === firstItem?.defId);
              if (firstDef?.rarity !== def?.rarity) return prev; 
          }

          return [...prev, id];
      });
  };

  const handleCityTrade = (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => {
    setState(prev => {
      const newResources = { ...prev.resources };
      let possible = true;
      (Object.keys(cost) as (keyof Resources)[]).forEach(res => { if (newResources[res] < (cost[res] || 0)) possible = false; });
      if (!possible) return prev;
      (Object.keys(cost) as (keyof Resources)[]).forEach(res => { newResources[res] -= (cost[res] || 0); });
      let newXp = prev.xp;
      (Object.keys(reward) as (keyof Resources | 'XP')[]).forEach(key => { if (key === 'XP') newXp += (reward.XP || 0); else newResources[key as keyof Resources] += (reward[key as keyof Resources] || 0); });
      audioEngine.playClick();
      return { ...prev, resources: newResources, xp: newXp };
    });
  };

  const handleCityHeal = () => setState(prev => prev.heat <= 0 ? prev : { ...prev, heat: 0 });

  const handleRefreshQuests = () => {
     setState(prev => {
        if (prev.resources.clay < 100) return prev;
        const newResources = { ...prev.resources, clay: prev.resources.clay - 100 };
        return { ...prev, resources: newResources, activeQuests: generateQuestBatch(prev.depth, prev.level), lastQuestRefresh: Date.now() };
     });
  };

  const handleCompleteQuest = (questId: string) => {
     setState(prev => {
        const quest = prev.activeQuests.find(q => q.id === questId);
        if (!quest) return prev;
        const newResources = { ...prev.resources };
        let newXp = prev.xp;
        let possible = true;
        quest.requirements.forEach(req => {
           if ((req.type === 'RESOURCE' || req.type === 'TECH') && newResources[req.target as keyof Resources] < req.amount) possible = false;
           else if (req.type === 'XP' && newXp < req.amount) possible = false;
        });
        if (!possible) return prev;
        quest.requirements.forEach(req => { if (req.type === 'RESOURCE' || req.type === 'TECH') newResources[req.target as keyof Resources] -= req.amount; else if (req.type === 'XP') newXp -= req.amount; });
        quest.rewards.forEach(rew => { if (rew.type === 'RESOURCE' || rew.type === 'TECH') newResources[rew.target as keyof Resources] += rew.amount; else if (rew.type === 'XP') newXp += rew.amount; });
        audioEngine.playClick();
        addLog(`КОНТРАКТ ВЫПОЛНЕН: ${quest.title}`, "text-green-400");
        return { ...prev, resources: newResources, xp: newXp, activeQuests: prev.activeQuests.filter(q => q.id !== questId) };
     });
  };

  const handleUpgradeSkill = (skillId: string) => {
    setState(prev => {
      const currentLevel = prev.skillLevels[skillId] || 0;
      const skillDef = SKILLS.find(s => s.id === skillId);
      if (!skillDef) return prev;
      const cost = getSkillCost(skillDef, currentLevel);
      if (prev.xp < cost || currentLevel >= skillDef.maxLevel) return prev;
      if (skillDef.requiredParent && (prev.skillLevels[skillDef.requiredParent] || 0) < 1) return prev;
      if (skillDef.requiredDepth && prev.depth < skillDef.requiredDepth) return prev;
      audioEngine.playClick();
      return { ...prev, xp: prev.xp - cost, skillLevels: { ...prev.skillLevels, [skillId]: currentLevel + 1 } };
    });
  };

  const handleStartAnalysis = (instanceId: string) => setState(prev => prev.analyzer.activeItemInstanceId ? prev : { ...prev, analyzer: { activeItemInstanceId: instanceId, timeLeft: 100, maxTime: 100 } });
  
  const handleEquipArtifact = (instanceId: string) => {
     setState(prev => {
        if (prev.equippedArtifacts.includes(instanceId) || prev.equippedArtifacts.length >= 3) return prev;
        const item = prev.inventory.find(i => i.instanceId === instanceId);
        if (!item || !item.isIdentified) return prev;
        const newInventory = prev.inventory.map(i => i.instanceId === instanceId ? { ...i, isEquipped: true } : i);
        return { ...prev, inventory: newInventory, equippedArtifacts: [...prev.equippedArtifacts, instanceId] };
     });
  };

  const handleUnequipArtifact = (instanceId: string) => {
     setState(prev => {
        const newInventory = prev.inventory.map(i => i.instanceId === instanceId ? { ...i, isEquipped: false } : i);
        return { ...prev, inventory: newInventory, equippedArtifacts: prev.equippedArtifacts.filter(id => id !== instanceId) };
     });
  };

  const handleScrapArtifact = (instanceId: string) => {
     setState(prev => {
        const item = prev.inventory.find(i => i.instanceId === instanceId);
        if (!item || item.isEquipped) return prev;
        const def = ARTIFACTS.find(a => a.id === item.defId);
        return { ...prev, resources: { ...prev.resources, ancientTech: prev.resources.ancientTech + (def ? def.scrapAmount : 5) }, inventory: prev.inventory.filter(i => i.instanceId !== instanceId) };
     });
  };

  const currentBiome = BIOMES.slice().reverse().find(b => state.depth >= b.depth) || BIOMES[0];
  const stats = {
     prod: state.drill.power.baseStats.energyOutput,
     cons: state.drill.bit.baseStats.energyCost + state.drill.engine.baseStats.energyCost + state.drill.cooling.baseStats.energyCost + state.drill.logic.baseStats.energyCost + state.drill.control.baseStats.energyCost + state.drill.gearbox.baseStats.energyCost + state.drill.armor.baseStats.energyCost
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden relative selection:bg-cyan-900 selection:text-white">
      {/* --- FLOATING TEXT LAYER --- */}
      <FloatingTextOverlay ref={textRef} />

      {/* HEADER */}
      <div className="flex bg-zinc-950 border-b border-zinc-800 z-50 shrink-0 h-10 md:h-14 relative">
        <div className="flex-1 flex overflow-x-auto scrollbar-hide">
           {COMMON_RESOURCES.map(key => {
              const val = state.resources[key];
              return val > 0 ? (
                 <ResourceItem key={key} name={key} amount={val} label={getResourceLabel(key)} />
              ) : null;
           })}
        </div>
        <button onClick={() => setIsRareMenuOpen(!isRareMenuOpen)} className={`px-2 md:px-4 border-l border-zinc-800 flex flex-col items-center justify-center hover:bg-zinc-900 transition-colors ${isRareMenuOpen ? 'bg-zinc-800 text-purple-400' : 'text-zinc-500'}`}>
           <span className="text-sm md:text-xl">💎</span>
        </button>
        {isRareMenuOpen && (
           <div className="absolute top-full right-0 w-48 bg-zinc-900/95 border border-zinc-700 shadow-2xl p-2 z-[60] backdrop-blur animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-bold text-zinc-500 mb-2 px-2 text-center uppercase tracking-widest border-b border-zinc-800 pb-1">РЕДКИЕ РЕСУРСЫ</h4>
              <div className="flex flex-col gap-1">
                 {RARE_RESOURCES.map(key => (
                    <div key={key} className="flex justify-between items-center px-2 py-1 hover:bg-black/50 rounded">
                       <span className="text-[10px] text-zinc-400">{getResourceLabel(key)}</span>
                       <span className={`text-xs font-mono font-bold ${['rubies','emeralds','diamonds'].includes(key) ? 'text-purple-400' : 'text-cyan-400'}`}>{state.resources[key].toLocaleString()}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      <div className="flex-1 relative flex flex-col min-h-0">
        {!hasStarted && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
            <h1 className="text-2xl md:text-5xl mb-8 text-center px-4 leading-tight pixel-text text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">COSMIC<br/><span className="text-cyan-400">EXCAVATOR</span></h1>
            <button onClick={startGame} className="px-8 py-4 bg-white text-black font-black text-xl hover:bg-cyan-400 transition-colors pixel-text">ИНИЦИАЛИЗАЦИЯ</button>
          </div>
        )}

        {/* --- AI COMPANION (Always Visible) --- */}
        <AICompanion state={state.aiState} heat={state.heat} />

        <div className="flex-1 relative min-h-0 flex flex-col">
          {activeView === View.DRILL && (
            <div ref={drillContainerRef} className="relative w-full h-full">
              <FlyingObjectsRenderer objects={state.flyingObjects} />
              <ParticleRenderer ref={particleRef} />
              <DroneRenderer activeDrones={state.activeDrones} />
              <div className="absolute inset-0 z-0">
                 <DrillRenderer 
                     heat={state.heat} 
                     evolution={state.drill.bit.tier} 
                     spinning={isDrilling} 
                     biomeColor={currentBiome.color} 
                     depth={state.depth} 
                     activeVisualEffects={[]}
                     activeDrillFX={state.drill.bit.fxId || 'none'}
                 />
              </div>

              {/* HUD: Depth (Top Left) */}
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <div className="text-2xl md:text-6xl font-black text-white/90 drop-shadow-md font-mono">{Math.floor(state.depth)}<span className="text-sm md:text-2xl text-zinc-400 ml-1 md:ml-2">m</span></div>
                <div className="text-[10px] md:text-xs font-bold text-zinc-400 bg-black/50 px-2 py-1 inline-block mt-1 border-l-2" style={{ borderColor: currentBiome.color }}>{currentBiome.name}</div>
              </div>

              {/* HUD: Stats (Top Right) */}
              <div className="absolute top-2 right-2 z-10 w-32 md:w-56 bg-black/60 backdrop-blur-md border border-zinc-700 p-2.5 flex flex-col gap-3 shadow-lg">
                 {/* Hull Section */}
                 <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] md:text-[10px] font-bold text-zinc-400 font-mono tracking-wider">
                       <span>ОБШИВКА</span>
                       <span className={state.integrity < 30 ? 'text-red-500 animate-pulse' : 'text-white'}>{Math.ceil(state.integrity)}/{state.drill.hull.baseStats.maxIntegrity}</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2.5 bg-zinc-900 border border-zinc-700/50 relative overflow-hidden group">
                       <div className={`h-full transition-all duration-300 ${state.integrity < state.drill.hull.baseStats.maxIntegrity * 0.3 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-green-500'}`} style={{ width: `${Math.max(0, (state.integrity / state.drill.hull.baseStats.maxIntegrity) * 100)}%` }} />
                       <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzj//v37zaDIfwYgDlmFCAAamxXwSUr1aQAAAABJRU5ErkJggg==')] opacity-20"></div>
                    </div>
                 </div>
                 
                 {/* Heat Section */}
                 <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] md:text-[10px] font-bold text-zinc-400 font-mono tracking-wider">
                       <span>НАГРЕВ</span>
                       <span className={state.heat > 80 ? 'text-red-500 animate-pulse' : 'text-white'}>{Math.ceil(state.heat)}%</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2.5 bg-zinc-900 border border-zinc-700/50 relative overflow-hidden">
                       <div className={`h-full transition-all duration-300 ${state.heat > 80 ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, state.heat)}%` }} />
                        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzj//v37zaDIfwYgDlmFCAAamxXwSUr1aQAAAABJRU5ErkJggg==')] opacity-20"></div>
                    </div>
                 </div>

                 {/* Logic Core Prediction Indicator */}
                 {state.drill.logic.baseStats.predictionTime && state.drill.logic.baseStats.predictionTime > 0 ? (
                    <div className="flex items-center gap-2 border-t border-zinc-700 pt-2">
                       <div className={`w-2 h-2 rounded-full ${isDrilling ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                       <div className="flex-1">
                          <div className="text-[7px] md:text-[8px] font-bold text-zinc-400 leading-none">AI CONTROL ACTIVE</div>
                          <div className="text-[7px] text-zinc-600 leading-none mt-0.5">AUTO-STOP: {100 - (state.drill.logic.baseStats.predictionTime * 2)}% HEAT</div>
                          {state.drill.logic.baseStats.predictionTime >= 5 && (
                             <div className="text-[7px] text-green-700 leading-none mt-0.5">AUTO-START: ENABLED</div>
                          )}
                       </div>
                    </div>
                 ) : null}
              </div>

              <div className="absolute inset-0 z-0 cursor-crosshair active:scale-[0.99] transition-transform"
                onMouseDown={() => { resetAFK(); if (!isOverheated && !isBroken) setIsDrilling(true); }}
                onMouseUp={() => setIsDrilling(false)}
                onMouseLeave={() => setIsDrilling(false)}
                onTouchStart={() => { resetAFK(); if (!isOverheated && !isBroken) setIsDrilling(true); }}
                onTouchEnd={() => setIsDrilling(false)}
              />
            </div>
          )}

          {activeView === View.COMBAT && state.currentBoss && (
             <div className="relative w-full h-full bg-black">
                 <div className="absolute top-4 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-none">
                     <h2 className="text-lg md:text-2xl font-black pixel-text text-red-600 mb-2 drop-shadow-[0_0_10px_red] text-center">{state.currentBoss.name}</h2>
                     <div className="w-full max-w-lg h-4 md:h-8 bg-black border-2 border-red-800 relative overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${(state.currentBoss.currentHp / state.currentBoss.maxHp) * 100}%` }} />
                     </div>
                 </div>
                 <BossRenderer bossType={state.currentBoss.type} color={state.currentBoss.color} hpPercent={state.currentBoss.currentHp / state.currentBoss.maxHp} time={Date.now()} isHit={bossHitEffect} />
                 <div className="absolute inset-0 z-40 cursor-crosshair active:scale-[1.02] transition-transform" onMouseDown={() => { resetAFK(); setIsDrilling(true); }} onMouseUp={() => setIsDrilling(false)} />
             </div>
          )}

          {activeView === View.FORGE && (
            <div className="flex-1 bg-black flex flex-col min-h-0">
               {/* FORGE TABS - IMPROVED SCROLLING CONTAINER */}
               <div className="flex bg-zinc-950 border-b border-zinc-800 overflow-x-auto scrollbar-hide whitespace-nowrap min-h-[44px]">
                  {['DRILL', 'SYSTEMS', 'HULL', 'FUSION', 'DRONES'].map(tab => (
                     <button key={tab} onClick={() => setForgeTab(tab as any)} className={`flex-none py-3 md:py-4 px-4 md:px-6 text-[10px] md:text-xs font-bold pixel-text transition-colors border-r border-zinc-900 ${forgeTab === tab ? 'bg-zinc-900 text-white border-b-2 border-b-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {tab === 'DRILL' ? 'БУР' : tab === 'SYSTEMS' ? 'СИСТЕМЫ' : tab === 'HULL' ? 'КОРПУС' : tab === 'FUSION' ? 'СИНТЕЗ' : 'ДРОНЫ'}
                     </button>
                  ))}
               </div>

               <div className="bg-zinc-900 border-b border-zinc-800 p-2 px-2 md:px-4 flex justify-between items-center text-[10px] md:text-xs font-mono">
                  <span className="text-zinc-500">БАЛАНС ЭНЕРГИИ:</span>
                  <div className="flex items-center gap-2 md:gap-4">
                     <span className="text-green-400">ГЕН:{stats.prod}</span>
                     <span className={stats.cons > stats.prod ? 'text-red-500 animate-pulse' : 'text-amber-400'}>ПОТР:{stats.cons}</span>
                     <div className="w-16 md:w-24 h-2 bg-black border border-zinc-700">
                        <div className={`h-full ${stats.cons > stats.prod ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (stats.cons / stats.prod) * 100)}%` }} />
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-2 md:p-8 overflow-y-auto scrollbar-hide pb-32 overscroll-contain">
                  {forgeTab === 'DRILL' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        <UpgradeCard title="НАКОНЕЧНИК" current={state.drill.bit} next={BITS[BITS.findIndex(p=>p.id===state.drill.bit.id)+1]} type="bit" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ДВИГАТЕЛЬ" current={state.drill.engine} next={ENGINES[ENGINES.findIndex(p=>p.id===state.drill.engine.id)+1]} type="engine" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ОХЛАЖДЕНИЕ" current={state.drill.cooling} next={COOLERS[COOLERS.findIndex(p=>p.id===state.drill.cooling.id)+1]} type="cooling" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'SYSTEMS' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        <UpgradeCard title="ЛОГИКА" current={state.drill.logic} next={LOGIC_CORES[LOGIC_CORES.findIndex(p=>p.id===state.drill.logic.id)+1]} type="logic" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="УПРАВЛЕНИЕ" current={state.drill.control} next={CONTROL_UNITS[CONTROL_UNITS.findIndex(p=>p.id===state.drill.control.id)+1]} type="control" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="РЕДУКТОР" current={state.drill.gearbox} next={GEARBOXES[GEARBOXES.findIndex(p=>p.id===state.drill.gearbox.id)+1]} type="gearbox" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'HULL' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        <UpgradeCard title="КАРКАС" current={state.drill.hull} next={HULLS[HULLS.findIndex(p=>p.id===state.drill.hull.id)+1]} type="hull" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ПИТАНИЕ" current={state.drill.power} next={POWER_CORES[POWER_CORES.findIndex(p=>p.id===state.drill.power.id)+1]} type="power" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="БРОНЯ" current={state.drill.armor} next={ARMORS[ARMORS.findIndex(p=>p.id===state.drill.armor.id)+1]} type="armor" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'FUSION' && (
                     <div className="flex flex-col gap-6">
                        {/* 1. ATOMIC RECONSTRUCTOR (Upgrade Parts) */}
                        <div className="bg-zinc-900 border border-purple-900/50 p-4 shadow-[0_0_30px_rgba(88,28,135,0.2)]">
                            <h3 className="text-xl pixel-text text-purple-400 mb-4 border-b border-purple-900 pb-2">АТОМНЫЙ РЕКОНСТРУКТОР</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {FUSION_RECIPES.filter(recipe => {
                                    return (state.drill.bit.id === recipe.componentAId) ||
                                           (state.drill.engine.id === recipe.componentAId) ||
                                           (state.drill.cooling.id === recipe.componentAId) ||
                                           (state.drill.hull.id === recipe.componentAId) ||
                                           (state.drill.logic.id === recipe.componentAId) ||
                                           (state.drill.control.id === recipe.componentAId) ||
                                           (state.drill.gearbox.id === recipe.componentAId) ||
                                           (state.drill.power.id === recipe.componentAId) ||
                                           (state.drill.armor.id === recipe.componentAId);
                                }).map(recipe => {
                                    const canAfford = state.resources[recipe.catalyst.resource] >= recipe.catalyst.amount;
                                    let list: any[] = [];
                                    if (recipe.resultId.startsWith('bit')) list = BITS;
                                    else if (recipe.resultId.startsWith('eng')) list = ENGINES;
                                    else if (recipe.resultId.startsWith('cool')) list = COOLERS;
                                    else if (recipe.resultId.startsWith('hull')) list = HULLS;
                                    else if (recipe.resultId.startsWith('cpu')) list = LOGIC_CORES;
                                    else if (recipe.resultId.startsWith('ctrl')) list = CONTROL_UNITS;
                                    else if (recipe.resultId.startsWith('gear')) list = GEARBOXES;
                                    else if (recipe.resultId.startsWith('pwr')) list = POWER_CORES;
                                    else if (recipe.resultId.startsWith('arm')) list = ARMORS;
                                    
                                    const nextPart = list.find(p => p.id === recipe.resultId);
                                    if (!nextPart) return null;

                                    let conditionMet = true;
                                    let progressPercent = 100;
                                    
                                    if (recipe.condition) {
                                        if (recipe.condition.type === 'ZERO_HEAT') {
                                            conditionMet = heatStabilityDisplay >= recipe.condition.target;
                                            progressPercent = Math.min(100, (heatStabilityDisplay / recipe.condition.target) * 100);
                                        }
                                        else if (recipe.condition.type === 'DEPTH_REACHED') {
                                            conditionMet = state.depth >= recipe.condition.target;
                                            progressPercent = Math.min(100, (state.depth / recipe.condition.target) * 100);
                                        }
                                        else if (recipe.condition.type === 'NO_DAMAGE') {
                                            conditionMet = state.integrity >= recipe.condition.target;
                                            progressPercent = Math.min(100, (state.integrity / recipe.condition.target) * 100);
                                        }
                                    }

                                    return (
                                        <div key={recipe.id} className="bg-black border border-purple-600 p-4 flex flex-col justify-between group">
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase">ЭВОЛЮЦИЯ МОДУЛЯ</div>
                                                <h4 className="text-white font-bold pixel-text text-sm mb-1">{nextPart.name}</h4>
                                                <p className="text-xs text-purple-300 italic mb-4">"{recipe.description}"</p>
                                                
                                                <div className="bg-zinc-900 p-2 mb-2 border border-zinc-800">
                                                    <div className="text-[9px] text-zinc-400 mb-1">ТРЕБУЕТСЯ КАТАЛИЗАТОР:</div>
                                                    <div className={`text-sm font-mono font-bold ${canAfford ? 'text-green-400' : 'text-red-500'}`}>
                                                        {recipe.catalyst.amount} {getResourceLabel(recipe.catalyst.resource)}
                                                    </div>
                                                </div>

                                                {recipe.condition && (
                                                    <div className="bg-zinc-900 p-2 mb-4 border border-zinc-800">
                                                        <div className="text-[9px] text-zinc-400 mb-1 uppercase">СПЕЦ-УСЛОВИЕ:</div>
                                                        <div className={`text-[10px] font-bold mb-1 ${conditionMet ? 'text-green-400' : 'text-amber-500'}`}>
                                                            {recipe.condition.description}
                                                        </div>
                                                        <div className="w-full h-1 bg-black">
                                                            <div className={`h-full transition-all duration-300 ${conditionMet ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${progressPercent}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleFusionUpgrade(recipe.id)}
                                                disabled={!canAfford || !conditionMet}
                                                className={`w-full py-3 pixel-text text-xs font-bold transition-all
                                                    ${canAfford && conditionMet ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_#9333ea]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                                                `}
                                            >
                                                {canAfford && conditionMet ? 'СИНТЕЗИРОВАТЬ' : !canAfford ? 'НЕТ РЕСУРСОВ' : 'УСЛОВИЕ НЕ ВЫПОЛНЕНО'}
                                            </button>
                                        </div>
                                    );
                                })}
                                {FUSION_RECIPES.every(r => 
                                    state.drill.bit.id !== r.componentAId && 
                                    state.drill.engine.id !== r.componentAId && 
                                    state.drill.cooling.id !== r.componentAId &&
                                    state.drill.hull.id !== r.componentAId &&
                                    state.drill.logic.id !== r.componentAId &&
                                    state.drill.control.id !== r.componentAId &&
                                    state.drill.gearbox.id !== r.componentAId &&
                                    state.drill.power.id !== r.componentAId &&
                                    state.drill.armor.id !== r.componentAId
                                ) && (
                                    <div className="col-span-3 text-center py-10 text-zinc-600 font-mono text-xs">
                                        <div className="text-2xl mb-2">🚫</div>
                                        НЕТ ДОСТУПНЫХ МОДУЛЕЙ ДЛЯ СЛИЯНИЯ.<br/>
                                        ДОСТИГНИТЕ ЛЕГЕНДАРНОГО УРОВНЯ (TIER 12), ЧТОБЫ АКТИВИРОВАТЬ ПРОТОКОЛЫ.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. ARTIFACT TRANSMUTATION */}
                        <div className="bg-zinc-900 border border-amber-900/50 p-4 relative">
                            <div className="absolute top-0 right-0 p-2 text-[50px] opacity-10 pointer-events-none">⚗️</div>
                            <h3 className="text-xl pixel-text text-amber-500 mb-2 border-b border-amber-900 pb-2">ТРАНСМУТАЦИЯ АРТЕФАКТОВ</h3>
                            <p className="text-xs text-zinc-400 font-mono mb-4">"Пожертвуй тремя, чтобы создать одного совершенного."</p>

                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Slots */}
                                <div className="flex-1 flex justify-center gap-2 md:gap-4 items-center bg-black/50 p-4 border border-zinc-800">
                                    {[0, 1, 2].map(i => {
                                        const itemId = selectedArtifactsForFusion[i];
                                        const item = itemId ? state.inventory.find(inv => inv.instanceId === itemId) : null;
                                        const def = item ? ARTIFACTS.find(a => a.id === item.defId) : null;
                                        return (
                                            <div key={i} className={`w-16 h-16 md:w-20 md:h-20 border-2 flex items-center justify-center relative
                                                ${def ? getArtifactColor(def.rarity) : 'border-zinc-800 border-dashed text-zinc-700'}
                                            `}>
                                                {def ? (
                                                    <div className="text-2xl" onClick={() => toggleArtifactSelection(itemId)}>{def.icon}</div>
                                                ) : <div className="text-xs font-mono">СЛОТ {i+1}</div>}
                                            </div>
                                        );
                                    })}
                                    <div className="text-2xl text-zinc-600">➔</div>
                                    <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center animate-pulse">
                                        <span className="text-2xl">?</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col justify-center w-full md:w-48">
                                    <button 
                                        onClick={handleArtifactTransmutation}
                                        disabled={selectedArtifactsForFusion.length !== 3}
                                        className={`w-full py-4 pixel-text text-xs font-bold transition-all
                                            ${selectedArtifactsForFusion.length === 3 
                                                ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_orange]' 
                                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                                        `}
                                    >
                                        ТРАНСМУТАЦИЯ
                                    </button>
                                </div>
                            </div>

                            {/* Artifact Picker */}
                            <div className="mt-4">
                                <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-2">ВЫБЕРИТЕ 3 АРТЕФАКТА ОДНОЙ РЕДКОСТИ:</h4>
                                <div className="grid grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
                                    {state.inventory.filter(item => item.isIdentified && !item.isEquipped).map(item => {
                                        const def = ARTIFACTS.find(a => a.id === item.defId);
                                        if (!def) return null;
                                        const isSelected = selectedArtifactsForFusion.includes(item.instanceId);
                                        let disabled = false;
                                        if (selectedArtifactsForFusion.length > 0 && !isSelected) {
                                            const firstItem = state.inventory.find(i => i.instanceId === selectedArtifactsForFusion[0]);
                                            const firstDef = ARTIFACTS.find(a => a.id === firstItem?.defId);
                                            if (firstDef?.rarity !== def.rarity) disabled = true;
                                        }

                                        return (
                                            <button 
                                                key={item.instanceId}
                                                onClick={() => !disabled && toggleArtifactSelection(item.instanceId)}
                                                className={`aspect-square border flex items-center justify-center transition-all
                                                    ${isSelected ? 'bg-amber-900/50 border-amber-500 scale-95' : 'bg-black border-zinc-800 hover:border-zinc-500'}
                                                    ${disabled ? 'opacity-20 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                <span className="text-xl">{def.icon}</span>
                                            </button>
                                        );
                                    })}
                                    {state.inventory.filter(i => i.isIdentified && !i.isEquipped).length === 0 && (
                                        <div className="col-span-6 text-zinc-600 text-xs italic">Нет доступных артефактов. Снимите экипировку или найдите новые.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                     </div>
                  )}
                  {forgeTab === 'DRONES' && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        {DRONES.map(drone => {
                           const currentLevel = state.droneLevels[drone.id] || 0;
                           const isMaxed = currentLevel >= drone.maxLevel;
                           const costMultiplier = Math.pow(drone.costMultiplier, currentLevel);
                           const currentCost: Partial<Resources> = {};
                           let canAfford = !isMaxed;
                           
                           if (!isMaxed) {
                               (Object.keys(drone.baseCost) as (keyof Resources)[]).forEach(res => {
                                   const val = Math.floor((drone.baseCost[res] || 0) * costMultiplier);
                                   currentCost[res] = val;
                                   if (state.resources[res] < val) canAfford = false;
                               });
                           }
                           
                           return (
                             <div key={drone.id} className={`bg-zinc-900 border p-3 md:p-4 flex flex-col justify-between ${currentLevel > 0 ? 'border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.2)]' : 'border-zinc-700'}`}>
                                <div>
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold pixel-text text-xs" style={{ color: drone.color }}>{drone.name}</h4>
                                       <div className="text-[9px] font-mono bg-black px-1.5 py-0.5 border border-zinc-800 text-white">
                                           LVL {currentLevel}/{drone.maxLevel}
                                       </div>
                                   </div>
                                   
                                   <p className="text-[10px] md:text-xs text-zinc-400 mb-2 h-10">{drone.description}</p>
                                   
                                   <div className="bg-black/50 p-2 mb-3 border border-zinc-800">
                                       <div className="text-[9px] text-zinc-500 mb-1">ТЕКУЩИЙ ЭФФЕКТ:</div>
                                       <div className="text-[10px] font-bold text-white">{drone.effectDescription(currentLevel)}</div>
                                   </div>

                                   {!isMaxed && (
                                      <div className="space-y-1 mb-3">
                                         <div className="text-[9px] text-zinc-500 mb-1 uppercase">СТОИМОСТЬ {currentLevel === 0 ? 'АКТИВАЦИИ' : 'УЛУЧШЕНИЯ'}:</div>
                                         {(Object.keys(currentCost) as (keyof Resources)[]).map(res => (
                                            <div key={res} className="flex justify-between text-[9px] md:text-[10px] font-mono border-b border-zinc-800/50 pb-0.5">
                                               <span className="text-zinc-500 uppercase">{res}</span>
                                               <span className={state.resources[res] >= (currentCost[res] || 0) ? 'text-green-400' : 'text-red-500'}>
                                                  {currentCost[res]?.toLocaleString()}
                                               </span>
                                            </div>
                                         ))}
                                      </div>
                                   )}
                                </div>
                                <button 
                                   onClick={() => handleBuyDrone(drone.id)}
                                   disabled={isMaxed || !canAfford}
                                   className={`w-full text-[10px] py-3 border transition-all pixel-text font-bold
                                      ${isMaxed ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-default' : 
                                        canAfford ? 'bg-zinc-800 hover:bg-white hover:text-black text-white border-white' : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'}
                                   `}
                                >
                                   {isMaxed ? 'МАКСИМУМ' : currentLevel === 0 ? 'АКТИВИРОВАТЬ' : 'УЛУЧШИТЬ'}
                                </button>
                             </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
          )}

          {activeView === View.CITY && (
             <CityView 
                biome={currentBiome} 
                resources={state.resources} 
                heat={state.heat} 
                xp={state.xp}
                depth={state.depth}
                activeQuests={state.activeQuests}
                onTrade={handleCityTrade} 
                onHeal={handleCityHeal} 
                onCompleteQuest={handleCompleteQuest}
                onRefreshQuests={handleRefreshQuests}
             />
          )}

          {activeView === View.SKILLS && (
             <SkillsView state={state} onUpgradeSkill={handleUpgradeSkill} />
          )}

          {activeView === View.ARTIFACTS && (
             <ArtifactsView 
                items={state.inventory} 
                storageLevel={state.storageLevel} 
                analyzerState={state.analyzer}
                equippedArtifacts={state.equippedArtifacts}
                onStartAnalysis={handleStartAnalysis}
                onEquipArtifact={handleEquipArtifact}
                onUnequipArtifact={handleUnequipArtifact}
                onScrapArtifact={handleScrapArtifact}
             />
          )}

          {state.eventQueue.length > 0 && (
            <EventModal event={state.eventQueue[0]} onOptionSelect={handleEventOption} />
          )}
        </div>

        <div className="flex flex-col shrink-0 z-30 bg-zinc-950 border-t border-zinc-800 transition-all duration-300">
           {activeView === View.DRILL || activeView === View.COMBAT ? (
             <div className="h-20 md:h-44 p-2 font-mono text-[9px] md:text-xs overflow-y-auto scrollbar-hide space-y-1 bg-black/80">
               {logs.map((log, i) => (
                 <div key={i} className={`${log.color || 'text-zinc-400'} border-l-2 border-transparent hover:border-zinc-700 pl-1`}>{log.msg}</div>
               ))}
               <div ref={consoleEndRef} />
             </div>
           ) : null}

           <div className={`h-12 md:h-14 flex ${activeView === View.DRILL ? 'border-t border-zinc-800' : ''}`}>
             {[
               { id: View.DRILL, label: 'БУР', icon: '⚡' },
               ...(state.forgeUnlocked ? [{ id: View.FORGE, label: 'ЦЕХ', icon: '🔧' }] : []),
               ...(state.skillsUnlocked ? [{ id: View.SKILLS, label: 'МОЗГ', icon: '🧠' }] : []),
               ...(state.cityUnlocked ? [{ id: View.CITY, label: 'ГОРОД', icon: '🏙️' }] : []),
               ...(state.storageLevel > 0 ? [{ id: View.ARTIFACTS, label: 'СКЛАД', icon: '💎' }] : [])
             ].map(btn => (
               <button key={btn.id} onClick={() => !state.currentBoss && setActiveView(btn.id as View)} className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 border-r border-zinc-800 last:border-0 hover:bg-white/5 active:bg-white/10 transition-colors ${activeView === btn.id ? 'bg-zinc-900 text-cyan-400' : 'text-zinc-500'} ${state.currentBoss ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <span className="text-base md:text-lg">{btn.icon}</span>
                 <span className="text-[9px] md:text-xs font-bold pixel-text md:inline">{btn.label}</span>
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
