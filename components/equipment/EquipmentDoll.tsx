/**
 * EquipmentDoll - сетка 10 слотов бура (Зона 1 инвентаря)
 * Позволяет видеть установленное оборудование и фильтровать склад при клике
 */

import React from 'react';
import { DrillSlot } from '../../types';
import { DrillSlotItem } from './DrillSlotItem';

interface EquipmentDollProps {
    selectedSlot: DrillSlot | null;
    onSlotClick: (slot: DrillSlot | null) => void;
}

export const EquipmentDoll: React.FC<EquipmentDollProps> = ({ selectedSlot, onSlotClick }) => {
    const slots: DrillSlot[] = [
        DrillSlot.BIT,
        DrillSlot.ENGINE,
        DrillSlot.COOLING,
        DrillSlot.HULL,
        DrillSlot.LOGIC,
        DrillSlot.CONTROL,
        DrillSlot.GEARBOX,
        DrillSlot.POWER,
        DrillSlot.ARMOR,
        DrillSlot.CARGO_BAY,
        DrillSlot.SHIELD
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    КОНФИГУРАЦИЯ БУРА
                </span>
                {selectedSlot && (
                    <button
                        onClick={() => onSlotClick(null)}
                        className="text-[10px] text-[#3b82f6] hover:underline"
                    >
                        Сбросить фильтр
                    </button>
                )}
            </div>

            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slots.map(slot => (
                    <DrillSlotItem
                        key={slot}
                        slotType={slot}
                        isSelected={selectedSlot === slot}
                        onClick={() => onSlotClick(selectedSlot === slot ? null : slot)}
                    />
                ))}
            </div>
        </div>
    );
};
