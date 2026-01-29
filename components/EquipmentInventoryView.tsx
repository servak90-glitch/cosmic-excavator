import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { EquipmentCard } from './equipment/EquipmentCard';
import { WeightBar } from './equipment/WeightBar';
import { EquipmentDoll } from './equipment/EquipmentDoll';
import { DrillSlot, InventoryItem } from '../types';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { t, TL } from '../services/localization';

interface EquipmentInventoryViewProps {
    onClose: () => void;
}

export const EquipmentInventoryView: React.FC<EquipmentInventoryViewProps> = ({ onClose }) => {
    const [selectedSlot, setSelectedSlot] = React.useState<DrillSlot | null>(null);
    const [tab, setTab] = React.useState<'EQUIPMENT' | 'ARTIFACTS'>('EQUIPMENT');

    React.useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const equipmentInventory = useGameStore(s => s.equipmentInventory);
    const artifactInventory = useGameStore(s => s.inventory);
    const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
    const unequipArtifact = useGameStore(s => s.unequipArtifact);
    const equipArtifact = useGameStore(s => s.equipArtifact);
    const startAnalysis = useGameStore(s => s.startAnalysis);
    const analyzerState = useGameStore(s => s.analyzer);
    const lang = useGameStore(s => s.settings.language);

    const artifactItems = useMemo(() => Object.values(artifactInventory) as InventoryItem[], [artifactInventory]);

    // Фильтрация инвентаря оборудования
    const filteredEquipment = useMemo(() => {
        let items = [...equipmentInventory];
        if (selectedSlot) {
            items = items.filter(item => item.slotType === selectedSlot);
        }
        return items.sort((a, b) => {
            if (a.isEquipped !== b.isEquipped) return a.isEquipped ? 1 : -1;
            return b.tier - a.tier;
        });
    }, [equipmentInventory, selectedSlot]);

    // Фильтрация артефактов
    const filteredArtifacts = useMemo(() => {
        return artifactItems.sort((a, b) => {
            if (a.isEquipped !== b.isEquipped) return a.isEquipped ? 1 : -1;
            return b.acquiredAt - a.acquiredAt;
        });
    }, [artifactItems]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
            <div
                className="bg-[#0a0e17] md:border-2 md:border-[#3b82f6] md:rounded-lg p-4 md:p-6 w-full h-full md:max-w-6xl md:h-[90vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 md:mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xl md:text-3xl">⚙️</span>
                        <h2 className="text-base md:text-3xl font-black text-[#3b82f6] font-technical uppercase tracking-tighter italic">
                            {t(TL.ui.inventoryTitle, lang)}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl md:text-3xl transition-colors p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* ⬆️ ЗОНА 1: Кукла бура (30% высоты) */}
                <div className="h-[30%] mb-4 border border-gray-700/50 rounded-lg p-3 bg-gray-900/20 shrink-0">
                    <EquipmentDoll
                        selectedSlot={selectedSlot}
                        onSlotClick={(s) => {
                            setSelectedSlot(s);
                            setTab('EQUIPMENT');
                        }}
                    />
                </div>

                {/* ↔️ ЗОНА 2: Quick Access (10% высоты) */}
                <div className="h-[12%] md:h-[10%] mb-4 border border-gray-700/30 rounded-lg p-2 bg-gray-900/10 shrink-0">
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">
                        {t(TL.ui.quickAccess, lang)} (Q | E | R | F)
                    </div>
                    <div className="grid grid-cols-4 gap-2 h-10 md:h-12">
                        {['Q', 'E', 'R', 'F'].map((key, idx) => {
                            const artifactInstanceId = equippedArtifacts[idx];
                            const artifact = artifactInstanceId ? artifactInventory[artifactInstanceId] : null;
                            const def = artifact ? ARTIFACTS.find(a => a.id === artifact.defId) : null;

                            return (
                                <div
                                    key={key}
                                    onClick={() => artifact && unequipArtifact(artifact.instanceId)}
                                    className={`bg-gray-800/50 border ${artifact ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-gray-700/50'} rounded flex items-center justify-center relative group overflow-hidden cursor-pointer hover:bg-gray-700/50 transition-all`}
                                >
                                    <span className="absolute top-0.5 left-1 text-[8px] text-gray-500 font-mono">{key}</span>
                                    {artifact && def ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{def.icon}</span>
                                            <span className="text-[10px] text-white font-bold hidden md:block truncate max-w-[60px]">{t(def.name, lang)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-[10px] uppercase font-bold group-hover:text-gray-400 transition-colors">
                                            {t(TL.ui.empty_label, lang)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ⬇️ ЗОНА 3: Склад (50% высоты) */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => setTab('EQUIPMENT')}
                            className={`px-4 py-1.5 rounded-t font-bold text-xs transition-all ${tab === 'EQUIPMENT' ? 'bg-[#3b82f6] text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                        >
                            {t(TL.ui.equipmentTab, lang)}
                        </button>
                        <button
                            onClick={() => setTab('ARTIFACTS')}
                            className={`px-4 py-1.5 rounded-t font-bold text-xs transition-all ${tab === 'ARTIFACTS' ? 'bg-[#10b981] text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                        >
                            {t(TL.ui.artifactsTab, lang)}
                        </button>
                    </div>

                    <div className="flex-1 bg-gray-950/50 border border-gray-800 rounded-lg rounded-tl-none p-3 overflow-y-auto custom-scrollbar">
                        {tab === 'EQUIPMENT' ? (
                            <>
                                <WeightBar />
                                <div className="flex justify-between items-center mb-3 mt-2">
                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                        {t(TL.ui.equipmentStorage, lang)} {selectedSlot && <span className="text-[#3b82f6]">/ {selectedSlot.toUpperCase()}</span>}
                                        <span className="ml-2 text-gray-600">({filteredEquipment.length})</span>
                                    </div>
                                    {selectedSlot && (
                                        <button onClick={() => setSelectedSlot(null)} className="text-[#3b82f6] text-[10px] uppercase font-bold hover:underline">
                                            {t(TL.ui.resetFilter, lang)}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {filteredEquipment.map(item => (
                                        <EquipmentCard key={item.instanceId} item={item} />
                                    ))}
                                </div>
                                {filteredEquipment.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
                                        <span className="text-4xl mb-2 opacity-20">📦</span>
                                        <p className="text-sm">{t(TL.ui.noItemsFound, lang)}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {filteredArtifacts.map(item => {
                                    const def = ARTIFACTS.find(a => a.id === item.defId);
                                    if (!def) return null;
                                    const isAnalyzing = item.instanceId === analyzerState.activeItemInstanceId;
                                    const rarityStyle = item.isIdentified ? getArtifactColor(def.rarity) : 'border-zinc-700 text-zinc-600';

                                    return (
                                        <div
                                            key={item.instanceId}
                                            onClick={() => {
                                                if (!item.isIdentified && !isAnalyzing) startAnalysis(item.instanceId);
                                                else if (item.isIdentified && !item.isEquipped) equipArtifact(item.instanceId);
                                            }}
                                            className={`aspect-square border-2 relative group transition-all flex flex-col items-center justify-center p-2 cursor-pointer active:scale-95 bg-zinc-900/50 rounded-lg ${rarityStyle} ${isAnalyzing ? 'animate-pulse' : ''} ${item.isEquipped ? 'ring-2 ring-green-500' : ''}`}
                                        >
                                            <div className="text-2xl md:text-3xl mb-1">{item.isIdentified ? def.icon : '❓'}</div>
                                            <div className="text-[9px] font-bold text-center truncate w-full uppercase">
                                                {item.isIdentified ? t(def.name, lang).split(' ')[0] : '???'}
                                            </div>

                                            {isAnalyzing && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                                    <div className="w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${((analyzerState.maxTime - analyzerState.timeLeft) / analyzerState.maxTime) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tooltip */}
                                            <div className="hidden group-hover:block absolute z-[100] top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-950 border border-zinc-700 p-3 rounded shadow-2xl pointer-events-none">
                                                {item.isIdentified ? (
                                                    <>
                                                        <p className="text-[10px] font-bold text-cyan-400 mb-1 uppercase">{t(def.name, lang)}</p>
                                                        <p className="text-[9px] text-zinc-400 italic mb-2">"{t(def.loreDescription, lang)}"</p>
                                                        <div className="border-t border-zinc-800 pt-1 text-[9px] text-green-400 font-bold">
                                                            {t(def.effectDescription, lang)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-[10px] text-zinc-500 italic">
                                                        {isAnalyzing ? t(TL.ui.analyzing, lang) : t(TL.ui.analysisRequired, lang)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
