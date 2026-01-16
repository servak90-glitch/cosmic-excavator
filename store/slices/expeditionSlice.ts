import { SliceCreator } from './types';
import { Expedition, ExpeditionDifficulty, ResourceType } from '../../types';
import { expeditionSystem } from '../../services/systems/ExpeditionSystem';

export interface ExpeditionActions {
    launchExpedition: (difficulty: ExpeditionDifficulty, droneCount: number, targetResource: ResourceType) => void;
    checkExpeditions: () => void;
    collectRewards: (id: string) => void;
    cancelExpedition: (id: string) => void;
    adminInstantComplete: () => void;
}

export const createExpeditionSlice: SliceCreator<ExpeditionActions> = (set, get) => ({
    launchExpedition: (difficulty, droneCount, targetResource) => {
        const state = get();

        // Validation handled in UI but safety check here
        // Check if we have enough idle drones? 
        // We only track "Active Drones" by type in activeDrones array.
        // But for expeditions we likely consume generic drones?
        // Wait, types.ts says `activeDrones: DroneType[]`.
        // This seems to track UNLOCKED drone types, not quantity.
        // But `droneLevels` tracks quantity/level?
        // Actually, `DroneSystem` implies `activeDrones` lists types that are ON.

        // Let's assume for now we don't have a specific "available drone count" resource.
        // Maybe we consume resources to launch? Or just assign them?
        // The prompt said "Send drones".
        // Let's assume we just assign them logically. 
        // Risk: losing drones means lowering level? Or just narrative loss?
        // In `ExpeditionSystem`, lostDrones is a number.
        // If we want real loss, we should reduce `droneLevels`?
        // `droneLevels` (Record<DroneType, number>) seems to be the UPGRADE level.
        // Maybe we need a new resource: `drones`? 
        // OR we treat "drones" here as generic "miners" separate from the Upgrade Drones (Collector, Cooler etc).
        // Let's go with Generic Drones for now to avoid breaking the upgrade system.
        // Or better: Each Expedition requires building drones using resources.
        // But "Launch" implies we have them.

        // Simplest approach for v1: Drones are just a number you input, representing resources committed.
        // No, that's weak.
        // Let's say we use "Nano Swarm" resource as "Drones".
        // 1 Drone = 10 Nano Swarm.
        // If they die, you lose the Nano Swarm (already spent).
        // If they return, you get... well you already spent them.
        // Actually, let's make it so you "buy" the expedition with Nano Swarm.
        // "Drone Count" is just how much swarm you send.

        const droneCost = droneCount * 10; // 10 Nano Swarm per drone
        if (state.resources.nanoSwarm < droneCost) return;

        const newExpedition = expeditionSystem.createExpedition(difficulty, droneCount, targetResource);

        set(s => ({
            activeExpeditions: [...s.activeExpeditions, newExpedition],
            resources: {
                ...s.resources,
                nanoSwarm: s.resources.nanoSwarm - droneCost
            },
            actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: `ЭКСПЕДИЦИЯ ОТПРАВЛЕНА: ${targetResource}`, color: 'text-cyan-400' }]
        }));
    },

    checkExpeditions: () => {
        const state = get();
        let hasChanges = false;

        const updatedExpeditions = state.activeExpeditions.map(ex => {
            const updated = expeditionSystem.checkStatus(ex);
            if (updated !== ex) hasChanges = true;
            return updated;
        });

        if (hasChanges) {
            set({ activeExpeditions: updatedExpeditions });
        }
    },

    collectRewards: (id) => {
        const state = get();
        const exp = state.activeExpeditions.find(e => e.id === id);
        if (!exp || exp.status === 'ACTIVE') return;

        // Apply rewards
        const updates: any = { ...state.resources };
        if (exp.rewards) {
            Object.entries(exp.rewards).forEach(([res, amount]) => {
                updates[res] = (updates[res] || 0) + (amount as number);
            });
        }

        // Return surviving drones (refund Nano Swarm)
        const survivors = exp.droneCount - (exp.lostDrones || 0);
        if (survivors > 0) {
            updates.nanoSwarm += survivors * 10;
        }

        set(s => ({
            resources: updates,
            activeExpeditions: s.activeExpeditions.filter(e => e.id !== id),
            actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ОТЧЕТ ЭКСПЕДИЦИИ ПОЛУЧЕН', color: 'text-green-400' }]
        }));
    },

    cancelExpedition: (id) => {
        // Only if active. Refund 50%
        const state = get();
        const exp = state.activeExpeditions.find(e => e.id === id);
        if (!exp || exp.status !== 'ACTIVE') return;

        const refund = Math.floor(exp.droneCount * 10 * 0.5);

        set(s => ({
            activeExpeditions: s.activeExpeditions.filter(e => e.id !== id),
            resources: { ...s.resources, nanoSwarm: s.resources.nanoSwarm + refund },
            actionLogQueue: [...s.actionLogQueue, { type: 'LOG', msg: 'ЭКСПЕДИЦИЯ ОТОЗВАНА', color: 'text-yellow-400' }]
        }));
    },

    adminInstantComplete: () => {
        const state = get();
        // Force fast forward all active expeditions
        const now = Date.now();

        const updatedExpeditions = state.activeExpeditions.map(ex => {
            if (ex.status !== 'ACTIVE') return ex;
            // Set start time to way back so it completes now
            // Or just manually resolving them?
            // Safer to just adjust start time effectively
            return { ...ex, startTime: now - ex.duration - 1000 };
        });

        set({ activeExpeditions: updatedExpeditions });
        // Trigger check immediately
        // We need to call the action from the store context, but we are inside the store creator.
        // `get()` returns GameStore which HAS checkExpeditions mixed in.
        // But TypeScript might not see it yet because it's being defined.
        // We can just call the local function logic or cast get().
        (get() as any).checkExpeditions();
    }
});
