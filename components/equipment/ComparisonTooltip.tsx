/**
 * ComparisonTooltip - тултип сравнения детали в инвентаре с установленной
 */

import React from 'react';
import { EquipmentItem, DrillSlot } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { calculateStats } from '../../services/gameMath';
import { getPartDefinition } from '../../store/slices/craftSlice';
import { t } from '../../services/localization';

interface ComparisonTooltipProps {
    item: EquipmentItem;
}

export const ComparisonTooltip: React.FC<ComparisonTooltipProps> = ({ item }) => {
    const drill = useGameStore(s => s.drill);
    const skillLevels = useGameStore(s => s.skillLevels);
    const inventory = useGameStore(s => s.inventory);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const depth = useGameStore(s => s.depth);

    const equippedPart = drill[item.slotType as DrillSlot];
    const itemDef = getPartDefinition(item.partId);

    // Защита от undefined equipment
    if (!equippedPart || !item || !item.slotType || !itemDef) return null;

    // Защита от невалидной конфигурации drill
    if (!drill.bit || !drill.engine || !drill.cooling || !drill.hull ||
        !drill.logic || !drill.control || !drill.gearbox || !drill.power || !drill.armor) {
        return null;
    }

    // Расчет статов для текущей конфигурации
    const currentStats = calculateStats(drill, skillLevels, equippedArtifacts.filter(Boolean) as string[], inventory, depth);

    // Расчет статов с новой деталью
    const ghostDrill = { ...drill, [item.slotType]: itemDef };
    const nextStats = calculateStats(ghostDrill, skillLevels, equippedArtifacts.filter(Boolean) as string[], inventory, depth);

    // Определение характеристик для сравнения в зависимости от слота
    const getStatsToCompare = () => {
        const base = [
            { key: 'energyCost', label: 'Энергопотребление', unit: 'W', format: (v: number) => Math.round(v).toString(), inverse: true }
        ];

        switch (item.slotType) {
            case 'bit':
                return [
                    { key: 'totalDamage', label: 'Урон бурения', unit: '', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            case 'engine':
                return [
                    { key: 'totalSpeed', label: 'Скорость проходки', unit: '', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            case 'cooling':
                return [
                    { key: 'totalCooling', label: 'Охлаждение', unit: '', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            case 'hull':
                return [
                    { key: 'integrity', label: 'Целостность', unit: 'HP', format: (v: number) => Math.round(v).toString() },
                    { key: 'regen', label: 'Регенерация', unit: '/s', format: (v: number) => v.toFixed(2) },
                    { key: 'totalCargoCapacity', label: 'Грузоотсек', unit: 'kg', format: (v: number) => Math.round(v).toString() },
                    ...base
                ];
            case 'logic':
                return [
                    { key: 'critChance', label: 'Шанс крита', unit: '%', format: (v: number) => v.toFixed(1) },
                    { key: 'luck', label: 'Удача', unit: '', format: (v: number) => v.toFixed(1) },
                    { key: 'predictionTime', label: 'Прогноз', unit: 's', format: (v: number) => v.toFixed(0) },
                    ...base
                ];
            case 'control':
                return [
                    { key: 'clickMult', label: 'Множитель клика', unit: 'x', format: (v: number) => v.toFixed(1) },
                    { key: 'ventSpeed', label: 'Вентиляция', unit: 'x', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            case 'gearbox':
                return [
                    { key: 'torque', label: 'Крутящий момент', unit: '%', format: (v: number) => v.toFixed(0) },
                    ...base
                ];
            case 'power':
                return [
                    { key: 'energyProd', label: 'Генерация энергии', unit: 'W', format: (v: number) => Math.round(v).toString() },
                    { key: 'droneEfficiency', label: 'Эфф. дронов', unit: 'x', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            case 'armor':
                return [
                    { key: 'defense', label: 'Защита', unit: '%', format: (v: number) => v.toFixed(1) },
                    { key: 'hazardResist', label: 'Сопротивление', unit: '%', format: (v: number) => v.toFixed(1) },
                    ...base
                ];
            default:
                return [...base];
        }
    };

    const statsToCompare = getStatsToCompare();
    const tierDiff = item.tier - equippedPart.tier;
    const isDifferentPart = item.partId !== equippedPart.id;

    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#0a0e17]/95 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 shadow-2xl z-[60] pointer-events-none animate-in fade-in slide-in-from-bottom-2">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2 flex justify-between items-center">
                <span className="truncate max-w-[120px]">{t(itemDef.name, useGameStore.getState().settings.language)}</span>
                <span className={tierDiff > 0 ? 'text-green-400' : tierDiff < 0 ? 'text-red-400' : 'text-cyan-400'}>
                    T{equippedPart.tier} → T{item.tier}
                </span>
            </div>

            {statsToCompare.map(stat => {
                const currentVal = (currentStats as any)[stat.key] || 0;
                const nextVal = (nextStats as any)[stat.key] || 0;
                const diff = nextVal - currentVal;
                const isGood = (stat as any).inverse ? diff < 0 : diff > 0;
                const isNeutral = Math.abs(diff) < 0.0001;

                if (isNeutral && !isDifferentPart) return null;

                return (
                    <div key={stat.key} className="flex justify-between items-center text-[10px] py-0.5">
                        <span className="text-white/40">{stat.label}:</span>
                        <div className="flex items-center gap-1.5 font-technical">
                            <span className="text-white/60">{stat.format(currentVal)}</span>
                            {!isNeutral && (
                                <span className={isGood ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                    {diff > 0 ? '▲' : '▼'}{stat.format(Math.abs(diff))}{stat.unit}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="mt-2 pt-1.5 border-t border-gray-800/50">
                <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase font-bold">
                    <span>Итог:</span>
                    {tierDiff > 0 ? (
                        <span className="text-green-400">▲ УЛУЧШЕНИЕ</span>
                    ) : tierDiff < 0 ? (
                        <span className="text-red-400">▼ УХУДШЕНИЕ</span>
                    ) : (
                        <span className="text-blue-400">● ЗАМЕНА</span>
                    )}
                </div>
            </div>
        </div>
    );
};
