import React from 'react';
import { LicenseTabProps } from './types';
import { useGameStore } from '../../store/gameStore';
import { REGIONS, REGION_IDS } from '../../constants/regions';
import { LICENSE_PRICES, PERMIT_PRICES } from '../../constants/licenses';
import { calculatePermitPrice, getRequiredLicense, hasRequiredLicense } from '../../services/licenseManager';
import { t, TEXT_IDS, TL } from '../../services/localization';
import { ZoneLicense, RegionId } from '../../types';

const LicenseTab: React.FC<LicenseTabProps> = ({ resources }) => {
    const lang = useGameStore(s => s.settings.language);
    const unlockedLicenses = useGameStore(s => s.unlockedLicenses);
    const activePermits = useGameStore(s => s.activePermits);
    const globalReputation = useGameStore(s => s.globalReputation);
    const buyLicense = useGameStore(s => s.buyLicense);
    const buyPermit = useGameStore(s => s.buyPermit);

    const zones: ZoneLicense[] = ['green', 'yellow', 'red'];
    // Regions excluding the starting one (Rust Valley)
    const permitRegions = REGION_IDS.filter(id => id !== RegionId.RUST_VALLEY);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-8">
            {/* Header Description */}
            <div className="bg-zinc-900 border border-zinc-700 p-6 text-center">
                <h3 className="text-xl pixel-text text-white mb-2 uppercase">{t(TEXT_IDS.CITY_LICENSES, lang)}</h3>
                <p className="text-xs text-zinc-400 font-mono">
                    "Здесь вы можете приобрести официальные права на бурение в подконтрольных зонах и регионах."
                </p>
                <div className="mt-4 inline-block bg-black px-4 py-1 border border-zinc-800 rounded">
                    <span className="text-[10px] text-zinc-500 font-mono">ВАША РЕПУТАЦИЯ: </span>
                    <span className="text-cyan-400 font-bold">{globalReputation}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. ZONE LICENSES */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-500 pixel-text flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-zinc-700" />
                        {t(TEXT_IDS.CITY_LICENSE_ZONE, lang).toUpperCase()}
                    </h4>

                    {zones.map(zone => {
                        const isUnlocked = unlockedLicenses.includes(zone);
                        const basePrice = LICENSE_PRICES[zone];
                        const finalPrice = calculatePermitPrice(basePrice, globalReputation);
                        const canAfford = resources.rubies >= finalPrice;

                        // Requirement check for yellow and red
                        let reqMessage = "";
                        let isReqMet = true;
                        if (zone === 'yellow' && !unlockedLicenses.includes('green')) {
                            reqMessage = `Need GREEN license`;
                            isReqMet = false;
                        } else if (zone === 'red' && !unlockedLicenses.includes('yellow')) {
                            reqMessage = `Need YELLOW license`;
                            isReqMet = false;
                        }

                        return (
                            <div key={zone} className={`p-4 border-2 transition-all ${isUnlocked ? 'border-zinc-800 bg-zinc-950 opacity-60' : 'border-zinc-700 bg-zinc-900 hover:border-white/20'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${zone === 'green' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' :
                                                zone === 'yellow' ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' :
                                                    'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                            }`} />
                                        <div className="font-bold text-sm tracking-widest text-white">{zone.toUpperCase()} ZONE</div>
                                    </div>
                                    {isUnlocked && (
                                        <span className="text-[9px] font-mono bg-green-900/40 text-green-400 px-2 py-0.5 rounded border border-green-800/50 uppercase">
                                            {t(TEXT_IDS.CITY_OWNED, lang)}
                                        </span>
                                    )}
                                </div>

                                <p className="text-[10px] text-zinc-500 mb-4 font-mono">
                                    {zone === 'green' ? 'Доступ к базовым регионам и технологиям добычи.' :
                                        zone === 'yellow' ? 'Разрешение на работу в промышленных зонах (Iron Gates).' :
                                            'Высший допуск для работы в ядре и аномальных пустотах.'}
                                </p>

                                {!isUnlocked && (
                                    <div className="space-y-2">
                                        {!isReqMet ? (
                                            <div className="text-[10px] text-red-500 font-bold uppercase py-1 px-2 bg-red-950/20 border border-red-900/30">
                                                🚨 {t(TEXT_IDS.CITY_REQUIREMENT, lang)}: {reqMessage}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => buyLicense(zone)}
                                                disabled={!canAfford}
                                                className={`w-full py-2.5 font-bold text-xs transition-all flex justify-between items-center px-4 ${canAfford ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
                                            >
                                                <span>{t(TEXT_IDS.CITY_COST, lang).toUpperCase()}</span>
                                                <span className="flex items-center gap-1">
                                                    {finalPrice} <span className="text-[14px]">💎</span>
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. REGION PERMITS */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-500 pixel-text flex items-center gap-2">
                        <span className="w-4 h-[2px] bg-zinc-700" />
                        {t(TEXT_IDS.CITY_PERMIT_REGION, lang).toUpperCase()}
                    </h4>

                    <div className="space-y-3">
                        {permitRegions.map(regionId => {
                            const region = REGIONS[regionId];
                            const permit = activePermits[regionId];
                            const isPermanent = permit?.type === 'permanent';
                            const requiredLicense = getRequiredLicense(regionId);
                            const hasLicense = hasRequiredLicense(unlockedLicenses, requiredLicense);

                            const prices = PERMIT_PRICES[regionId];
                            const finalPermCost = calculatePermitPrice(prices.perm, globalReputation);
                            const finalTempCost = calculatePermitPrice(prices.temp, globalReputation);

                            return (
                                <div key={regionId} className={`p-4 border-2 transition-all ${isPermanent ? 'border-zinc-800 bg-zinc-950 opacity-60' : 'border-zinc-700 bg-zinc-900'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-xs text-zinc-200">{t(TL.regions[regionId], lang).toUpperCase()}</div>
                                        {!isPermanent && (
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <div className={`w-1.5 h-1.5 rounded-full ${requiredLicense === 'green' ? 'bg-green-500' :
                                                        requiredLicense === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'
                                                    }`} />
                                                <span className="text-[8px] font-mono text-zinc-400 uppercase">{requiredLicense} REQ</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[9px] text-zinc-500 font-mono mb-4">
                                        {t(TL.regionDescriptions[regionId], lang)}
                                    </div>

                                    {isPermanent ? (
                                        <div className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                                            FULL ACCESS GRANTED
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {!hasLicense ? (
                                                <div className="text-[9px] text-red-500/80 font-mono italic">
                                                    Requires {requiredLicense.toUpperCase()} license to purchase access.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => buyPermit(regionId, 'temporary')}
                                                        disabled={resources.rubies < finalTempCost || finalTempCost === -1}
                                                        className={`py-2 px-2 text-[9px] font-bold border flex flex-col items-center transition-all ${finalTempCost === -1 ? 'hidden' : resources.rubies >= finalTempCost ? 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                                    >
                                                        <span>{t(TEXT_IDS.CITY_TEMPORARY, lang)}</span>
                                                        <span className="text-white mt-1">{finalTempCost} 💎</span>
                                                    </button>
                                                    <button
                                                        onClick={() => buyPermit(regionId, 'permanent')}
                                                        disabled={resources.rubies < finalPermCost || finalPermCost === -1}
                                                        className={`py-2 px-2 text-[9px] font-bold border flex flex-col items-center transition-all ${finalPermCost === -1 ? 'hidden' : resources.rubies >= finalPermCost ? 'bg-zinc-100 border-zinc-300 text-black hover:bg-white' : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                                    >
                                                        <span>{t(TEXT_IDS.CITY_PERMANENT, lang)}</span>
                                                        <span className="text-black font-black mt-1">{finalPermCost} 💎</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reputation Info Footer */}
            <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-3 text-cyan-400 mb-2">
                    <span className="text-xl">🎓</span>
                    <h5 className="font-bold text-xs pixel-text uppercase">БОНУСЫ РЕПУТАЦИИ</h5>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                    Чем выше ваша глобальная репутация, тем выше лояльность лицензионного центра.
                    Опытные бурильщики получают скидки до <span className="text-white">30%</span> на все типы пропусков и лицензий.
                    Выполняйте спец-контракты, чтобы повысить свой статус.
                </p>
            </div>
        </div>
    );
};

export default LicenseTab;
