import React, { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useDrillState, useCombatState, useCombatActions, useDrillActions } from '../store/selectors';
import { formatCompactNumber } from '../services/gameMath';
import { calculateShieldRechargeCost } from '../services/gameMath';
import { abilitySystem } from '../services/systems/AbilitySystem';
import { checkWeakness } from '../services/systems/CombatSystem';
import { AbilityType } from '../types';
import BossOverlay from './BossOverlay';

interface CombatOverlayProps {
    onDrillStart: (e: any) => void;
    onDrillEnd: (e: any) => void;
    onRechargeShield: () => void;
}

const CombatOverlay: React.FC<CombatOverlayProps> = ({ onDrillStart, onDrillEnd, onRechargeShield }) => {
    // Selectors
    const { currentBoss } = useCombatState();
    const { depth, heat, shieldCharge, resources } = useDrillState();
    const { isDrilling, isOverheated } = useDrillActions();

    // We need active abilities from state
    const activeAbilities = useGameStore(state => state.activeAbilities || []);

    // Derived
    const rechargeCost = calculateShieldRechargeCost(depth);
    const canAffordRecharge = resources[rechargeCost.resource] >= rechargeCost.cost;

    if (!currentBoss) return null;

    const hpPercent = (currentBoss.currentHp / currentBoss.maxHp) * 100;

    // Ability Handlers
    const activateAbility = useGameStore(state => state.activateAbility);

    const handleAbilityClick = (id: AbilityType) => {
        activateAbility(id);
    };

    const abilitiesStart = ['EMP_BURST', 'THERMAL_STRIKE', 'BARRIER', 'OVERLOAD'] as AbilityType[];

    return (
        <>
            {/* BOSS HEALTH BAR */}
            <div className="absolute top-4 left-0 right-0 z-30 flex flex-col items-center px-4 pointer-events-auto">
                <h2 className={`text-lg md:text-2xl font-black pixel-text mb-2 drop-shadow-[0_0_10px_red] text-center ${currentBoss.isMob ? 'text-orange-500' : 'text-red-600'}`}>
                    {currentBoss.name}
                    {currentBoss.phases && currentBoss.phases[0] > 1 && <span className="text-sm ml-2 animate-pulse text-yellow-400">PHASE {currentBoss.phases[0]}</span>}
                </h2>
                <div className="w-full max-w-lg h-4 md:h-8 bg-black border-2 border-red-800 relative overflow-hidden">
                    {currentBoss.isInvulnerable && <div className="absolute inset-0 bg-cyan-500/50 z-10 flex items-center justify-center animate-pulse"><span className="text-[10px] font-black text-white tracking-widest bg-black/50 px-2">ЩИТ</span></div>}
                    <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${hpPercent}%` }} />
                </div>
            </div>

            {/* BOSS WEAK POINTS OVERLAY */}
            <BossOverlay onWeakPointClick={useGameStore(s => s.damageWeakPoint)} />

            {/* ABILITIES BAR */}
            <div className="absolute top-24 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
                {abilitiesStart.map((id, idx) => {
                    const def = abilitySystem.getAbilityDef(id);
                    const state = activeAbilities.find(a => a.id === id);
                    const cooldown = state ? state.cooldownRemaining : 0;
                    const isActive = state ? state.isActive : false;
                    const onCooldown = cooldown > 0;

                    if (!def) return null; // Safety

                    const isEffective = currentBoss && checkWeakness(currentBoss.type, id);

                    return (
                        <button
                            key={id}
                            onClick={() => handleAbilityClick(id)}
                            disabled={onCooldown || isActive}
                            className={`relative w-12 h-12 md:w-14 md:h-14 border-2 flex items-center justify-center transition-all active:scale-95
                                ${isActive ? 'border-yellow-400 bg-yellow-900/50 animate-pulse' :
                                    onCooldown ? 'border-zinc-700 bg-zinc-900 opacity-50 cursor-not-allowed' :
                                        isEffective ? 'border-green-400 bg-green-900/40 shadow-[0_0_15px_rgba(74,222,128,0.5)] animate-pulse' :
                                            'border-cyan-600 bg-black hover:bg-cyan-900/50 text-white'}
                            `}
                        >
                            <span className={`text-xl md:text-2xl ${isEffective ? 'scale-110' : ''}`}>{def.icon}</span>

                            {/* Hotkey Number */}
                            <span className="absolute top-0 left-1 text-[8px] font-mono text-zinc-500">{idx + 1}</span>

                            {/* Effectiveness Indicator */}
                            {isEffective && (
                                <div className="absolute -top-2 -right-2 text-[8px] md:text-[10px] bg-green-500 text-black px-1 font-bold rounded z-10">
                                    CRIT
                                </div>
                            )}

                            {/* Cooldown Overlay */}
                            {onCooldown && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-lg md:text-xl text-white drop-shadow-md">
                                    {Math.ceil(cooldown / 1000)}
                                </div>
                            )}

                            {/* Heat Cost */}
                            <div className="absolute -bottom-2 right-0 bg-black text-[10px] sm:text-xs font-bold text-red-400 px-1 border border-red-900/50 shadow-sm z-20">
                                {def.heatCost > 0 ? `+${def.heatCost}H` : ''}
                                {def.heatCost < 0 ? `${def.heatCost}H` : ''}
                            </div>
                        </button>
                    );
                })}
            </div>


            {/* BOTTOM CONTROLS (Attack & Shield) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-end gap-4">

                {/* EMERGENCY RECHARGE BUTTON */}
                <button
                    onClick={onRechargeShield}
                    disabled={!canAffordRecharge}
                    className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center bg-black/80 mb-2 transition-all active:scale-95
                ${canAffordRecharge ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-900/50' : 'border-zinc-800 text-zinc-600 opacity-50'}
            `}
                >
                    <span className="text-xl">⚡</span>
                    <span className="text-[8px] font-bold">{rechargeCost.cost > 0 ? formatCompactNumber(rechargeCost.cost) : 'FREE'}</span>
                </button>

                <div className="relative">
                    <button
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center justify-center pixel-text text-sm md:text-lg font-black tracking-widest transition-transform active:scale-95 touch-none select-none
                    ${heat > 90 ? 'bg-red-900 border-red-500 text-red-100 animate-pulse' : 'bg-red-950 border-red-800 text-red-500 hover:border-red-400 hover:text-white'}
                    ${isDrilling ? 'scale-95 border-red-400 text-white bg-red-900 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : ''}
                    ${currentBoss.isInvulnerable ? 'opacity-50 cursor-not-allowed border-zinc-600' : ''}
                `}
                        onPointerDown={onDrillStart}
                        onPointerUp={onDrillEnd}
                        onPointerLeave={onDrillEnd}
                    >
                        {currentBoss.isInvulnerable ? 'ЗАЩИТА' : 'АТАКА'}

                        {/* SHIELD CAPACITOR INDICATOR (RING) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-90 scale-110" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#222" strokeWidth="3" />
                            <circle
                                cx="50" cy="50" r="48" fill="none"
                                stroke={shieldCharge < 25 ? '#ef4444' : isDrilling ? '#22c55e' : '#3b82f6'}
                                strokeWidth="4"
                                strokeDasharray="301.59"
                                strokeDashoffset={301.59 * (1 - shieldCharge / 100)}
                                className="transition-all duration-100"
                            />
                        </svg>
                    </button>
                    <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-cyan-400">
                        {Math.floor(shieldCharge)}%
                    </div>
                </div>
            </div>
        </>
    );
};

export default CombatOverlay;
