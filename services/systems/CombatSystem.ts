/**
 * CombatSystem — управление боссами и боем
 * 
 * Отвечает за:
 * - Атаки боссов
 * - Уворот (evasion)
 * - Блок щитом
 * - Спавн мини-игр
 * - Смерть боссов и награды
 */

import { GameState, VisualEvent, Stats, ResourceType, InventoryItem, Boss, CombatMinigame, BossType, AbilityType } from '../../types';
import { ARTIFACTS } from '../artifactRegistry';
import { generateBoss } from '../bossRegistry';
import { audioEngine } from '../audioEngine';
import { abilitySystem } from './AbilitySystem';
import { ResourceChanges } from './types';

export interface CombatUpdate {
    currentBoss: Boss | null;
    combatMinigame: CombatMinigame | null;
    bossAttackTick: number;
    lastBossDepth: number;
    integrity?: number;
    xp?: number;
    minigameCooldown?: number;
    // We handle strict state updates via the returned object properties in gameStore
}

export const damageBossWeakPoint = (boss: Boss, wpId: string, baseDamage: number): { boss: Boss, damageDealt: number, isDestroyed: boolean } => {
    const wpIndex = boss.weakPoints.findIndex(w => w.id === wpId);
    if (wpIndex === -1) return { boss, damageDealt: 0, isDestroyed: false };

    const wp = boss.weakPoints[wpIndex];
    if (!wp.isActive) return { boss, damageDealt: 0, isDestroyed: false };

    const dmg = baseDamage * 2; // Weak points take double click damage
    const newWpHp = Math.max(0, wp.currentHp - dmg);
    const isDestroyed = newWpHp <= 0;

    const newWp = { ...wp, currentHp: newWpHp, isActive: !isDestroyed };

    // Create new array
    const newWeakPoints = [...boss.weakPoints];
    newWeakPoints[wpIndex] = newWp;

    // Boss takes damage equal to weak point damage
    const newBossHp = Math.max(0, boss.currentHp - dmg);

    return {
        boss: { ...boss, weakPoints: newWeakPoints, currentHp: newBossHp },
        damageDealt: dmg,
        isDestroyed
    };
};

export interface CombatResult {
    update: CombatUpdate;
    resourceChanges: ResourceChanges;
    newInventoryItems: Record<string, InventoryItem>;
    events: VisualEvent[];
    questUpdates?: { target: string, type: 'DEFEAT_BOSS' }[];
}

export const checkWeakness = (bossType: BossType, abilityType: AbilityType): boolean => {
    if (bossType === BossType.CONSTRUCT && abilityType === 'EMP_BURST') return true;
    if (bossType === BossType.WORM && abilityType === 'THERMAL_STRIKE') return true;
    if (bossType === BossType.CORE && abilityType === 'OVERLOAD') return true;
    return false;
};

/**
 * Обработка боссов и боя
 */
export function processCombat(
    state: GameState,
    stats: Stats,
    isShielding: boolean,
    isOverheated: boolean
): CombatResult {
    const events: VisualEvent[] = [];
    const resourceChanges: ResourceChanges = {};
    const newInventoryItems: Record<string, InventoryItem> = {};

    let currentBoss = state.currentBoss;
    let combatMinigame = state.combatMinigame;
    let bossAttackTick = state.bossAttackTick;
    let lastBossDepth = state.lastBossDepth;
    let integrity = state.integrity;
    let xp = state.xp;
    let minigameCooldown = state.minigameCooldown || 0;

    // Check Ability Effects
    const abilityStates = abilitySystem.getAllStates();
    const isBarrierActive = abilityStates.find(s => s.id === 'BARRIER')?.isActive;
    const isOverloadActive = abilityStates.find(s => s.id === 'OVERLOAD')?.isActive;

    // Consume Instant Activations
    const activatedAbilities = abilitySystem.consumeActivationEvents();

    // Weakness Logic Helper


    if (currentBoss) {
        // Handle Instant Effects
        activatedAbilities.forEach(abilityId => {
            const isWeak = checkWeakness(currentBoss!.type, abilityId);
            audioEngine.playAbilityActivation(abilityId);

            // EMP LOGIC
            if (abilityId === 'EMP_BURST') {
                events.push({ type: 'VISUAL_EFFECT', option: 'EMP_SHOCK' });
                events.push({ type: 'SOUND', sfx: 'GLITCH' });

                if (isWeak) {
                    events.push({ type: 'LOG', msg: ">>> КРИТИЧЕСКИЙ СБОЙ СИСТЕМ БОССА!", color: "text-cyan-400 font-bold" });
                    // Force Hack Minigame if not active
                    if (!combatMinigame) {
                        combatMinigame = {
                            active: true,
                            type: currentBoss!.minigameWeakness || 'MASH',
                            difficulty: Math.floor(state.level / 5)
                        };
                        currentBoss!.isInvulnerable = true;
                    }
                } else {
                    events.push({ type: 'LOG', msg: "> EMP РАЗРЯД: Дроны оглушены", color: "text-blue-400" });
                    // Minor stun or damage could go here
                }
            }

            // THERMAL STRIKE LOGIC
            if (abilityId === 'THERMAL_STRIKE') {
                events.push({ type: 'VISUAL_EFFECT', option: 'FIRE_BURST' });
                // events.push({ type: 'SOUND', sfx: 'EXPLOSION' }); // Need to add EXPLOSION to types if not present

                const baseDmg = stats.totalDamage * 3; // [BALANCING] Reduced from 5x to 3x
                let finalDmg = baseDmg;

                if (isWeak) {
                    finalDmg *= 2; // [BALANCING] Reduced from 3x to 2x (Total 6x)
                    events.push({ type: 'LOG', msg: ">>> ТЕРМАЛЬНЫЙ УДАР: СВЕРХЭФФЕКТИВНО!", color: "text-orange-500 font-bold" });
                    events.push({ type: 'TEXT', x: window.innerWidth / 2, y: window.innerHeight / 2 - 50, text: 'SUPER EFFECTIVE!', style: 'CRIT' });
                } else {
                    events.push({ type: 'LOG', msg: "> ТЕРМАЛЬНЫЙ УДАР", color: "text-orange-300" });
                }

                currentBoss!.currentHp -= finalDmg;
                events.push({ type: 'BOSS_HIT' });
                audioEngine.playBossHit();
            }

            // OVERLOAD LOGIC (Instant effect part)
            if (abilityId === 'OVERLOAD') {
                if (isWeak && currentBoss!.isInvulnerable && !combatMinigame) {
                    currentBoss!.isInvulnerable = false;
                    events.push({ type: 'LOG', msg: ">>> ЩИТ ЯДРА ПРОБИТ!", color: "text-red-500 font-black" });
                    events.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' });
                }
            }
        });


        bossAttackTick++;

        // --- BOSS PHASES ---
        const hpPercent = currentBoss.currentHp / currentBoss.maxHp;
        const currentPhase = currentBoss.phases[0] || 1; // Default phase 1

        // Phase Transitions
        if (hpPercent < 0.2 && currentPhase < 3) {
            currentBoss.phases[0] = 3;
            events.push({ type: 'LOG', msg: ">>> БОСС В ПАНИКЕ! (ФАЗА 3)", color: "text-red-600 font-bold animate-shake" });
            currentBoss.attackSpeed = Math.floor(currentBoss.attackSpeed * 0.7); // 30% faster attacks
            currentBoss.damage = Math.floor(currentBoss.damage * 1.5); // 50% more damage
            // Visual Flare
            events.push({ type: 'VISUAL_EFFECT', option: 'GLITCH_RED' });
        } else if (hpPercent < 0.5 && currentPhase < 2) {
            currentBoss.phases[0] = 2;
            events.push({ type: 'LOG', msg: ">>> ЩИТЫ БОССА СНЯТЫ (ФАЗА 2)", color: "text-orange-400 font-bold" });
            currentBoss.attackSpeed = Math.floor(currentBoss.attackSpeed * 0.85); // 15% faster
        }

        // --- BOSS ATTACK ---
        if (bossAttackTick >= currentBoss.attackSpeed && !state.isBroken && !combatMinigame) {
            bossAttackTick = 0;

            // Check Barrier
            if (isBarrierActive) {
                events.push({
                    type: 'TEXT',
                    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 250,
                    text: 'IMMUNE',
                    style: 'BLOCKED' // Reusing BLOCKED or adding IMMUNE style
                });
            } else {
                // Evasion Logic
                let effectiveEvasion = stats.evasion;
                if (isOverheated) effectiveEvasion *= 0.5;

                if (Math.random() * 100 < effectiveEvasion) {
                    events.push({
                        type: 'TEXT',
                        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                        y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 250,
                        text: 'MISS',
                        style: 'EVADE'
                    });
                    audioEngine.playEvade();
                } else {
                    // Taking Damage
                    let dmg = Math.max(1, currentBoss.damage * (1 - stats.defense / 100));

                    if (isShielding) {
                        dmg = Math.ceil(dmg * 0.2); // 80% reduction
                        events.push({
                            type: 'TEXT',
                            x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
                            y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 250,
                            text: 'BLOCKED',
                            style: 'HEAL'
                        });
                        audioEngine.playBlock();
                    } else {
                        if (dmg > 5) {
                            events.push({ type: 'BOSS_HIT' });
                            audioEngine.playBossHit();
                        }
                    }

                    if (!state.isGodMode) {
                        integrity -= dmg;
                        audioEngine.playPlayerHit();
                    }
                }
            }
        }

        // Spawn Minigame (Hack)
        // [BALANCING] Cooldown Logic to prevent spam

        // Decrement (Assuming ~10 ticks/sec or 0.1s tick)
        minigameCooldown = minigameCooldown > 0 ? minigameCooldown - 0.1 : 0;

        if (combatMinigame === null && !currentBoss.isInvulnerable && minigameCooldown <= 0) {
            const chance = 0.005;

            if (Math.random() < chance) {
                combatMinigame = {
                    active: true,
                    type: currentBoss.minigameWeakness,
                    difficulty: Math.floor(state.level / 5) + currentPhase
                };
                currentBoss = { ...currentBoss, isInvulnerable: true };
                minigameCooldown = 45; // 45 Seconds cooldown

                events.push({ type: 'LOG', msg: ">>> ВЗЛОМ СИСТЕМ ЗАЩИТЫ...", color: "text-cyan-400 font-bold" });
                audioEngine.playGlitch();
            }
        }

        // Boss Death
        if (currentBoss.currentHp <= 0) {
            audioEngine.playCombatEnd(true);
            events.push({
                type: 'LOG',
                msg: `${currentBoss.isMob ? 'ВРАГ' : 'БОСС'} УНИЧТОЖЕН`,
                color: "text-green-500 font-black"
            });
            xp += currentBoss.reward.xp;

            for (const [k, v] of Object.entries(currentBoss.reward.resources)) {
                resourceChanges[k as ResourceType] = (resourceChanges[k as ResourceType] || 0) + v;
            }

            if (currentBoss.reward.guaranteedArtifactRarity) {
                const pool = ARTIFACTS.filter(a => a.rarity === currentBoss!.reward.guaranteedArtifactRarity);
                if (pool.length) {
                    const def = pool[Math.floor(Math.random() * pool.length)];
                    const newInstanceId = Math.random().toString(36).substr(2, 9);
                    const newItem: InventoryItem = {
                        instanceId: newInstanceId,
                        defId: def.id,
                        acquiredAt: Date.now(),
                        isIdentified: false,
                        isEquipped: false
                    };
                    newInventoryItems[newInstanceId] = newItem;
                    events.push({
                        type: 'LOG',
                        msg: `>> ОБНАРУЖЕН АРТЕФАКТ: ???`,
                        color: "text-purple-400 font-bold animate-pulse"
                    });
                }
            }

            const questUpdates: { target: string, type: 'DEFEAT_BOSS' }[] = [
                { target: currentBoss.id, type: 'DEFEAT_BOSS' },
                { target: currentBoss.type, type: 'DEFEAT_BOSS' }
            ];

            lastBossDepth = currentBoss.isMob ? lastBossDepth : Math.floor(state.depth);
            currentBoss = null;
            combatMinigame = null;

            return {
                update: {
                    currentBoss,
                    combatMinigame,
                    bossAttackTick,
                    lastBossDepth,
                    integrity: integrity !== state.integrity ? integrity : undefined,
                    xp: xp !== state.xp ? xp : undefined,
                    minigameCooldown
                },
                resourceChanges,
                newInventoryItems,
                events,
                questUpdates
            };
        }
    } else if (state.depth > 200 && (state.depth - lastBossDepth) >= 500 && Math.random() < 0.005) {
        currentBoss = generateBoss(state.depth, "Unknown");
        audioEngine.playCombatStart();
        // Initialize phases
        currentBoss.phases = [1];

        events.push({
            type: 'LOG',
            msg: `!!! ВНИМАНИЕ: ${currentBoss.description} !!!`,
            color: "text-red-500 font-bold"
        });
    }

    return {
        update: {
            currentBoss,
            combatMinigame,
            bossAttackTick,
            lastBossDepth,
            integrity: integrity !== state.integrity ? integrity : undefined,
            xp: xp !== state.xp ? xp : undefined,
            minigameCooldown
        },
        resourceChanges,
        newInventoryItems,
        events
    };
}
