import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { TL, t, TEXT_IDS } from '../services/localization';
import { DrillSlot, LocalizedString } from '../types';
import { BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS, CARGO_BAYS } from '../constants';
import { useDrillStats, useForgeState, useCraftActions } from '../store/selectors';
import { UpgradeCard, FusionTab, DronesTab } from './forge';
import { ConsumablesTab } from './forge/ConsumablesTab';
import { CraftingJobCard } from './forge/CraftingJobCard';
import {
    Hammer,
    Cpu,
    Shield,
    Boxes,
    GitBranch,
    Bot,
    Zap,
    AlertTriangle,
    LayoutGrid,
    Timer
} from 'lucide-react';

type ForgeTab = 'DRILL' | 'SYSTEMS' | 'HULL' | 'FUSION' | 'DRONES' | 'SUPPLY';

const TABS: { id: ForgeTab; label: LocalizedString; icon: React.ReactNode }[] = [
    { id: 'DRILL', label: TL.ui.tabDrill, icon: <Hammer className="w-4 h-4" /> },
    { id: 'SYSTEMS', label: TL.ui.tabSystems, icon: <Cpu className="w-4 h-4" /> },
    { id: 'HULL', label: TL.ui.tabHull, icon: <Shield className="w-4 h-4" /> },
    { id: 'SUPPLY', label: TL.ui.tabSupply, icon: <Boxes className="w-4 h-4" /> },
    { id: 'FUSION', label: TL.ui.tabFusion, icon: <GitBranch className="w-4 h-4" /> },
    { id: 'DRONES', label: TL.ui.tabDrones, icon: <Bot className="w-4 h-4" /> },
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

    const { drill, resources, inventory, stats, equipmentInventory } = useDrillStats();
    const { droneLevels, depth, heatStabilityTimer, integrity, craftingQueue } = useForgeState();
    const { startCraft, collectCraftedItem, cancelCraft } = useCraftActions();
    const lang = useGameStore(s => s.settings.language);

    const forgeStats = useMemo(() => ({
        prod: drill.power.baseStats.energyOutput,
        cons: stats.energyCons
    }), [drill.power.baseStats.energyOutput, stats.energyCons]);

    const getNextAvailablePart = (partType: DrillSlot, currentPart: any, allParts: any[]) => {
        const maxTierInInventory = Math.max(
            currentPart.tier,
            ...equipmentInventory.filter(item => item.slotType === partType).map(item => item.tier)
        );
        const nextTier = maxTierInInventory + 1;
        return allParts.find(p => p.tier === nextTier);
    };

    const renderActiveTab = () => {
        const gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
        switch (forgeTab) {
            case 'DRILL':
                return (
                    <div className={gridClass}>
                        <UpgradeCard title={t(TL.ui.drillBit, lang)} current={drill.bit} next={getNextAvailablePart(DrillSlot.BIT, drill.bit, BITS)} type={DrillSlot.BIT} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.engine, lang)} current={drill.engine} next={getNextAvailablePart(DrillSlot.ENGINE, drill.engine, ENGINES)} type={DrillSlot.ENGINE} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TEXT_IDS.CITY_COOLING_SYSTEM, lang)} current={drill.cooling} next={getNextAvailablePart(DrillSlot.COOLING, drill.cooling, COOLERS)} type={DrillSlot.COOLING} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'SYSTEMS':
                return (
                    <div className={gridClass}>
                        <UpgradeCard title={t(TL.ui.logicCore, lang)} current={drill.logic} next={getNextAvailablePart(DrillSlot.LOGIC, drill.logic, LOGIC_CORES)} type={DrillSlot.LOGIC} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.controlUnit, lang)} current={drill.control} next={getNextAvailablePart(DrillSlot.CONTROL, drill.control, CONTROL_UNITS)} type={DrillSlot.CONTROL} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.cargoBay, lang)} current={drill.cargoBay} next={getNextAvailablePart(DrillSlot.CARGO_BAY, drill.cargoBay, CARGO_BAYS)} type={DrillSlot.CARGO_BAY} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.gearbox, lang)} current={drill.gearbox} next={getNextAvailablePart(DrillSlot.GEARBOX, drill.gearbox, GEARBOXES)} type={DrillSlot.GEARBOX} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'HULL':
                return (
                    <div className={gridClass}>
                        <UpgradeCard title={t(TL.ui.structuralHull, lang)} current={drill.hull} next={getNextAvailablePart(DrillSlot.HULL, drill.hull, HULLS)} type={DrillSlot.HULL} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.powerCore, lang)} current={drill.power} next={getNextAvailablePart(DrillSlot.POWER, drill.power, POWER_CORES)} type={DrillSlot.POWER} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                        <UpgradeCard title={t(TL.ui.armorPlating, lang)} current={drill.armor} next={getNextAvailablePart(DrillSlot.ARMOR, drill.armor, ARMORS)} type={DrillSlot.ARMOR} resources={resources} onStartCraft={startCraft} craftingQueue={craftingQueue} />
                    </div>
                );
            case 'SUPPLY':
                return <ConsumablesTab resources={resources} onStartCraft={startCraft} lang={lang || 'EN'} />;
            case 'FUSION':
                return <FusionTab resources={resources} inventory={inventory} depth={depth} heatStabilityTimer={heatStabilityTimer} integrity={integrity} drill={drill} />;
            case 'DRONES':
                return <DronesTab resources={resources} droneLevels={droneLevels} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 h-full bg-void">
            {/* TABS HUD */}
            <div className="flex glass-panel border-x-0 border-t-0 rounded-none overflow-x-auto scrollbar-hide whitespace-nowrap min-h-[56px] touch-pan-x bg-black/40">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setForgeTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-6 text-[11px] font-bold font-technical transition-all border-r border-white/5 relative
                            ${forgeTab === tab.id ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                        `}
                    >
                        {tab.icon}
                        <span className="tracking-widest uppercase">{t(tab.label, lang)}</span>
                        {forgeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* STATUS BAR (Bento-lite) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 px-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[10px] text-white/40 font-technical uppercase">{t(TL.ui.powerGrid, lang)}</span>
                    <span className={`text-[11px] font-bold ${forgeStats.cons > forgeStats.prod ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                        {forgeStats.prod - forgeStats.cons}W
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] text-white/40 font-technical uppercase">{t(TL.ui.module_label, lang)}</span>
                    <span className="text-[11px] font-bold text-white uppercase">{t(TL.ui.active, lang)}</span>
                </div>
                {forgeStats.cons > forgeStats.prod && (
                    <div className="col-span-2 flex items-center gap-2 text-red-500 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-technical font-bold uppercase tracking-tighter">{t(TL.ui.energyShortage, lang)}: {t(TL.ui.efficiency, lang)} -25%</span>
                    </div>
                )}
            </div>

            {/* CRAFTING QUEUE (Bento Grid Section) */}
            {craftingQueue.length > 0 && (
                <div className="p-4 bg-cyan-500/5 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Timer className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-cyan-400 font-bold text-xs font-technical uppercase tracking-widest">{t(TL.ui.activeAssemblies, lang)}</h3>
                        <span className="text-[10px] bg-cyan-500/20 px-1.5 rounded-full text-cyan-200">{craftingQueue.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {craftingQueue.map(job => (
                            <CraftingJobCard
                                key={job.id}
                                job={job}
                                onCollect={() => collectCraftedItem(job.id)}
                                onCancel={() => cancelCraft(job.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide pb-4 md:pb-8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05)_0%,transparent_50%)]">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default ForgeView;
