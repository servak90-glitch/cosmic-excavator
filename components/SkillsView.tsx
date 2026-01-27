import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { SKILLS, getSkillCost } from '../services/skillRegistry';
import { t, TL } from '../services/localization';
import { SkillCategory, LocalizedString } from '../types';
import {
  Cpu,
  Activity,
  Eye,
  Clock,
  Zap,
  Lock,
  CheckCircle2,
  BrainCircuit,
  Layers,
  TrendingUp
} from 'lucide-react';

const CategoryIcons: Record<SkillCategory, React.ReactNode> = {
  'CORTEX': <Cpu className="w-4 h-4" />,
  'MOTOR': <Activity className="w-4 h-4" />,
  'VISUAL': <Eye className="w-4 h-4" />,
  'CHRONOS': <Clock className="w-4 h-4" />,
};

const SkillsView: React.FC = () => {
  const xp = useGameStore(s => s.xp);
  const skillLevels = useGameStore(s => s.skillLevels);
  const depth = useGameStore(s => s.depth);
  const level = useGameStore(s => s.level);
  const lang = useGameStore(s => s.settings.language);
  const onUpgradeSkill = useGameStore(s => s.upgradeSkill);

  useEffect(() => {
    audioEngine.playUIPanelOpen();
  }, []);

  const categories: { id: SkillCategory; label: LocalizedString; color: string; desc: LocalizedString; icon: React.ReactNode }[] = [
    { id: 'CORTEX', label: TL.ui.skillsCortex, color: 'text-amber-400', desc: TL.ui.descCortex, icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'MOTOR', label: TL.ui.skillsMotor, color: 'text-cyan-400', desc: TL.ui.descMotor, icon: <Activity className="w-4 h-4" /> },
    { id: 'VISUAL', label: TL.ui.skillsVisual, color: 'text-emerald-400', desc: TL.ui.descVisual, icon: <Layers className="w-4 h-4" /> },
    { id: 'CHRONOS', label: TL.ui.skillsChronos, color: 'text-purple-400', desc: TL.ui.descChronos, icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-void relative h-full overflow-hidden pointer-events-auto">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      {/* HEADER HUD */}
      <div className="relative z-10 glass-panel border-x-0 border-t-0 rounded-none pb-4 md:pb-6 mb-2 flex flex-col md:flex-row justify-between items-start md:items-end p-4 md:p-6 gap-3 md:gap-4 bg-black/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
            <h2 className="text-lg md:text-2xl font-black font-technical tracking-tighter text-white uppercase italic">{t(TL.ui.neuroCoreInterface, lang)}</h2>
          </div>
          <p className="text-[8px] md:text-[10px] text-white/30 font-technical uppercase tracking-[0.3em]">{t(TL.ui.syncProtocol, lang)}</p>
        </div>

        <div className="glass-panel py-2 px-4 md:py-3 md:px-6 border-cyan-500/20 bg-cyan-400/5 flex flex-col items-center md:items-end self-end md:self-auto">
          <span className="text-[8px] md:text-[9px] text-cyan-400/60 font-technical font-black uppercase tracking-widest mb-1">{t(TL.ui.neuralBuffer, lang)}</span>
          <div className="text-xl md:text-3xl font-black font-technical text-cyan-400 neon-text-cyan tabular-nums leading-none">
            {Math.floor(xp).toLocaleString()} <span className="text-xs opacity-50">{t(TL.ui.units, lang)}</span>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-1 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
          <div className="text-[10px] text-white font-technical font-black uppercase">{t(TL.ui.syncStatus, lang)}: <span className="text-cyan-400">{(level * 100).toFixed(0)}%</span></div>
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, level * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* SKILLS GRID - SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto relative z-10 px-4 md:px-6 pb-24 md:pb-32 pt-2 md:pt-4 scrollbar-hide space-y-8 md:space-y-12">
        {categories.map(cat => {
          const categorySkills = SKILLS.filter(s => s.category === cat.id);

          return (
            <div key={cat.id} className="relative group/cat">
              {/* Category Header (Bento Style) */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4 md:mb-6 sticky top-0 bg-void/90 backdrop-blur-3xl py-3 z-20 border-b border-white/5 mx-[-1rem] px-4 md:px-6">
                <div className={`p-2 glass-panel border-inherit bg-inherit flex items-center justify-center ${cat.color} opacity-80`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className={`text-sm font-black font-technical tracking-[0.2em] ${cat.color} uppercase`}>{t(cat.label, lang)}</h3>
                  <div className="text-[8px] font-technical text-white/30 uppercase tracking-[0.4em] mt-0.5">{t(cat.desc, lang)}</div>
                </div>
                <div className="hidden md:block h-px bg-gradient-to-r from-white/10 to-transparent flex-1 ml-4" />
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categorySkills.map(skill => {
                  const currentLevel = skillLevels[skill.id] || 0;
                  const cost = getSkillCost(skill, currentLevel);
                  const canAfford = xp >= cost;
                  const isMaxed = currentLevel >= skill.maxLevel;

                  // Check requirements
                  let locked = false;
                  let lockReason = "";

                  if (skill.requiredDepth && depth < skill.requiredDepth) {
                    locked = true;
                    lockReason = `${t(TL.ui.reqDepth, lang)}: ${skill.requiredDepth}${t(TL.ui.meter_label, lang)}`;
                  }
                  if (skill.requiredParent) {
                    const parentLevel = skillLevels[skill.requiredParent] || 0;
                    if (parentLevel < 1) {
                      locked = true;
                      const parentName = SKILLS.find(s => s.id === skill.requiredParent)?.name || "???";
                      lockReason = `${t(TL.ui.requirements, lang)}: ${t((parentName as any), lang).toUpperCase()}`;
                    }
                  }

                  return (
                    <div
                      key={skill.id}
                      className={`glass-panel p-3 md:p-4 flex flex-col justify-between min-h-[160px] md:min-h-[180px] transition-all duration-300 group/card relative
                          ${locked ? 'border-white/5 opacity-40 grayscale pointer-events-none' :
                          canAfford && !isMaxed ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20' :
                            'border-white/5 bg-void/40'}
                        `}
                    >
                      {/* Skill Info */}
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black font-technical text-white/20 uppercase tracking-widest mb-1">{t(TL.ui.moduleCode, lang)}: {skill.id.substring(0, 5)}</span>
                            <h4 className="text-xs font-black font-technical text-white uppercase tracking-tight leading-tight group-hover/card:text-cyan-400 transition-colors">
                              {t(skill.name, lang)}
                            </h4>
                          </div>
                          <div className={`text-[9px] font-black font-technical py-0.5 px-2 rounded-full border ${isMaxed ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-white/40 bg-black/40'}`}>
                            {isMaxed ? t(TL.ui.max, lang) : `LVL ${currentLevel}`}
                          </div>
                        </div>

                        <p className="text-[10px] text-white/40 font-technical leading-relaxed h-[36px] overflow-hidden line-clamp-3 italic">
                          {t(skill.description, lang)}
                        </p>
                      </div>

                      {/* Upgrade Section */}
                      <div className="mt-4 border-t border-white/5 pt-3">
                        <div className={`text-[10px] font-black font-technical mb-3 flex items-center justify-between ${cat.color}`}>
                          <span className="opacity-40 uppercase tracking-widest text-[8px]">{t(TL.ui.nextBonus, lang)}:</span>
                          <span className="font-bold">{skill.getBonusText(currentLevel + (isMaxed ? 0 : 1))}</span>
                        </div>

                        {locked ? (
                          <div className="w-full py-2 bg-rose-500/10 text-center text-[9px] text-rose-500 font-black border border-rose-500/30 uppercase tracking-[0.2em] rounded-sm">
                            {lockReason}
                          </div>
                        ) : isMaxed ? (
                          <div className="w-full py-2 bg-emerald-500/10 text-center text-[9px] text-emerald-400 font-black border border-emerald-500/30 uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            {t(TL.ui.optimizationComplete, lang)}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onUpgradeSkill(skill.id);
                              audioEngine.playLevelUp();
                            }}
                            disabled={!canAfford}
                            className={`w-full py-2.5 rounded text-[10px] font-black font-technical transition-all flex justify-between items-center px-4 group/btn
                                ${canAfford
                                ? 'bg-white/5 border border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                                : 'bg-black/40 border border-white/5 text-white/10 cursor-not-allowed'}
                                 `}
                          >
                            <span className="uppercase tracking-widest">{t(TL.ui.upgradeLink, lang)}</span>
                            <div className="flex items-center gap-2">
                              <Zap className={`w-3 h-3 ${canAfford ? 'text-cyan-400 group-hover/btn:text-black' : ''}`} />
                              <span className="font-bold tabular-nums">{cost.toLocaleString()} <span className="text-[8px] opacity-60">{t(TL.ui.units, lang)}</span></span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Connection Line Visual */}
                      {skill.requiredParent && !locked && (
                        <div className="absolute top-1/2 -left-4 w-4 h-px bg-white/10 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsView;