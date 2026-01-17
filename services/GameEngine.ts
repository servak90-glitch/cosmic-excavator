/**
 * GameEngine — основной игровой цикл
 * 
 * Рефакторировано в версии 3.0:
 * - Логика разбита на подсистемы в services/systems/
 * - tick() теперь оркестрирует подсистемы
 */

import { GameState, VisualEvent, Resources } from '../types';
import { calculateStats, recalculateCargoWeight } from './gameMath';
import { narrativeManager } from './narrativeManager';

import { audioEngine } from './audioEngine';
import {
    processEffects,
    processAnalyzer,
    processEvents,
    processHeat,
    processShield,
    processDrilling,
    processCombat,
    processEntities,
    processHazards,
    applyResourceChanges,
    ResourceChanges
} from './systems';
import { processDrones, processRegeneration } from './systems/DroneSystem';
import { tunnelAtmosphere } from './systems/TunnelAtmosphere';
import { abilitySystem } from './systems/AbilitySystem';
import { expeditionSystem } from './systems/ExpeditionSystem';

export class GameEngine {
    tick(state: GameState, dt: number): { partialState: Partial<GameState>, events: VisualEvent[] } {
        const visualEvents: VisualEvent[] = [];

        // === КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ: СМЕРТЬ ===
        if (state.integrity <= 0 && !state.isGodMode) {
            const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);
            const reducedResources = Object.keys(state.resources).reduce((acc, key) => {
                acc[key as keyof Resources] = Math.floor(state.resources[key as keyof Resources] * 0.7);
                return acc;
            }, {} as Resources);

            visualEvents.push({ type: 'LOG', msg: "!!! КРИТИЧЕСКОЕ ПОВРЕЖДЕНИЕ КОРПУСА !!!", color: "text-red-600 font-black bg-red-950/50" });
            visualEvents.push({ type: 'LOG', msg: ">> АВАРИЙНЫЙ СБРОС...", color: "text-red-400" });

            return {
                partialState: {
                    integrity: stats.integrity,
                    heat: 0,
                    depth: Math.max(0, state.depth - 50),
                    resources: reducedResources,
                    isDrilling: false,
                    currentBoss: null,
                    combatMinigame: null,
                    shieldCharge: 0,
                },
                events: visualEvents
            };
        }

        // === ВЫЧИСЛЕНИЕ СТАТОВ ===
        const stats = calculateStats(state.drill, state.skillLevels, state.equippedArtifacts, state.inventory, state.depth);
        if (state.isGodMode) {
            // В режиме бога — полное HP
            state = { ...state, integrity: stats.integrity };
        }

        // === СБОР ИЗМЕНЕНИЙ ОТ ПОДСИСТЕМ ===
        const resourceChanges: ResourceChanges = {};
        const inventoryUpdates: Record<string, any> = {};

        // 1. Эффекты (баффы/дебаффы)
        const effectsResult = processEffects(state);
        visualEvents.push(...effectsResult.events);
        const activeEffects = effectsResult.update.activeEffects;

        // 2. Анализатор артефактов
        const analyzerResult = processAnalyzer(state);
        visualEvents.push(...analyzerResult.events);
        Object.assign(inventoryUpdates, analyzerResult.inventoryChanges);

        // 3. Случайные события
        const eventsResult = processEvents(state, stats);
        visualEvents.push(...eventsResult.events);

        // COOLING MANAGER moved to separate high-frequency loop

        // 4. Щит
        const shieldResult = processShield(state);

        // 5. Нагрев/Охлаждение
        const heatResult = processHeat(state, stats, activeEffects);
        visualEvents.push(...heatResult.events);

        // 6. Бурение и добыча
        const drillResult = processDrilling(
            state,
            stats,
            activeEffects,
            // Override drilling state if event changed heat or other blockers?
            // Assume drilling continues unless heat stops it
            heatResult.update.isDrilling,
            heatResult.update.isOverheated
        );
        visualEvents.push(...drillResult.events);
        Object.assign(resourceChanges, drillResult.resourceChanges);

        // 7. Бой с боссами
        const combatResult = processCombat(
            state,
            stats,
            shieldResult.isShielding,
            heatResult.update.isOverheated
        );
        visualEvents.push(...combatResult.events);
        Object.assign(resourceChanges, combatResult.resourceChanges);
        Object.assign(inventoryUpdates, combatResult.newInventoryItems);

        // 8. Летающие объекты
        const entityResult = processEntities({
            ...state,
            currentBoss: combatResult.update.currentBoss,
            combatMinigame: combatResult.update.combatMinigame,
            isCoolingGameActive: heatResult.update.isCoolingGameActive
        });
        visualEvents.push(...entityResult.events);

        // 9. Регенерация и дроны
        // [MODULAR] Check Expeditions (every 1s roughly)
        if (state.eventCheckTick % 10 === 0) {
            // [MODULAR] Expedition Update
            const updatedExpeditions = state.activeExpeditions.map(ex => expeditionSystem.checkStatus(ex));
            // Check for any changes to avoid unnecessary state updates (React optimization)
            // But here we are returning partialState.
            // If we just return mapped, it replaces the array.
            // Does it matter? 
            // Let's only add it to partialState if functionality implies it.
            // checkStatus updates the object effectively (returns new if changed).
            // We should push this to partialState.
            // However partialState is aggregated.
            // We need to merge it?
            // No, GameEngine returns one object.
            // We can just assign it to a property of the returned object.
            // But `entityResult` creates `events`.
            // Let's create `expeditionResult`.
        }

        // Actually, let's just do it properly:
        let activeExpeditions = state.activeExpeditions;
        if (state.eventCheckTick % 10 === 0) {
            let hasChanges = false;
            const updated = state.activeExpeditions.map(ex => {
                const newVal = expeditionSystem.checkStatus(ex);
                if (newVal !== ex) hasChanges = true;
                return newVal;
            });
            if (hasChanges) activeExpeditions = updated;
        }

        let integrity = eventsResult.update.integrity ?? heatResult.update.integrity ?? combatResult.update.integrity ?? state.integrity;
        let heat = eventsResult.update.heat ?? heatResult.update.heat;

        let depth = eventsResult.update.depth ?? drillResult.update.depth; // Event jump takes priority over drill? Or Add?

        // Wait, drillResult adds depth based on state.depth.
        // If event added depth instantaneously, does drillResult account for it?
        // drillResult uses `state.depth + ...`.
        // If event happens SAME TICK, we should combine.
        // But simpler to just take max or prioritize event jump.
        if (eventsResult.update.depth) {
            depth = Math.max(depth, eventsResult.update.depth);
        }

        // [BALANCING] Overload Heat Generation (+10/sec)
        const isOverloadActive = abilitySystem.getState('OVERLOAD').isActive;
        if (isOverloadActive) {
            heat += 10 * dt;
        }

        integrity = processRegeneration(state, stats, integrity);
        const droneResult = processDrones(state, stats, integrity, heat);
        if (droneResult.integrity !== undefined) integrity = droneResult.integrity;
        if (droneResult.integrity !== undefined) integrity = droneResult.integrity;
        if (droneResult.heat !== undefined) heat = droneResult.heat;

        // 10. Случайные опасности (Hazards)
        const hazardResult = processHazards({
            ...state,
            heat, // Use current accumulated heat
            integrity, // Use current accumulated integrity
            depth
        });
        if (hazardResult.update.integrity !== undefined) integrity = hazardResult.update.integrity;
        if (hazardResult.update.heat !== undefined) heat = hazardResult.update.heat;
        visualEvents.push(...hazardResult.events);

        // === HAZARD TRIGGERS (Visual Effects) ===
        // Detect hazards from logs for visual triggers (Temporary coupling until VisualEvent supports explicit hazards)
        hazardResult.events.forEach(e => {
            if (e.type === 'LOG') {
                if (e.msg.includes('ОБВАЛ')) tunnelAtmosphere.triggerHazard('CAVE_IN', 0.5);
                if (e.msg.includes('ГАЗОВЫЙ')) tunnelAtmosphere.triggerHazard('GAS_POCKET', 0.5);
                if (e.msg.includes('МАГМАТИЧЕСКИЙ')) tunnelAtmosphere.triggerHazard('MAGMA_FLOW', 0.8);
            }
        });

        // 1. GAS_POCKET event triggers green mist
        const gasEvent = eventsResult.update.eventQueue.find(e => e.id === 'GAS_POCKET');
        if (gasEvent) {
            tunnelAtmosphere.triggerHazard('GAS_POCKET', 0.7);
        }

        // 2. Overheat triggers magma glow
        if (heat >= 90 && !state.isOverheated) {
            tunnelAtmosphere.triggerHazard('MAGMA_FLOW', heat / 100);
        }

        // 3. Deep drilling (>30000m) random magma
        if (depth > 30000 && Math.random() < 0.002) {
            tunnelAtmosphere.triggerHazard('MAGMA_FLOW', 0.3);
        }

        // 4. Boss attack triggers screen shake
        if (combatResult.update.currentBoss && state.currentBoss) {
            // Check if boss just attacked (bossAttackTick reset)
            if (combatResult.update.bossAttackTick === 0 && state.bossAttackTick > 0) {
                const bossIntensity = combatResult.update.currentBoss.damage / 50;
                tunnelAtmosphere.triggerHazard('CAVE_IN', Math.min(1, bossIntensity));
            }
        }

        // 5. Tectonic event triggers cave-in
        const tectonicEvent = eventsResult.update.eventQueue.find(e => e.id === 'TECTONIC_SHIFT');
        if (tectonicEvent) {
            tunnelAtmosphere.triggerHazard('CAVE_IN', 0.8);
        }

        // === ЗВУК И НАРРАТИВ ===
        const narrativeContext = {
            depth,
            heat,
            integrity,
            biome: "Unknown",
            eventActive: eventsResult.update.eventQueue.length > 0,
            afkTime: (Date.now() - state.lastInteractTime) / 1000
        };
        const aiState = narrativeManager.getAIState(narrativeContext);
        audioEngine.update(heat, depth, heatResult.update.isOverheated);

        // NARRATIVE TICK (Time based)
        const NARRATIVE_INTERVAL = 10.0; // Seconds
        let narrativeTick = (state.narrativeTick || 0) + dt;

        if (narrativeTick >= NARRATIVE_INTERVAL) {
            narrativeTick = 0;
            const log = narrativeManager.generateLog(narrativeContext);
            if (log) {
                visualEvents.push({ type: 'LOG', msg: log.msg, color: log.color });
            }
        }

        // === ABILITY SYSTEM UPDATE ===
        // Update cooldowns and durations
        abilitySystem.update(dt);
        // AbilitySystem.update takes dt. 
        // Let's check AbilitySystem.ts:
        // update(dt: number): void { ... state.cooldownRemaining -= dt * 1000; ... }
        // So it expects dt in SECONDS.
        // Wait, "state.cooldownRemaining -= dt * 1000" implies dt is seconds and we convert to ms.
        // So passing dt (seconds) is correct.

        const activeAbilities = abilitySystem.getAllStates();


        // === ОБЪЕДИНЕНИЕ ИНВЕНТАРЯ ===
        let newInventory = state.inventory;
        if (Object.keys(inventoryUpdates).length > 0) {
            newInventory = { ...state.inventory, ...inventoryUpdates };
        }

        // === ПРИМЕНЕНИЕ РЕСУРСОВ ===
        const newResources = applyResourceChanges(state.resources, resourceChanges);

        // === ФИНАЛЬНОЕ СОСТОЯНИЕ ===
        return {
            partialState: {
                // ... (existing)
                activeAbilities, // Add this

                // Тепло
                heat,
                isOverheated: heatResult.update.isOverheated,
                isCoolingGameActive: heatResult.update.isCoolingGameActive,
                heatStabilityTimer: heatResult.update.heatStabilityTimer,

                // Щит
                shieldCharge: shieldResult.shieldCharge,
                isShielding: shieldResult.isShielding,

                // Бурение
                depth, // Updated from event or drill
                isDrilling: heatResult.update.isDrilling,
                forgeUnlocked: drillResult.update.forgeUnlocked,
                cityUnlocked: drillResult.update.cityUnlocked,
                skillsUnlocked: drillResult.update.skillsUnlocked,
                storageLevel: drillResult.update.storageLevel as 0 | 1 | 2,

                // Ресурсы и HP
                resources: newResources,
                currentCargoWeight: recalculateCargoWeight(newResources),  // [CARGO SYSTEM] Автообновление веса
                integrity,
                xp: (combatResult.update.xp ?? state.xp), // Combat XP updates

                // === БОЙ И СУЩНОСТИ (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ) ===
                currentBoss: combatResult.update.currentBoss,
                combatMinigame: combatResult.update.combatMinigame,
                bossAttackTick: combatResult.update.bossAttackTick,
                lastBossDepth: combatResult.update.lastBossDepth,
                minigameCooldown: combatResult.update.minigameCooldown,
                flyingObjects: entityResult.update.flyingObjects,

                // События
                eventQueue: eventsResult.update.eventQueue,
                eventCheckTick: eventsResult.update.eventCheckTick,
                recentEventIds: eventsResult.update.recentEventIds,

                // Эффекты и анализатор
                activeEffects,
                analyzer: analyzerResult.update.analyzer,
                inventory: newInventory,

                // Нарратив
                narrativeTick,
                aiState,

                // Let's add activeExpeditions if changed
                ...(state.eventCheckTick % 10 === 0 ? { activeExpeditions } : {})
            },
            events: visualEvents
        };
    }
}

export const gameEngine = new GameEngine();
