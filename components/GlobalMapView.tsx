/**
 * GLOBAL MAP VIEW — Основной экран навигации, рынка и караванов
 * Содержит Изометрическую карту, вкладки и модальные окна
 */

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { IsometricCanvas } from './GlobalMap/IsometricCanvas';
import { REGIONS, REGION_IDS } from '../constants/regions';
import { RegionId, ResourceType } from '../types';
import { CaravanPanel } from './CaravanPanel';
import { MarketView } from './MarketView';
import QuestPanel from './QuestPanel';
import FactionPanel from './FactionPanel';
import { BuildBaseModal } from './BuildBaseModal';
import { BaseView } from './BaseView';
import { useDrillStats, useMapState, useMapActions } from '../store/selectors';
import { calculateDistance } from '../services/regionMath';
import { FUEL_TYPES, getFuelLabel } from '../services/travelMath';
import { TL, t } from '../services/localization';
import {
    Map as MapIcon,
    ShoppingBag,
    Truck,
    ScrollText,
    Crown,
    Package,
    Fuel,
    ArrowUpCircle,
    Navigation,
    Clock,
    Activity,
    AlertTriangle,
    Hammer,
    Satellite,
    Zap,
    Search,
    Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mathematical Engine v0.3.6
import { calculateTotalMass, calculateFuelConsumption } from '../services/mathEngine';
import { FuelType } from '../services/mathEngineConfig';

const TravelOverlay = ({ travel, lang }: { travel: any, lang: string }) => {
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
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-3xl animate-in fade-in duration-700">
            <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />

            <div className="w-full max-w-xl p-10 glass-panel border-cyan-500/20 relative overflow-hidden group shadow-[0_0_100px_rgba(34,211,238,0.1)]">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Satellite className="w-32 h-32" />
                </div>

                <div className="flex flex-col items-center relative z-10">
                    <div className="p-4 glass-panel border-cyan-500/30 bg-cyan-500/5 mb-8 rounded-2xl pulse-glow-cyan">
                        <Navigation className="w-10 h-10 text-cyan-400" />
                    </div>

                    <h3 className="text-3xl font-black font-technical text-white uppercase tracking-[0.3em] mb-3 italic">
                        {lang === 'RU' ? 'ТРАНСПОРТИРОВКА' : 'TRANSIT_PROTOCOL_ACTIVE'}
                    </h3>

                    <div className="flex items-center gap-6 text-white/30 font-technical text-[10px] mb-10 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2 glass-panel border-white/5 bg-white/5 py-1 px-3">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span>Dist: <span className="text-white font-bold">{travel.distance} KM</span></span>
                        </div>
                        <div className="flex items-center gap-2 glass-panel border-white/5 bg-white/5 py-1 px-3">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>ETA: <span className="text-white font-bold">{timeLeft}S</span></span>
                        </div>
                    </div>

                    <div className="w-full space-y-2 mb-10">
                        <div className="flex justify-between text-[8px] font-black font-technical text-cyan-400/60 uppercase tracking-widest px-1">
                            <span>Phase_Optimization</span>
                            <span>{Math.floor(progress)}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 glass-panel border-rose-500/20 bg-rose-500/5 py-2 px-6 text-[9px] font-black font-technical text-rose-400 uppercase tracking-[0.2em]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Mass-Dependent Physics Applied</span>
                        </div>
                        <span className="text-[8px] text-white/20 font-technical uppercase italic">Void-Piercer Guidance System v.4.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GlobalMapView = () => {
    const [activeTab, setActiveTab] = useState<'map' | 'market' | 'caravans' | 'quests' | 'factions'>('map');
    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<ResourceType>(ResourceType.COAL);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
    const [managedBaseId, setManagedBaseId] = useState<string | null>(null);

    const { drill, resources, stats, equipmentInventory } = useDrillStats();
    const { level, unlockedLicenses, travel, currentRegion, playerBases, caravans, currentCargoWeight } = useMapState();
    const { travelToRegion, buildBase } = useMapActions();
    const lang = useGameStore(s => s.settings.language);

    const maxCapacity = useMemo(() => stats.totalCargoCapacity || 5000, [stats.totalCargoCapacity]);
    const currentRegionData = useMemo(() => REGIONS[currentRegion], [currentRegion]);
    const isOverloaded = useMemo(() => currentCargoWeight > maxCapacity, [currentCargoWeight, maxCapacity]);
    const currentBase = useMemo(() => playerBases.find(b => b.regionId === currentRegion), [playerBases, currentRegion]);
    const hasStationAccess = useMemo(() => currentBase?.type === 'station', [currentBase]);
    const hasCaravanAccess = useMemo(() => playerBases.length > 0, [playerBases]);

    const handleTravel = () => {
        if (selectedRegion && selectedRegion !== currentRegion) {
            travelToRegion(selectedRegion, selectedFuel);
        }
    };

    const tabs = [
        { id: 'map', label: TL.ui.map, icon: <MapIcon className="w-4 h-4" />, color: 'text-cyan-400' },
        { id: 'market', label: TL.ui.market, icon: <ShoppingBag className="w-4 h-4" />, color: 'text-amber-400', locked: !hasStationAccess },
        { id: 'caravans', label: TL.ui.caravans, icon: <Truck className="w-4 h-4" />, color: 'text-purple-400', locked: !hasCaravanAccess },
        { id: 'quests', label: TL.ui.quests, icon: <ScrollText className="w-4 h-4" />, color: 'text-rose-400' },
        { id: 'factions', label: TL.ui.factions, icon: <Crown className="w-4 h-4" />, color: 'text-emerald-400' },
    ];

    const formatVal = (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v;

    return (
        <div className="flex-1 flex flex-col bg-void text-white pb-20 md:pb-4 relative overflow-hidden h-full">
            <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
            <AnimatePresence>
                {travel && <TravelOverlay travel={travel} lang={lang} />}
            </AnimatePresence>

            {/* HEADER HUB BENTO */}
            <div className="max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col gap-8 relative z-10 shrink-0">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 glass-panel border-cyan-500/20 bg-cyan-500/5 hidden md:block">
                                <Satellite className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl md:text-7xl font-black font-technical uppercase tracking-tighter italic text-white leading-none">
                                    {t(TL.ui.map, lang)}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="glass-panel px-3 py-1 border-white/10 bg-white/5 flex items-center gap-2">
                                        <span className="text-[8px] font-black font-technical text-white/30 uppercase tracking-widest">{t(TL.ui.sectorId, lang)}</span>
                                        <span className="text-[10px] md:text-xs font-black font-technical text-cyan-400">AEGIS_CORE_7</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black font-technical uppercase tracking-[0.2em] text-white/30">
                            <div className="flex items-center gap-2 text-emerald-400 glass-panel px-3 py-1 border-emerald-500/20 bg-emerald-500/5">
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                <span>{t(TL.ui.scanningActive, lang)}</span>
                            </div>
                            <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                                <span>{t(TL.ui.authClearance, lang)}</span>
                                <div className="flex gap-2">
                                    {(['green', 'yellow', 'red'] as const).map(zone => (
                                        <div key={zone} className={`w-3 h-3 rounded-full border border-black/40 transition-shadow duration-500 ${unlockedLicenses.includes(zone)
                                            ? zone === 'green' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                                                : zone === 'yellow' ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                                                    : 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                                            : 'bg-white/5 grayscale border-white/5'
                                            }`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NAV DECK TABS */}
                    <div className="w-full lg:w-auto flex glass-panel p-1 md:p-2 border-white/5 bg-black/40 overflow-x-auto no-scrollbar shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                disabled={tab.locked}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-none transition-all font-technical text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] relative group shrink-0
                                    ${tab.locked ? 'opacity-20 cursor-not-allowed grayscale' :
                                        activeTab === tab.id ? 'text-white bg-white/10' : 'text-white/30 hover:text-white/60'}
                                `}
                            >
                                <span className={`transition-transform duration-300 group-hover:scale-125 ${activeTab === tab.id ? tab.color : ''} [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4`}>{tab.icon}</span>
                                <span className="whitespace-nowrap">{t(tab.label, lang)}</span>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="map-tab-active" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_-4px_10px_white]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD SCENE */}
            <div className="max-w-7xl w-full mx-auto px-6 md:px-10 mt-4 flex-1 flex flex-col gap-8 overflow-y-auto min-h-0 pb-32 scrollbar-hide relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'map' && (
                        <motion.div
                            key="map-scene"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full min-h-0 md:min-h-[660px]"
                        >
                            {/* LEFT WING: TELEMETRY & STATUS */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <BentoStat icon={<Activity className="text-cyan-400" />} label={t(TL.ui.currentSector, lang)} val={t(TL.regions[currentRegion] || currentRegionData.name, lang)} />
                                    <BentoStat icon={<Package className={isOverloaded ? 'text-rose-500' : 'text-emerald-400'} />} label={t(TL.ui.cargoLoad, lang)} val={`${Math.floor(currentCargoWeight)}/${Math.floor(maxCapacity)}`} urgent={isOverloaded} />
                                    <BentoStat icon={<Fuel className="text-amber-400" />} label={t(TL.ui.carbonUnits, lang)} val={resources[ResourceType.COAL]} />
                                    <BentoStat icon={<ArrowUpCircle className="text-purple-400" />} label={t(TL.ui.expDegree, lang)} val={`Rank_${level}`} />
                                </div>

                                {/* SCANNER INTERFACE */}
                                <div className="glass-panel border-white/5 bg-black/40 overflow-hidden flex flex-col p-4 md:p-6 relative group">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Cpu className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <h3 className="text-[10px] font-black font-technical text-white/50 uppercase tracking-[0.3em]">{t(TL.ui.regionDescriptor, lang)}</h3>
                                    </div>

                                    <div className="space-y-4 md:space-y-6 flex-1">
                                        <AnimatePresence mode="wait">
                                            {selectedRegion ? (
                                                <motion.div key={selectedRegion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
                                                    <div>
                                                        <h4 className="text-xl md:text-2xl font-black font-technical uppercase italic text-white mb-2">{t(TL.regions[selectedRegion] || REGIONS[selectedRegion].name, lang)}</h4>
                                                        <p className="text-[10px] md:text-xs text-white/40 font-technical italic pr-4 md:pr-8">"{t(REGIONS[selectedRegion].description || '', lang)}"</p>
                                                    </div>

                                                    {selectedRegion !== currentRegion ? (
                                                        <div className="space-y-3 md:space-y-4">
                                                            <div>
                                                                <label className="text-[8px] font-black font-technical uppercase text-white/30 mb-2 block tracking-widest">{t(TL.ui.propulsionSource, lang)}</label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {FUEL_TYPES.map(fuel => {
                                                                        const available = resources[fuel] || 0;
                                                                        const totalMass = calculateTotalMass(drill, resources, equipmentInventory);
                                                                        const distance = calculateDistance(currentRegion, selectedRegion);
                                                                        const cost = Math.ceil(calculateFuelConsumption(distance, totalMass.grossWeight, maxCapacity, fuel as FuelType, currentRegion as any));
                                                                        const canAfford = available >= cost;
                                                                        return (
                                                                            <button
                                                                                key={fuel}
                                                                                disabled={!canAfford}
                                                                                onClick={() => setSelectedFuel(fuel)}
                                                                                className={`p-2 md:p-3 glass-panel text-left border-white/5 transition-all
                                                                                    ${selectedFuel === fuel ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/40 text-white/40 hover:bg-white/5'}
                                                                                    ${!canAfford && 'opacity-20 cursor-not-allowed'}
                                                                                `}
                                                                            >
                                                                                <div className="text-[8px] md:text-[9px] font-black font-technical uppercase mb-1">{t(TL.resources[fuel] || getFuelLabel(fuel), lang)}</div>
                                                                                <div className="text-[7px] md:text-[8px] font-technical opacity-70 italic font-bold">
                                                                                    {formatVal(available)} / {formatVal(cost)}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center py-3 md:py-4 border-y border-white/5">
                                                                <span className="text-[8px] md:text-[9px] font-black font-technical text-white/30 uppercase tracking-widest">E-Distance</span>
                                                                <span className="text-lg md:text-xl font-black font-technical text-white italic">{calculateDistance(currentRegion, selectedRegion)} KM</span>
                                                            </div>
                                                            <button
                                                                onClick={handleTravel}
                                                                disabled={isOverloaded}
                                                                className={`w-full py-4 md:py-5 font-black font-technical text-[10px] md:text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                                                                ${isOverloaded
                                                                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-500 grayscale cursor-not-allowed'
                                                                        : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'}`}
                                                            >
                                                                <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                {isOverloaded ? t(TL.ui.overloaded, lang) : t(TL.ui.initiateTransit, lang)}
                                                            </button>
                                                        </div>
                                                    ) : currentBase ? (
                                                        <div className="glass-panel p-4 md:p-6 border-purple-500/20 bg-purple-500/5">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-8 h-8 md:w-10 md:h-10 glass-panel flex items-center justify-center bg-purple-500/10 text-purple-400">
                                                                    <Hammer className="w-4 h-4 md:w-5 md:h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-[7px] md:text-[8px] font-black font-technical text-purple-400/60 uppercase">Base_Link_Operational</div>
                                                                    <div className="text-xs md:text-sm font-black font-technical text-white uppercase">{t(TL.baseTypes[currentBase.type], lang)}</div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setManagedBaseId(currentBase.id)}
                                                                className="w-full py-2 md:py-3 glass-panel border-white/10 bg-white/5 hover:bg-white/10 text-white font-black font-technical text-[8px] md:text-[9px] uppercase tracking-widest transition-all"
                                                            >
                                                                {t(TL.ui.accessMainframe, lang)}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 md:p-6 glass-panel border-cyan-500/20 bg-cyan-500/5 text-center">
                                                            <div className="text-[10px] md:text-xs font-black font-technical text-cyan-400 uppercase tracking-widest mb-1">{t(TL.ui.youAreHere, lang)}</div>
                                                            <div className="text-[8px] md:text-[9px] font-technical text-white/40 uppercase">{t(TL.ui.awaitingCommand, lang)}</div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center opacity-20 py-10 md:py-20">
                                                    <Search className="w-10 h-10 md:w-12 md:h-12 mb-4" />
                                                    <span className="text-[9px] md:text-[10px] font-black font-technical uppercase tracking-[0.3em]">Select_Destination_Node</span>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5 flex flex-wrap gap-1.5 md:gap-2">
                                        {Object.keys(currentRegionData.resourceBonuses || {}).map(res => (
                                            <div key={res} className="px-2 md:px-3 py-0.5 md:py-1 glass-panel border-white/10 bg-white/5 text-[8px] md:text-[9px] font-black font-technical text-white/40 uppercase">
                                                {res}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CENTER STAGE: ISOMETRIC SCANNER */}
                            <div className="lg:col-span-8 glass-panel border-white/10 bg-black/60 relative overflow-hidden flex flex-col bento-glow shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] min-h-[400px] md:min-h-0 order-first md:order-none">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-4">
                                    <div className="px-3 py-1.5 md:px-4 md:py-2 glass-panel border-cyan-500/30 bg-black/60 flex items-center gap-2 md:gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[7px] md:text-[8px] font-black font-technical text-white/30 uppercase tracking-widest">{t(TL.ui.globalCoordLink, lang)}</span>
                                            <span className="text-[9px] md:text-[10px] font-black font-technical text-cyan-400 uppercase">{t(TL.ui.syncOk, lang)} // 84.192.X</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 pointer-events-auto">
                                    <IsometricCanvas
                                        regions={REGION_IDS}
                                        activeRegion={selectedRegion || currentRegion}
                                        bases={playerBases}
                                        caravans={caravans}
                                        onRegionSelect={setSelectedRegion}
                                    />
                                </div>

                                {/* BASES QUICK ACCESS BOTTOM OVERLAY */}
                                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20 flex justify-between items-end pointer-events-none">
                                    <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pointer-events-auto max-w-[70%]">
                                        {playerBases.map(base => (
                                            <button
                                                key={base.id}
                                                onClick={() => { setActiveTab('map'); setManagedBaseId(base.id); setSelectedRegion(base.regionId); }}
                                                className={`p-1 md:p-1.5 glass-panel border-white/10 bg-black/60 hover:border-cyan-400 group transition-all text-left flex items-center gap-2 md:gap-3 shrink-0
                                                  ${managedBaseId === base.id ? 'border-cyan-400 bg-cyan-400/5' : ''}
                                                `}
                                            >
                                                <div className="p-1.5 md:p-2 glass-panel border-white/10 bg-white/5 text-cyan-400">
                                                    <Hammer className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                </div>
                                                <div className="pr-2 md:pr-4 hidden sm:block">
                                                    <div className="text-[7px] md:text-[8px] font-black font-technical text-white/30 uppercase leading-none mb-1">{t(TL.baseTypes[base.type], lang)}</div>
                                                    <div className="text-[9px] md:text-[10px] font-black font-technical text-white uppercase leading-none">{t(TL.regions[base.regionId], lang)}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedRegion === currentRegion && !playerBases.find(b => b.regionId === currentRegion) && (
                                        <button
                                            onClick={() => setIsBuildModalOpen(true)}
                                            className="px-4 py-2.5 md:px-6 md:py-4 glass-panel border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 md:gap-3 font-black font-technical text-[8px] md:text-[10px] uppercase tracking-[0.2em] pointer-events-auto"
                                        >
                                            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 group-hover:text-inherit" />
                                            {t(TL.ui.establishOutpost, lang)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'market' && (
                        <motion.div key="market-scene" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                            <MarketView />
                        </motion.div>
                    )}

                    {activeTab === 'caravans' && (
                        <motion.div key="caravan-scene" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                            <CaravanPanel />
                        </motion.div>
                    )}

                    {activeTab === 'quests' && (
                        <motion.div key="quests-scene" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                            <QuestPanel />
                        </motion.div>
                    )}

                    {activeTab === 'factions' && (
                        <motion.div key="factions-scene" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                            <FactionPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {isBuildModalOpen && (
                    <BuildBaseModal
                        regionId={currentRegion}
                        onClose={() => setIsBuildModalOpen(false)}
                        onBuild={(baseType) => buildBase(currentRegion, baseType)}
                    />
                )}
                {managedBaseId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 md:p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-void/95 backdrop-blur-xl" onClick={() => setManagedBaseId(null)} />
                        <div className="relative w-full max-w-7xl h-full md:h-[90vh] glass-panel bg-void/60 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden my-auto">
                            <BaseView
                                baseId={managedBaseId}
                                onClose={() => setManagedBaseId(null)}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BentoStat = ({ icon, label, val, urgent = false }: { icon: any, label: string, val: any, urgent?: boolean }) => (
    <div className={`glass-panel p-5 bg-white/[0.03] border-white/10 flex flex-col relative overflow-hidden transition-all duration-300 hover:bg-white/[0.05]
        ${urgent ? 'border-rose-500/50 bg-rose-500/5' : ''}
    `}>
        <div className="flex items-center gap-3 mb-3 text-white/30">
            <div className="p-1.5 glass-panel border-white/10 bg-white/5">{icon}</div>
            <span className="text-[9px] font-black font-technical uppercase tracking-[0.2em]">{label}</span>
        </div>
        <div className={`text-sm md:text-base font-black font-technical text-white uppercase truncate ${urgent ? 'text-rose-400' : ''}`}>{val}</div>
        {urgent && <div className="absolute top-0 right-0 p-2 text-rose-500 animate-pulse"><AlertTriangle className="w-3 h-3" /></div>}
    </div>
);
