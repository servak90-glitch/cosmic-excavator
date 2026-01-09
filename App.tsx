
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, GameState, Resources, DrillPart, Biome, ActiveEffect, InventoryItem, VisualEffectType, Quest, QuestRequirement, HullPart, FlyingObject, Boss, DroneType, DrillFX, EnginePart, CoolerPart, LogicPart, ControlPart, GearboxPart, PowerCorePart, ArmorPart, ArtifactRarity } from './types';
import { BIOMES, BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, DRONES, FUSION_RECIPES } from './constants';
import DrillRenderer from './components/DrillRenderer';
import BossRenderer from './components/BossRenderer'; 
import FlyingObjectsRenderer from './components/FlyingObjectsRenderer'; 
import ParticleRenderer, { ParticleHandle } from './components/ParticleRenderer'; 
import DroneRenderer from './components/DroneRenderer'; 
import { audioEngine, MusicMode } from './services/audioEngine'; 
import { rollRandomEvent, createEffect } from './services/eventRegistry';
import { calculateSkillModifiers, getSkillCost, SKILLS } from './services/skillRegistry';
import { ARTIFACTS, rollArtifact } from './services/artifactRegistry';
import { generateQuestBatch } from './services/questRegistry';
import { generateBoss } from './services/bossRegistry'; 
import EventModal from './components/EventModal';
import ArtifactsView from './components/ArtifactsView';
import CityView from './components/CityView';
import SkillsView from './components/SkillsView';

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
  flyingObjects: [],
  
  currentBoss: null,
  lastBossDepth: 0,
  
  activeDrones: [],

  storageLevel: 0,
  forgeUnlocked: false,
  cityUnlocked: false,
  skillsUnlocked: false
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

  const canAfford = (Object.keys(next.cost) as (keyof Resources)[]).every(r => resources[r] >= (next.cost[r] || 0));

  return (
    <div className="bg-zinc-900 p-3 md:p-4 border border-zinc-700 flex flex-col justify-between min-h-[180px] md:min-h-[220px] hover:border-zinc-500 transition-colors group relative">
       <div>
          <h3 className="text-cyan-400 font-bold mb-1 pixel-text text-xs md:text-sm group-hover:text-white transition-colors truncate">{title}</h3>
          <div className="text-[9px] md:text-[10px] text-zinc-500 mb-2 font-mono">
            TIER {current.tier} <span className="text-zinc-300">➔ {next.tier}</span>
          </div>
          
          <div className="bg-black/50 p-2 mb-2 border border-zinc-800 min-h-[40px] md:min-h-[50px]">
             <p className="text-[9px] md:text-[10px] text-zinc-300 italic leading-tight">"{next.description}"</p>
             {/* Stat Preview */}
             <div className="mt-1 text-[8px] md:text-[9px] text-green-400 font-mono">
                {next.baseStats.damage && `DMG: ${next.baseStats.damage} `}
                {next.baseStats.speed && `SPD: ${next.baseStats.speed} `}
                {next.baseStats.cooling && `COOL: ${next.baseStats.cooling} `}
                {next.baseStats.energyOutput && `PWR: ${next.baseStats.energyOutput} `}
                {next.baseStats.energyCost > 0 && <span className="text-red-400">⚡-{next.baseStats.energyCost}</span>}
             </div>
          </div>
          
          <div className="space-y-1 mb-3">
             {(Object.keys(next.cost) as (keyof Resources)[]).map(res => (
                <div key={res} className="flex justify-between text-[9px] md:text-[10px] font-mono border-b border-zinc-800/50 pb-0.5">
                   <span className="text-zinc-500 uppercase">{res}</span>
                   <span className={resources[res] >= (next.cost[res] || 0) ? 'text-green-400' : 'text-red-500'}>
                      {next.cost[res]?.toLocaleString()}
                   </span>
                </div>
             ))}
          </div>
       </div>
       
       <button 
         disabled={!canAfford}
         onClick={() => onBuy(type)}
         className={`w-full py-2 md:py-3 text-[10px] md:text-xs font-bold pixel-text transition-all border active:scale-95
            ${canAfford 
              ? 'bg-cyan-900/50 border-cyan-500 hover:bg-cyan-500 hover:text-black text-cyan-400' 
              : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'}
         `}
       >
         {canAfford ? 'УЛУЧШИТЬ' : 'НЕДОСТУПНО'}
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
  
  const [logs, setLogs] = useState<{msg: string, color?: string}[]>([
    {msg: "СИСТЕМА ИНИЦИАЛИЗИРОВАНА..."}, 
    {msg: "ОЖИДАНИЕ КОМАНД..."}
  ]);
  
  const lastBiomeRef = useRef<string>(BIOMES[0].name);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const eventCheckTickRef = useRef(0); 
  const hazardTickRef = useRef(0);
  const bossAttackTickRef = useRef(0); 
  const droneTickRef = useRef(0);
  const forgeUnlockTriggered = useRef(false);
  const cityUnlockTriggered = useRef(false);
  const skillsUnlockTriggered = useRef(false);
  const node2UnlockTriggered = useRef(false);
  
  // REFS
  const particleRef = useRef<ParticleHandle>(null);
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

  const handleObjectCatch = useCallback((id: string, type: FlyingObject['type']) => {
      setState(prev => {
         const obj = prev.flyingObjects.find(o => o.id === id);
         if (!obj) return prev;
         const newResources = { ...prev.resources };
         let newXp = prev.xp;
         let log = "";
         if (type === 'GEODE_SMALL') { const gem = Math.random() > 0.5 ? 'rubies' : 'emeralds'; newResources[gem] += 1; newXp += 25; }
         else if (type === 'GEODE_LARGE') { const gem = 'diamonds'; newResources[gem] += 1; newXp += 100; }
         else { newResources.ancientTech += 2; newXp += 50; }
         
         audioEngine.playClick();
         return { ...prev, resources: newResources, xp: newXp, flyingObjects: prev.flyingObjects.filter(o => o.id !== id) };
      });
  }, []);

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
        torque: drill.gearbox.baseStats.torque,
        critChance: drill.logic.baseStats.critChance,
        clickMult: drill.control.baseStats.clickMultiplier,
        defense: drill.armor.baseStats.defense,
        integrity: drill.hull.baseStats.maxIntegrity
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
        const newResources = { ...prev.resources };
        let nextEffects = [...prev.activeEffects];
        const nextQueue = [...prev.eventQueue];
        let newXp = prev.xp;
        let nextObjects = [...prev.flyingObjects];
        let nextBoss = prev.currentBoss ? { ...prev.currentBoss } : null;
        let nextInventory = [...prev.inventory];
        let nextAnalyzer = { ...prev.analyzer };
        
        // --- ANALYZER TICK ---
        if (nextAnalyzer.activeItemInstanceId) {
            nextAnalyzer.timeLeft = Math.max(0, nextAnalyzer.timeLeft - 1); 
            if (nextAnalyzer.timeLeft <= 0) {
               const itemIndex = nextInventory.findIndex(i => i.instanceId === nextAnalyzer.activeItemInstanceId);
               if (itemIndex > -1) {
                  nextInventory[itemIndex] = { ...nextInventory[itemIndex], isIdentified: true };
                  audioEngine.playClick(); 
               }
               nextAnalyzer.activeItemInstanceId = null;
            }
        }
        
        // Drone Logic
        droneTickRef.current++;
        if (droneTickRef.current >= 10) { 
           droneTickRef.current = 0;
           if (prev.activeDrones.includes('COLLECTOR') && nextObjects.length > 0) {
              const target = nextObjects[0];
              if (target.type === 'GEODE_SMALL') { const gem = Math.random() > 0.5 ? 'rubies' : 'emeralds'; newResources[gem] += 1; newXp += 25; }
              else if (target.type === 'GEODE_LARGE') { const gem = 'diamonds'; newResources[gem] += 1; newXp += 100; }
              else { newResources.ancientTech += 2; newXp += 50; }
              nextObjects = nextObjects.filter(o => o.id !== target.id);
           }
           if (prev.activeDrones.includes('COOLER') && newHeat > 0) newHeat = Math.max(0, newHeat - 2.0);
           if (prev.activeDrones.includes('BATTLE') && nextBoss) {
              nextBoss = { ...nextBoss, currentHp: Math.max(0, nextBoss.currentHp - 50) };
              setBossHitEffect(true); setTimeout(() => setBossHitEffect(false), 100);
           }
        }

        // Particle Logic
        if (activeView === View.DRILL && particleRef.current && drillContainerRef.current) {
          const currentBiomeIndex = BIOMES.findIndex((b, i) => {
             const next = BIOMES[i + 1];
             return prev.depth >= b.depth && (!next || prev.depth < next.depth);
          });
          const actualBiomeIndex = currentBiomeIndex >= 0 ? currentBiomeIndex : 0;
          const currentBiome = BIOMES[actualBiomeIndex];
          
          const rect = drillContainerRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height * 0.75; 
          
          if (isDrilling && !isOverheated && !isBroken) particleRef.current.emit(centerX, centerY, currentBiome.color, 'DEBRIS', 2);
          if (prev.heat > 50 && Math.random() < (prev.heat / 200)) particleRef.current.emit(centerX, centerY, '#FFA500', 'SPARK', 1);
          if (prev.heat > 80 || isOverheated) particleRef.current.emit(centerX + (Math.random()-0.5)*50, centerY, '#333333', 'SMOKE', 1);
        }

        // Boss Logic
        if (!nextBoss && prev.depth > 200 && (prev.depth - prev.lastBossDepth) >= 500 && nextQueue.length === 0) {
           const currentBiomeIndex = BIOMES.findIndex((b, i) => {
              const next = BIOMES[i + 1];
              return prev.depth >= b.depth && (!next || prev.depth < next.depth);
           });
           const actualBiomeIndex = currentBiomeIndex >= 0 ? currentBiomeIndex : 0;
           nextBoss = generateBoss(prev.depth, BIOMES[actualBiomeIndex].name);
           addLog(`!!! ВНИМАНИЕ: ${nextBoss.description} !!!`, "text-red-500 font-bold");
           setActiveView(View.COMBAT);
        }

        if (nextBoss) {
           bossAttackTickRef.current++;
           if (bossAttackTickRef.current >= nextBoss.attackSpeed && !isBroken) {
              bossAttackTickRef.current = 0;
              const dmg = Math.max(1, nextBoss.damage * (1 - stats.defense / 100)); 
              newIntegrity -= dmg;
              setBossHitEffect(false); 
              if (dmg > 5) addLog(`УДАР ПО КОРПУСУ: -${dmg.toFixed(0)}%`, "text-red-500");
           }
           
           if (nextBoss.currentHp <= 0) {
              addLog(`ЦЕЛЬ УНИЧТОЖЕНА: ${nextBoss.name}`, "text-green-500 font-black");
              newXp += nextBoss.reward.xp;
              for (const [key, val] of Object.entries(nextBoss.reward.resources)) newResources[key as keyof Resources] = (newResources[key as keyof Resources] || 0) + (val || 0);
              nextBoss = null;
              setActiveView(View.DRILL);
              return { ...prev, currentBoss: null, lastBossDepth: Math.floor(prev.depth), xp: newXp, resources: newResources, inventory: nextInventory, activeEffects: nextEffects, eventQueue: nextQueue }; 
           }
        }

        // Unlocks
        let nextForgeUnlocked = prev.forgeUnlocked;
        let nextCityUnlocked = prev.cityUnlocked;
        let nextSkillsUnlocked = prev.skillsUnlocked;
        let nextStorageLevel = prev.storageLevel;

        if (newDepth >= 20 && !prev.forgeUnlocked) { 
           nextForgeUnlocked = true; 
           nextQueue.unshift({ id: 'FORGE_UNLOCK', title: 'СИСТЕМА ОБНОВЛЕНА: КУЗНИЦА', description: '>> Диагностика завершена. Доступ к улучшениям.', type: 'NOTIFICATION', weight: 0 }); 
        }
        if (newDepth >= 100 && !prev.cityUnlocked) {
           nextCityUnlocked = true;
           nextQueue.unshift({ id: 'CITY_UNLOCK', title: 'СИГНАЛ: ПОСЕЛЕНИЕ', description: '>> Обнаружен подземный хаб. Торговля доступна.', type: 'NOTIFICATION', weight: 0 });
        }
        if (newDepth >= 50 && prev.storageLevel === 0) {
           nextStorageLevel = 1;
           nextQueue.unshift({ id: 'STORAGE_UNLOCK', title: 'ХРАНИЛИЩЕ: АКТИВИРОВАНО', description: '>> Найден неизвестный объект. Отсек анализа готов.', type: 'ARTIFACT', weight: 0 });
        }
        if (newDepth >= 300 && !prev.skillsUnlocked) {
            nextSkillsUnlocked = true;
            nextQueue.unshift({ id: 'SKILLS_UNLOCK', title: 'НЕЙРО-СЕТЬ: ОНЛАЙН', description: '>> Подключение к коре головного мозга установлено.', type: 'NOTIFICATION', weight: 0 });
        }

        // Hazard Logic
        const currentBiomeIndex = BIOMES.findIndex((b, i) => {
           const next = BIOMES[i + 1];
           return newDepth >= b.depth && (!next || newDepth < next.depth);
        });
        const actualBiomeIndex = currentBiomeIndex >= 0 ? currentBiomeIndex : 0;
        const currentBiome = BIOMES[actualBiomeIndex];

        hazardTickRef.current++;
        if (hazardTickRef.current >= 10 && !isBroken && !isOverheated) {
           hazardTickRef.current = 0;
           if (currentBiome.hazard !== 'NONE' && !nextBoss) { 
              const hazardDmg = currentBiome.hazardLevel;
              const netDamage = Math.max(0, hazardDmg * (1 - stats.defense / 100) * 0.1); 
              if (netDamage > 0) newIntegrity = Math.max(0, newIntegrity - netDamage);
           }
           if (currentBiome.hazard === 'NONE' && newIntegrity < stats.integrity && !nextBoss) {
               newIntegrity = Math.min(stats.integrity, newIntegrity + 1);
           }
        }

        if (newIntegrity <= 0 && !isBroken) {
           setIsBroken(true); setIsDrilling(false);
           if (nextBoss) { nextBoss = null; newDepth = Math.max(0, newDepth - 100); setActiveView(View.DRILL); }
        }
        if (isBroken) {
           newIntegrity += 0.5; 
           if (newIntegrity >= stats.integrity) { setIsBroken(false); addLog("ОБШИВКА ВОССТАНОВЛЕНА", "text-green-500"); }
        }

        // Physics
        if (isOverheated) {
          newHeat = Math.max(0, newHeat - 0.4);
          if (newHeat <= 0) { setIsOverheated(false); addLog("СИСТЕМЫ ОХЛАЖДЕНЫ."); }
        } else if (!isBroken) {
          newHeat = Math.max(0, newHeat - stats.totalCooling * 0.1); // Passive cooling
          
          if (isDrilling && !nextBoss) {
            const skillMods = calculateSkillModifiers(prev.skillLevels);
            const hardness = Math.min(1.0, (newDepth / 10000));
            const pierce = Math.min(1.0, stats.torque / 100);
            const speedPenalty = Math.max(0.1, 1.0 - (hardness - pierce));
            
            const drillPower = stats.totalSpeed * speedPenalty * (1 + skillMods.autoSpeedPct/100);
            newDepth += drillPower;
            newHeat += 0.85; 
            newResources[currentBiome.resource] += drillPower * 0.3 * (1 + skillMods.resourceMultPct/100);
            
            if (newHeat >= 100) { newHeat = 100; setIsOverheated(true); setIsDrilling(false); addLog("!!! КРИТИЧЕСКИЙ ПЕРЕГРЕВ !!!", "text-red-500 font-bold"); }
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
          storageLevel: nextStorageLevel as 0|1|2,
          inventory: nextInventory,
          analyzer: nextAnalyzer,
          flyingObjects: nextObjects, 
          currentBoss: nextBoss
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isDrilling, isOverheated, isBroken, hasStarted, addLog, activeView]);

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
      const newResources = { ...prev.resources };
      let canAfford = true;
      (Object.keys(nextPart.cost) as (keyof Resources)[]).forEach(res => { if (newResources[res] < (nextPart?.cost[res] || 0)) canAfford = false; });
      if (!canAfford) return prev;
      (Object.keys(nextPart.cost) as (keyof Resources)[]).forEach(res => { newResources[res] -= (nextPart?.cost[res] || 0); });
      audioEngine.playClick();
      return { ...prev, resources: newResources, drill: { ...prev.drill, [type]: nextPart }, integrity: (type === 'hull' ? (nextPart as HullPart).baseStats.maxIntegrity : prev.integrity) };
  });

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

  const handleEventOption = (optionId?: string) => {
    setState(prev => {
       const [currentEvent, ...remainingEvents] = prev.eventQueue;
       if (!currentEvent) return prev;
       let nextEffects = [...prev.activeEffects];
       let nextResources = { ...prev.resources };
       if (optionId === 'purge_nanomites') { nextResources.nanoSwarm += 10; addLog("НАНИТЫ ПЕРЕРАБОТАНЫ", "text-cyan-500"); } 
       else if (optionId === 'accept_fluctuation') { const effect = createEffect('QUANTUM_FLUCTUATION_EFFECT'); if (effect) nextEffects.push(effect); }
       if (currentEvent.forceArtifactDrop || currentEvent.type === 'ARTIFACT') {
           const def = rollArtifact(prev.depth);
           const newItem: InventoryItem = { instanceId: Math.random().toString(36).substr(2, 9), defId: def.id, acquiredAt: Date.now(), isIdentified: false, isEquipped: false };
           if (prev.inventory.length < 12) return { ...prev, inventory: [...prev.inventory, newItem], eventQueue: remainingEvents, activeEffects: nextEffects, resources: nextResources };
           else addLog("СКЛАД ПЕРЕПОЛНЕН. АРТЕФАКТ УТЕРЯН.", "text-red-500");
       }
       return { ...prev, eventQueue: remainingEvents, activeEffects: nextEffects, resources: nextResources };
    });
  };

  const currentBiome = BIOMES.slice().reverse().find(b => state.depth >= b.depth) || BIOMES[0];
  const stats = {
     prod: state.drill.power.baseStats.energyOutput,
     cons: state.drill.bit.baseStats.energyCost + state.drill.engine.baseStats.energyCost + state.drill.cooling.baseStats.energyCost + state.drill.logic.baseStats.energyCost + state.drill.control.baseStats.energyCost + state.drill.gearbox.baseStats.energyCost + state.drill.armor.baseStats.energyCost
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden relative selection:bg-cyan-900 selection:text-white">
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

              {/* HUD: Stats (Top Right) - FIXED ALIGNMENT */}
              <div className="absolute top-2 right-2 z-10 w-28 md:w-48 bg-black/50 backdrop-blur border border-zinc-700 p-2">
                 <div className="flex justify-between text-[7px] md:text-[8px] text-zinc-400 mb-1">
                    <span>ОБШИВКА</span>
                    <span>{state.integrity.toFixed(0)}</span>
                 </div>
                 {/* SAME WIDTH AND MARGINS FOR BOTH BARS */}
                 <div className="w-full h-1.5 md:h-2 bg-zinc-900 border border-zinc-800 mb-2">
                    <div className={`h-full transition-all duration-300 ${state.integrity < state.drill.hull.baseStats.maxIntegrity * 0.3 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${Math.max(0, (state.integrity / state.drill.hull.baseStats.maxIntegrity) * 100)}%` }} />
                 </div>
                 
                 <div className="flex justify-between text-[7px] md:text-[8px] text-zinc-400 mb-1">
                    <span>НАГРЕВ</span>
                    <span className={state.heat > 80 ? 'text-red-500 animate-pulse' : ''}>{state.heat.toFixed(0)}%</span>
                 </div>
                 <div className="w-full h-1.5 md:h-2 bg-zinc-900 border border-zinc-800">
                    <div className={`h-full transition-all duration-300 ${state.heat > 80 ? 'bg-red-500' : 'bg-cyan-600'}`} style={{ width: `${state.heat}%` }} />
                 </div>
              </div>

              <div className="absolute inset-0 z-0 cursor-crosshair active:scale-[0.99] transition-transform"
                onMouseDown={() => { if (!isOverheated && !isBroken) setIsDrilling(true); }}
                onMouseUp={() => setIsDrilling(false)}
                onMouseLeave={() => setIsDrilling(false)}
                onTouchStart={() => { if (!isOverheated && !isBroken) setIsDrilling(true); }}
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
                 <div className="absolute inset-0 z-40 cursor-crosshair active:scale-[1.02] transition-transform" onMouseDown={() => setIsDrilling(true)} onMouseUp={() => setIsDrilling(false)} />
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

               <div className="flex-1 p-2 md:p-8 overflow-y-auto scrollbar-hide pb-24">
                  {forgeTab === 'DRILL' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="НАКОНЕЧНИК" current={state.drill.bit} next={BITS[BITS.findIndex(p=>p.id===state.drill.bit.id)+1]} type="bit" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ДВИГАТЕЛЬ" current={state.drill.engine} next={ENGINES[ENGINES.findIndex(p=>p.id===state.drill.engine.id)+1]} type="engine" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ОХЛАЖДЕНИЕ" current={state.drill.cooling} next={COOLERS[COOLERS.findIndex(p=>p.id===state.drill.cooling.id)+1]} type="cooling" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'SYSTEMS' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="ЛОГИКА" current={state.drill.logic} next={LOGIC_CORES[LOGIC_CORES.findIndex(p=>p.id===state.drill.logic.id)+1]} type="logic" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="УПРАВЛЕНИЕ" current={state.drill.control} next={CONTROL_UNITS[CONTROL_UNITS.findIndex(p=>p.id===state.drill.control.id)+1]} type="control" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="РЕДУКТОР" current={state.drill.gearbox} next={GEARBOXES[GEARBOXES.findIndex(p=>p.id===state.drill.gearbox.id)+1]} type="gearbox" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'HULL' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="КАРКАС" current={state.drill.hull} next={HULLS[HULLS.findIndex(p=>p.id===state.drill.hull.id)+1]} type="hull" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="ПИТАНИЕ" current={state.drill.power} next={POWER_CORES[POWER_CORES.findIndex(p=>p.id===state.drill.power.id)+1]} type="power" resources={state.resources} onBuy={handleBuyUpgrade} />
                        <UpgradeCard title="БРОНЯ" current={state.drill.armor} next={ARMORS[ARMORS.findIndex(p=>p.id===state.drill.armor.id)+1]} type="armor" resources={state.resources} onBuy={handleBuyUpgrade} />
                     </div>
                  )}
                  {forgeTab === 'FUSION' && (
                     <div className="text-center text-zinc-500 font-mono mt-10 text-xs">СИСТЕМА СЛИЯНИЯ АКТИВНА. ОЖИДАНИЕ КОМПОНЕНТОВ.</div>
                  )}
                  {forgeTab === 'DRONES' && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                        {DRONES.map(drone => (
                           <div key={drone.id} className="bg-zinc-900 border border-zinc-700 p-3 md:p-4">
                              <h4 className="font-bold pixel-text mb-2 text-xs" style={{ color: drone.color }}>{drone.name}</h4>
                              <p className="text-[10px] md:text-xs text-zinc-400 mb-4">{drone.description}</p>
                              <button className="w-full bg-zinc-800 text-zinc-500 text-[10px] py-2 border border-zinc-700">НЕДОСТУПНО</button>
                           </div>
                        ))}
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
