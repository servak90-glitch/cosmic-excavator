/**
 * License Slice — действия для покупки лицензий и разрешений
 */

import { SliceCreator, pushLog } from './types';
import type { ZoneLicense, PermitType, RegionId, VisualEvent } from '../../types';
import { LICENSE_PRICES, PERMIT_PRICES } from '../../constants/licenses';
import {
    getReputationTier,
    hasRequiredLicense,
    calculatePermitPrice,
    createPermit,
    getRequiredLicense
} from '../../services/licenseManager';
import { audioEngine } from '../../services/audioEngine';
import { recalculateCargoWeight } from '../../services/gameMath';

export interface LicenseActions {
    buyLicense: (zone: ZoneLicense) => void;
    buyPermit: (regionId: RegionId, type: PermitType) => void;
    addGlobalReputation: (amount: number) => void;
}

export const createLicenseSlice: SliceCreator<LicenseActions> = (set, get) => ({
    /**
     * Купить лицензию на зону
     */
    buyLicense: (zone) => {
        const s = get();

        // Проверка 1: Уже есть?
        if (s.unlockedLicenses.includes(zone)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `ВЫ УЖЕ ИМЕЕТЕ ${zone.toUpperCase()} ZONE LICENSE`,
                color: 'text-yellow-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: Требования
        if (zone === 'yellow' && !s.unlockedLicenses.includes('green')) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '⚠️ ТРЕБУЕТСЯ GREEN ZONE LICENSE!',
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        if (zone === 'red' && !s.unlockedLicenses.includes('yellow')) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '⚠️ ТРЕБУЕТСЯ YELLOW ZONE LICENSE!',
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Расчёт цены со скидкой
        const basePrice = LICENSE_PRICES[zone];
        const finalPrice = calculatePermitPrice(basePrice, s.globalReputation);

        // Проверка 3: Хватает денег?
        if (s.resources.rubies < finalPrice) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `💎 НЕДОСТАТОЧНО РУБИНОВ! Требуется: ${finalPrice}, есть: ${s.resources.rubies}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // ✅ Покупка
        const newResources = {
            ...s.resources,
            rubies: s.resources.rubies - finalPrice
        };

        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `✅ ${zone.toUpperCase()} ZONE LICENSE РАЗБЛОКИРОВАНА! (-${finalPrice} 💎)`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: newResources,
            currentCargoWeight: recalculateCargoWeight(newResources),
            unlockedLicenses: [...s.unlockedLicenses, zone],
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playLocationDiscover();
    },

    /**
     * Купить разрешение на регион
     */
    buyPermit: (regionId, type) => {
        const s = get();

        // Проверка 1: Уже есть permanent?
        const existing = s.activePermits[regionId];
        if (existing?.type === 'permanent') {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `У ВАС УЖЕ ЕСТЬ PERMANENT РАЗРЕШЕНИЕ НА ${regionId.toUpperCase()}`,
                color: 'text-yellow-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 2: Quest only?
        const prices = PERMIT_PRICES[regionId];
        const basePrice = type === 'temporary' ? prices.temp : prices.perm;

        if (basePrice === -1) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: '⚠️ Этот регион доступен только через КВЕСТ!',
                color: 'text-purple-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Проверка 3: Zone license
        const requiredZone = getRequiredLicense(regionId);
        if (!hasRequiredLicense(s.unlockedLicenses, requiredZone)) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⚠️ ТРЕБУЕТСЯ ${requiredZone.toUpperCase()} ZONE LICENSE!`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // Расчёт цены со скидкой
        const finalPrice = calculatePermitPrice(basePrice, s.globalReputation);

        // Проверка 4: Хватает денег?
        if (s.resources.rubies < finalPrice) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `💎 НЕДОСТАТОЧНО РУБИНОВ! Требуется: ${finalPrice}, есть: ${s.resources.rubies}`,
                color: 'text-red-500'
            };
            set({ actionLogQueue: pushLog(s, event) });
            return;
        }

        // ✅ Покупка
        const newPermit = createPermit(regionId, type);
        const newResources = {
            ...s.resources,
            rubies: s.resources.rubies - finalPrice
        };

        const permitLabel = type === 'temporary' ? 'ВРЕМЕННОЕ (7 дней)' : 'PERMANENT';
        const successEvent: VisualEvent = {
            type: 'LOG',
            msg: `🎫 ${permitLabel} РАЗРЕШЕНИЕ НА ${regionId.toUpperCase()} ПОЛУЧЕНО! (-${finalPrice} 💎)`,
            color: 'text-green-400 font-bold'
        };

        set({
            resources: newResources,
            currentCargoWeight: recalculateCargoWeight(newResources),
            activePermits: { ...s.activePermits, [regionId]: newPermit },
            actionLogQueue: pushLog(s, successEvent)
        });

        audioEngine.playLocationDiscover();
    },

    /**
     * Добавить глобальную репутацию
     */
    addGlobalReputation: (amount) => {
        const s = get();
        const oldTier = getReputationTier(s.globalReputation);
        const newRep = Math.max(0, s.globalReputation + amount);
        const newTier = getReputationTier(newRep);

        set({ globalReputation: newRep });

        // Если tier повысился - уведомление
        if (newTier.tier > oldTier.tier) {
            const event: VisualEvent = {
                type: 'LOG',
                msg: `⬆️ REPUTATION TIER UP! Теперь вы: ${newTier.name} (скидка ${newTier.discount * 100}%)`,
                color: 'text-cyan-400 font-bold'
            };
            set({ actionLogQueue: pushLog(s, event) });
            audioEngine.playLocationDiscover();
        }
    }
});
