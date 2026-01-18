import { useGameStore } from '../store/gameStore';
import { RegionId } from '../types';
import { REGIONS } from '../constants/regions';
import { calculateDistance, getRegionColor, getZoneColorEmoji } from '../services/regionMath';
import { calculateFuelCost, FUEL_TYPES, getFuelLabel } from '../services/travelMath';
import { useState } from 'react';
import { MarketView } from './MarketView';
import { CaravanPanel } from './CaravanPanel';
import QuestPanel from './QuestPanel';
import FactionPanel from './FactionPanel';
import { IsometricCanvas } from './GlobalMap/IsometricCanvas';

import { TL } from '../services/localization';

type TabType = 'map' | 'market' | 'caravans' | 'quests' | 'factions';

export const GlobalMapView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const level = useGameStore(s => s.level);
    const currentCargoWeight = useGameStore(s => s.currentCargoWeight);
    const maxCapacity = useGameStore(s => s.drill?.hull?.baseStats?.cargoCapacity || 0);
    const travelToRegion = useGameStore(s => s.travelToRegion);
    const playerBases = useGameStore(s => s.playerBases);
    const caravans = useGameStore(s => s.caravans);

    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<'coal' | 'oil' | 'gas' | 'uranium'>('coal');
    const [activeTab, setActiveTab] = useState<TabType>('map');

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

    // Для Caravans нужно минимум 1 база
    const hasCaravanAccess = playerBases.length > 0;

    // Tab рендеринг
    if (activeTab === 'market') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                {/* Tab Navigation */}
                <div className="max-w-6xl mx-auto p-6 pb-0">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🗺️ {TL.ui.map}
                        </button>
                        <button onClick={() => setActiveTab('market')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                            💰 {TL.ui.market}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            🚛 {TL.ui.caravans}
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
                            🗺️ {TL.ui.map}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {TL.ui.market} {!hasStationAccess && TL.ui.locked}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className="px-4 py-2 bg-purple-600 text-white rounded-t border-2 border-b-0 border-purple-500">
                            🚛 {TL.ui.caravans}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            📜 {TL.ui.quests}
                        </button>
                    </div>
                    <h1 className="text-4xl font-bold text-purple-400 mb-2">🚛 {TL.caravan.title}</h1>
                    <p className="text-gray-400">{TL.caravan.subtitle}</p>
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
                            🗺️ {TL.ui.map}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {TL.ui.market} {!hasStationAccess && TL.ui.locked}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                            🚛 {TL.ui.caravans} {!hasCaravanAccess && TL.ui.locked}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-blue-600 text-white rounded-t border-2 border-b-0 border-blue-500">
                            📜 {TL.ui.quests}
                        </button>
                        <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            👑 {TL.ui.factions}
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
                            🗺️ {TL.ui.map}
                        </button>
                        <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                            💰 {TL.ui.market} {!hasStationAccess && TL.ui.locked}
                        </button>
                        <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                            🚛 {TL.ui.caravans} {!hasCaravanAccess && TL.ui.locked}
                        </button>
                        <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                            📜 {TL.ui.quests}
                        </button>
                        <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                            👑 {TL.ui.factions}
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
                        {TL.ui.map.toUpperCase()}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                        <span>{TL.ui.sector}: AEGIS-7</span>
                        <span className="text-cyan-500">{TL.ui.status}: {TL.ui.active}</span>
                    </div>
                </div>

                {/* Tab Navigation (Map View) */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('map')} className="px-4 py-2 bg-cyan-600 text-white rounded-t border-2 border-b-0 border-cyan-500">
                        🗺️ {TL.ui.map}
                    </button>
                    <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasStationAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasStationAccess}>
                        💰 {TL.ui.market} {!hasStationAccess && TL.ui.locked}
                    </button>
                    <button onClick={() => setActiveTab('caravans')} className={`px-4 py-2 rounded-t border-2 border-b-0 ${hasCaravanAccess ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700' : 'bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed'}`} disabled={!hasCaravanAccess}>
                        🚛 {TL.ui.caravans} {!hasCaravanAccess && TL.ui.locked}
                    </button>
                    <button onClick={() => setActiveTab('quests')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                        📜 {TL.ui.quests}
                    </button>
                    <button onClick={() => setActiveTab('factions')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-t border-2 border-b-0 border-gray-700">
                        👑 {TL.ui.factions}
                    </button>
                </div>
            </div>

            {/* Main Map Area */}
            <div className="max-w-6xl mx-auto flex flex-col gap-6 relative z-10">

                {/* Status Panel */}
                <div className="bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">{TL.ui.currentRegion}</p>
                            <p className="text-cyan-400 font-bold">{TL.regions[currentRegion] || currentRegionData.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{TL.ui.cargo}</p>
                            <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                {currentCargoWeight} / {maxCapacity}
                                {isOverloaded && ' ⚠️'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{TL.ui.fuel} ({TL.resources.coal})</p>
                            <p className="text-yellow-400 font-bold">{resources.coal}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{TL.ui.level}</p>
                            <p className="text-purple-400 font-bold">Lvl {level}</p>
                        </div>
                    </div>
                </div>

                {/* 3D ISOMETRIC MAP */}
                <div className="w-full h-[500px] bg-black/40 border-2 border-gray-700 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)] pointer-events-none" />
                    <IsometricCanvas
                        regions={Object.keys(REGIONS) as RegionId[]}
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
                        🚀 {TL.ui.travelTo} {TL.regions[selectedRegion]}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Fuel Selector */}
                        <div>
                            <label className="block text-gray-400 mb-2">{TL.ui.selectFuel}</label>
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
                                            <div className="font-bold text-white">{TL.resources[fuel] || getFuelLabel(fuel)}</div>
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
                                <p className="text-gray-400 text-sm">{TL.ui.distance}:</p>
                                <p className="text-white font-bold">
                                    {calculateDistance(currentRegion, selectedRegion)}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">{TL.ui.cargoState}</p>
                                <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                    {Math.round(cargoRatio * 100)}% {TL.ui.loaded}
                                    {cargoRatio >= 0.5 && ` (+${Math.round(cargoRatio * 50)}% ${TL.ui.consumption})`}
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
                                {isOverloaded ? TL.ui.overloaded : `🚀 ${TL.ui.startTravel}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
