/**
 * AbilitySystem.ts
 * 
 * Manages player active skills during combat.
 * Handles cooldowns, activation conditions, and effect application.
 */

import { AbilityType, AbilityDef, ActiveAbilityState } from '../../types';

export const ABILITIES: Record<AbilityType, AbilityDef> = {
    'EMP_BURST': {
        id: 'EMP_BURST',
        name: 'EMP Burst',
        description: 'Снимает щиты и оглушает дронов. Генерирует 20 Нагрева.',
        cooldownMs: 15000,
        energyCost: 0,
        heatCost: 20,
        icon: '⚡',
        unlockLevel: 5
    },
    'THERMAL_STRIKE': {
        id: 'THERMAL_STRIKE',
        name: 'Thermal Strike',
        description: 'Мгновенный урон на основе текущего Нагрева. Охлаждает систему на 25%.',
        cooldownMs: 8000,
        energyCost: 0,
        heatCost: -25, // Special case: Reduces heat
        icon: '🔥',
        unlockLevel: 2
    },
    'BARRIER': {
        id: 'BARRIER',
        name: 'Void Barrier',
        description: 'Временная неуязвимость на 4 секунды.',
        cooldownMs: 20000,
        energyCost: 0,
        heatCost: 10,
        icon: '🛡️',
        unlockLevel: 10
    },
    'OVERLOAD': {
        id: 'OVERLOAD',
        name: 'System Overload',
        description: '+200% Урона на 6 секунд. +10 Нагрева в секунду.',
        cooldownMs: 30000,
        energyCost: 0,
        heatCost: 5, // Initial cost, dot handled elsewhere
        icon: '☢️',
        unlockLevel: 15
    }
};

export class AbilitySystem {
    private states: Record<AbilityType, ActiveAbilityState>;
    private activationQueue: AbilityType[] = [];

    constructor() {
        this.states = {
            'EMP_BURST': this.createState('EMP_BURST'),
            'THERMAL_STRIKE': this.createState('THERMAL_STRIKE'),
            'BARRIER': this.createState('BARRIER'),
            'OVERLOAD': this.createState('OVERLOAD')
        };
    }

    private createState(id: AbilityType): ActiveAbilityState {
        return {
            id,
            cooldownRemaining: 0,
            isActive: false,
            durationRemaining: 0
        };
    }

    public getAbilityDef(id: AbilityType): AbilityDef {
        return ABILITIES[id];
    }

    public getState(id: AbilityType): ActiveAbilityState {
        return this.states[id];
    }

    public getAllStates(): ActiveAbilityState[] {
        return Object.values(this.states);
    }

    public canActivate(id: AbilityType, currentHeat: number): boolean {
        const state = this.states[id];
        const def = ABILITIES[id];

        if (state.cooldownRemaining > 0) return false;
        if (state.isActive) return false; // Already active

        // Heat checks
        if (def.heatCost > 0 && currentHeat + def.heatCost >= 100) return false;

        return true;
    }

    public activate(id: AbilityType): void {
        const state = this.states[id];
        const def = ABILITIES[id];

        state.cooldownRemaining = def.cooldownMs;

        // Set duration if applicable
        if (id === 'BARRIER') {
            state.isActive = true;
            state.durationRemaining = 4000;
        } else if (id === 'OVERLOAD') {
            state.isActive = true;
            state.durationRemaining = 6000;
        }

        this.activationQueue.push(id);
    }

    public update(dt: number): void {
        for (const key in this.states) {
            const state = this.states[key as AbilityType];

            // Cooldowns
            if (state.cooldownRemaining > 0) {
                state.cooldownRemaining = Math.max(0, state.cooldownRemaining - dt * 1000); // converting sec to ms? Wait dt is usually in seconds
                // Typically games use sec or ms consistently. Let's assume dt is SECONDS.
            }

            // Active durations
            if (state.isActive) {
                state.durationRemaining -= dt * 1000;
                if (state.durationRemaining <= 0) {
                    state.isActive = false;
                    state.durationRemaining = 0;
                }
            }
        }
    }

    // Helper to reduce all cooldowns (e.g. from pickup)
    public reduceCooldowns(amountMs: number): void {
        for (const key in this.states) {
            const state = this.states[key as AbilityType];
            if (state.cooldownRemaining > 0) {
                state.cooldownRemaining = Math.max(0, state.cooldownRemaining - amountMs);
            }
        }
    }

    public consumeActivationEvents(): AbilityType[] {
        const events = [...this.activationQueue];
        this.activationQueue = [];
        return events;
    }
}

export const abilitySystem = new AbilitySystem();
