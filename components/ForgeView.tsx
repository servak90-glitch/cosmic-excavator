import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { DrillSlot } from '../types';
import { BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS } from '../constants';
import { calculateStats } from '../services/gameMath';
import { UpgradeCard, FusionTab, DronesTab } from './forge';

type ForgeTab = 'DRILL' | 'SYSTEMS' | 'HULL' | 'FUSION' | 'DRONES';

const TABS: { id: ForgeTab; label: string }[] = [
    { id: 'DRILL', label: 'БУР' },
    { id: 'SYSTEMS', label: 'СИСТЕМЫ' },
    { id: 'HULL', label: 'КОРПУС' },
    { id: 'FUSION', label: 'СИНТЕЗ' },
    { id: 'DRONES', label: 'ДРОНЫ' },
];

const ForgeView: React.FC = () => {
    const [forgeTab, setForgeTab] = useState<ForgeTab>('DRILL');

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
    }, [forgeTab]);

    // Connect to store
    const drill = useGameStore(s => s.drill);
    const resources = useGameStore(s => s.resources);
    const buyUpgrade = useGameStore(s => s.buyUpgrade);
    const inventory = useGameStore(s => s.inventory);
    const droneLevels = useGameStore(s => s.droneLevels);
    const skillLevels = useGameStore(s => s.skillLevels);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const depth = useGameStore(s => s.depth);
    const heatStabilityTimer = useGameStore(s => s.heatStabilityTimer);
    const integrity = useGameStore(s => s.integrity);

    const stats = calculateStats(drill, skillLevels, equippedArtifacts, inventory, depth);
    const forgeStats = { prod: drill.power.baseStats.energyOutput, cons: stats.energyCons };

    const renderActiveTab = () => {
        switch (forgeTab) {
            case 'DRILL':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 space-y-2 md:space-y-0">
                        <UpgradeCard title="НАКОНЕЧНИК" current={drill.bit} next={BITS[BITS.findIndex(p => p.id === drill.bit.id) + 1]} type={DrillSlot.BIT} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="ДВИГАТЕЛЬ" current={drill.engine} next={ENGINES[ENGINES.findIndex(p => p.id === drill.engine.id) + 1]} type={DrillSlot.ENGINE} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="ОХЛАЖДЕНИЕ" current={drill.cooling} next={COOLERS[COOLERS.findIndex(p => p.id === drill.cooling.id) + 1]} type={DrillSlot.COOLING} resources={resources} onBuy={buyUpgrade} />
                    </div>
                );
            case 'SYSTEMS':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="ЛОГИКА" current={drill.logic} next={LOGIC_CORES[LOGIC_CORES.findIndex(p => p.id === drill.logic.id) + 1]} type={DrillSlot.LOGIC} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="УПРАВЛЕНИЕ" current={drill.control} next={CONTROL_UNITS[CONTROL_UNITS.findIndex(p => p.id === drill.control.id) + 1]} type={DrillSlot.CONTROL} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="ГРУЗОВОЙ ОТСЕК" current={drill.cargoBay} next={CARGO_BAYS[CARGO_BAYS.findIndex(p => p.id === drill.cargoBay.id) + 1]} type={DrillSlot.CARGO_BAY} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="РЕДУКТОР" current={drill.gearbox} next={GEARBOXES[GEARBOXES.findIndex(p => p.id === drill.gearbox.id) + 1]} type={DrillSlot.GEARBOX} resources={resources} onBuy={buyUpgrade} />
                    </div>
                );
            case 'HULL':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                        <UpgradeCard title="КАРКАС" current={drill.hull} next={HULLS[HULLS.findIndex(p => p.id === drill.hull.id) + 1]} type={DrillSlot.HULL} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="ПИТАНИЕ" current={drill.power} next={POWER_CORES[POWER_CORES.findIndex(p => p.id === drill.power.id) + 1]} type={DrillSlot.POWER} resources={resources} onBuy={buyUpgrade} />
                        <UpgradeCard title="БРОНЯ" current={drill.armor} next={ARMORS[ARMORS.findIndex(p => p.id === drill.armor.id) + 1]} type={DrillSlot.ARMOR} resources={resources} onBuy={buyUpgrade} />
                    </div>
                );
            case 'FUSION':
                return (
                    <FusionTab
                        resources={resources}
                        inventory={inventory}
                        depth={depth}
                        heatStabilityTimer={heatStabilityTimer}
                        integrity={integrity}
                        drill={drill}
                    />
                );
            case 'DRONES':
                return <DronesTab resources={resources} droneLevels={droneLevels} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-black flex flex-col min-h-0 h-full">
            {/* TABS */}
            <div className="flex bg-zinc-950 border-b border-zinc-800 overflow-x-auto scrollbar-hide whitespace-nowrap min-h-[44px] touch-pan-x">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setForgeTab(tab.id)}
                        className={`flex-none py-3 md:py-4 px-4 md:px-6 text-[10px] md:text-xs font-bold pixel-text transition-colors border-r border-zinc-900 ${forgeTab === tab.id ? 'bg-zinc-900 text-white border-b-2 border-b-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ENERGY STATS */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-2 px-2 md:px-4 flex justify-between items-center text-[10px] md:text-xs font-mono">
                <span className="text-zinc-500">БАЛАНС ЭНЕРГИИ:</span>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-green-400">ГЕН:{forgeStats.prod}</span>
                    <span className={forgeStats.cons > forgeStats.prod ? 'text-red-500 animate-pulse' : 'text-amber-400'}>ПОТР:{forgeStats.cons}</span>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-2 md:p-8 overflow-y-auto scrollbar-hide pb-32 overscroll-contain touch-pan-y">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default ForgeView;
