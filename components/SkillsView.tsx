import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { audioEngine } from '../services/audioEngine';
import { SkillCategory } from '../types';
import { SKILLS, getSkillCost } from '../services/skillRegistry';
import { t } from '../services/localization';


// [DEV_CONTEXT: REFACTOR] Components now use internal hooks for reactivity
// Props are removed to prevent stale closures when parent re-renders sluggishly
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


  const categories: { id: SkillCategory; label: string; color: string; desc: string }[] = [
    { id: 'CORTEX', label: 'ФРОНТАЛЬНАЯ КОРА', color: 'text-amber-500', desc: 'УПРАВЛЕНИЕ / КЛИК / ТЕПЛО' },
    { id: 'MOTOR', label: 'ТЕМЕННАЯ ДОЛЯ', color: 'text-cyan-500', desc: 'АВТОМАТИКА / ДВИГАТЕЛЬ' },
    { id: 'VISUAL', label: 'ЗАТЫЛОЧНАЯ ДОЛЯ', color: 'text-emerald-500', desc: 'ВОСПРИЯТИЕ / РЕСУРСЫ' },
    { id: 'CHRONOS', label: 'ВИСОЧНАЯ ДОЛЯ', color: 'text-purple-500', desc: 'ВРЕМЯ / МЕТА-ПРОГРЕСС' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#050505] relative h-full overflow-hidden pointer-events-auto">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 border-b border-zinc-800 pb-4 mb-4 flex justify-between items-end p-4">
        <div>
          <h2 className="text-2xl md:text-3xl pixel-text text-white mb-1">НЕЙРО-ИМПЛАНТЫ</h2>
          <p className="text-[10px] text-zinc-500 font-mono">СВОБОДНАЯ ПАМЯТЬ (XP):</p>
          <div className="text-2xl font-mono text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            {Math.floor(xp).toLocaleString()} UNITS
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] text-zinc-600 font-mono">СИНХРОНИЗАЦИЯ: {(level * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-zinc-600 font-mono">МОЗГОВАЯ АКТИВНОСТЬ: СТАБИЛЬНА</div>
        </div>
      </div>

      {/* SKILLS GRID - SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto space-y-8 relative z-10 px-4 pb-20 touch-pan-y overscroll-contain">
        {categories.map(cat => {
          const categorySkills = SKILLS.filter(s => s.category === cat.id);

          return (
            <div key={cat.id} className="relative">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#050505]/90 backdrop-blur-sm py-2 z-20">
                <div className={`w-3 h-3 rotate-45 border ${cat.color} bg-current box-border`} />
                <h3 className={`text-sm md:text-base font-bold pixel-text ${cat.color}`}>{cat.label}</h3>
                <div className="h-px bg-zinc-800 flex-1" />
                <span className="text-[9px] text-zinc-600 font-mono uppercase">{cat.desc}</span>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2 border-l border-dashed border-zinc-800 pl-4 py-2">
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
                    lockReason = `ТРЕБУЕТСЯ ГЛУБИНА ${skill.requiredDepth}м`;
                  }
                  if (skill.requiredParent) {
                    const parentLevel = skillLevels[skill.requiredParent] || 0;
                    if (parentLevel < 1) {
                      locked = true;
                      const parentName = SKILLS.find(s => s.id === skill.requiredParent)?.name || "???";
                      lockReason = `ТРЕБУЕТСЯ: ${parentName}`;
                    }
                  }

                  return (
                    <div
                      key={skill.id}
                      className={`bg-zinc-900/50 border p-3 flex flex-col justify-between transition-all group relative
                          ${locked ? 'border-zinc-800 opacity-50' : canAfford ? 'border-zinc-600 hover:border-zinc-400 hover:bg-zinc-900' : 'border-zinc-800'}
                        `}
                    >
                      {/* Connector Line Logic (Visual Only) */}
                      {skill.requiredParent && !locked && (
                        <div className="absolute -left-4 top-1/2 w-4 h-px bg-zinc-700" />
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-bold text-zinc-200 mb-1 flex items-center gap-2">
                            {t(skill.name, lang)}
                            <span className="text-[9px] bg-black px-1.5 py-0.5 rounded text-zinc-500 font-mono">LVL {currentLevel}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 leading-tight h-8">{t(skill.description, lang)}</div>

                        </div>
                      </div>

                      <div className="mt-2">
                        <div className={`text-[10px] font-mono mb-2 ${cat.color} brightness-75`}>
                          ЭФФЕКТ: {skill.getBonusText(currentLevel + (isMaxed ? 0 : 1))}
                        </div>

                        {locked ? (
                          <div className="w-full py-2 bg-black text-center text-[9px] text-red-500 font-bold border border-red-900/30">
                            [БЛОК: {lockReason}]
                          </div>
                        ) : isMaxed ? (
                          <div className="w-full py-2 bg-zinc-800 text-center text-[10px] text-zinc-500 font-bold">
                            МАКСИМУМ
                          </div>
                        ) : (
                          <button
                            onClick={() => onUpgradeSkill(skill.id)}
                            disabled={!canAfford}
                            className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider transition-colors flex justify-between px-4
                                    ${canAfford
                                ? 'bg-zinc-800 hover:bg-white hover:text-black text-white'
                                : 'bg-black text-zinc-600 cursor-not-allowed'}
                                 `}
                          >
                            <span>УЛУЧШИТЬ</span>
                            <span>{cost.toLocaleString()} XP</span>
                          </button>
                        )}
                      </div>
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