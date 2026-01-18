
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { EVENTS } from '../services/eventRegistry';
import { ARTIFACTS } from '../services/artifactRegistry';
import { REGIONS } from '../constants/regions';
import type { BaseType } from '../types';
import { t } from '../services/localization';

const DevTools: React.FC = () => {
  const store = useGameStore();
  const lang = store.settings.language;
  const [activeTab, setActiveTab] = useState<'RES' | 'STATE' | 'NAV' | 'EVENT' | 'GLOBAL'>('RES');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [selectedArtifactId, setSelectedArtifactId] = useState(ARTIFACTS[0]?.id || '');
  const [customDepth, setCustomDepth] = useState('');

  // --- MOUSE HANDLERS (Desktop) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- TOUCH HANDLERS (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    // e.preventDefault() here might block scrolling inside the terminal if touched elsewhere,
    // but on the header it is fine to prevent default browser drag behavior.
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault(); // Stop viewport scrolling while dragging terminal
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Mobile Listeners (non-passive to allow preventDefault)
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Теперь безопасный ранний выход, если меню закрыто
  if (!store.isDebugUIOpen || !store.debugUnlocked) return null;

  return (
    <div
      className="fixed z-[9999] w-80 md:w-96 bg-black border-2 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.3)] font-mono text-xs flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      {/* HEADER */}
      <div
        className="bg-green-900/80 p-2 cursor-move flex justify-between items-center select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span className="text-green-300 font-bold">OMEGA TERMINAL [ROOT]</span>
        <button onClick={() => store.toggleDebugUI(false)} className="text-green-300 hover:text-white px-2">[X]</button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-green-800">
        {(['RES', 'STATE', 'NAV', 'EVENT', 'GLOBAL'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center hover:bg-green-900/50 ${activeTab === tab ? 'bg-green-800 text-white' : 'text-green-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="p-4 bg-black/90 text-green-400 h-64 md:h-80 overflow-y-auto space-y-4 scrollbar-hide touch-pan-y">

        {activeTab === 'RES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => store.adminAddResources(1000000, 0)} className="border border-green-700 hover:bg-green-900 p-2 text-[9px]">+1M COM</button>
              <button onClick={() => store.adminAddResources(0, 1000)} className="border border-green-700 hover:bg-green-900 p-2 text-[9px]">+1K RARE</button>
              <button onClick={() => store.adminAddXP(1000000)} className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 p-2 text-[9px]">+1M XP</button>
              <button onClick={() => store.adminAddLevel(1)} className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 p-2 text-[9px]">+1 LVL</button>
              <button onClick={store.adminIdentifyAll} className="border border-purple-700 text-purple-400 hover:bg-purple-900/30 p-2 text-[9px]">ID ALL ARTIF.</button>
              <button onClick={store.adminResetResources} className="border border-red-700 text-red-500 hover:bg-red-900/20 p-2 text-[9px]">RESET WALLET</button>
            </div>

            {/* ARTIFACT SPAWNER */}
            <div className="border-t border-green-800 pt-2">
              <div className="text-green-500 mb-1">ADD ARTIFACT</div>
              <div className="flex gap-2">
                <select
                  value={selectedArtifactId}
                  onChange={(e) => setSelectedArtifactId(e.target.value)}
                  className="flex-1 bg-black border border-green-700 text-green-400 text-[10px]"
                >
                  {ARTIFACTS.map(a => (
                    <option key={a.id} value={a.id}>{t(a.name, lang)} ({a.rarity})</option>
                  ))}
                </select>
                <button
                  onClick={() => store.adminAddArtifact(selectedArtifactId)}
                  className="border border-green-700 hover:bg-green-900 px-2"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'STATE' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center border border-green-800 p-2">
              <span>GOD MODE</span>
              <button onClick={() => store.adminSetGodMode(!store.isGodMode)} className={`${store.isGodMode ? 'text-green-300 font-bold' : 'text-zinc-500'}`}>
                [{store.isGodMode ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="flex justify-between items-center border border-green-800 p-2">
              <span>INF. COOLANT</span>
              <button onClick={() => store.adminSetInfiniteCoolant(!store.isInfiniteCoolant)} className={`${store.isInfiniteCoolant ? 'text-green-300 font-bold' : 'text-zinc-500'}`}>
                [{store.isInfiniteCoolant ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="flex justify-between items-center border border-green-800 p-2">
              <span>OVERDRIVE (x100)</span>
              <button onClick={() => store.adminSetOverdrive(!store.isOverdrive)} className={`${store.isOverdrive ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                [{store.isOverdrive ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="flex justify-between items-center border border-zinc-800 p-2">
              <span>INFINITE FUEL</span>
              <button onClick={() => store.adminSetInfiniteFuel(!store.isInfiniteFuel)} className={`${store.isInfiniteFuel ? 'text-cyan-300 font-bold' : 'text-zinc-500'}`}>
                [{store.isInfiniteFuel ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="flex justify-between items-center border border-zinc-800 p-2">
              <span>INFINITE ENERGY</span>
              <button onClick={() => store.adminSetInfiniteEnergy(!store.isInfiniteEnergy)} className={`${store.isInfiniteEnergy ? 'text-yellow-300 font-bold' : 'text-zinc-500'}`}>
                [{store.isInfiniteEnergy ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="flex justify-between items-center border border-green-800 p-2">
              <span>ZERO WEIGHT</span>
              <button onClick={() => store.adminSetZeroWeight(!store.isZeroWeight)} className={`${store.isZeroWeight ? 'text-amber-300 font-bold' : 'text-zinc-500'}`}>
                [{store.isZeroWeight ? 'ON' : 'OFF'}]
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={store.adminUnlockAll} className="border border-green-700 hover:bg-green-900 p-1 text-[9px]">UNLOCK ALL</button>
              <button onClick={store.adminMaxSkills} className="border border-green-700 hover:bg-green-900 p-1 text-[9px]">MAX SKILLS</button>
              <button onClick={store.adminMaxDrones} className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 p-1 text-[9px]">MAX DRONES</button>
              <button onClick={store.adminMaxTech} className="border border-green-700 hover:bg-green-900 p-1 text-[9px]">MAX TECH</button>
              <button onClick={store.adminMaxFactionReputation} className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 p-1 text-[9px]">MAX REP</button>
              <button onClick={store.adminInstantHeal} className="border border-red-700 text-red-400 hover:bg-red-900/20 p-1 text-[9px]">INSTANT HEAL</button>
              <button onClick={store.adminCompleteActiveQuests} className="border border-amber-700 text-amber-400 hover:bg-amber-900/20 p-1 text-[9px]">FINISH QUESTS</button>
              <button onClick={() => store.adminInstantComplete()} className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 p-1 text-[9px] col-span-2 text-center">FINISH EXPEDITIONS</button>

              {/* HORIZONTAL PROGRESSION DEBUG */}
              <div className="col-span-2 border-t border-zinc-800 pt-2 mt-2">
                <p className="text-[10px] text-zinc-500 mb-1">FACTIONS & EVENTS</p>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => (store as any).addReputation?.('CORPORATE', 100)} className="border border-zinc-600 text-[10px] hover:bg-zinc-800">+CORP</button>
                  <button onClick={() => (store as any).addReputation?.('SCIENCE', 100)} className="border border-cyan-600 text-[10px] hover:bg-cyan-900">+SCI</button>
                  <button onClick={() => (store as any).addReputation?.('REBELS', 100)} className="border border-amber-600 text-[10px] hover:bg-amber-900">+REB</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => store.adminClearEvents()} className="border border-blue-900 text-blue-400 hover:bg-blue-950 p-1 text-[8px]">CLEAR EVT</button>
                  <button onClick={() => store.adminClearEffects()} className="border border-blue-900 text-blue-400 hover:bg-blue-950 p-1 text-[8px]">CLEAR EFF</button>
                </div>
                <button onClick={() => store.adminTriggerEvent('SIDE_TUNNEL_DISCOVERY')} className="w-full mt-2 border border-purple-600 text-purple-400 hover:bg-purple-900/30 p-2 text-xs">TRIGGER SIDE TUNNEL</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'NAV' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => store.adminSetDepth(store.depth + 10000)} className="flex-1 border border-green-700 hover:bg-green-900 p-2">+10k M</button>
              <button onClick={() => store.adminSetDepth(store.depth + 50000)} className="flex-1 border border-green-700 hover:bg-green-900 p-2">+50k M</button>
            </div>
            <button onClick={store.adminSkipBiome} className="w-full border border-green-700 hover:bg-green-900 p-2">SKIP BIOME</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={store.adminSpawnBoss} className="border border-red-700 text-red-400 hover:bg-red-900/20 p-2">SPAWN BOSS</button>
              <button onClick={store.adminKillBoss} className="border border-zinc-700 text-zinc-400 hover:bg-zinc-900/20 p-2">KILL BOSS</button>
            </div>

            {/* MANUAL DEPTH JUMP */}
            <div className="border-t border-green-800 pt-2 mt-2">
              <div className="text-green-500 mb-1">JUMP TO DEPTH</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customDepth}
                  onChange={(e) => setCustomDepth(e.target.value)}
                  placeholder="METERS"
                  className="flex-1 bg-black border border-green-700 text-green-400 text-[10px] px-2 outline-none focus:border-green-500"
                />
                <button
                  onClick={() => {
                    const d = parseInt(customDepth);
                    if (!isNaN(d)) store.adminSetDepth(d);
                  }}
                  className="border border-green-700 hover:bg-green-900 px-2 font-bold"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'EVENT' && (
          <div className="space-y-1">
            {EVENTS.map(ev => (
              <button
                key={ev.id}
                onClick={() => store.adminTriggerEvent(ev.id)}
                className="w-full text-left p-1 border-b border-green-900 hover:text-white truncate text-[10px]"
              >
                {ev.id} - {t(ev.title, lang)}
              </button>
            ))}
            <button onClick={store.adminClearEvents} className="w-full text-center p-2 border border-red-900 text-red-500 mt-2">CLEAR QUEUE</button>
          </div>
        )}

        {activeTab === 'GLOBAL' && (
          <div className="space-y-3">
            {/* ТОПЛИВО */}
            <div>
              <div className="text-green-500 text-[10px] mb-1">⛽ FUEL</div>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => { store.resources.coal = (store.resources.coal || 0) + 1000; }} className="border border-amber-700 hover:bg-amber-900/20 p-1 text-[9px]">+1K COAL</button>
                <button onClick={() => { store.resources.oil = (store.resources.oil || 0) + 500; }} className="border border-orange-700 hover:bg-orange-900/20 p-1 text-[9px]">+500 OIL</button>
                <button onClick={() => { store.resources.gas = (store.resources.gas || 0) + 250; }} className="border border-cyan-700 hover:bg-cyan-900/20 p-1 text-[9px]">+250 GAS</button>
              </div>
            </div>

            {/* ТЕЛЕПОРТАЦИЯ */}
            <div className="border-t border-green-800 pt-2 
">
              <div className="text-green-500 text-[10px] mb-1">🌍 TELEPORT</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.values(REGIONS).map(region => (
                  <button
                    key={region.id}
                    onClick={() => (store as any).adminTeleportRegion?.(region.id)}
                    className={`border border-green-700 hover:bg-green-900/30 p-1 text-[8px] truncate ${store.currentRegion === region.id ? 'bg-green-800 text-white' : ''
                      }`}
                  >
                    {t(region.name, lang).substring(0, 12)}
                  </button>
                ))}
              </div>
            </div>

            {/* ЛИЦЕНЗИИ */}
            <div className="border-t border-green-800 pt-2">
              <div className="text-green-500 text-[10px] mb-1">🎫 LICENSES</div>
              <div className="grid grid-cols-2 gap-1 mb-1">
                <button onClick={() => store.adminUnlockLicenses()} className="border border-green-600 hover:bg-green-900/30 p-1 text-[9px] col-span-2">UNLOCK ALL LICENSES</button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => (store as any).adminUnlockLicense?.('green')} className="border border-green-600 hover:bg-green-900/30 p-1 text-[9px]">GREEN</button>
                <button onClick={() => (store as any).adminUnlockLicense?.('yellow')} className="border border-yellow-600 hover:bg-yellow-900/30 p-1 text-[9px]">YELLOW</button>
                <button onClick={() => (store as any).adminUnlockLicense?.('red')} className="border border-red-600 hover:bg-red-900/30 p-1 text-[9px]">RED</button>
              </div>
              <button
                onClick={() => (store as any).adminUnlockAllPermits?.()}
                className="w-full mt-1 border border-cyan-600 hover:bg-cyan-900/20 p-1 text-[9px]"
              >
                UNLOCK ALL PERMITS
              </button>
            </div>

            {/* БАЗЫ */}
            <div className="border-t border-green-800 pt-2">
              <div className="text-green-500 text-[10px] mb-1">🏗️ CREATE BASE / RAID</div>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => (store as any).adminCreateBase?.('outpost')} className="border border-zinc-600 hover:bg-zinc-800 p-1 text-[8px]">OUTPOST</button>
                <button onClick={() => (store as any).adminCreateBase?.('camp')} className="border border-blue-600 hover:bg-blue-900/30 p-1 text-[8px]">CAMP</button>
                <button onClick={() => (store as any).adminCreateBase?.('station')} className="border border-purple-600 hover:bg-purple-900/30 p-1 text-[8px]">STATION</button>
              </div>
              <button onClick={store.adminInstantConstruction} className="w-full mt-1 border border-zinc-600 hover:bg-zinc-800 p-1 text-[9px]">INSTANT CONSTRUCTION</button>
              <button onClick={store.adminForceRaid} className="w-full mt-1 border border-red-700 text-red-400 hover:bg-red-900/30 p-1 text-[9px]">FORCE BASE RAID</button>
            </div>

            {/* КАРАВАНЫ */}
            <div className="border-t border-green-800 pt-2">
              <div className="text-green-500 text-[10px] mb-1">🚛 CARAVAN</div>
              <button
                onClick={() => (store as any).adminUnlockCaravan?.('1star')}
                className="w-full border border-amber-600 hover:bg-amber-900/20 p-1 text-[9px]"
              >
                UNLOCK 1★ SHUTTLE
              </button>
            </div>

            {/* CARGO WEIGHT */}
            <div className="border-t border-green-800 pt-2">
              <div className="text-green-500 text-[10px] mb-1">📦 CARGO</div>
              <div className="grid grid-cols-2 gap-1">
                <button onClick={() => (store as any).adminSetCargo?.(0)} className="border border-green-600 hover:bg-green-900/30 p-1 text-[9px]">EMPTY</button>
                <button onClick={() => (store as any).adminSetCargo?.(5000)} className="border border-yellow-600 hover:bg-yellow-900/30 p-1 text-[9px]">5000KG</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DevTools;
