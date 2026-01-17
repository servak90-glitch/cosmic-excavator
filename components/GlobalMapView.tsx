import { useGameStore } from '../store/gameStore';
import { RegionId } from '../types';
import { REGIONS } from '../constants/regions';
import { calculateDistance, getRegionColor, getZoneColorEmoji } from '../services/regionMath';
import { calculateFuelCost, FUEL_TYPES, getFuelLabel } from '../services/travelMath';
import { useState } from 'react';

export const GlobalMapView = () => {
    const currentRegion = useGameStore(s => s.currentRegion);
    const resources = useGameStore(s => s.resources);
    const level = useGameStore(s => s.level);
    const currentCargoWeight = useGameStore(s => s.currentCargoWeight);
    const maxCapacity = useGameStore(s => s.drill?.hull?.baseStats?.cargoCapacity || 0);
    const travelToRegion = useGameStore(s => s.travelToRegion);

    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<'coal' | 'oil' | 'gas' | 'uranium'>('coal');

    const currentRegionData = REGIONS[currentRegion];
    const cargoRatio = maxCapacity > 0 ? currentCargoWeight / maxCapacity : 0;
    const isOverloaded = currentCargoWeight > maxCapacity;

    const handleTravel = () => {
        if (selectedRegion && selectedRegion !== currentRegion) {
            travelToRegion(selectedRegion, selectedFuel);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">🗺️ ГЛОБАЛЬНАЯ КАРТА</h1>
                <p className="text-gray-400">Планета Aegis-7 • 5 регионов</p>
            </div>

            {/* Status Panel */}
            <div className="max-w-6xl mx-auto mb-6 bg-gray-800/50 border-2 border-cyan-500/30 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-gray-400 text-sm">Текущий регион</p>
                        <p className="text-cyan-400 font-bold">{currentRegionData.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Груз</p>
                        <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                            {currentCargoWeight} / {maxCapacity}
                            {isOverloaded && ' ⚠️'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Топливо (Уголь)</p>
                        <p className="text-yellow-400 font-bold">{resources.coal}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Уровень</p>
                        <p className="text-purple-400 font-bold">Lvl {level}</p>
                    </div>
                </div>
            </div>

            {/* Regions Grid */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Object.values(REGIONS).map(region => {
                    const distance = calculateDistance(currentRegion, region.id);
                    const zoneColor = getRegionColor(region, level);
                    const emoji = getZoneColorEmoji(zoneColor);
                    const fuelCost = calculateFuelCost(distance, selectedFuel, cargoRatio);
                    const isCurrent = region.id === currentRegion;
                    const isSelected = region.id === selectedRegion;

                    return (
                        <div
                            key={region.id}
                            onClick={() => setSelectedRegion(region.id)}
                            className={`
                bg-gray-800/70 border-2 rounded-lg p-4 cursor-pointer transition-all
                ${isCurrent ? 'border-green-500 ring-2 ring-green-500/50' :
                                    isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/50' :
                                        'border-gray-700 hover:border-cyan-500/50'}
              `}
                        >
                            {/* Region Header */}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-white">
                                    {region.name}
                                    {isCurrent && ' 📍'}
                                </h3>
                                <span className="text-2xl">{emoji}</span>
                            </div>

                            {/* Info */}
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-400">
                                    Lvl {region.recommendedLevel} • {distance} ед.
                                </p>

                                {!isCurrent && (
                                    <p className="text-yellow-400">
                                        ⛽ {fuelCost} {getFuelLabel(selectedFuel)}
                                    </p>
                                )}

                                {/* Resource Bonuses */}
                                {region.resourceBonuses && Object.keys(region.resourceBonuses).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Бонусы:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(region.resourceBonuses).map(([res, mult]) => (
                                                <span key={res} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                                                    {res} ×{mult}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {region.description && (
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        {region.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Travel Control Panel */}
            {selectedRegion && selectedRegion !== currentRegion && (
                <div className="max-w-6xl mx-auto bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                        🚀 Перемещение в {REGIONS[selectedRegion].name}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Fuel Selector */}
                        <div>
                            <label className="block text-gray-400 mb-2">Выбор топлива:</label>
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
                                            <div className="font-bold text-white">{getFuelLabel(fuel)}</div>
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
                                <p className="text-gray-400 text-sm">Расстояние:</p>
                                <p className="text-white font-bold">
                                    {calculateDistance(currentRegion, selectedRegion)} единиц
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Состояние груза:</p>
                                <p className={`font-bold ${isOverloaded ? 'text-red-500' : 'text-green-400'}`}>
                                    {Math.round(cargoRatio * 100)}% загружен
                                    {cargoRatio >= 0.5 && ` (+${Math.round(cargoRatio * 50)}% расход)`}
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
                                {isOverloaded ? '⚠️ ПЕРЕГРУЗ! СБРОСЬТЕ ГРУЗ' : '🚀 НАЧАТЬ ПЕРЕМЕЩЕНИЕ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
