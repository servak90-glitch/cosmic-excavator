import React from 'react';
import { ServiceTabProps } from './types';
import { ResourceType, Resources } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { calculateRepairCost, getResourceLabel } from '../../services/gameMath';
import { CITY_SERVICE, PREMIUM_BUFFS } from '../../constants/balance';
import { t } from '../../services/localization';



const ServiceTab: React.FC<ServiceTabProps> = ({
    resources,
    depth,
    heat,
    integrity,
    maxIntegrity,
    onHeal,
    onRepair
}) => {
    const buyCityBuff = useGameStore(s => s.buyCityBuff);
    const lang = useGameStore(s => s.settings.language);
    const freeCoolingLastUsed = useGameStore(s => s.freeCoolingLastUsed);

    const [cooldownRemaining, setCooldownRemaining] = React.useState(0);

    const isPaidCooling = depth >= CITY_SERVICE.PAID_COOLING_DEPTH;
    const coolingRes = depth > CITY_SERVICE.GOLD_COOLING_DEPTH ? 'gold' : 'stone';
    const coolingRate = depth > CITY_SERVICE.GOLD_COOLING_DEPTH ? CITY_SERVICE.COOLING_RATE_GOLD : CITY_SERVICE.COOLING_RATE_STONE;
    const coolingCost = Math.ceil(heat * coolingRate);
    const canAffordCooling = !isPaidCooling || resources[coolingRes as keyof Resources] >= coolingCost;

    // Обновление таймера кулдауна каждую секунду
    React.useEffect(() => {
        if (isPaidCooling) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastUse = now - (freeCoolingLastUsed || 0);
            const remaining = Math.max(0, CITY_SERVICE.FREE_COOLING_COOLDOWN_MS - timeSinceLastUse);
            setCooldownRemaining(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [freeCoolingLastUsed, isPaidCooling]);

    const isOnCooldown = !isPaidCooling && cooldownRemaining > 0;
    const canUseCooling = heat >= 1 && !isOnCooldown && canAffordCooling;

    // Форматирование времени MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const repairInfo = calculateRepairCost(depth, integrity, maxIntegrity);
    const repairRes = repairInfo.resource;
    const fullRepairCost = repairInfo.cost;
    const canAffordRepair = resources[repairRes] >= fullRepairCost;
    const missingHp = maxIntegrity - integrity;

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* COOLING SECTION */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-3 md:mb-4 pixel-text">СИСТЕМА ОХЛАЖДЕНИЯ</h3>
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] md:text-xs font-mono text-zinc-400 mb-1">
                        <span>ТЕКУЩИЙ НАГРЕВ</span>
                        <span className={heat > 80 ? "text-red-500 font-bold" : "text-cyan-400"}>{heat.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 md:h-4 bg-black border border-zinc-700">
                        <div className={`h-full transition-all duration-300 ${heat > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${heat}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 font-mono">СТОИМОСТЬ:</span>
                    {isPaidCooling ? (
                        <span className={`text-xs font-bold ${canAffordCooling ? 'text-white' : 'text-red-500'}`}>
                            {coolingCost} {t(getResourceLabel(coolingRes), lang)}
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-green-400">БЕСПЛАТНО</span>
                    )}
                </div>

                {/* Таймер кулдауна */}
                {!isPaidCooling && isOnCooldown && (
                    <div className="mb-2 text-center py-1 bg-yellow-900/20 border border-yellow-700/30 rounded">
                        <span className="text-xs text-yellow-400 font-mono">
                            ⏱️ ДОСТУПНО ЧЕРЕЗ: {formatTime(cooldownRemaining)}
                        </span>
                    </div>
                )}

                <button
                    onClick={onHeal}
                    disabled={!canUseCooling}
                    className={`w-full py-2 md:py-3 font-bold border-2 transition-colors active:scale-95 text-xs md:text-sm
            ${heat < 1 ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' :
                            !canUseCooling ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black'}
          `}
                >
                    {heat < 1
                        ? 'СИСТЕМА В НОРМЕ'
                        : isOnCooldown
                            ? `КУЛДАУН: ${formatTime(cooldownRemaining)}`
                            : canAffordCooling
                                ? 'ЭКСТРЕННЫЙ СБРОС ТЕПЛА'
                                : 'НЕДОСТАТОЧНО СРЕДСТВ'
                    }
                </button>
            </div>

            {/* HULL REPAIR SECTION */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-zinc-200 mb-3 md:mb-4 pixel-text">РЕМОНТНЫЙ ДОК</h3>
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] md:text-xs font-mono text-zinc-400 mb-1">
                        <span>ЦЕЛОСТНОСТЬ ОБШИВКИ</span>
                        <span className={integrity < maxIntegrity * 0.3 ? "text-red-500 font-bold" : "text-green-400"}>
                            {Math.floor(integrity)} / {maxIntegrity}
                        </span>
                    </div>
                    <div className="w-full h-3 md:h-4 bg-black border border-zinc-700">
                        <div
                            className={`h-full transition-all duration-300 ${integrity < maxIntegrity * 0.3 ? 'bg-red-600' : 'bg-green-500'}`}
                            style={{ width: `${(integrity / maxIntegrity) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 font-mono">ПОЛНЫЙ РЕМОНТ:</span>
                    <span className={`text-xs font-bold ${canAffordRepair ? 'text-white' : 'text-red-500'}`}>
                        {fullRepairCost} {t(getResourceLabel(repairRes), lang)}
                    </span>
                </div>

                <button
                    onClick={() => onRepair()}
                    disabled={missingHp <= 0 || !canAffordRepair}
                    className={`w-full py-2 md:py-3 font-bold border-2 transition-colors active:scale-95 text-xs md:text-sm
            ${missingHp <= 0 ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' :
                            canAffordRepair ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black' : 'border-red-900 text-red-700 cursor-not-allowed'}
          `}
                >
                    {missingHp <= 0 ? 'ПОВРЕЖДЕНИЙ НЕТ' : canAffordRepair ? 'ВОССТАНОВИТЬ ОБШИВКУ' : 'НЕДОСТАТОЧНО СРЕДСТВ'}
                </button>
            </div>

            {/* PREMIUM BUFFS */}
            <div className="bg-zinc-900 border border-amber-700/50 p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-amber-500 mb-3 md:mb-4 pixel-text">ПРЕМИУМ ОБСЛУЖИВАНИЕ</h3>
                <div className="space-y-4">
                    {PREMIUM_BUFFS.map(buff => {
                        const canBuy = resources[buff.res as keyof Resources] >= buff.cost;
                        return (
                            <div key={buff.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black border border-zinc-800 p-3 gap-2 group hover:border-amber-900 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{buff.icon}</div>
                                    <div>
                                        <div className={`text-xs font-bold ${buff.color} pixel-text`}>{t(buff.name, lang)}</div>

                                        <div className="text-[10px] text-zinc-500 font-mono">{buff.desc}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => buyCityBuff(buff.cost, buff.res as ResourceType, buff.effectId)}
                                    disabled={!canBuy}
                                    className={`w-full md:w-auto mt-2 md:mt-0 px-3 py-1.5 text-[10px] font-mono border transition-all active:scale-95 ${canBuy ? 'border-amber-500 text-amber-400 hover:bg-amber-900/30' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                >
                                    {buff.cost} {t(getResourceLabel(buff.res), lang)}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ServiceTab;
