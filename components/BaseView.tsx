import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerBase, ResourceType, FacilityId, DefenseUnitType, Resources } from '../types';
import { FUEL_RECIPES } from '../constants/fuelRecipes';
import { BASE_FACILITIES } from '../constants/baseFacilities';
import { CRAFTING_RECIPES } from '../constants/craftingRecipes';
import { DEFENSE_UNITS, BASE_REPAIR_COST } from '../constants/defenseUnits';
import { TL } from '../services/localization';
import { t } from '../services/localization';
import { getResourceLabel } from '../services/gameMath';

interface BaseViewProps {
    base: PlayerBase;
    onClose: () => void;
}

export const BaseView: React.FC<BaseViewProps> = ({ base, onClose }) => {
    const { settings, resources, transferResources, refineResource, craftConsumable, buildFacility, startDefenseProduction, repairBase } = useGameStore();
    const lang = settings.language;
    const [activeTab, setActiveTab] = useState<'storage' | 'facilities' | 'refinery' | 'workshop' | 'garrison'>('storage');

    const totalStored = Object.values(base.storedResources).reduce((sum, a) => sum + (a || 0), 0);
    const storagePercent = (totalStored / base.storageCapacity) * 100;

    // Fallback для старых баз без defense
    const defense = base.defense ?? {
        integrity: 100,
        shields: 0,
        infantry: 0,
        drones: 0,
        turrets: 0
    };
    const productionQueue = base.productionQueue ?? [];

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            🏢 {base.type.toUpperCase()} - {t(TL.regions[base.regionId], lang)}
                        </h2>
                        <p className="text-cyan-400 text-sm font-mono mt-1">Status: {base.status.toUpperCase()} | LVL {base.upgradeLevel}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-900 px-6 pt-4 gap-2">
                    {[
                        { id: 'storage', label: lang === 'RU' ? '📦 Хранилище' : '📦 Storage' },
                        { id: 'facilities', label: lang === 'RU' ? '🏭 Модули' : '🏭 Facilities' },
                        { id: 'refinery', label: lang === 'RU' ? '⚗️ Переработка' : '⚗️ Refinery', hidden: !base.facilities.includes('basic_refinery') },
                        { id: 'workshop', label: lang === 'RU' ? '🛠️ Мастерская' : '🛠️ Workshop', hidden: !base.facilities.includes('workshop_facility') && !base.facilities.includes('advanced_workshop') },
                        { id: 'garrison', label: lang === 'RU' ? '🛡️ Гарнизон' : '🛡️ Garrison' }
                    ].map(tab => !tab.hidden && (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded-t-lg font-bold transition-all ${activeTab === tab.id ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
                    {activeTab === 'storage' && (
                        <div className="space-y-6">
                            {/* Storage Status */}
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-400">{lang === 'RU' ? 'Заполнение хранилища' : 'Storage Fill'}</span>
                                    <span className={storagePercent > 90 ? 'text-red-400 font-bold' : 'text-cyan-400'}>
                                        {Math.floor(totalStored)} / {base.storageCapacity} Un
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                    <div
                                        className={`h-full transition-all duration-500 ${storagePercent > 90 ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`}
                                        style={{ width: `${Math.min(100, storagePercent)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Base Inventory */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-300 border-l-4 border-cyan-500 pl-3">{lang === 'RU' ? 'На базе' : 'In Base'}</h3>
                                    <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800 min-h-[200px] flex flex-col gap-2">
                                        {Object.entries(base.storedResources).map(([res, amount]) => (amount || 0) > 0 && (
                                            <div key={res} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm font-bold uppercase">{t(getResourceLabel(res), lang)}</span>
                                                    <span className="text-cyan-400 font-mono">{Math.floor(amount || 0)}</span>
                                                </div>
                                                <button
                                                    onClick={() => transferResources(base.id, res as any, 100, 'to_player')}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded-md text-gray-300 transition-all active:scale-95"
                                                >
                                                    {lang === 'RU' ? 'В КАРГО (100)' : 'TO CARGO (100)'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ship Cargo */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-300 border-l-4 border-yellow-500 pl-3">{lang === 'RU' ? 'Груз корабля' : 'Ship Cargo'}</h3>
                                    <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800 min-h-[200px] flex flex-col gap-2">
                                        {Object.entries(resources).map(([res, amount]) => (amount || 0) > 0 && (
                                            <div key={res} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-sm font-bold uppercase">{t(getResourceLabel(res), lang)}</span>
                                                    <span className="text-yellow-400 font-mono">{Math.floor(amount || 0)}</span>
                                                </div>
                                                <button
                                                    onClick={() => transferResources(base.id, res as any, 100, 'to_base')}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded-md text-gray-300 transition-all active:scale-95"
                                                >
                                                    {lang === 'RU' ? 'В ХРАН. (100)' : 'TO STORAGE (100)'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'facilities' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.values(BASE_FACILITIES).map(facility => {
                                const isBuilt = base.facilities.includes(facility.id);
                                return (
                                    <div key={facility.id} className={`p-4 rounded-xl border-2 transition-all ${isBuilt ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 bg-gray-800/30'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-xl font-bold text-white">{isBuilt && '✅ '}{t(facility.name, lang)}</h4>
                                            {!isBuilt && (<span className="text-yellow-400 font-bold">{facility.cost} 💎</span>)}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{t(facility.description, lang)}</p>
                                        {!isBuilt && (
                                            <button
                                                onClick={() => buildFacility(base.id, facility.id)}
                                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all"
                                            >
                                                {lang === 'RU' ? 'ПОСТРОИТЬ МОДУЛЬ' : 'BUILD FACILITY'}
                                            </button>
                                        )}
                                        {isBuilt && (
                                            <div className="text-xs text-green-400 font-mono">{lang === 'RU' ? 'МОДУЛЬ ФУНКЦИОНИРУЕТ' : 'FACILITY OPERATIONAL'}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'refinery' && (
                        <div className="grid grid-cols-1 gap-4">
                            {FUEL_RECIPES.map(recipe => {
                                const hasFacility = !recipe.requiredFacility || base.facilities.includes(recipe.requiredFacility);
                                const canAfford = resources[recipe.input.resource] >= recipe.input.amount;

                                return (
                                    <div key={recipe.id} className={`p-4 rounded-xl border-2 transition-all ${!hasFacility ? 'opacity-50 grayscale' : 'border-gray-700 bg-gray-800/30'}`}>
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-white uppercase">{t(recipe.name, lang)}</h4>
                                                <p className="text-gray-400 text-xs">{t(recipe.description, lang)}</p>
                                            </div>

                                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-gray-700">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">{t(getResourceLabel(recipe.input.resource), lang)}</div>
                                                    <div className={`font-bold ${canAfford ? 'text-white' : 'text-red-500'}`}>{recipe.input.amount}</div>
                                                </div>
                                                <div className="text-cyan-500 text-2xl">➜</div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">{t(getResourceLabel(recipe.output.resource), lang)}</div>
                                                    <div className="font-bold text-green-400">+{recipe.output.amount}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button
                                                    disabled={!hasFacility || !canAfford}
                                                    onClick={() => refineResource(base.id, recipe.id, 1)}
                                                    className={`flex-1 md:w-24 py-2 rounded-lg font-bold transition-all ${hasFacility && canAfford ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-gray-700 text-gray-500'}`}
                                                >
                                                    x1
                                                </button>
                                                <button
                                                    disabled={!hasFacility || !canAfford}
                                                    onClick={() => {
                                                        const max = Math.floor(resources[recipe.input.resource] / recipe.input.amount);
                                                        refineResource(base.id, recipe.id, max);
                                                    }}
                                                    className={`flex-1 md:w-24 py-2 rounded-lg font-bold transition-all ${hasFacility && canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-gray-700 text-gray-500'}`}
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                        </div>
                                        {!hasFacility && (
                                            <p className="text-red-400 text-[10px] mt-2 font-bold uppercase">⚠️ ТРЕБУЕТСЯ: {t(BASE_FACILITIES[recipe.requiredFacility!].name, lang)}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'workshop' && (
                        <div className="grid grid-cols-1 gap-4">
                            {CRAFTING_RECIPES.map(recipe => {
                                const hasFacility = !recipe.requiredFacility || base.facilities.includes(recipe.requiredFacility);
                                const canAfford = recipe.input.every(input => (resources[input.resource] || 0) >= input.amount);

                                return (
                                    <div key={recipe.id} className={`p-4 rounded-xl border-2 transition-all ${!hasFacility ? 'opacity-50 grayscale' : 'border-gray-700 bg-gray-800/30'}`}>
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-white uppercase">{t(recipe.name, lang)}</h4>
                                                <p className="text-gray-400 text-xs">{t(recipe.description, lang)}</p>
                                            </div>

                                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-gray-700">
                                                <div className="flex gap-2">
                                                    {recipe.input.map(input => (
                                                        <div key={input.resource} className="text-center">
                                                            <div className="text-[10px] text-gray-500 uppercase">{t(getResourceLabel(input.resource), lang)}</div>
                                                            <div className={`font-bold ${(resources[input.resource] || 0) >= input.amount ? 'text-white' : 'text-red-500'}`}>{input.amount}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-cyan-500 text-2xl">➜</div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">{t(getResourceLabel(recipe.output.resource), lang)}</div>
                                                    <div className="font-bold text-green-400">+{recipe.output.amount}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button
                                                    disabled={!hasFacility || !canAfford}
                                                    onClick={() => craftConsumable(base.id, recipe.id, 1)}
                                                    className={`flex-1 md:w-24 py-2 rounded-lg font-bold transition-all ${hasFacility && canAfford ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-gray-700 text-gray-500'}`}
                                                >
                                                    x1
                                                </button>
                                                <button
                                                    disabled={!hasFacility || !canAfford}
                                                    onClick={() => {
                                                        let max = 999;
                                                        recipe.input.forEach(input => {
                                                            max = Math.min(max, Math.floor((resources[input.resource] || 0) / input.amount));
                                                        });
                                                        craftConsumable(base.id, recipe.id, max);
                                                    }}
                                                    className={`flex-1 md:w-24 py-2 rounded-lg font-bold transition-all ${hasFacility && canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-gray-700 text-gray-500'}`}
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                        </div>
                                        {!hasFacility && recipe.requiredFacility && (
                                            <p className="text-red-400 text-[10px] mt-2 font-bold uppercase">⚠️ ТРЕБУЕТСЯ: {t(BASE_FACILITIES[recipe.requiredFacility].name, lang)}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'garrison' && (
                        <div className="space-y-6">
                            {/* Base Health and Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-xs mb-1 uppercase font-bold">{lang === 'RU' ? 'Целостность базы' : 'Base Integrity'}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                            <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${defense.integrity}%` }} />
                                        </div>
                                        <span className="text-white font-mono font-bold">{defense.integrity}%</span>
                                    </div>
                                    {defense.integrity < 100 && (
                                        <button
                                            onClick={() => repairBase(base.id)}
                                            className="w-full mt-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] font-bold rounded transition-all uppercase"
                                        >
                                            🛠️ {lang === 'RU' ? `Отремонтировать` : `Repair Base`} ({BASE_REPAIR_COST.scrap} Scrap, {BASE_REPAIR_COST.iron} Iron)
                                        </button>
                                    )}
                                </div>

                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-xs mb-1 uppercase font-bold">{lang === 'RU' ? 'Мощность щита' : 'Shield Power'}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                            <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${defense.shields}%` }} />
                                        </div>
                                        <span className="text-white font-mono font-bold">{defense.shields}%</span>
                                    </div>
                                </div>

                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <div className="text-gray-400 text-xs mb-1 uppercase font-bold">{lang === 'RU' ? 'Сила Обороны' : 'Defense Rating'}</div>
                                    <div className="text-2xl font-black text-cyan-400 italic">
                                        {defense.infantry * DEFENSE_UNITS.infantry.defensePower +
                                            defense.drones * DEFENSE_UNITS.drone.defensePower +
                                            defense.turrets * DEFENSE_UNITS.turret.defensePower} DP
                                    </div>
                                </div>
                            </div>

                            {/* Units Current */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { type: 'infantry', icon: '💂', count: defense.infantry, def: DEFENSE_UNITS.infantry },
                                    { type: 'drone', icon: '🛸', count: defense.drones, def: DEFENSE_UNITS.drone },
                                    { type: 'turret', icon: '📡', count: defense.turrets, def: DEFENSE_UNITS.turret }
                                ].map(unit => (
                                    <div key={unit.type} className="bg-gray-800/30 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{unit.icon}</span>
                                            <div>
                                                <div className="text-white font-bold">{t(unit.def.name, lang)}</div>
                                                <div className="text-gray-500 text-[10px] uppercase font-mono">{unit.def.defensePower} DP per unit</div>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-white">{unit.count}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Production Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-cyan-400 border-l-4 border-cyan-500 pl-3 uppercase tracking-wider">
                                    🏗️ {lang === 'RU' ? 'Инженерный цех' : 'Engineering Workshop'}
                                </h3>

                                {/* Queue */}
                                {productionQueue.length > 0 && (
                                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                                        <p className="text-cyan-400 text-[10px] uppercase font-bold mb-2">В производстве:</p>
                                        {productionQueue.map(job => {
                                            const def = DEFENSE_UNITS[job.unitType];
                                            const total = job.completionTime - job.startTime;
                                            const current = Date.now() - job.startTime;
                                            const progress = Math.min(100, (current / total) * 100);
                                            return (
                                                <div key={job.id} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-white font-bold">{t(def.name, lang).toUpperCase()}</span>
                                                        <span className="text-cyan-400 font-mono">{Math.ceil((job.completionTime - Date.now()) / 1000)}s</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Available for Production */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(Object.keys(DEFENSE_UNITS) as DefenseUnitType[]).map(unitType => {
                                        const unit = DEFENSE_UNITS[unitType];
                                        const canAfford = Object.entries(unit.cost).every(([res, amount]) => (resources[res as keyof Resources] || 0) >= (amount || 0));

                                        return (
                                            <div key={unitType} className={`p-4 rounded-xl border-2 transition-all ${canAfford ? 'border-gray-700 bg-gray-800/30' : 'border-gray-800 bg-gray-900/50 opacity-60'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">{t(unit.name, lang)}</h4>
                                                        <p className="text-[10px] text-gray-500 mb-2">{t(unit.description, lang)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {Object.entries(unit.cost).map(([res, amount]) => (
                                                        <div key={res} className="text-[9px] bg-black/40 px-2 py-0.5 rounded border border-gray-700 flex gap-1">
                                                            <span className="text-gray-400 uppercase">{t(getResourceLabel(res), lang)}:</span>
                                                            <span className={resources[res as keyof Resources] >= (amount || 0) ? 'text-green-400' : 'text-red-500'}>
                                                                {amount}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    disabled={!canAfford}
                                                    onClick={() => startDefenseProduction(base.id, unitType)}
                                                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-lg shadow-cyan-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                                >
                                                    {lang === 'RU' ? 'ЗАПУСТИТЬ ПРОИЗВОДСТВО' : 'START PRODUCTION'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-950/80 border-t border-gray-800 flex justify-between items-center px-8 text-xs text-gray-500 font-mono">
                    <span>SECTOR ACCESS: GRANTED</span>
                    <span>BASE ID: {base.id}</span>
                </div>
            </div>
        </div>
    );
};
