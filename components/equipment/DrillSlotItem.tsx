/**
 * DrillSlotItem - один слот в кукле бура
 * Показывает тип детали, её название и тир
 */

import React from 'react';
import { DrillSlot, EquipmentItem } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../services/localization';
import { EquipmentIcon } from './EquipmentIcon';
import { ComparisonTooltip } from './ComparisonTooltip';

interface DrillSlotItemProps {
    slotType: DrillSlot;
    isSelected?: boolean;
    onClick?: () => void;
}

export const DrillSlotItem: React.FC<DrillSlotItemProps> = ({ slotType, isSelected, onClick }) => {
    const slotRef = React.useRef<HTMLDivElement>(null);
    const drill = useGameStore(s => s.drill);
    const lang = useGameStore(s => s.settings.language);

    // Получаем текущую деталь в этом слоте
    const part = drill[slotType];

    if (!part) return null;

    // Безопасное получение iconPath
    const iconPath = 'iconPath' in part ? part.iconPath : undefined;

    // Создаем объект EquipmentItem для тултипа (так как это установленная деталь, создаем виртуальный объект)
    const virtualItem: EquipmentItem = {
        instanceId: `equipped_${slotType}`,
        partId: part.id,
        slotType: slotType,
        tier: part.tier,
        isEquipped: true,
        acquiredAt: 0,
        scrapValue: 0
    };

    return (
        <div
            ref={slotRef}
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded border-2 transition-all cursor-pointer
                ${isSelected
                    ? 'bg-[#3b82f6]/20 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                }
            `}
        >
            {/* Название слота (маленькое сверху) */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0a0e17] px-1 text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
                {slotType}
            </div>

            {/* Иконка оборудования */}
            <div className="mb-1">
                <EquipmentIcon
                    iconPath={iconPath}
                    name={part.name}
                    tier={part.tier}
                    size={48}
                    className="rounded"
                />
            </div>

            {/* Имя детали */}
            <div className="text-[9px] font-bold text-white text-center leading-tight truncate w-full">
                {t(part.name, lang)}
            </div>

            {/* Тултип (Портал) */}
            <ComparisonTooltip item={virtualItem} targetRef={slotRef} />
        </div>
    );
};
