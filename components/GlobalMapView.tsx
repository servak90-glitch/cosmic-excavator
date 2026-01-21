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
import { audioEngine } from '../services/audioEngine';
import { calculateStats } from '../services/gameMath';
import { calculateDistance } from '../services/regionMath';
import { FUEL_TYPES, getFuelLabel } from '../services/travelMath';  // FUEL_TYPES нужен для UI
import { TL, t } from '../services/localization';

// Mathematical Engine v0.3.6
import { calculateTotalMass, calculateFuelConsumption } from '../services/mathEngine';
import { FuelType } from '../services/mathEngineConfig';

const TravelProgress = ({ travel, lang }: { travel: any, lang: string }) => {
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="w-80 p-6 bg-gray-900 border-2 border-cyan-500 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <h3 className="text-cyan-400 font-bold text-center mb-4 animate-pulse">
                    {lang === 'RU' ? 'В ПУТИ...' : 'TRAVELING...'}
                </h3>
                <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                    <span>{travel.distance} km</span>
                    <span>{timeLeft}s</span>
                </div>
                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-4 italic">
                    {lang === 'RU'
                        ? 'Масса влияет на расход топлива и скорость'
                        : 'Mass affects fuel consumption and speed'}
                </p>
            </div>
        </div>
    );
};

export const GlobalMapView = () => {
    // State
    const [activeTab, setActiveTab] = useState<'map' | 'market' | 'caravans' | 'quests' | 'factions'>('map');
    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<ResourceType>(ResourceType.COAL);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
    const [managedBaseId, setManagedBaseId] = useState<string | null>(null);

    // Store data
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const playerBases = useGameStore(s => s.playerBases);
    const caravans = useGameStore(s => s.caravans);
    const travelToRegion = useGameStore(s => s.travelToRegion);
    const buildBase = useGameStore(s => s.buildBase);
    const currentCargoWeight = useGameStore(s => s.currentCargoWeight);
    const level = useGameStore(s => s.level);
    const lang = useGameStore(s => s.settings.language);
    const unlockedLicenses = useGameStore(s => s.unlockedLicenses);
    const travel = useGameStore(s => s.travel);

    // Drill data for stats
    const drill = useGameStore(s => s.drill);
    const skillLevels = useGameStore(s => s.skillLevels);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const inventory = useGameStore(s => s.inventory);
    const equipmentInventory = useGameStore(s => s.equipmentInventory);
    const depth = useGameStore(s => s.depth);

    // Derived
    const stats = calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth);
    const maxCapacity = stats.totalCargoCapacity || 5000;
    const currentRegionData = REGIONS[currentRegion];
    const cargoRatio = maxCapacity > 0 ? currentCargoWeight / maxCapacity : 0;
    const isOverloaded = currentCargoWeight > maxCapacity;

    const currentBase = playerBases.find(b => b.regionId === currentRegion);
    const hasStationAccess = currentBase?.type === 'station';
    const hasCaravanAccess = playerBases.length > 0;
    const regionIds = useMemo(() => REGION_IDS, []);

    const handleTravel = () => {
        if (selectedRegion && selectedRegion !== currentRegion) {
            travelToRegion(selectedRegion, selectedFuel);
            // audioEngine.playTravelStart(); // Удалено, т.к. вызывается внутри travelToRegion
        }
    };

    const renderTabs = () => (
        <div className="flex overflow-x-auto scrollbar-hide touch-pan-x gap-1 sm:gap-2 w-full mt-2 md:mt-0 snap-x snap-mandatory pb-1">
            <button
                onClick={() => setActiveTab('map')}
                className={`flex-shrink-0 snap-start min-w-[60px] sm:min-w-[80px] md:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-t border-2 border-b-0 transition-all flex items-center justify-center gap-1 ${activeTab === 'map' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
            >
                <span>🗺️</span>
                <span className="hidden sm:inline">{t(TL.ui.map, lang)}</span>
            </button>
            <button
                onClick={() => setActiveTab('market')}
                className={`flex-shrink-0 snap-start min-w-[60px] sm:min-w-[80px] md:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-t border-2 border-b-0 transition-all flex items-center justify-center gap-1 ${!hasStationAccess ? 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed' : activeTab === 'market' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                disabled={!hasStationAccess}
            >
                <span>💰</span>
                <span className="hidden sm:inline">{t(TL.ui.market, lang)}</span>
                {!hasStationAccess && <span className="hidden md:inline text-[10px] ml-1">{t(TL.ui.locked, lang)}</span>}
            </button>
            <button
                onClick={() => setActiveTab('caravans')}
                className={`flex-shrink-0 snap-start min-w-[60px] sm:min-w-[80px] md:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-t border-2 border-b-0 transition-all flex items-center justify-center gap-1 ${!hasCaravanAccess ? 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed' : activeTab === 'caravans' ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                disabled={!hasCaravanAccess}
            >
                <span>🚛</span>
                <span className="hidden sm:inline">{t(TL.ui.caravans, lang)}</span>
                {!hasCaravanAccess && <span className="hidden md:inline text-[10px] ml-1">{t(TL.ui.locked, lang)}</span>}
            </button>
            <button
                onClick={() => setActiveTab('quests')}
                className={`flex-shrink-0 snap-start min-w-[60px] sm:min-w-[80px] md:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-t border-2 border-b-0 transition-all flex items-center justify-center gap-1 ${activeTab === 'quests' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
            >
                <span>📜</span>
                <span className="hidden sm:inline">{t(TL.ui.quests, lang)}</span>
            </button>
            <button
                onClick={() => setActiveTab('factions')}
                className={`flex-shrink-0 snap-start min-w-[60px] sm:min-w-[80px] md:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-t border-2 border-b-0 transition-all flex items-center justify-center gap-1 ${activeTab === 'factions' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
            >
                <span>👑</span>
                <span className="hidden sm:inline">{t(TL.ui.factions, lang)}</span>
            </button>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-black text-white p-2 md:p-4 pb-20 md:pb-4 relative overflow-hidden h-full">
            {travel && <TravelProgress travel={travel} lang={lang} />}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
            </div>

            <div className="max-w-6xl w-full mx-auto mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4 relative z-10 shrink-0">
                <div className="flex justify-between w-full md:w-auto items-center">
                    <div>
                        <h1 className="text-3xl md:text-6xl font-black mb-1 md:mb-2 tracking-tighter pixel-text text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                            {t(TL.ui.map, lang).toUpperCase()}
                        </h1>
                        <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-mono text-gray-400">
                            <span>SECTOR: AEGIS-7</span>
                            <span className="text-cyan-500">STATUS: ACTIVE</span>
                            <div className="flex items-center gap-2 ml-4 bg-gray-900/50 border border-gray-800 rounded px-2 py-0.5">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">{lang === 'RU' ? 'Лицензии' : 'Licenses'}:</span>
                                <div className="flex gap-1.5">
                                    {(['green', 'yellow', 'red'] as const).map(zone => (
                                        <div key={zone} className={`w-2 h-2 rounded-full ${unlockedLicenses.includes(zone)
                                            ? zone === 'green' ? 'bg-green-500 shadow-[0_0_4px_#22c55e]'
                                                : zone === 'yellow' ? 'bg-yellow-400 shadow-[0_0_4px_#facc15]'
                                                    : 'bg-red-500 shadow-[0_0_4px_#ef4444]'
                                            : 'bg-gray-800'
                                            }`} title={`${zone.toUpperCase()} license`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {renderTabs()}
            </div>

            <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-4 relative z-10 min-h-0 overflow-y-auto touch-pan-y overscroll-contain">
                {activeTab === 'map' && (
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-3 md:p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.currentRegion, lang)}</p>
                                    <p className="text-cyan-400 font-bold text-xs md:text-base text-nowrap">{t(TL.regions[currentRegion] || currentRegionData.name, lang)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.cargo, lang)}</p>
                                    <p className={`font-bold text-xs md:text-base ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                        {Math.floor(currentCargoWeight)} / {Math.floor(maxCapacity)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.fuel, lang)}</p>
                                    <p className="text-yellow-400 font-bold text-xs md:text-base">{resources[ResourceType.COAL]}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.level, lang)}</p>
                                    <p className="text-purple-400 font-bold text-xs md:text-base">Lvl {level}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="w-full h-[300px] md:h-[400px] bg-black/40 border-2 border-gray-700 rounded-lg overflow-hidden relative shadow-inner"
                            style={{ touchAction: 'none' }}
                        >
                            <IsometricCanvas
                                regions={regionIds as any}
                                activeRegion={currentRegion}
                                bases={playerBases}
                                caravans={caravans}
                                onRegionSelect={setSelectedRegion}
                            />
                            <div className="absolute top-2 right-2 md:top-4 md:right-4 pointer-events-none text-right hidden md:block">
                                <p className="text-[10px] text-gray-500 font-mono">LMB: SELECT</p>
                                <p className="text-[10px] text-gray-500 font-mono">DRAG: PAN</p>
                            </div>
                        </div>

                        {selectedRegion && selectedRegion !== currentRegion && (
                            <div className="bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-4 md:p-6 mb-4">
                                <h3 className="text-lg md:text-2xl font-bold text-cyan-400 mb-3 md:mb-4">
                                    🚀 {t(TL.ui.travelTo, lang)} {t(TL.regions[selectedRegion], lang)}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label className="block text-gray-400 text-xs md:text-sm mb-2">{t(TL.ui.selectFuel, lang)}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FUEL_TYPES.map(fuel => {
                                                const available = resources[fuel] || 0;
                                                // NEW: Используем mathEngine v0.3.6
                                                const totalMass = calculateTotalMass(drill, resources, equipmentInventory);
                                                const distance = calculateDistance(currentRegion, selectedRegion);
                                                const cost = Math.ceil(calculateFuelConsumption(
                                                    distance,
                                                    totalMass.grossWeight,
                                                    maxCapacity,
                                                    fuel as FuelType,
                                                    currentRegion as any  // RegionId совместим
                                                ));
                                                const canAfford = available >= cost;
                                                return (
                                                    <button
                                                        key={fuel}
                                                        onClick={() => setSelectedFuel(fuel)}
                                                        disabled={!canAfford}
                                                        className={`p-2 md:p-3 rounded border transition-all text-left ${selectedFuel === fuel ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-600'} ${!canAfford ? 'opacity-50' : ''}`}
                                                    >
                                                        <div className="font-bold text-xs md:text-sm text-white">{t(TL.resources[fuel] || getFuelLabel(fuel), lang)}</div>
                                                        <div className="text-[10px] md:text-xs text-gray-400">{available} / {cost}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between md:block">
                                            <p className="text-gray-400 text-xs">{t(TL.ui.distance, lang)}</p>
                                            <p className="text-white font-bold">{calculateDistance(currentRegion, selectedRegion)} km</p>
                                        </div>
                                        <button onClick={handleTravel} disabled={isOverloaded}
                                            className={`w-full py-3 rounded-lg font-bold text-sm md:text-lg transition-all ${isOverloaded ? 'bg-red-900 text-red-300' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>
                                            {isOverloaded ? t(TL.ui.overloaded, lang) : `🚀 ${t(TL.ui.startTravel, lang)}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedRegion && playerBases.find(b => b.regionId === selectedRegion) && (
                            <div className="bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-4 md:p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] mb-4">
                                <h3 className="text-lg md:text-2xl font-bold text-cyan-400 mb-2">
                                    🏢 {lang === 'RU' ? 'Ваша база' : 'Your Base'}
                                </h3>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-sm text-gray-400">
                                        {playerBases.find(b => b.regionId === selectedRegion)?.type.toUpperCase()} - {t(TL.regions[selectedRegion], lang)}
                                    </p>
                                    <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase">Active</span>
                                </div>
                                <button
                                    onClick={() => setManagedBaseId(playerBases.find(b => b.regionId === selectedRegion)?.id || null)}
                                    className="w-full py-3 rounded-lg font-bold text-sm md:text-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-900/40"
                                >
                                    ⚙️ {lang === 'RU' ? 'УПРАВЛЯТЬ БАЗОЙ' : 'MANAGE BASE'}
                                </button>
                            </div>
                        )}

                        {selectedRegion && !playerBases.find(b => b.regionId === selectedRegion) && (
                            <div className="bg-gray-800/80 border-2 border-green-500 rounded-lg p-4 md:p-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <h3 className="text-lg md:text-2xl font-bold text-green-400 mb-3">
                                    🏗️ {lang === 'RU' ? 'Построить базу' : 'Build Base'}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    No base in {t(TL.regions[selectedRegion], lang)}. Build one to store resources and access facilities.
                                </p>
                                <button
                                    onClick={() => setIsBuildModalOpen(true)}
                                    className="w-full py-3 rounded-lg font-bold text-sm md:text-lg bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-900/40"
                                >
                                    🏗️ {lang === 'RU' ? 'ПОСТРОИТЬ БАЗУ' : 'BUILD BASE'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'market' && <MarketView />}
                {activeTab === 'caravans' && (
                    <div className="p-2">
                        <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mb-2">🚛 {t(TL.caravan.title, lang)}</h1>
                        <p className="text-gray-400 text-xs md:text-sm mb-6">{t(TL.caravan.subtitle, lang)}</p>
                        <CaravanPanel />
                    </div>
                )}
                {activeTab === 'quests' && <QuestPanel />}
                {activeTab === 'factions' && <FactionPanel />}
            </div>

            {/* Build Base Modal */}
            {isBuildModalOpen && selectedRegion && (
                <BuildBaseModal
                    regionId={selectedRegion}
                    onClose={() => setIsBuildModalOpen(false)}
                    onBuild={(baseType) => {
                        buildBase(selectedRegion, baseType);
                        setIsBuildModalOpen(false);
                    }}
                />
            )}
            {/* Managed Base View */}
            {managedBaseId && (
                <BaseView
                    base={playerBases.find(b => b.id === managedBaseId)!}
                    onClose={() => setManagedBaseId(null)}
                />
            )}
        </div>
    );
};
