/**
 * CARAVAN PANEL — UI для управления караванами
 * Phase 2 (MVP): только 1★ шаттлы
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CARAVAN_SPECS } from '../constants/caravans';
import { getCaravanETA } from '../services/caravanManager';
import { getActivePerkIds } from '../services/factionLogic';
import { TL, t } from '../services/localization';
import { ResourceType } from '../types';
import type { Resources } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Lock,
    Unlock,
    Navigation,
    Package,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRightCircle,
    MonitorDot,
    Activity,
    ShieldAlert,
    History,
    Zap,
    Scale
} from 'lucide-react';

export const CaravanPanel = () => {
    const playerBases = useGameStore(s => s.playerBases);
    const caravans = useGameStore(s => s.caravans);
    const caravanUnlocks = useGameStore(s => s.caravanUnlocks);
    const resources = useGameStore(s => s.resources);
    const unlockBasicLogistics = useGameStore(s => s.unlockBasicLogistics);
    const sendCaravan = useGameStore(s => s.sendCaravan);
    const reputation = useGameStore(s => s.reputation);
    const lang = useGameStore(s => s.settings.language);

    const [fromBaseId, setFromBaseId] = useState<string>('');
    const [toBaseId, setToBaseId] = useState<string>('');
    const [cargoAmount, setCargoAmount] = useState<number>(100);
    const [cargoResource, setCargoResource] = useState<ResourceType>(ResourceType.STONE);

    const isUnlocked = caravanUnlocks.find(u => u.tier === '1star')?.unlocked || false;
    const spec = CARAVAN_SPECS['1star'];

    const activePerks = useMemo(() => getActivePerkIds(reputation), [reputation]);
    const capacityModifier = activePerks.includes('BULK_LOGISTICS') ? 1.2 : 1.0;
    const maxCapacity = Math.floor(spec.capacity * capacityModifier);

    const fromBase = playerBases.find(b => b.id === fromBaseId);
    const availableInBase = fromBase ? (fromBase.storedResources[cargoResource] || 0) : 0;
    const canSend = isUnlocked && fromBase && toBaseId && fromBaseId !== toBaseId && availableInBase >= cargoAmount && cargoAmount <= maxCapacity;

    const handleSend = () => {
        if (canSend) {
            sendCaravan(fromBaseId, toBaseId, { [cargoResource]: cargoAmount } as Partial<Resources>);
            setCargoAmount(100);
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-0 md:gap-10 font-technical text-white overflow-y-auto pr-0 md:pr-4 scrollbar-hide">

            {/* UNLOCK OVERLAY / LOCK SCREEN */}
            <AnimatePresence>
                {!isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-12 border-amber-500/20 bg-amber-500/5 relative overflow-hidden text-center flex flex-col items-center gap-8 shadow-[0_0_100px_rgba(245,158,11,0.1)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                        <div className="p-6 glass-panel border-amber-500/30 bg-amber-500/10 rounded-full">
                            <Lock className="w-16 h-16 text-amber-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">Logistics_Core_Inactive</h3>
                            <p className="text-xs text-white/40 font-black uppercase tracking-[0.4em] max-w-sm">{t(TL.ui.market_station_required, lang)}</p>
                        </div>

                        <div className="max-w-md w-full glass-panel border-white/5 bg-black/40 p-10 space-y-8">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 glass-panel border-cyan-500/20 text-cyan-400"><MonitorDot className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="text-lg font-black uppercase text-white leading-none mb-1">1★ Shuttle Prototype</h4>
                                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">Basic cargo frame // sector-transit capable</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <BentoSpec label="Payload" value={`${spec.capacity} KG`} />
                                <BentoSpec label="Cycle" value={`${spec.travelTime / (60 * 60 * 1000)}H`} />
                            </div>
                            <button
                                onClick={unlockBasicLogistics}
                                disabled={resources.credits < spec.unlockCost}
                                className={`w-full py-5 font-black uppercase text-xs tracking-[0.4em] italic shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all
                                    ${resources.credits >= spec.unlockCost ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white/5 text-white/10 border border-white/5 opacity-40 cursor-not-allowed'}
                                `}
                            >
                                {t(TL.ui.acquire, lang)} // {spec.unlockCost} CR
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN LOGISTICS COMMAND */}
            {isUnlocked && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT: DEPLOYMENT INTERFACE */}
                    <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
                        <div className="glass-panel p-10 border-cyan-500/20 bg-black/60 relative overflow-hidden bento-glow">
                            <div className="absolute top-0 right-0 p-10 opacity-5"><Navigation className="w-40 h-40" /></div>
                            <div className="flex items-center gap-4 mb-10 border-l-4 border-cyan-500 pl-6">
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Deploy_Supply_Run</h3>
                            </div>

                            {playerBases.length < 2 ? (
                                <div className="p-10 glass-panel border-rose-500/30 bg-rose-500/5 flex flex-col items-center justify-center text-center gap-6 group">
                                    <div className="p-6 glass-panel border-rose-500/20 bg-rose-500/10 text-rose-500 transition-transform group-hover:scale-110"><AlertTriangle className="w-12 h-12" /></div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black text-rose-400 uppercase tracking-widest">Network_Link_Failure</h4>
                                        <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Minimum of 2 active sectors required to establish a transit route.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-6 md:space-y-8">
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="space-y-3 md:space-y-4">
                                                <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic pl-1">{t(TL.ui.deploymentOrigin, lang)}</label>
                                                <select
                                                    value={fromBaseId} onChange={(e) => setFromBaseId(e.target.value)}
                                                    className="w-full bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 p-3 md:p-4 font-black uppercase italic outline-none text-xs md:text-sm transition-all text-cyan-400"
                                                >
                                                    <option value="">{t(TL.ui.waiting, lang)}</option>
                                                    {playerBases.map(base => (
                                                        <option key={base.id} value={base.id} className="bg-void">{t(TL.regions[base.regionId], lang).toUpperCase()} [{base.type.toUpperCase()}]</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-3 md:space-y-4">
                                                <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic pl-1">{t(TL.ui.targetDestination, lang)}</label>
                                                <select
                                                    value={toBaseId} onChange={(e) => setToBaseId(e.target.value)}
                                                    className="w-full bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 p-3 md:p-4 font-black uppercase italic outline-none text-xs md:text-sm transition-all text-white/80"
                                                >
                                                    <option value="">{t(TL.ui.waiting, lang)}</option>
                                                    {playerBases.filter(b => b.id !== fromBaseId).map(base => (
                                                        <option key={base.id} value={base.id} className="bg-void">{t(TL.regions[base.regionId], lang).toUpperCase()} [{base.type.toUpperCase()}]</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-4 md:p-6 glass-panel border-white/5 bg-white/[0.02]">
                                            <div className="flex items-center gap-3 md:gap-4 text-white/20">
                                                <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 animate-pulse" />
                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em]">{t(TL.ui.routeSyncing, lang)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:space-y-8 flex flex-col justify-between">
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="space-y-3 md:space-y-4">
                                                <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic pl-1">{t(TL.ui.cargoPayload, lang)}</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={cargoResource} onChange={(e) => setCargoResource(e.target.value as any)}
                                                        className="flex-1 bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 p-3 md:p-4 font-black uppercase italic outline-none text-[10px] md:text-xs text-white"
                                                    >
                                                        {[ResourceType.STONE, ResourceType.CLAY, ResourceType.IRON, ResourceType.COPPER, ResourceType.COAL, ResourceType.OIL, ResourceType.GAS, ResourceType.ICE, ResourceType.SCRAP].map(res => (
                                                            <option key={res} value={res} className="bg-void">{t(TL.resources[res], lang).toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number" value={cargoAmount} onChange={(e) => setCargoAmount(Math.min(maxCapacity, Math.max(1, parseInt(e.target.value) || 1)))}
                                                        className="w-24 md:w-32 bg-white/5 border-2 border-white/5 focus:border-cyan-500/50 p-3 md:p-4 font-black text-center text-xs md:text-sm italic text-cyan-400 outline-none"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{t(TL.ui.payloadCap, lang)}: {maxCapacity}</span>
                                                    <span className="text-[7px] md:text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">{t(TL.ui.available, lang)}: {availableInBase.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSend}
                                            disabled={!canSend}
                                            className={`w-full py-4 md:py-6 font-black uppercase text-[10px] md:text-sm tracking-[0.5em] italic shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-3 md:gap-4 group/btn
                                                  ${canSend ? 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98]' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed grayscale'}
                                              `}
                                        >
                                            <ArrowRightCircle className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform" />
                                            {t(TL.ui.initiateSupplyBridge, lang)}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACTIVE TRANSITS HUB */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 py-2">
                                <Activity className="w-4 h-4 text-purple-400" />
                                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.4em] italic">Active_Transit_Monitors</h3>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {caravans.filter(c => c.status === 'in_transit').map(caravan => {
                                    const eta = getCaravanETA(caravan);
                                    const fBase = playerBases.find(b => b.id === caravan.fromBaseId);
                                    const tBase = playerBases.find(b => b.id === caravan.toBaseId);

                                    return (
                                        <div key={caravan.id} className="glass-panel p-6 border-purple-500/20 bg-purple-500/5 flex flex-col gap-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Truck className="w-20 h-20" /></div>
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter italic">
                                                        {t(TL.regions[fBase?.regionId || ''], lang).toUpperCase()} → {t(TL.regions[tBase?.regionId || ''], lang).toUpperCase()}
                                                    </div>
                                                    <div className="text-[8px] font-black text-purple-400/60 uppercase tracking-widest">TRANSPONDER: {caravan.id.slice(0, 8)}</div>
                                                </div>
                                                <div className={`px-3 py-1 glass-panel border-cyan-500/30 bg-black/40 text-[9px] font-black uppercase text-cyan-400 ${eta.arrived ? 'animate-pulse' : ''}`}>
                                                    {eta.arrived ? 'Signal_Arrived' : `ETA: ${eta.remainingMinutes}m`}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                                                    <span>Payload_Analysis</span>
                                                    <span>{Math.round(caravan.lossChance * 100)}% Danger_Index</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {Object.entries(caravan.cargo).map(([res, amt]) => (
                                                        <div key={res} className="px-3 py-1.5 glass-panel border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Package className="w-3 h-3 text-purple-400" />
                                                            {t(res, lang)}: {amt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {caravans.filter(c => c.status === 'in_transit').length === 0 && (
                                    <div className="col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-10">
                                        <MonitorDot className="w-12 h-12 mb-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">No_Active_Signals_Detected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TRACKING & STATS */}
                    <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">

                        <div className="glass-panel p-8 border-white/5 bg-black/40 flex flex-col gap-8 bento-glow min-h-[400px]">
                            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                                <History className="w-5 h-5 text-white/40" />
                                <h4 className="text-xl font-black uppercase italic tracking-tighter">Event_Log_Stream</h4>
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                                {caravans.filter(c => c.status !== 'in_transit').slice(-10).reverse().map(caravan => {
                                    const fBase = playerBases.find(b => b.id === caravan.fromBaseId);
                                    const tBase = playerBases.find(b => b.id === caravan.toBaseId);
                                    const isSuccess = caravan.status === 'completed';

                                    return (
                                        <div key={caravan.id} className={`p-4 glass-panel border-white/5 flex flex-col gap-3 transition-colors ${isSuccess ? 'hover:bg-emerald-500/5' : 'hover:bg-rose-500/5'}`}>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-white/40">{t(TL.regions[fBase?.regionId || ''], lang as 'RU' | 'EN').toUpperCase()} {'>'} {t(TL.regions[tBase?.regionId || ''], lang as 'RU' | 'EN').toUpperCase()}</span>
                                                <span className={isSuccess ? 'text-emerald-400' : 'text-rose-500'}>{isSuccess ? 'ARRIVED_OK' : 'LINK_LOST'}</span>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-white/5 pt-2">
                                                <div className="text-[8px] font-black text-white/20 italic">Shuttle: Star-1_{caravan.id.slice(-4)}</div>
                                                <div className="text-[8px] font-black text-white/40 uppercase">
                                                    {Object.keys(caravan.cargo).length} Unit Types
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {caravans.filter(c => c.status !== 'in_transit').length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                                        <ShieldAlert className="w-16 h-16 mb-4" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Log_Archive_Null</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 glass-panel border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">Operational Efficiency</span>
                                </div>
                                <span className="text-xl font-black text-white italic tracking-tighter">94.2%</span>
                            </div>
                        </div>

                        {/* FLEET TELEMETRY BENTO */}
                        <div className="glass-panel p-8 bg-black/40 border-white/5 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity"><Scale className="w-32 h-32" /></div>
                            <div className="flex items-center gap-4">
                                <Truck className="w-5 h-5 text-cyan-400" />
                                <h4 className="text-xs font-black uppercase tracking-[0.4em] italic text-white/60">Fleet_Capacity_Telemetry</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-white/40">Network_Load</span>
                                        <span className="text-white">Active</span>
                                    </div>
                                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                                        <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: '65%' }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 glass-panel border-white/5 bg-white/5 flex flex-col gap-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Avg_ETA</span>
                                        <span className="text-lg font-black italic tracking-tighter">2.4M</span>
                                    </div>
                                    <div className="p-4 glass-panel border-white/5 bg-white/5 flex flex-col gap-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Risk_Mod</span>
                                        <span className="text-lg font-black italic tracking-tighter text-emerald-400">-15%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const BentoSpec = ({ label, value }: { label: string, value: string }) => (
    <div className="p-4 glass-panel border-white/5 bg-white/5 flex flex-col gap-1 text-left">
        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{label}</span>
        <span className="text-xl font-black italic tracking-tighter text-white">{value}</span>
    </div>
);

const BentoSpecRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-white uppercase italic tracking-widest">{value}</span>
    </div>
);
