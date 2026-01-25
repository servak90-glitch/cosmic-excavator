import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerBase, ResourceType, FacilityId, DefenseUnitType, Resources } from '../types';
import { FUEL_RECIPES } from '../constants/fuelRecipes';
import { BASE_FACILITIES } from '../constants/baseFacilities';
import { CRAFTING_RECIPES } from '../constants/craftingRecipes';
import { DEFENSE_UNITS, BASE_REPAIR_COST } from '../constants/defenseUnits';
import { TL, t } from '../services/localization';
import { getResourceLabel } from '../services/gameMath';
import { BASE_COSTS } from '../constants/playerBases';
import { audioEngine } from '../services/audioEngine';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Box,
    Factory,
    Zap,
    Hammer,
    Shield,
    Cpu,
    Database,
    LayoutDashboard,
    ArrowRightLeft,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Activity,
    Package,
    ArrowUpCircle,
    Settings,
    Construction,
    Navigation,
    Compass,
    MonitorDot
} from 'lucide-react';

interface BaseViewProps {
    baseId: string;
    onClose: () => void;
}

export const BaseView: React.FC<BaseViewProps> = ({ baseId, onClose }) => {
    const {
        settings,
        resources,
        playerBases,
        transferResources,
        refineResource,
        craftConsumable,
        buildFacility,
        startDefenseProduction,
        repairBase,
        upgradeBase
    } = useGameStore();

    const base = useMemo(() => playerBases.find(b => b.id === baseId), [playerBases, baseId]);
    const lang = settings.language as 'RU' | 'EN';
    const [activeTab, setActiveTab] = useState<'storage' | 'facilities' | 'refinery' | 'workshop' | 'garrison'>('storage');

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!base) return null;

    const totalStored = Object.values(base.storedResources).reduce((sum, a) => sum + (a || 0), 0);
    const storagePercent = (totalStored / base.storageCapacity) * 100;
    const defense = base.defense || { integrity: 100, shields: 0, infantry: 0, drones: 0, turrets: 0 };
    const productionQueue = base.productionQueue || [];

    const isBuilding = base.status === 'building';
    let constructionProgress = 0;
    let constructionTimeLeft = 0;
    if (isBuilding) {
        const total = base.constructionCompletionTime - base.constructionStartTime;
        const elapsed = now - base.constructionStartTime;
        constructionProgress = Math.min(100, (elapsed / total) * 100);
        constructionTimeLeft = Math.max(0, base.constructionCompletionTime - now);
    }

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const tabs = [
        { id: 'storage', label: t(TL.ui.storage, lang), icon: <Box className="w-4 h-4" /> },
        { id: 'facilities', label: t(TL.ui.facilities, lang), icon: <Factory className="w-4 h-4" /> },
        { id: 'refinery', label: t(TL.ui.refinery, lang), icon: <Zap className="w-4 h-4" />, hidden: !base.facilities.includes('basic_refinery') },
        { id: 'workshop', label: t(TL.ui.workshop, lang), icon: <Hammer className="w-4 h-4" />, hidden: !base.facilities.includes('workshop_facility') && !base.facilities.includes('advanced_workshop') },
        { id: 'garrison', label: t(TL.ui.garrison, lang), icon: <Shield className="w-4 h-4" /> }
    ];

    return (
        <div className="flex flex-col h-full bg-void/40 backdrop-blur-3xl relative font-technical overflow-hidden text-white">
            <div className="absolute inset-0 mesh-bg opacity-10 pointer-events-none" />

            {/* HEADER HUB BENTO */}
            <div className="p-4 md:p-10 border-b border-white/5 bg-black/60 relative z-30 shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="p-3 md:p-4 glass-panel border-cyan-500/30 bg-cyan-500/10 rounded-xl md:rounded-2xl relative shadow-[0_0_30px_rgba(34,211,238,0.2)] shrink-0">
                            <Database className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
                            {isBuilding && <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-void"><Construction className="w-3 h-3 text-black animate-spin-slow" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter leading-none truncate mb-1">
                                {base.type.toUpperCase()} <span className="text-cyan-400 font-normal">// {t(TL.regions[base.regionId], lang)}</span>
                            </h2>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="flex items-center gap-2 px-2 py-0.5 glass-panel border-white/5 bg-white/5 text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white/40">
                                    {t(TL.ui.level_label, lang)}: <span className="text-cyan-400">{base.upgradeLevel}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-2 py-0.5 glass-panel border-white/5 text-[7px] md:text-[9px] font-black uppercase tracking-widest
                                    ${isBuilding ? 'text-amber-400 bg-amber-500/10 animate-pulse' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                    {base.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        {isBuilding && (
                            <div className="flex-1 md:flex-none flex flex-col gap-1.5 min-w-[120px] md:min-w-[200px]">
                                <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-500">
                                    <span>CONSTRUCTION</span>
                                    <span>{Math.floor(constructionProgress)}%</span>
                                </div>
                                <div className="w-full h-1.5 md:h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <motion.div
                                        className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                        style={{ width: `${constructionProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="p-3 md:p-4 glass-panel border-white/10 hover:border-white/40 hover:bg-white/5 text-white/40 hover:text-white transition-all group shrink-0"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
                        </button>
                    </div>
                </div>
            </div>

            {/* NAV TABS FRAMEWORK */}
            <div className="w-full px-4 md:px-10 mt-4 md:mt-8 shrink-0 relative z-10">
                <div className="max-w-7xl mx-auto flex gap-1 md:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
                    {tabs.map(tab => !tab.hidden && (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`group px-4 md:px-8 py-3 md:py-4 glass-panel border-white/5 flex items-center gap-2 md:gap-3 font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all relative overflow-hidden shrink-0
                                ${activeTab === tab.id ? 'text-white bg-white/10 border-white/20' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}
                            `}
                        >
                            <span className={`transition-transform duration-300 group-hover:scale-125 ${activeTab === tab.id ? 'text-cyan-400' : ''} [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4`}>{tab.icon}</span>
                            <span className="whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div layoutId="base-tab-active" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* DASHBOARD CONTENT SCENE */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-6 md:py-10 flex-1 overflow-y-auto scroll-smooth relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'storage' && (
                        <motion.div
                            key="storage-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col gap-10"
                        >
                            {/* STORAGE CAPACITY BENTO */}
                            <div className="glass-panel p-8 bg-black/40 border-white/5 relative overflow-hidden bento-glow">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <LayoutDashboard className="w-32 h-32" />
                                </div>
                                <div className="flex justify-between items-end mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">{t(TL.ui.vaultCapacityIndex, lang)}</span>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter">
                                            {Math.floor(totalStored).toLocaleString()} / {base.storageCapacity.toLocaleString()} <span className="text-xs text-white/20 not-italic ml-2">{t(TL.ui.units, lang)}</span>
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-4xl font-black italic tracking-tighter ${storagePercent > 90 ? 'text-rose-500' : 'text-cyan-400'}`}>
                                            {Math.floor(storagePercent)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-4 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
                                    <motion.div
                                        className={`h-full rounded-full relative transition-colors duration-500 ${storagePercent > 90 ? 'bg-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]'}`}
                                        initial={{ width: 0 }} animate={{ width: `${Math.min(100, storagePercent)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Base Inventory Matrix */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 glass-panel border-cyan-500/20 bg-cyan-500/5 text-cyan-400"><Database className="w-4 h-4" /></div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">{t(TL.ui.baseStoredMatrix, lang)}</h3>
                                        <div className="h-px bg-white/5 flex-1" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px] content-start">
                                        {Object.entries(base.storedResources).map(([res, amount]) => (amount || 0) > 0 && (
                                            <ResourceTransferCard
                                                key={res}
                                                res={res as ResourceType}
                                                amount={amount!}
                                                lang={lang}
                                                onTransfer={() => transferResources(base.id, res as any, 100, 'to_player')}
                                                btnLabel={t(TL.ui.withdraw100, lang)}
                                                color="cyan"
                                            />
                                        ))}
                                        {Object.values(base.storedResources).every(v => !v || v <= 0) && (
                                            <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/5 rounded-2xl">
                                                <Package className="w-12 h-12 mb-4" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t(TL.ui.vaultEmpty, lang)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Player Cargo Matrix */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 glass-panel border-amber-500/20 bg-amber-500/5 text-amber-500"><Navigation className="w-4 h-4" /></div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">{t(TL.ui.drillCargoPayload, lang)}</h3>
                                        <div className="h-px bg-white/5 flex-1" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px] content-start">
                                        {Object.entries(resources).map(([res, amount]) => (amount || 0) > 0 && res !== 'credits' && (
                                            <ResourceTransferCard
                                                key={res}
                                                res={res as ResourceType}
                                                amount={amount!}
                                                lang={lang}
                                                onTransfer={() => transferResources(base.id, res as any, 100, 'to_base')}
                                                btnLabel={t(TL.ui.deposit100, lang)}
                                                color="amber"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* UPGRADE HUB BENTO */}
                            {base.status === 'active' && (base.type === 'outpost' || base.type === 'camp') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel p-10 bg-black/60 border-cyan-500/20 relative overflow-hidden group shadow-[0_0_50px_rgba(34,211,238,0.1)]"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ArrowUpCircle className="w-40 h-40" />
                                    </div>
                                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 glass-panel border-cyan-500/40 bg-cyan-500/10 text-cyan-400 rotate-12 group-hover:rotate-0 transition-transform"><TrendingUp className="w-6 h-6" /></div>
                                                <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t(TL.ui.structuralEvolution, lang)}</h3>
                                            </div>
                                            <p className="text-xs text-white/40 font-black uppercase tracking-widest pl-1">
                                                {t(TL.ui.upgradePath, lang)}: {base.type === 'outpost' ? 'Camp' : 'Station'} // {t(TL.ui.features, lang)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-6 shrink-0 md:min-w-[400px]">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {(() => {
                                                    const nextType = base.type === 'outpost' ? 'camp' : 'station';
                                                    const currentC = BASE_COSTS[base.type];
                                                    const nextC = BASE_COSTS[nextType];
                                                    const credDiff = nextC.credits - (currentC.credits || 0);

                                                    return (
                                                        <>
                                                            <div className={`px-5 py-2.5 glass-panel border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${resources.credits >= credDiff ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-rose-500/40 bg-rose-500/10 text-rose-500'}`}>
                                                                <Zap className="w-3.5 h-3.5" /> {credDiff.toLocaleString()} CR
                                                            </div>
                                                            {Object.entries(nextC.materials).map(([res, amt]) => {
                                                                const currentAmt = currentC.materials[res as keyof Resources] || 0;
                                                                const diff = Math.max(0, (amt || 0) - currentAmt);
                                                                if (diff <= 0) return null;
                                                                const hasRes = (resources[res as keyof Resources] || 0) >= diff;
                                                                return (
                                                                    <div key={res} className={`px-5 py-2.5 glass-panel border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${hasRes ? 'border-white/20 bg-white/5 text-white/60' : 'border-rose-500/40 bg-rose-500/10 text-rose-500'}`}>
                                                                        {t(getResourceLabel(res), lang).toUpperCase()} {diff}
                                                                    </div>
                                                                );
                                                            })}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <button
                                                onClick={() => { upgradeBase(base.id); audioEngine.playMarketTrade(); }}
                                                className="w-full py-5 bg-cyan-500 text-black font-black uppercase text-xs tracking-[0.4em] italic shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-400 transition-all active:scale-95"
                                            >
                                                {t(TL.ui.initiatePhaseShift, lang)}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'facilities' && (
                        <motion.div
                            key="facilities-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {Object.values(BASE_FACILITIES).map(facility => {
                                const isBuilt = base.facilities.includes(facility.id);
                                return (
                                    <div key={facility.id} className={`group p-6 glass-panel border-2 transition-all relative overflow-hidden
                                        ${isBuilt ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{t(facility.name, lang)}</h4>
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{t(TL.ui.module_id, lang)}: {facility.id}</span>
                                            </div>
                                            {!isBuilt && (
                                                <div className="px-3 py-1 glass-panel border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] font-black">{facility.cost} 💎</div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-white/40 font-black uppercase italic tracking-widest leading-relaxed mb-10 h-16 overflow-hidden">
                                            {t(facility.description, lang)}
                                        </p>
                                        {!isBuilt ? (
                                            <button
                                                onClick={() => buildFacility(base.id, facility.id)}
                                                className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-cyan-400 transition-all active:scale-95"
                                            >
                                                {t(TL.ui.authorizeConstruction, lang)}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 text-emerald-400 py-4 px-3 glass-panel border-emerald-500/20 bg-emerald-500/5">
                                                <CheckCircle2 className="w-5 h-5 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t(TL.ui.active, lang)}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
                                            <Settings className="w-20 h-20" />
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'refinery' && (
                        <motion.div
                            key="refinery-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="space-y-6 max-w-5xl mx-auto"
                        >
                            {FUEL_RECIPES.map(recipe => {
                                const hasFacility = !recipe.requiredFacility || base.facilities.includes(recipe.requiredFacility);
                                const available = resources[recipe.input.resource] || 0;
                                const canAfford = available >= recipe.input.amount;

                                return (
                                    <RefineryRecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        lang={lang}
                                        hasFacility={hasFacility}
                                        available={available}
                                        onRefine={(a) => refineResource(base.id, recipe.id, a)}
                                    />
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'workshop' && (
                        <motion.div
                            key="workshop-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {CRAFTING_RECIPES.map(recipe => {
                                const hasFacility = !recipe.requiredFacility || base.facilities.includes(recipe.requiredFacility);
                                const canAfford = recipe.input.every(input => (resources[input.resource] || 0) >= input.amount);

                                return (
                                    <WorkshopCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        lang={lang}
                                        hasFacility={hasFacility}
                                        resources={resources}
                                        onCraft={(a) => craftConsumable(base.id, recipe.id, a)}
                                    />
                                );
                            })}
                        </motion.div>
                    )}

                    {activeTab === 'garrison' && (
                        <motion.div
                            key="garrison-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            {/* GARRISON STATUS MATRIX */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <BentoGarrisonMetric
                                    label={t(TL.ui.structuralIntegrity, lang)}
                                    value={defense.integrity}
                                    max={100}
                                    color="rose"
                                    icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
                                    action={defense.integrity < 100 ? {
                                        label: `${t(TL.ui.repair_base_btn, lang)} [${BASE_REPAIR_COST.scrap} ${t(TL.resources.scrap, lang)}, ${BASE_REPAIR_COST.iron} ${t(TL.resources.iron, lang)}]`,
                                        onClick: () => repairBase(base.id)
                                    } : undefined}
                                />
                                <BentoGarrisonMetric
                                    label={t(TL.ui.auraShieldCapacity, lang)}
                                    value={defense.shields}
                                    max={100}
                                    color="cyan"
                                    icon={<Zap className="w-5 h-5 text-cyan-400" />}
                                />
                                <div className="glass-panel p-8 bg-black/40 border-white/5 flex flex-col justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5"><Shield className="w-20 h-20" /></div>
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 italic">{t(TL.ui.compositePowerIndex, lang)}</span>
                                    <div className="text-4xl font-black text-cyan-400 italic tracking-tighter">
                                        {defense.infantry * DEFENSE_UNITS.infantry.defensePower +
                                            defense.drones * DEFENSE_UNITS.drone.defensePower +
                                            defense.turrets * DEFENSE_UNITS.turret.defensePower} <span className="text-sm not-italic ml-2">DP</span>
                                    </div>
                                </div>
                            </div>

                            {/* DEFENSE UNITS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(['infantry', 'drone', 'turret'] as const).map(type => {
                                    const unit = DEFENSE_UNITS[type];
                                    const count = defense[type];
                                    const icons = { infantry: '💂', drone: '🛸', turret: '📡' };
                                    return (
                                        <div key={type} className="glass-panel p-8 bg-white/[0.03] border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{icons[type]}</div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-xl font-black uppercase text-white tracking-widest leading-none mb-1">{t(unit.name, lang)}</h4>
                                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{unit.defensePower} Power Units</span>
                                                </div>
                                            </div>
                                            <div className="text-5xl font-black text-white italic tracking-tighter">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* PRODUCTION LINE */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 py-2 border-l-4 border-cyan-500 pl-6">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{t(TL.ui.strategicForge, lang)}</h3>
                                    <div className="h-px bg-white/5 flex-1" />
                                </div>

                                {productionQueue.length > 0 && (
                                    <div className="glass-panel p-8 bg-cyan-500/5 border-cyan-500/20 space-y-6">
                                        <div className="flex items-center gap-3 text-cyan-400 mb-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t(TL.ui.activeProductionCycle, lang)}</span>
                                        </div>
                                        {productionQueue.map(job => {
                                            const def = DEFENSE_UNITS[job.unitType];
                                            const total = job.completionTime - job.startTime;
                                            const progress = Math.min(100, ((Date.now() - job.startTime) / total) * 100);
                                            return (
                                                <div key={job.id} className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{t(def.name, lang)}</h4>
                                                        <span className="text-xs font-black text-cyan-400 font-mono tracking-tighter">{Math.ceil((job.completionTime - Date.now()) / 1000)}s</span>
                                                    </div>
                                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                        <motion.div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progress}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(Object.keys(DEFENSE_UNITS) as DefenseUnitType[]).map(type => {
                                        const unit = DEFENSE_UNITS[type];
                                        const canAfford = Object.entries(unit.cost).every(([res, amount]) => (resources[res as keyof Resources] || 0) >= (amount || 0));
                                        return (
                                            <div key={type} className="group glass-panel p-6 bg-black/40 border-white/5 flex flex-col gap-6 hover:border-white/20 transition-all">
                                                <div className="space-y-2">
                                                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{t(unit.name, lang)}</h4>
                                                    <p className="text-[9px] text-white/30 uppercase font-black leading-relaxed italic">{t(unit.description, lang)}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(unit.cost).map(([res, amount]) => (
                                                        <div key={res} className="px-3 py-1 glass-panel border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <span className="opacity-40">{t(getResourceLabel(res), lang)}</span>
                                                            <span className={(resources[res as keyof Resources] || 0) >= amount ? 'text-white' : 'text-rose-500'}>{amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    disabled={!canAfford}
                                                    onClick={() => startDefenseProduction(base.id, type)}
                                                    className={`w-full py-4 font-black uppercase text-[10px] tracking-[0.3em] transition-all
                                                        ${canAfford ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'}
                                                    `}
                                                >
                                                    {t(TL.ui.queueUnitDraft, lang)}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* STATUS BAR FOOTER */}
            <div className="p-4 bg-black/80 border-t border-white/5 relative z-20 shrink-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">
                            <Activity className="w-3.5 h-3.5" />
                            {t(TL.ui.telemetryActive, lang)}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 border-l border-white/10 pl-6">{t(TL.ui.sectorSync, lang)}: {t(TL.ui.synced, lang)}</div>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Base_ID: {base.id} // v.4.82</div>
                </div>
            </div>
        </div>
    );
};

const ResourceTransferCard = ({ res, amount, lang, onTransfer, btnLabel, color }: { res: ResourceType, amount: number, lang: 'RU' | 'EN', onTransfer: () => void, btnLabel: string, color: 'cyan' | 'amber' }) => (
    <div className="glass-panel p-4 bg-white/[0.02] border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] leading-none mb-1">{t(getResourceLabel(res), lang)}</span>
            <div className={`text-xl font-black italic tracking-tighter ${color === 'cyan' ? 'text-cyan-400' : 'text-amber-400'}`}>
                {Math.floor(amount).toLocaleString()}
            </div>
        </div>
        <button
            onClick={onTransfer}
            className={`px-4 py-3 glass-panel text-[8px] font-black uppercase tracking-widest transition-all active:scale-90
                ${color === 'cyan' ? 'hover:bg-cyan-500 hover:text-black border-cyan-500/20' : 'hover:bg-amber-500 hover:text-black border-amber-500/20'}
            `}
        >
            {btnLabel}
        </button>
    </div>
);

const BentoGarrisonMetric = ({ label, value, max, color, icon, action }: { label: string, value: number, max: number, color: string, icon: any, action?: { label: string, onClick: () => void } }) => (
    <div className="glass-panel p-6 bg-black/40 border-white/5 flex flex-col gap-4 relative overflow-hidden group">
        <div className="flex justify-between items-center pr-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">{label}</span>
            {icon}
        </div>
        <div className="flex items-end gap-3 mb-2">
            <div className={`text-4xl font-black italic tracking-tighter ${color === 'rose' ? 'text-rose-500' : 'text-cyan-400'} leading-none`}>{value}%</div>
            <div className="text-[9px] text-white/20 font-black mb-1 uppercase tracking-widest">Index</div>
        </div>
        <div className="h-2 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div className={`h-full rounded-full bg-${color === 'rose' ? 'rose' : 'cyan'}-500 shadow-[0_0_15px_currentColor]`} initial={{ width: 0 }} animate={{ width: `${value}%` }} />
        </div>
        {action && (
            <button
                onClick={action.onClick}
                className="mt-2 py-3 glass-panel border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 hover:text-black text-rose-500 text-[8px] font-black uppercase tracking-[0.3em] transition-all"
            >
                {action.label}
            </button>
        )}
    </div>
);

const RefineryRecipeCard = ({ recipe, lang, hasFacility, available, onRefine }: { recipe: any, lang: 'RU' | 'EN', hasFacility: boolean, available: number, onRefine: (a: number) => void }) => (
    <div className={`group p-8 glass-panel border-2 transition-all relative overflow-hidden
        ${!hasFacility ? 'opacity-40 grayscale blur-[1px]' : 'border-white/5 bg-black/40 hover:border-cyan-500/30'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div className="flex-1 space-y-3">
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{t(recipe.name, lang)}</h4>
                <p className="text-[10px] text-white/40 font-black uppercase italic tracking-[0.2em]">{t(recipe.description, lang)}</p>
            </div>

            <div className="flex items-center gap-10 px-8 py-5 glass-panel border-white/5 bg-black/20 rounded-2xl">
                <div className="text-center space-y-2">
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(getResourceLabel(recipe.input.resource), lang)}</div>
                    <div className={`text-2xl font-black italic tracking-tighter ${available >= recipe.input.amount ? 'text-white' : 'text-rose-500'}`}>{recipe.input.amount}</div>
                </div>
                <div className="text-cyan-400 rotate-90 md:rotate-0"><ArrowRightLeft className="w-6 h-6" /></div>
                <div className="text-center space-y-2">
                    <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(getResourceLabel(recipe.output.resource), lang)}</div>
                    <div className="text-2xl font-black text-emerald-400 italic tracking-tighter">+{recipe.output.amount}</div>
                </div>
            </div>

            <div className="flex gap-3 shrink-0">
                <button
                    disabled={!hasFacility || available < recipe.input.amount}
                    onClick={() => onRefine(1)}
                    className="px-6 py-4 glass-panel border-cyan-500/20 hover:bg-cyan-500 hover:text-black font-black text-xs transition-all active:scale-90"
                >
                    X1
                </button>
                <button
                    disabled={!hasFacility || available < recipe.input.amount}
                    onClick={() => onRefine(Math.floor(available / recipe.input.amount))}
                    className="px-8 py-4 bg-cyan-600 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:text-black transition-all active:scale-90"
                >
                    MAX
                </button>
            </div>
        </div>
        {!hasFacility && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                <div className="px-6 py-2 glass-panel border-rose-500/50 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.4em]">{t(TL.ui.requiresModule, lang)}: {t(BASE_FACILITIES[recipe.requiredFacility].name, lang)}</div>
            </div>
        )}
    </div>
);

const WorkshopCard = ({ recipe, lang, hasFacility, resources, onCraft }: { recipe: any, lang: 'RU' | 'EN', hasFacility: boolean, resources: any, onCraft: (a: number) => void }) => {
    const canAfford = recipe.input.every((input: any) => (resources[input.resource] || 0) >= input.amount);
    const maxPoss = recipe.input.reduce((min: number, input: any) => Math.min(min, Math.floor((resources[input.resource] || 0) / input.amount)), 999);

    return (
        <div className={`p-6 glass-panel border-2 transition-all relative overflow-hidden group
            ${!hasFacility ? 'opacity-40 grayscale' : 'border-white/5 bg-black/40 hover:border-purple-500/30'}`}>
            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{t(recipe.name, lang)}</h4>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{t(recipe.description, lang)}</span>
                    </div>
                    <div className="p-2 glass-panel border-purple-500/20 bg-purple-500/5 text-purple-400 group-hover:scale-110 transition-transform"><Hammer className="w-5 h-5" /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.resourcesRequired, lang)}</span>
                        <div className="flex flex-wrap gap-2">
                            {recipe.input.map((input: any) => {
                                const current = resources[input.resource] || 0;
                                const isEnough = current >= input.amount;
                                return (
                                    <div key={input.resource} className={`px-2 py-1.5 glass-panel text-[8px] font-black uppercase tracking-widest flex flex-col gap-0.5 border-white/5 min-w-[80px] ${isEnough ? 'text-white/60' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>
                                        <div className="opacity-50">{t(getResourceLabel(input.resource), lang)}</div>
                                        <div className="flex justify-between items-center">
                                            <span>{input.amount}</span>
                                            <span className="text-[7px] opacity-80">/ {Math.floor(current)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-3 text-right">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t(TL.ui.yieldMatrix, lang)}</span>
                        <div className="text-lg font-black text-emerald-400 italic tracking-tighter">+{recipe.output.amount} {t(getResourceLabel(recipe.output.resource), lang)}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        disabled={!hasFacility || !canAfford}
                        onClick={() => onCraft(1)}
                        className="flex-1 py-3 glass-panel border-purple-500/20 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        {t(TL.ui.x1Craft, lang)}
                    </button>
                    <button
                        disabled={!hasFacility || !canAfford}
                        onClick={() => onCraft(maxPoss)}
                        className="flex-1 py-3 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 transition-all"
                    >
                        {t(TL.ui.maxCraft, lang)} ({maxPoss})
                    </button>
                </div>
            </div>
            {!hasFacility && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                    <div className="px-6 py-2 glass-panel border-rose-500/50 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.4em]">{t(TL.ui.requiresModule, lang)}</div>
                </div>
            )}
        </div>
    );
};
