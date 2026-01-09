
import React, { useState, useEffect } from 'react';
import { Biome, Resources, ResourceType, Quest, QuestIssuer } from '../types';

interface CityViewProps {
  biome: Biome;
  resources: Resources;
  heat: number;
  xp: number;
  depth: number;
  activeQuests: Quest[];
  onTrade: (cost: Partial<Resources>, reward: Partial<Resources> & { XP?: number }) => void;
  onHeal: () => void;
  onCompleteQuest: (questId: string) => void;
  onRefreshQuests: () => void;
}

const REVERSE_TRADES: { source: ResourceType, target: ResourceType, label: string }[] = [
  { source: 'stone', target: 'clay', label: 'ДРОБИЛКА ПОРОДЫ' },
  { source: 'copper', target: 'stone', label: 'УТИЛИЗАЦИЯ ПРОВОДКИ' },
  { source: 'iron', target: 'copper', label: 'ПЕРЕПЛАВКА ЛОМА' },
  { source: 'silver', target: 'iron', label: 'ДЕМОНТАЖ ЭЛЕКТРОНИКИ' },
  { source: 'gold', target: 'silver', label: 'РАЗМЫВ РУДЫ' },
  { source: 'titanium', target: 'gold', label: 'РАСЩЕПЛЕНИЕ СПЛАВОВ' },
  { source: 'uranium', target: 'titanium', label: 'ДЕАКТИВАЦИЯ ЯДРА' }
];

const GEM_TRADES = [
  { gem: 'rubies', label: 'РУБИН', xp: 500, moneyRes: 'gold', moneyAmount: 100 },
  { gem: 'emeralds', label: 'ИЗУМРУД', xp: 1500, moneyRes: 'titanium', moneyAmount: 50 },
  { gem: 'diamonds', label: 'АЛМАЗ', xp: 5000, moneyRes: 'ancientTech', moneyAmount: 10 }
];

const CityView: React.FC<CityViewProps> = ({ 
  biome, 
  resources, 
  heat, 
  xp,
  depth,
  activeQuests,
  onTrade, 
  onHeal,
  onCompleteQuest,
  onRefreshQuests
}) => {
  const [activeTab, setActiveTab] = useState<'TRADE' | 'CONTRACTS' | 'SERVICE' | 'BAR' | 'JEWELER'>('TRADE');
  const [barMessage, setBarMessage] = useState<string>("Чего тебе, бурильщик? Не видишь, стаканы протираю.");
  
  const [displayedMessage, setDisplayedMessage] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedMessage("");
    const interval = setInterval(() => {
      setDisplayedMessage(barMessage.slice(0, i + 1));
      i++;
      if (i >= barMessage.length) clearInterval(interval);
    }, 15); 
    return () => clearInterval(interval);
  }, [barMessage]);

  const tradeCost: Partial<Resources> = { clay: 500 };
  const tradeReward: Partial<Resources> = { stone: 50 };
  const canAffordTrade = resources.clay >= 500;

  const handleBarTalk = () => {
    const generalRumors = [
      "Говорят, на глубине 2км кто-то слышал пение... Но это бред, там же вакуум.",
      "Твоя буровая головка - старье. Но работает, и ладно.",
      "Не доверяй дронам Корпорации. Они программируются на самосохранение, а не на твою защиту.",
      "Странный гул из шахты сегодня, не находишь?",
      "Если увидишь синее свечение — беги. Или бури быстрее.",
      "Раньше здесь был океан. Теперь только пыль и долги.",
      "Мой дед бурил до Магмы. Вернулся седым и немым.",
      "Вчера один новичок нашел золотую жилу. И сразу пропил её здесь.",
      "Ты веришь в 'Ядро'? Некоторые говорят, это не просто камень.",
    ];

    const heatRumors = [
      "Эй, от тебя пахнет паленой проводкой. Остынь.",
      "Твой движок ревет как раненый зверь. Тебе бы в сервис.",
      "Если взорвешься здесь — платить за уборку будет твоя семья.",
      "Закажи ледяной коктейль, ты выглядишь перегретым.",
    ];

    const richRumors = [
      "Ого, да ты при деньгах! Не хочешь угостить заведение?",
      "Вижу, трюмы полны. Осторожнее в переулках.",
      "С такими запасами глины можно построить новый город.",
    ];

    const deepRumors = [
      "Ты добрался до Кристальных Гротов? Говорят, они поют, когда ломаются.",
      "Там внизу, в пустоте... время течет иначе?",
      "Многие уходят на глубину 10км. Возвращаются единицы.",
      "Оператор Узла-2 спрашивал про тебя. Это плохой знак."
    ];

    let pool = [...generalRumors];

    if (heat > 60) pool = [...pool, ...heatRumors, ...heatRumors];
    if (resources.clay > 2000 || resources.gold > 100) pool = [...pool, ...richRumors];
    if (biome.depth > 5000) pool = [...pool, ...deepRumors];

    const randomMsg = pool[Math.floor(Math.random() * pool.length)];
    if (randomMsg === barMessage && pool.length > 1) {
      handleBarTalk(); 
    } else {
      setBarMessage(randomMsg);
    }
  };

  const getResourceName = (key: string) => {
    const names: Record<string, string> = {
      clay: 'ГЛИНА', stone: 'КАМЕНЬ', copper: 'МЕДЬ', iron: 'ЖЕЛЕЗО',
      silver: 'СЕРЕБРО', gold: 'ЗОЛОТО', titanium: 'ТИТАН', uranium: 'УРАН', nanoSwarm: 'НАНО', ancientTech: 'TECH',
      XP: 'XP', rubies: 'РУБИН', emeralds: 'ИЗУМР', diamonds: 'АЛМАЗ'
    };
    return names[key] || key;
  };

  const getFactionStyle = (issuer: QuestIssuer) => {
     switch (issuer) {
        case 'CORP': return { border: 'border-zinc-500', bg: 'bg-zinc-900', text: 'text-zinc-200', badge: 'bg-zinc-700', icon: '🏢' };
        case 'SCIENCE': return { border: 'border-cyan-500', bg: 'bg-[#001015]', text: 'text-cyan-200', badge: 'bg-cyan-900', icon: '🔬' };
        case 'REBELS': return { border: 'border-amber-700', bg: 'bg-[#1a0f00]', text: 'text-amber-500', badge: 'bg-amber-900', icon: '✊' };
        default: return { border: 'border-white', bg: 'bg-black', text: 'text-white', badge: 'bg-zinc-500', icon: '?' };
     }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#080808] relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-10 left-10 text-[100px] text-zinc-800 font-black rotate-90">HUB-01</div>
         <div className="absolute bottom-10 right-10 text-[100px] text-zinc-800 font-black">ZONE-A</div>
      </div>

      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-10 relative">
        <h2 className="text-xl md:text-3xl pixel-text text-white mb-1 md:mb-2 truncate">{biome.hub || "НЕИЗВЕСТНОЕ ПОСЕЛЕНИЕ"}</h2>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-zinc-400">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"/>
           <span>СИСТЕМЫ: НОРМА</span>
           <span className="ml-auto md:ml-4 text-zinc-600">ГЛУБИНА: {biome.depth}м</span>
        </div>
      </div>

      {/* CITY NAVIGATION */}
      <div className="flex border-b border-zinc-800 z-10 relative bg-zinc-900 overflow-x-auto scrollbar-hide">
        {[
          { id: 'TRADE', label: 'РЫНОК', icon: '⚖️' },
          { id: 'CONTRACTS', label: 'КОНТРАКТЫ', icon: '📜' },
          { id: 'JEWELER', label: 'ЮВЕЛИР', icon: '💎' },
          { id: 'SERVICE', label: 'СЕРВИС', icon: '🔧' },
          { id: 'BAR', label: 'БАР', icon: '🍺' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[80px] md:min-w-0 py-3 md:py-4 px-2 md:px-4 text-[10px] md:text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap active:bg-zinc-800
              ${activeTab === tab.id ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-white'}`}
          >
            <span className="text-base md:text-base">{tab.icon}</span> 
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden text-[9px]">{tab.label.substring(0,4)}</span>
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-4 md:p-6 relative z-10 overflow-y-auto">
        
        {activeTab === 'TRADE' && (
          <div className="max-w-md mx-auto space-y-4 md:space-y-8">
            {/* STANDARD TRADE */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-2 md:mb-4 pixel-text">СКУПЩИК УТИЛЯ</h3>
              <p className="text-[10px] md:text-xs text-zinc-500 font-mono mb-4 md:mb-6 leading-tight">
                "Глины у нас завались, но если притащишь хорошую партию, дам немного твердой породы."
              </p>
              
              <div className="flex items-center justify-between bg-black p-3 md:p-4 border border-zinc-800 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-amber-600">500</div>
                  <div className="text-[9px] md:text-[10px] text-zinc-500">ГЛИНА</div>
                </div>
                <div className="text-zinc-600">➔</div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-white">50</div>
                  <div className="text-[9px] md:text-[10px] text-zinc-500">КАМЕНЬ</div>
                </div>
              </div>

              <button 
                disabled={!canAffordTrade}
                onClick={() => onTrade(tradeCost, tradeReward)}
                className={`w-full py-3 md:py-4 font-black pixel-text text-xs md:text-sm transition-all active:scale-95
                  ${canAffordTrade 
                    ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-[0_4px_0_rgb(120,53,15)] active:shadow-none active:translate-y-1' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
              >
                {canAffordTrade ? 'ОБМЕНЯТЬ' : 'НЕДОСТАТОЧНО РЕСУРСОВ'}
              </button>
            </div>

            {/* INDUSTRIAL CRUSHER */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#333_5px,#333_10px)] opacity-50" />
               <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-2 pixel-text">ПРОМЫШЛЕННАЯ ДРОБИЛКА</h3>
               <p className="text-[10px] md:text-xs text-zinc-500 font-mono mb-4 md:mb-6">
                 "Загружай редкую руду, получишь гору строительного мусора. Курс 1 к 5."
               </p>

               <div className="space-y-2 md:space-y-3">
                 {REVERSE_TRADES.map((trade, idx) => {
                    const canSee = resources[trade.source] > 0 || resources[trade.target] > 100;
                    if (!canSee) return null;
                    const costVal = 10;
                    const rewardVal = 50;
                    const canAfford = resources[trade.source] >= costVal;

                    return (
                      <div key={idx} className="bg-black border border-zinc-800 p-2 md:p-3 flex items-center justify-between">
                         <div className="flex-1">
                            <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold mb-1">{trade.label}</div>
                            <div className="flex items-center gap-1 md:gap-2 font-mono text-[10px] md:text-xs">
                               <span className="text-amber-600">{costVal} {getResourceName(trade.source)}</span>
                               <span className="text-zinc-600">➔</span>
                               <span className="text-green-500">{rewardVal} {getResourceName(trade.target)}</span>
                            </div>
                         </div>
                         <button
                           disabled={!canAfford}
                           onClick={() => onTrade({ [trade.source]: costVal }, { [trade.target]: rewardVal })}
                           className={`px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] font-bold border transition-colors active:bg-zinc-700
                             ${canAfford 
                               ? 'border-zinc-500 hover:bg-zinc-800 text-white' 
                               : 'border-zinc-800 text-zinc-700 cursor-not-allowed'}`}
                         >
                           ЗАПУСК
                         </button>
                      </div>
                    );
                 })}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'JEWELER' && (
           <div className="max-w-md mx-auto space-y-4">
              <div className="text-center mb-4 md:mb-6">
                 <h3 className="text-lg md:text-xl pixel-text text-purple-400 mb-1 md:mb-2">ЛАВКА ОГРАНЩИКА</h3>
                 <p className="text-[10px] md:text-xs text-zinc-500 font-mono">"Чистота камня превыше всего."</p>
              </div>

              {GEM_TRADES.map((trade, idx) => {
                 const resKey = trade.gem as keyof Resources;
                 const rewardKey = trade.moneyRes as keyof Resources;
                 const canAfford = resources[resKey] >= 1;

                 return (
                    <div key={idx} className="bg-zinc-900 border border-purple-900 p-3 md:p-4 flex flex-col gap-2 md:gap-3 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500/10 rotate-45 transform translate-x-4 -translate-y-4" />
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 md:gap-3">
                             <div className="w-6 h-6 md:w-8 md:h-8 bg-black border border-zinc-700 flex items-center justify-center text-sm md:text-lg">
                                {trade.gem === 'rubies' ? '🔴' : trade.gem === 'emeralds' ? '🟢' : '⚪'}
                             </div>
                             <div>
                                <div className="font-bold text-xs md:text-sm text-white">{trade.label}</div>
                                <div className="text-[9px] md:text-[10px] text-zinc-500 font-mono">У ВАС: {Math.floor(resources[resKey])}</div>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-2 mt-1 md:mt-2">
                          <button
                             onClick={() => onTrade({ [resKey]: 1 }, { XP: trade.xp })}
                             disabled={!canAfford}
                             className={`p-2 border text-[9px] md:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all active:scale-95
                                ${canAfford ? 'border-cyan-700 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300' : 'border-zinc-800 bg-black text-zinc-600'}
                             `}
                          >
                             <span>ОБМЕН НА ОПЫТ</span>
                             <span className="text-xs md:text-lg">+{trade.xp} XP</span>
                          </button>
                          <button
                             onClick={() => onTrade({ [resKey]: 1 }, { [rewardKey]: trade.moneyAmount })}
                             disabled={!canAfford}
                             className={`p-2 border text-[9px] md:text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all active:scale-95
                                ${canAfford ? 'border-amber-700 bg-amber-900/20 hover:bg-amber-900/40 text-amber-300' : 'border-zinc-800 bg-black text-zinc-600'}
                             `}
                          >
                             <span>ПРОДАТЬ</span>
                             <span className="text-xs md:text-lg">+{trade.moneyAmount} {getResourceName(trade.moneyRes)}</span>
                          </button>
                       </div>
                    </div>
                 );
              })}
           </div>
        )}

        {activeTab === 'CONTRACTS' && (
           <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                 <div>
                   <h3 className="text-lg md:text-xl pixel-text text-white">ДОСКА ОБЪЯВЛЕНИЙ</h3>
                   <p className="text-[10px] md:text-xs text-zinc-500 font-mono">ЗАПРОСЫ ФРАКЦИЙ</p>
                 </div>
                 <button 
                   onClick={onRefreshQuests}
                   className="text-[9px] md:text-[10px] border border-zinc-700 bg-zinc-900 px-2 md:px-3 py-1 hover:bg-zinc-800 transition-colors active:scale-95"
                 >
                   ОБНОВИТЬ (100 ГЛИНЫ)
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                 {activeQuests.map(quest => {
                    const style = getFactionStyle(quest.issuer);
                    let canComplete = true;
                    quest.requirements.forEach(req => {
                       if (req.type === 'RESOURCE' || req.type === 'TECH') {
                          if (resources[req.target as keyof Resources] < req.amount) canComplete = false;
                       } else if (req.type === 'XP') {
                          if (xp < req.amount) canComplete = false;
                       } else if (req.type === 'DEPTH') {
                          if (depth < req.amount) canComplete = false;
                       }
                    });

                    return (
                       <div key={quest.id} className={`border p-3 md:p-4 flex flex-col justify-between relative group ${style.border} ${style.bg}`}>
                          <div className="absolute right-2 top-2 text-3xl md:text-4xl opacity-10 pointer-events-none grayscale">{style.icon}</div>
                          <div>
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded font-bold ${style.badge} text-white`}>
                                   {quest.issuer}
                                </span>
                             </div>
                             <h4 className={`text-xs md:text-sm font-bold mb-1 ${style.text}`}>{quest.title}</h4>
                             <p className="text-[9px] md:text-[10px] text-zinc-400 mb-3 font-mono italic leading-tight">"{quest.description}"</p>
                             
                             <div className="bg-black/30 p-1.5 md:p-2 mb-2 border-l-2 border-zinc-700">
                                <div className="text-[7px] md:text-[8px] text-zinc-500 mb-1 uppercase">ТРЕБУЕТСЯ:</div>
                                {quest.requirements.map((req, i) => (
                                   <div key={i} className="flex justify-between text-[10px] md:text-xs font-mono">
                                      <span>{getResourceName(req.target)}</span>
                                      <span className={
                                         (req.type === 'RESOURCE' && resources[req.target as keyof Resources] >= req.amount) ||
                                         (req.type === 'XP' && xp >= req.amount) ||
                                         (req.type === 'DEPTH' && depth >= req.amount)
                                            ? 'text-green-500' : 'text-red-500'
                                      }>
                                         {req.amount.toLocaleString()}
                                      </span>
                                   </div>
                                ))}
                             </div>

                             <div className="bg-black/30 p-1.5 md:p-2 border-l-2 border-green-700/50">
                                <div className="text-[7px] md:text-[8px] text-zinc-500 mb-1 uppercase">НАГРАДА:</div>
                                {quest.rewards.map((rew, i) => (
                                   <div key={i} className="flex justify-between text-[10px] md:text-xs font-mono text-green-400">
                                      <span>{getResourceName(rew.target)}</span>
                                      <span>+{rew.amount.toLocaleString()}</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <button
                             onClick={() => onCompleteQuest(quest.id)}
                             disabled={!canComplete}
                             className={`mt-3 md:mt-4 w-full py-2 text-[10px] md:text-xs font-bold pixel-text transition-all active:scale-95
                                ${canComplete 
                                   ? 'bg-white text-black hover:bg-green-400' 
                                   : 'bg-black text-zinc-600 border border-zinc-800 cursor-not-allowed'}
                             `}
                          >
                             {canComplete ? 'ВЫПОЛНИТЬ' : 'НЕДОСТУПНО'}
                          </button>
                       </div>
                    );
                 })}
              </div>
           </div>
        )}

        {activeTab === 'SERVICE' && (
          <div className="max-w-md mx-auto">
             <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
               <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-3 md:mb-4 pixel-text">ТЕХ. ОТСЕК</h3>
               <div className="mb-4 md:mb-6">
                 <div className="flex justify-between text-[10px] md:text-xs font-mono text-zinc-400 mb-1">
                   <span>ТЕКУЩИЙ НАГРЕВ БУРА</span>
                   <span>{heat.toFixed(1)}%</span>
                 </div>
                 <div className="w-full h-3 md:h-4 bg-black border border-zinc-700">
                   <div className={`h-full transition-all duration-300 ${heat > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${heat}%` }} />
                 </div>
               </div>
               <button onClick={onHeal} disabled={heat < 10} className="w-full border-2 border-cyan-500 text-cyan-500 py-2 md:py-3 font-bold hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs md:text-sm">ЭКСТРЕННЫЙ СБРОС ТЕПЛА</button>
             </div>
          </div>
        )}

        {activeTab === 'BAR' && (
          <div className="max-w-md mx-auto">
             <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6 relative">
               <div className="absolute -top-3 -left-3 bg-red-900 text-white text-[8px] md:text-[10px] px-2 py-1 rotate-[-5deg] font-bold border border-red-500">24/7</div>
               <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-4 md:mb-6 pixel-text text-center">БАР "РЖАВАЯ ГАЙКА"</h3>
               <div className="bg-black/50 p-3 md:p-4 border border-zinc-800 min-h-[80px] md:min-h-[100px] flex items-center justify-center text-center mb-4 md:mb-6 relative">
                 <p className="text-xs md:text-sm text-cyan-100 font-mono italic relative z-10">"{displayedMessage}"<span className="animate-pulse">_</span></p>
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />
               </div>
               <button onClick={handleBarTalk} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 md:py-3 font-bold pixel-text text-[10px] md:text-xs border border-zinc-600 active:bg-zinc-600 transition-colors active:scale-95">ПОГОВОРИТЬ С БАРМЕНОМ</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CityView;
