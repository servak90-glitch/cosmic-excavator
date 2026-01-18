/**
 * CARAVAN PANEL — UI для управления караванами
 * Phase 2 (MVP): только 1★ шаттлы
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CARAVAN_SPECS } from '../constants/caravans';
import { getCaravanETA } from '../services/caravanManager';
import { getActivePerkIds } from '../services/factionLogic';
import { TL } from '../services/localization';
import type { Resources } from '../types';

export const CaravanPanel = () => {
    const playerBases = useGameStore(s => s.playerBases);
    const caravans = useGameStore(s => s.caravans);
    const caravanUnlocks = useGameStore(s => s.caravanUnlocks);
    const resources = useGameStore(s => s.resources);
    const unlockBasicLogistics = useGameStore(s => s.unlockBasicLogistics);
    const sendCaravan = useGameStore(s => s.sendCaravan);
    const reputation = useGameStore(s => s.reputation);

    const [fromBaseId, setFromBaseId] = useState<string>('');
    const [toBaseId, setToBaseId] = useState<string>('');
    const [cargoAmount, setCargoAmount] = useState<number>(100);
    const [cargoResource, setCargoResource] = useState<keyof Resources>('stone');

    const isUnlocked = caravanUnlocks.find(u => u.tier === '1star')?.unlocked || false;
    const spec = CARAVAN_SPECS['1star'];

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);

    // Calculate modified capacity
    const capacityModifier = activePerks.includes('BULK_LOGISTICS') ? 1.2 : 1.0;
    const maxCapacity = Math.floor(spec.capacity * capacityModifier);

    const handleUnlock = () => {
        unlockBasicLogistics();
    };

    const handleSend = () => {
        if (fromBaseId && toBaseId && cargoAmount > 0) {
            const cargo = { [cargoResource]: cargoAmount } as Partial<Resources>;
            sendCaravan(fromBaseId, toBaseId, cargo);
            setCargoAmount(100);
        }
    };

    const fromBase = playerBases.find(b => b.id === fromBaseId);
    const availableInBase = fromBase ? (fromBase.storedResources[cargoResource] || 0) : 0;
    const canSend = isUnlocked && fromBase && toBaseId && fromBaseId !== toBaseId && availableInBase >= cargoAmount && cargoAmount <= maxCapacity;

    return (
        <div className="space-y-6">
            {/* Unlock Section */}
            {!isUnlocked && (
                <div className="bg-gray-800/80 border-2 border-yellow-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">🔒 Караваны заблокированы</h3>
                    <p className="text-gray-400 mb-4">
                        Разблокируйте <span className="text-cyan-400 font-bold">Basic Logistics</span>, чтобы отправлять караваны между базами.
                    </p>
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-bold mb-2">1★ Shuttle</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Вместимость: {spec.capacity} единиц</li>
                            <li>• Время доставки: {spec.travelTime / (60 * 60 * 1000)} часов</li>
                            <li>• Риск потери: 15-30% (зависит от зоны)</li>
                            <li>• Стоимость рейса: Бесплатно</li>
                        </ul>
                    </div>
                    <button
                        onClick={handleUnlock}
                        disabled={resources.rubies < spec.unlockCost}
                        className={`
                            w-full py-3 rounded-lg font-bold text-lg transition-all
                            ${resources.rubies >= spec.unlockCost
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }
                        `}
                    >
                        {resources.rubies >= spec.unlockCost
                            ? `🔓 РАЗБЛОКИРОВАТЬ (${spec.unlockCost} 💎)`
                            : `❌ НУЖНО ${spec.unlockCost} CREDITS`
                        }
                    </button>
                </div>
            )}

            {/* Send Caravan Section */}
            {isUnlocked && (
                <div className="bg-gray-800/80 border-2 border-cyan-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">🚛 {TL.caravan.send}</h3>

                    {playerBases.length < 2 ? (
                        <div className="bg-yellow-900/30 border border-yellow-600 rounded p-4">
                            <p className="text-yellow-400">
                                ⚠️ Нужно минимум 2 базы для отправки караванов. Постройте ещё одну базу в другом регионе.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* From Base */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Откуда:</label>
                                <select
                                    value={fromBaseId}
                                    onChange={(e) => setFromBaseId(e.target.value)}
                                    className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="">Выберите базу</option>
                                    {playerBases.map(base => (
                                        <option key={base.id} value={base.id}>
                                            {TL.regions[base.regionId] || base.regionId} ({TL.baseTypes[base.type] || base.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* To Base */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Куда:</label>
                                <select
                                    value={toBaseId}
                                    onChange={(e) => setToBaseId(e.target.value)}
                                    className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="">Выберите базу</option>
                                    {playerBases.filter(b => b.id !== fromBaseId).map(base => (
                                        <option key={base.id} value={base.id}>
                                            {TL.regions[base.regionId] || base.regionId} ({TL.baseTypes[base.type] || base.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cargo Resource */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Ресурс:</label>
                                <select
                                    value={cargoResource}
                                    onChange={(e) => setCargoResource(e.target.value as keyof Resources)}
                                    className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                                >
                                    {(['stone', 'clay', 'iron', 'coal', 'oil', 'gas'] as (keyof Resources)[]).map(res => (
                                        <option key={res} value={res}>{TL.resources[res] || res}</option>
                                    ))}
                                </select>
                                {fromBase && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        В базе: {availableInBase} {TL.resources[cargoResource] || cargoResource}
                                    </p>
                                )}
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">
                                    Количество (макс. {maxCapacity}):
                                    {activePerks.includes('BULK_LOGISTICS') && <span className="text-green-400 ml-2">(+20%)</span>}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxCapacity}
                                    value={cargoAmount}
                                    onChange={(e) => setCargoAmount(Math.min(maxCapacity, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setCargoAmount(100)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">100</button>
                                    <button onClick={() => setCargoAmount(maxCapacity)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">Макс</button>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={!canSend}
                                className={`
                                    w-full py-3 rounded-lg font-bold transition-all
                                    ${canSend
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {canSend ? `🚀 ${TL.caravan.send.toUpperCase()}` : '❌ ПРОВЕРЬТЕ УСЛОВИЯ'}
                            </button>

                            {!canSend && fromBase && toBaseId && (
                                <div className="text-xs text-red-400">
                                    {availableInBase < cargoAmount && `⚠️ Недостаточно ${TL.resources[cargoResource]} в базе`}
                                    {cargoAmount > maxCapacity && `⚠️ Превышена вместимость каравана`}
                                    {fromBaseId === toBaseId && `⚠️ Выберите разные базы`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Active Caravans */}
            {isUnlocked && caravans.length > 0 && (
                <div className="bg-gray-800/80 border-2 border-purple-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-purple-400 mb-4">📦 Активные караваны</h3>
                    <div className="space-y-3">
                        {caravans.filter(c => c.status === 'in_transit').map(caravan => {
                            const eta = getCaravanETA(caravan);
                            const fromBaseName = playerBases.find(b => b.id === caravan.fromBaseId)?.regionId || '???';
                            const toBaseName = playerBases.find(b => b.id === caravan.toBaseId)?.regionId || '???';

                            return (
                                <div key={caravan.id} className="bg-gray-900/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-white">
                                            {TL.regions[fromBaseName] || fromBaseName} → {TL.regions[toBaseName] || toBaseName}
                                        </div>
                                        <div className="text-cyan-400 text-sm">
                                            {eta.arrived ? '✅ Прибыл' : `⏱️ ${eta.remainingMinutes} мин`}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Груз: {Object.entries(caravan.cargo).map(([res, amt]) => `${amt} ${TL.resources[res] || res}`).join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Риск потери: {Math.round(caravan.lossChance * 100)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* History */}
            {isUnlocked && caravans.some(c => c.status !== 'in_transit') && (
                <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-400 mb-4">📜 История</h3>
                    <div className="space-y-2">
                        {caravans.filter(c => c.status !== 'in_transit').slice(-5).reverse().map(caravan => {
                            const fromBaseName = playerBases.find(b => b.id === caravan.fromBaseId)?.regionId || '???';
                            const toBaseName = playerBases.find(b => b.id === caravan.toBaseId)?.regionId || '???';

                            return (
                                <div key={caravan.id} className="bg-gray-900/30 rounded p-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">
                                            {TL.regions[fromBaseName] || fromBaseName} → {TL.regions[toBaseName] || toBaseName}
                                        </span>
                                        <span className={caravan.status === 'completed' ? 'text-green-400' : 'text-red-400'}>
                                            {caravan.status === 'completed' ? '✅ Доставлено' : '💀 Потеряно'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
