import { useGameStore } from '../store/gameStore';
import { DrillSlot, RegionId } from '../types';
import { calculateStats } from '../services/gameMath';
import { REGIONS } from '../constants/regions';
import { calculateDistance, getRegionColor, getZoneColorEmoji } from '../services/regionMath';
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

    // [STABILITY FIX] Мемоизация фильтрованных артефактов
    const equippedArtifacts = useMemo(() =>
        (equippedArtifactsRaw || []).filter((id): id is string => id !== null),
        [equippedArtifactsRaw]
    );

    // [STABILITY FIX] Мемоизация статов
    const stats = useMemo(() =>
        calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth),
        [drill, skillLevels, equippedArtifacts, inventory, depth]
    );

    const maxCapacity = stats.totalCargoCapacity;

    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<FuelType>('coal');
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
        }
    };

    // Проверка доступности Market
    const currentBase = playerBases.find(b => b.regionId === currentRegion);
    const hasStationAccess = currentBase?.type === 'station';

    // For Caravans нужно минимум 1 база
    const hasCaravanAccess = playerBases.length > 0;

    // [STABILITY FIX] Мемоизация списка регионов
    const regionIds = useMemo(() => Object.keys(REGIONS) as RegionId[], []);

    // Tab рендеринг
    if (activeTab === 'market') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                {/* Tab Navigation */}
                <div className="max-w-6xl mx-auto p-6 pb-0">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🗺️ {t(TL.ui.map, lang)}
                        </button>
                        <button onClick={() => setActiveTab('market')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                            💰 {t(TL.ui.market, lang)}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🚛 {t(TL.ui.caravans, lang)}
                        </button>
                    </div>
                </div>
                <MarketView />
            </div>
        );
    }

    if (activeTab === 'caravans') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
                {/* Tab Navigation */}
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🗺️ {t(TL.ui.map, lang)}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {t(TL.ui.market, lang)} {!hasStationAccess && t(TL.ui.locked, lang)}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className="px-4 py-2 bg-purple-600 text-white rounded-t border-2 border-b-0 border-purple-500">
                            🚛 {t(TL.ui.caravans, lang)}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            📜 {t(TL.ui.quests, lang)}
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold text-purple-400 mb-2">🚛 {t(TL.caravan.title, lang)}</h1>
                    <p className="text-gray-400">{t(TL.caravan.subtitle, lang)}</p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <CaravanPanel />
                </div>
            </div>
        );
    }

    if (activeTab === 'quests') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
                {/* Tab Navigation */}
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🗺️ {t(TL.ui.map, lang)}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {t(TL.ui.market, lang)} {!hasStationAccess && t(TL.ui.locked, lang)}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                            🚛 {t(TL.ui.caravans, lang)} {!hasCaravanAccess && t(TL.ui.locked, lang)}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-blue-600 text-white rounded-t border-2 border-b-0 border-blue-500">
                            📜 {t(TL.ui.quests, lang)}
                        </button>
                        <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            👑 {t(TL.ui.factions, lang)}
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto h-[600px]">
                    <QuestPanel />
                </div>
            </div>
        );
    }

    if (activeTab === 'factions') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
                {/* Tab Navigation */}
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🗺️ {t(TL.ui.map, lang)}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {t(TL.ui.market, lang)} {!hasStationAccess && t(TL.ui.locked, lang)}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                            🚛 {t(TL.ui.caravans, lang)} {!hasCaravanAccess && t(TL.ui.locked, lang)}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            📜 {t(TL.ui.quests, lang)}
                        </button>
                        <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                            👑 {t(TL.ui.factions, lang)}
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <FactionPanel />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20 md:pb-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter pixel-text text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                        {t(TL.ui.map, lang).toUpperCase()}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span>{t(TL.ui.sector, lang)}: AEGIS-7</span>
                        <span className="text-cyan-500">{t(TL.ui.status, lang)}: {t(TL.ui.active, lang)}</span>
                    </div>
                </div>

                {/* Tab Navigation (Map View) */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                        🗺️ {t(TL.ui.map, lang)}
                    </button>
                    <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                        💰 {t(TL.ui.market, lang)} {!hasStationAccess && t(TL.ui.locked, lang)}
                    </button>
                    <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                        🚛 {t(TL.ui.caravans, lang)} {!hasCaravanAccess && t(TL.ui.locked, lang)}
                    </button>
                    <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                        📜 {t(TL.ui.quests, lang)}
                    </button>
                    <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                        👑 {t(TL.ui.factions, lang)}
                    </button>
                </div>
            </div>

            {/* Main Map Area */}
            <div className="max-w-6xl mx-auto flex flex-col gap-6 relative z-10">

                {/* Status Panel */}
                <div className="bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">{t(TL.ui.currentRegion, lang)}</p>
                            <p className="text-cyan-400 font-bold">{t(TL.regions[currentRegion] || currentRegionData.name, lang)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t(TL.ui.cargo, lang)}</p>
                            <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                {currentCargoWeight} / {maxCapacity}
                                {isOverloaded && ' ⚠️'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t(TL.ui.fuel, lang)} ({t(TL.resources.coal, lang)})</p>
                            <p className="text-yellow-400 font-bold">{resources.coal}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{t(TL.ui.level, lang)}</p>
                            <p className="text-purple-400 font-bold">Lvl {level}</p>
                        </div>
                        {playerBases.length > 0 && (
                            <div>
                                <p className="text-gray-400 text-sm">Защита баз</p>
                                <p className="text-blue-400 font-bold">
                                    {activePerks.includes('LIBERATION') ? '150' : '100'} 🛡️
                                    {activePerks.includes('LIBERATION') && <span className="text-xs text-green-400 ml-1">(+50%)</span>}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3D ISOMETRIC MAP */}
                <div className="w-full h-[500px] bg-black/40 border-2 border-gray-700 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)] pointer-events-none" />
                    <IsometricCanvas
                        regions={regionIds}
                        activeRegion={currentRegion}
                        bases={playerBases}
                        caravans={caravans}
                        onRegionSelect={setSelectedRegion}
                    />

                    {/* Instructions Overlay */}
                    <div className="absolute top-4 right-4 pointer-events-none text-right">
                        <p className="text-xs text-gray-500 font-mono">LMB: Выбрать регион</p>
                        <p className="text-xs text-gray-500 font-mono">WHEEL: Зум (WIP)</p>
                    </div>
                </div>
            </div>

            {/* Travel Control Panel */}
            {selectedRegion && selectedRegion !== currentRegion && (
                <div className="max-w-6xl mx-auto bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                        🚀 {t(TL.ui.travelTo, lang)} {t(TL.regions[selectedRegion], lang)}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Fuel Selector */}
                        <div>
                            <label className="block text-gray-400 mb-2">{t(TL.ui.selectFuel, lang)}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {FUEL_TYPES.map(fuel => {
                                    const available = resources[fuel] || 0;
                                    const cost = calculateFuelCost(
                                        calculateDistance(currentRegion, selectedRegion),
                                        fuel,
                                        cargoRatio
                                    );
                                    const canAfford = available >= cost;

                                    return (
                                        <button
                                            key={fuel}
                                            onClick={() => setSelectedFuel(fuel)}
                                            disabled={!canAfford}
                                            className={`
                                                p-3 rounded border-2 transition-all text-left
                                                ${selectedFuel === fuel
                                                    ? 'border-cyan-500 bg-cyan-500/20'
                                                    : 'border-gray-600 hover:border-cyan-500/50'
                                                }
                                                ${!canAfford && 'opacity-50 cursor-not-allowed'}
                                            `}
                                        >
                                            <div className="font-bold text-white">{t(TL.resources[fuel] || getFuelLabel(fuel), lang)}</div>
                                            <div className="text-sm text-gray-400">
                                                {available} / {cost} {!canAfford && '❌'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Travel Info */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-400 text-sm">{t(TL.ui.distance, lang)}:</p>
                                <p className="text-white font-bold">
                                    {calculateDistance(currentRegion, selectedRegion)}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">{t(TL.ui.cargoState, lang)}</p>
                                <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                    {Math.round(cargoRatio * 100)}% {t(TL.ui.loaded, lang)}
                                    {cargoRatio >= 0.5 && ` (+${Math.round(cargoRatio * 50)}% ${t(TL.ui.consumption, lang)})`}
                                </p>
                            </div>

                            <button
                                onClick={handleTravel}
                                disabled={isOverloaded}
                                className={`
                  w-full py-3 rounded-lg font-bold text-lg transition-all
                  ${isOverloaded
                                        ? 'bg-red-900 text-red-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                                    }
                `}
                            >
                                {isOverloaded ? t(TL.ui.overloaded, lang) : `🚀 ${t(TL.ui.startTravel, lang)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


