/**
 * EquipmentCard - карточка одной детали equipment в инвентаре
 * Показывает: partId, tier, scrapValue
 * Кнопки: EQUIP (swap), Scrap (♻️), Sell (💰)
 * Нельзя scrap/sell установленную деталь
 */

import React from 'react';
import { EquipmentItem, LocalizedString } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { getPartDefinition } from '../../store/slices/craftSlice';
import { t } from '../../services/localization';
import { EquipmentIcon } from './EquipmentIcon';
import { Trash2, Coins } from 'lucide-react';
import { ComparisonTooltip } from './ComparisonTooltip';

interface EquipmentCardProps {
    item: EquipmentItem;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item }) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const equipEquipment = useGameStore(s => s.equipEquipment);
    const scrapEquipment = useGameStore(s => s.scrapEquipment);
    const sellEquipment = useGameStore(s => s.sellEquipment);
    const lang = useGameStore(s => s.settings.language);

    const partDef = getPartDefinition(item.partId);

    if (!partDef) return null;

    const iconPath = 'iconPath' in partDef ? partDef.iconPath : undefined;
    const name = 'name' in partDef ? partDef.name as LocalizedString : { RU: item.partId, EN: item.partId };

    return (
        <div
            ref={cardRef}
            className="relative bg-gray-900 border border-gray-700 rounded p-1.5 md:p-3 hover:border-[#3b82f6]/50 transition-all flex flex-col items-center"
        >
            <div className="hidden md:block">
                <EquipmentIcon
                    iconPath={iconPath}
                    name={name}
                    tier={item.tier}
                    size={80}
                    className="mb-3"
                />
            </div>
            <div className="md:hidden">
                <EquipmentIcon
                    iconPath={iconPath}
                    name={name}
                    tier={item.tier}
                    size={64}
                    className="mb-2"
                />
            </div>

            {/* Название и Тир */}
            <div className="text-[10px] md:text-xs font-bold text-white text-center leading-tight mb-1 md:mb-2 truncate w-full uppercase tracking-tighter">
                {t(name, lang)}
            </div>

            {/* Цена разбора/продажи (мелко) */}
            <div className="text-[8px] md:text-[10px] text-gray-500 mb-2 md:mb-3 font-mono">
                SCRAP: {item.scrapValue}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-1 w-full mt-auto">
                <button
                    onClick={() => equipEquipment(item.instanceId)}
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[10px] md:text-xs font-black py-1.5 md:py-1 px-2 rounded uppercase transition-colors"
                >
                    Equip
                </button>

                <button
                    onClick={() => scrapEquipment(item.instanceId)}
                    className="bg-orange-600/30 hover:bg-orange-600/50 text-orange-400 p-2 md:p-1.5 rounded transition-colors"
                    title="Scrap for parts"
                >
                    <Trash2 size={16} className="md:w-4 md:h-4 w-4 h-4" />
                </button>

                <button
                    onClick={() => sellEquipment(item.instanceId)}
                    className="bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-500 p-2 md:p-1.5 rounded transition-colors"
                    title="Sell for credits"
                >
                    <Coins size={16} className="md:w-4 md:h-4 w-4 h-4" />
                </button>
            </div>

            {/* Тултип сравнения (Портал) */}
            {!item.isEquipped && (
                <ComparisonTooltip item={item} targetRef={cardRef} />
            )}
        </div>
    );
};
