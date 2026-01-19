import { useGameStore } from '../store/gameStore';
import { RegionId, ResourceType } from '../types';
import { calculateStats } from '../services/gameMath';
import { REGIONS } from '../constants/regions';
import { calculateDistance } from '../services/regionMath';
import { calculateFuelCost, FUEL_TYPES, FuelType, getFuelLabel } from '../services/travelMath';
import { useState, useMemo, useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { MarketView } from './MarketView';
import { CaravanPanel } from './CaravanPanel';
import QuestPanel from './QuestPanel';
import FactionPanel from './FactionPanel';
import { IsometricCanvas } from './GlobalMap/IsometricCanvas';
import { getActivePerkIds } from '../services/factionLogic';

import { TL, t } from '../services/localization';

type TabType = 'map' | 'market' | 'caravans' | 'quests' | 'factions';

export const GlobalMapView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const level = useGameStore(s => s.level);
    const currentCargoWeight = useGameStore(s => s.currentCargoWeight);
    const drill = useGameStore(s => s.drill);
    const skillLevels = useGameStore(s => s.skillLevels);
    const equippedArtifactsRaw = useGameStore(s => s.equippedArtifacts);
    const inventory = useGameStore(s => s.inventory);
    const depth = useGameStore(s => s.depth);
    const playerBases = useGameStore(s => s.playerBases);
    const caravans = useGameStore(s => s.caravans);
    const travelToRegion = useGameStore(s => s.travelToRegion);
    const lang = useGameStore(s => s.settings.language);
    const reputation = useGameStore(s => s.reputation);

    const equippedArtifacts = useMemo(() =>
        (equippedArtifactsRaw || []).filter((id): id is string => id !== null),
        [equippedArtifactsRaw]
    );

    const stats = useMemo(() =>
        calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth),
        [drill, skillLevels, equippedArtifacts, inventory, depth]
    );

    const maxCapacity = stats.totalCargoCapacity;
    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<FuelType>(ResourceType.COAL);
    const [activeTab, setActiveTab] = useState<TabType>('map');

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);

    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        audioEngine.playUITabSwitch();
    }, [activeTab]);

    const currentRegionData = REGIONS[currentRegion];
    const cargoRatio = maxCapacity > 0 ? currentCargoWeight / maxCapacity : 0;
    const isOverloaded = currentCargoWeight > maxCapacity;

    const handleTravel = () => {
        if (selectedRegion && selectedRegion !== currentRegion) {
            travelToRegion(selectedRegion, selectedFuel);
            audioEngine.playTravelStart();
        }
    };

    const currentBase = playerBases.find(b => b.regionId === currentRegion);
    const hasStationAccess = currentBase?.type === 'station';
    const hasCaravanAccess = playerBases.length > 0;
    const regionIds = useMemo(() => Object.keys(REGIONS) as RegionId[], []);

    const renderTabs = () => (
        <div className="flex flex-wrap gap-1 md:gap-2 w-full md:w-auto mt-2 md:mt-0">
            <button onClick={() => setActiveTab('map')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-base rounded-t border-2 border-b-0 transition-all ${activeTab === 'map' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                <span className="md:hidden">🗺️</span>
                <span className="hidden md:inline">🗺️ {t(TL.ui.map, lang)}</span>
            </button>
            <button onClick={() => setActiveTab('market')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-base rounded-t border-2 border-b-0 transition-all ${!hasStationAccess ? 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed' : activeTab === 'market' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`} disabled={!hasStationAccess}>
                <span className="md:hidden">💰</span>
                <span className="hidden md:inline">💰 {t(TL.ui.market, lang)} {!hasStationAccess && t(TL.ui.locked, lang)}</span>
            </button>
            <button onClick={() => setActiveTab('caravans')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-base rounded-t border-2 border-b-0 transition-all ${!hasCaravanAccess ? 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed' : activeTab === 'caravans' ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`} disabled={!hasCaravanAccess}>
                <span className="md:hidden">🚛</span>
                <span className="hidden md:inline">🚛 {t(TL.ui.caravans, lang)} {!hasCaravanAccess && t(TL.ui.locked, lang)}</span>
            </button>
            <button onClick={() => setActiveTab('quests')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-base rounded-t border-2 border-b-0 transition-all ${activeTab === 'quests' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                <span className="md:hidden">📜</span>
                <span className="hidden md:inline">📜 {t(TL.ui.quests, lang)}</span>
            </button>
            <button onClick={() => setActiveTab('factions')} className={`flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-base rounded-t border-2 border-b-0 transition-all ${activeTab === 'factions' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                <span className="md:hidden">👑</span>
                <span className="hidden md:inline">👑 {t(TL.ui.factions, lang)}</span>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-2 md:p-4 pb-20 md:pb-4 relative overflow-hidden flex flex-col">
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
                        </div>
                    </div>
                </div>
                {renderTabs()}
            </div>

            <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-4 relative z-10 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {activeTab === 'map' && (
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-3 md:p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.currentRegion, lang)}</p>
                                    <p className="text-cyan-400 font-bold text-xs md:text-base">{t(TL.regions[currentRegion] || currentRegionData.name, lang)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.cargo, lang)}</p>
                                    <p className={`font-bold text-xs md:text-base ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                        {currentCargoWeight} / {maxCapacity}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.fuel, lang)}</p>
                                    <p className="text-yellow-400 font-bold text-xs md:text-base">{resources.coal}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] md:text-sm">{t(TL.ui.level, lang)}</p>
                                    <p className="text-purple-400 font-bold text-xs md:text-base">Lvl {level}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="w-full flex-1 min-h-[300px] md:min-h-[500px] bg-black/40 border-2 border-gray-700 rounded-lg overflow-hidden relative shadow-inner"
                            style={{ touchAction: 'none' }}
                        >
                            <IsometricCanvas
                                regions={regionIds}
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
                                                const cost = calculateFuelCost(calculateDistance(currentRegion, selectedRegion), fuel, cargoRatio);
                                                const canAfford = available >= cost;
                                                return (
                                                    <button key={fuel} onClick={() => setSelectedFuel(fuel)} disabled={!canAfford}
                                                        className={`p-2 md:p-3 rounded border transition-all text-left ${selectedFuel === fuel ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-600'} ${!canAfford && 'opacity-50'}`}>
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
                    </div>
                )}

                {activeTab === 'market' && <MarketView />}
                {activeTab === 'caravans' && (
                    <div className="flex-1 flex flex-col p-2">
                        <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mb-2">🚛 {t(TL.caravan.title, lang)}</h1>
                        <p className="text-gray-400 text-xs md:text-sm mb-6">{t(TL.caravan.subtitle, lang)}</p>
                        <CaravanPanel />
                    </div>
                )}
                {activeTab === 'quests' && <div className="flex-1 h-[500px]"><QuestPanel /></div>}
                {activeTab === 'factions' && <FactionPanel />}
            </div>
        </div>
    );
};
