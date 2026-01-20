import React, { useState } from 'react';
import { Biome, Resources, Quest } from '../types';
import { audioEngine } from '../services/audioEngine';
import QuestPanel from './QuestPanel';
import TradeTab from './city/TradeTab';
import JewelerTab from './city/JewelerTab';
import ServiceTab from './city/ServiceTab';
import BarTab from './city/BarTab';
import ExpeditionTab from './city/ExpeditionTab';
import LicenseTab from './city/LicenseTab';

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

const TABS: { id: CityTab; label: string; icon: string }[] = [
  { id: 'TRADE', label: 'РЫНОК', icon: '⚖️' },
  { id: 'CONTRACTS', label: 'КОНТРАКТЫ', icon: '📜' },
  { id: 'JEWELER', label: 'ЮВЕЛИР', icon: '💎' },
  { id: 'SERVICE', label: 'СЕРВИС', icon: '🔧' },
  { id: 'EXPEDITIONS', label: 'ЭКСПЕДИЦИИ', icon: '🚀' },
  { id: 'LICENSES', label: 'ЛИЦЕНЗИИ', icon: '🎫' },
  { id: 'BAR', label: 'БАР', icon: '🍺' },
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
  const [activeTab, setActiveTab] = useState<CityTab>('EXPEDITIONS');

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
        return <ExpeditionTab />;
      case 'LICENSES':
        return <LicenseTab resources={resources} depth={depth} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#080808] relative overflow-hidden h-full pointer-events-auto">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-[100px] text-zinc-800 font-black rotate-90">HUB-01</div>
        <div className="absolute bottom-10 right-10 text-[100px] text-zinc-800 font-black">ZONE-A</div>
      </div>

      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-10 relative">
        <h2 className="text-xl md:text-3xl pixel-text text-white mb-1 md:mb-2 truncate">
          {biome.hub || "НЕИЗВЕСТНОЕ ПОСЕЛЕНИЕ"}
        </h2>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span>СИСТЕМЫ: НОРМА</span>
          <span className="ml-auto md:ml-4 text-zinc-600">ГЛУБИНА: {biome.depth}м</span>
        </div>
      </div>

      {/* CITY NAVIGATION */}
      <div className="flex border-b border-zinc-800 z-10 relative bg-zinc-900 overflow-x-auto scrollbar-hide touch-pan-x">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              audioEngine.playUITabSwitch();
            }}
            className={`flex-1 min-w-[80px] md:min-w-0 py-3 md:py-4 px-2 md:px-4 text-[10px] md:text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap active:bg-zinc-800
              ${activeTab === tab.id ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <span className="text-base md:text-base">{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden text-[9px]">{tab.label.substring(0, 4)}</span>
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-4 md:p-6 relative z-10 overflow-y-auto touch-pan-y overscroll-contain">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default CityView;
