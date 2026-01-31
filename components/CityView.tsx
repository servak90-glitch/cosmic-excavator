import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { View, Biome, Resources, Quest } from '../types';
import { BIOMES } from '../constants';
import { audioEngine } from '../services/audioEngine';
import QuestPanel from './QuestPanel';
import TradeTab from './city/TradeTab';
import JewelerTab from './city/JewelerTab';
import ServiceTab from './city/ServiceTab';
import BarTab from './city/BarTab';
import ExpeditionTab from './city/ExpeditionTab';
import LicenseTab from './city/LicenseTab';

import {
  ShoppingCart,
  ScrollText,
  Gem,
  Wrench,
  Rocket,
  Ticket,
  GlassWater
} from 'lucide-react';

interface CityViewProps {
  biome: Biome;
  resources: Resources;
  heat: number;
  integrity: number;
  maxIntegrity: number;
  xp: number;
  depth: number;
  onTrade: (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => void;
  onHeal: () => void;
  onRepair: () => void;
}

type CityTab = 'TRADE' | 'CONTRACTS' | 'SERVICE' | 'BAR' | 'JEWELER' | 'EXPEDITIONS' | 'LICENSES';

const TABS: { id: CityTab; label: string; icon: React.ReactNode }[] = [
  { id: 'TRADE', label: 'РЫНОК', icon: <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'CONTRACTS', label: 'КОНТРАКТЫ', icon: <ScrollText className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'JEWELER', label: 'ЮВЕЛИР', icon: <Gem className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'SERVICE', label: 'СЕРВИС', icon: <Wrench className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'EXPEDITIONS', label: 'ЭКСПЕДИЦИИ', icon: <Rocket className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'LICENSES', label: 'ЛИЦЕНЗИИ', icon: <Ticket className="w-5 h-5 md:w-6 md:h-6" /> },
  { id: 'BAR', label: 'БАР', icon: <GlassWater className="w-5 h-5 md:w-6 md:h-6" /> },
];

const CityView: React.FC<CityViewProps> = ({
  biome,
  resources,
  heat,
  integrity,
  maxIntegrity,
  xp,
  depth,
  onTrade,
  onHeal,
  onRepair
}) => {
  const { playerBases } = useGameStore();
  const biomeIndex = BIOMES.findIndex(b =>
    (typeof b.name === 'object' && b.name.EN === (typeof biome.name === 'object' ? biome.name.EN : biome.name)) ||
    b.name === biome.name
  );
  const regionIds = ['rust_valley', 'crystal_wastes', 'iron_gates', 'magma_core', 'void_chasm'];
  const currentBase = playerBases.find(b => b.regionId === regionIds[biomeIndex % regionIds.length]);
  const [activeTab, setActiveTab] = useState<CityTab>(currentBase?.droneStation ? 'EXPEDITIONS' : 'TRADE');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'TRADE':
        return <TradeTab resources={resources} depth={depth} onTrade={onTrade} />;
      case 'CONTRACTS':
        return <QuestPanel />;
      case 'JEWELER':
        return <JewelerTab resources={resources} depth={depth} onTrade={onTrade} />;
      case 'SERVICE':
        return (
          <ServiceTab
            resources={resources}
            depth={depth}
            heat={heat}
            integrity={integrity}
            maxIntegrity={maxIntegrity}
            onHeal={onHeal}
            onRepair={onRepair}
          />
        );
      case 'BAR':
        return <BarTab resources={resources} depth={depth} />;

      case 'EXPEDITIONS':
        return <ExpeditionTab base={currentBase} />;
      case 'LICENSES':
        return <LicenseTab resources={resources} depth={depth} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden h-full pointer-events-auto">
      {/* PREMIUM BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

        {/* Decorative Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(20, 20, 20, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 20, 20, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* HEADER: SCI-FI GLASSMOPHISM 2.0 */}
      <div className="p-4 md:p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl z-10 relative flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-1 w-12 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            <span className="text-[10px] font-black text-cyan-500/80 tracking-[0.3em] uppercase">Sector Access Granted</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none truncate">
            {biome.hub || "HUB ENTITY"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Station Telemetry</div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                <span className="text-[10px] text-zinc-300 font-bold">ONLINE</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="text-[10px] text-zinc-400 font-mono">
                LOC: <span className="text-white">{biome.depth < 1000 ? 'RUST_VALLEY' : 'DEEP_VOID'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => useGameStore.getState().setView(View.DRILL)}
            className="p-2 md:p-3 bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-lg active:scale-95"
            aria-label="Exit Hub"
          >
            <span className="text-xl md:text-2xl font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* CITY NAVIGATION: DYNAMIC TABS */}
      <div className="flex z-10 relative bg-black/60 backdrop-blur-md border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              audioEngine.playUITabSwitch();
            }}
            className={`group relative flex-1 min-w-[90px] md:min-w-[120px] py-4 px-4 transition-all duration-300
              ${activeTab === tab.id ? 'bg-cyan-500/5' : 'hover:bg-white/5'}`}
          >
            <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`}>
              <div className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{tab.icon}</div>
              <span className={`text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-colors
                ${activeTab === tab.id ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-200'}`}>
                {tab.label}
              </span>
            </div>

            {/* Active Indicator Line */}
            <div className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 shadow-[0_-5px_15px_#06b6d4] transition-all duration-500
              ${activeTab === tab.id ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
          </button>
        ))}
      </div>

      {/* CONTENT AREA: WRAPPED IN GLASS CARDS */}
      <div className="flex-1 p-4 md:p-8 relative z-10 overflow-y-auto no-scrollbar touch-pan-y overscroll-contain bg-gradient-to-b from-black/20 to-transparent">
        <div className="max-w-6xl mx-auto min-h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default CityView;
