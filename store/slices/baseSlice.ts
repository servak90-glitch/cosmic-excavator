/**
 * Base Slice — действия для управления базами игрока
 */

import { SliceCreator, pushLog } from './types';
import type { RegionId, BaseType, PlayerBase, VisualEvent, FacilityId } from '../../types';
import { BASE_COSTS, BASE_BUILD_TIMES, BASE_STORAGE_CAPACITY, WORKSHOP_TIER_RANGES } from '../../constants/playerBases';
import { FUEL_FACILITIES, canBuildFacility } from '../../constants/fuelFacilities';
import { audioEngine } from '../../services/audioEngine';

export interface BaseActions {
    buildBase: (regionId: RegionId, baseType: BaseType) => void;
    checkBaseCompletion: () => void;  // Проверка завершения строительства
    buildFacility: (baseId: string, facilityId: FacilityId) => void;  // Постройка facility
}

export const createBaseSlice: SliceCreator<BaseActions> = (set, get) => ({
    /**
     * Начать постройку базы
     */
    buildBase: (regionId, baseType) => {
        const s = get();

        // Проверка 1: Уже есть база в этом регионе?
        const existingBase = s.playerBases?.find(b => b.regionId === regionId);
        if (existingBase) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `В ${regionId.toUpperCase()} УЖЕ ЕСТЬ БАЗА!`,
                color: 'text-yellow-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: Хватает ресурсов?
        const cost = BASE_COSTS[baseType];

        if (s.resources.rubies < cost.credits) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `💎 НЕДОСТАТОЧНО РУБИНОВ! Требуется: ${cost.credits}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка материалов
        for (const [resource, amount] of Object.entries(cost.materials)) {
            if ((s.resources[resource as keyof typeof s.resources] || 0) < (amount || 0)) {
                const event: VisualEvent = {
                    type: 'LOG',
                    msg: `⚠️ НЕДОСТАТОЧНО МАТЕРИАЛОВ!`,
                    color: 'text-red-500'
                };
                set({ actionLogQueue: pushLog(s, event) });
                return;
            }
        }

        // ✅ Оплата
        const newResources = { ...s.resources, rubies: s.resources.rubies - cost.credits };
        for (const [resource, amount] of Object.entries(cost.materials)) {
            newResources[resource as keyof typeof newResources] -= (amount || 0);
        }

        // Создание базы
        const now = Date.now();
        const buildTime = BASE_BUILD_TIMES[baseType];
        const workshopRange = WORKSHOP_TIER_RANGES[regionId][baseType];

        const newBase: PlayerBase = {
            id: `base_${regionId}_${now}`,
            regionId,
            type: baseType,
            status: buildTime === 0 ? 'active' : 'building',

            storageCapacity: BASE_STORAGE_CAPACITY[baseType],
            storedResources: {},

            hasWorkshop: baseType !== 'outpost',
            workshopTierRange: workshopRange,
            hasFuelFacilities: baseType === 'station',
            hasMarket: baseType === 'station',
            hasFortification: false,
            hasGuards: false,

            constructionStartTime: now,
            constructionCompletionTime: now + buildTime,
            lastVisitedAt: now,

            upgradeLevel: 1,
            facilities: []  // Phase 2: пустой массив facilities при создании
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🏗️ ПОСТРОЙКА ${baseType.toUpperCase()} В ${regionId.toUpperCase()} НАЧАТА!`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: newResources,
            playerBases: [...(s.playerBases || []), newBase],
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playBaseBuild();
    },

    /**
     * Проверка завершения строительства баз
     * (вызывается из game loop)
     */
    checkBaseCompletion: () => {
        const s = get();
        const now = Date.now();
        let hasCompletions = false;

        const updatedBases = (s.playerBases || []).map(base => {
            if (base.status === 'building' && now >= base.constructionCompletionTime) {
                hasCompletions = true;
                return { ...base, status: 'active' as const };
            }
            return base;
        });

        if (hasCompletions) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '✅ ПОСТРОЙКА БАЗЫ ЗАВЕРШЕНА!',
                color: 'text-cyan-400 font-bold'
            };

            set({
                playerBases: updatedBases,
                actionLogQueue: pushLog(s, event)
            });

            audioEngine.playBaseBuild();
        }
    },

    /**
     * Постройка Fuel Facility в базе
     */
    buildFacility: (baseId, facilityId) => {
        const s = get();
        const base = s.playerBases?.find(b => b.id === baseId);

        if (!base) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '❌ База не найдена!',
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка возможности постройки
        const validation = canBuildFacility(base.facilities || [], facilityId, s.resources.rubies);
        if (!validation.canBuild) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `❌ ${validation.reason}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        const facility = FUEL_FACILITIES[facilityId];

        // Списать credits и добавить facility
        const updatedBases = s.playerBases.map(b =>
            b.id === baseId
                ? { ...b, facilities: [...(b.facilities || []), facilityId] }
                : b
        );

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🏭 ${facility.name} ПОСТРОЕНА!`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: { ...s.resources, rubies: s.resources.rubies - facility.cost },
            playerBases: updatedBases,
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playBaseBuild();
    }
});
