
import React, { useMemo, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { InventoryItem, ArtifactRarity } from '../types';
import { ARTIFACTS, getArtifactColor } from '../services/artifactRegistry';
import { useGameStore } from '../store/gameStore';
import { t } from '../services/localization';


// Removed Props interface as we now connect directly to store for better performance and reactivity
const ArtifactsView: React.FC = () => {
   // Direct Store Hooks
   const items = useGameStore(s => s.inventory);
   const storageLevel = useGameStore(s => s.storageLevel);
   const analyzerState = useGameStore(s => s.analyzer);
   const equippedArtifacts = useGameStore(s => s.equippedArtifacts);
   const lang = useGameStore(s => s.settings.language);

   // Actions
   const onStartAnalysis = useGameStore(s => s.startAnalysis);
   const onEquipArtifact = useGameStore(s => s.equipArtifact);
   const onUnequipArtifact = useGameStore(s => s.unequipArtifact);
   const onScrapArtifact = useGameStore(s => s.scrapArtifact);

   useEffect(() => {
      audioEngine.playUIPanelOpen();
   }, []);


   const isQuarantined = storageLevel === 1;
   const getItemDef = (defId: string) => ARTIFACTS.find(a => a.id === defId);
   const analyzingItem = analyzerState.activeItemInstanceId ? items[analyzerState.activeItemInstanceId] : null;

   // Convert Record to Array for rendering
   const itemList = useMemo(() => Object.values(items) as InventoryItem[], [items]);

   return (
      <div className="flex-1 flex flex-col md:flex-row bg-[#0a0a0a] relative h-full overflow-hidden">

         {/* --- LEFT PANEL: INVENTORY GRID --- */}
         <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 p-2 md:p-6 overflow-hidden min-h-[50%]">
            <div className="flex justify-between items-end border-b-2 border-zinc-800 pb-2 mb-2 md:mb-4 shrink-0">
               <div>
                  <h2 className="text-lg md:text-2xl pixel-text text-zinc-200">ХРАНИЛИЩЕ</h2>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono mt-1">ОБНАРУЖЕННЫЕ ОБЪЕКТЫ</p>
               </div>
               <div className={`text-[9px] font-mono font-bold px-2 py-1 ${isQuarantined ? 'bg-amber-900/50 text-amber-500' : 'bg-green-900/50 text-green-500'}`}>
                  {isQuarantined ? 'LIMITED' : 'ONLINE'}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 gap-2 md:gap-3 content-start touch-pan-y">
               {itemList.map((item) => {
                  const def = getItemDef(item.defId);
                  if (!def) return null;

                  const isAnalyzing = item.instanceId === analyzerState.activeItemInstanceId;
                  const isEquipped = item.isEquipped;
                  const rarityColor = item.isIdentified ? getArtifactColor(def.rarity) : 'border-zinc-700 text-zinc-600';

                  return (
                     <div
                        key={item.instanceId}
                        onClick={() => {
                           if (!isQuarantined && !item.isIdentified && !isAnalyzing) onStartAnalysis(item.instanceId);
                           else if (item.isIdentified && !isEquipped) onEquipArtifact(item.instanceId);
                        }}
                        className={`
                  aspect-square border-2 relative group transition-all flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer active:scale-95
                  ${rarityColor}
                  ${isAnalyzing ? 'animate-pulse bg-cyan-900/20' : 'bg-zinc-950/50'}
                  ${item.isIdentified ? 'hover:bg-zinc-900' : 'opacity-80'}
                  ${isEquipped ? 'ring-2 ring-green-500' : ''}
                `}
                     >
                        <div className="text-2xl md:text-3xl mb-1 filter drop-shadow-[0_0_5px_currentColor]">
                           {item.isIdentified ? def.icon : '❓'}
                        </div>

                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                           {isEquipped && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full shadow-[0_0_5px_#0f0]" />}
                           {isAnalyzing && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-500 rounded-full animate-ping" />}
                        </div>

                        <div className="text-[7px] md:text-[9px] text-center font-bold leading-tight pixel-text w-full truncate">
                           {item.isIdentified ? t(def.name, lang).split(' ')[0] : '???'}
                        </div>


                        {/* DESKTOP TOOLTIP */}
                        <div className="hidden md:block absolute opacity-0 group-hover:opacity-100 transition-opacity top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-950 border border-zinc-500 p-3 z-50 pointer-events-none shadow-xl">
                           {item.isIdentified ? (
                              <>
                                 <p className={`text-[10px] font-bold mb-2 ${getArtifactColor(def.rarity).split(' ')[1]}`}>{def.rarity}</p>
                                 <p className="text-xs text-white mb-2 italic">"{t(def.loreDescription, lang)}"</p>
                                 <div className="border-t border-zinc-800 pt-2 text-[10px] text-green-400 font-mono">ЭФФЕКТ: {t(def.effectDescription, lang)}</div>
                              </>
                           ) : <p className="text-xs text-zinc-500 italic">"Требуется анализ."</p>}
                        </div>
                     </div>
                  );
               })}

               {Array.from({ length: Math.max(0, 12 - itemList.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square border border-zinc-900 bg-zinc-950/30 flex items-center justify-center opacity-30">
                     <div className="w-1 h-1 bg-zinc-800" />
                  </div>
               ))}
            </div>
         </div>

         {/* --- RIGHT/BOTTOM PANEL: LAB & ACTIVE --- */}
         <div className="h-[45%] md:h-full w-full md:w-72 flex flex-col bg-zinc-950/80 p-3 md:p-6 shrink-0 relative border-t md:border-t-0 md:border-l border-zinc-800 overflow-y-auto touch-pan-y">
            {isQuarantined && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-red-500 font-bold pixel-text mb-2 text-xs">ДОСТУП ЗАПРЕЩЕН</h3>
               </div>
            )}

            {/* ANALYZER */}
            <div className="mb-4 md:mb-8 relative">
               <h3 className="text-[10px] md:text-xs text-zinc-400 font-bold mb-2 flex items-center gap-2">
                  <span className="animate-pulse text-cyan-500">●</span> АНАЛИЗАТОР
               </h3>

               <div className="bg-black border border-zinc-700 p-2 md:p-4 flex flex-col items-center min-h-[100px] md:min-h-[140px] justify-center relative overflow-hidden">
                  {analyzingItem ? (
                     <>
                        <div className="text-2xl md:text-4xl animate-bounce mb-2">❓</div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                           <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${((analyzerState.maxTime - analyzerState.timeLeft) / analyzerState.maxTime) * 100}%` }} />
                        </div>
                        <div className="text-[9px] md:text-[10px] text-cyan-400 font-mono animate-pulse">ДЕКРИПТОВАНИЕ...</div>
                     </>
                  ) : (
                     <div className="text-zinc-600 text-[9px] md:text-[10px] font-mono text-center">НАЖМИТЕ НА НЕИЗВЕСТНЫЙ ОБЪЕКТ</div>
                  )}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[size:100%_4px]" />
               </div>
            </div>

            {/* ACTIVE SLOTS */}
            <div className="flex-1">
               <h3 className="text-[10px] md:text-xs text-zinc-400 font-bold mb-2">АКТИВНЫЕ МОДУЛИ</h3>
               <div className="space-y-2 md:space-y-3">
                  {[0, 1, 2].map(slotIdx => {
                     const itemInstanceId = equippedArtifacts[slotIdx];
                     const item = itemInstanceId ? items[itemInstanceId] : null;
                     const def = item ? getItemDef(item.defId) : null;

                     return (
                        <div key={slotIdx} className="h-12 md:h-16 border border-zinc-800 bg-zinc-900 flex items-center p-2 gap-2 relative group">
                           {item && def ? (
                              <>
                                 <div className="text-lg md:text-2xl">{def.icon}</div>
                                 <div className="flex-1 min-w-0">
                                    <div className={`text-[9px] md:text-[10px] font-bold truncate ${getArtifactColor(def.rarity).split(' ')[1]}`}>{t(def.name, lang)}</div>
                                    <div className="text-[8px] text-zinc-500 truncate">{t(def.effectDescription, lang)}</div>
                                 </div>

                                 <button onClick={() => onUnequipArtifact(item.instanceId)} className="text-zinc-500 hover:text-red-500 px-2 text-lg">×</button>
                              </>
                           ) : <div className="w-full text-center text-[8px] text-zinc-700 font-mono">ПУСТОЙ СЛОТ</div>}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* SCRAP */}
            <div className="mt-4 border-t border-zinc-800 pt-2">
               <h4 className="text-[8px] text-zinc-500 mb-1">УТИЛИЗАЦИЯ</h4>
               <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 touch-pan-x">
                  {itemList.filter(i => i.isIdentified && !i.isEquipped).map(item => {
                     const def = getItemDef(item.defId);
                     return (
                        <button key={item.instanceId} onClick={() => onScrapArtifact(item.instanceId)} className="min-w-[32px] h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center hover:border-red-500">
                           <span className="text-xs">{def?.icon}</span>
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ArtifactsView;
