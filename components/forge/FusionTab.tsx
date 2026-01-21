import React, { useState } from 'react';
import { FusionTabProps } from './types';
import { Resources, InventoryItem } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { FUSION_RECIPES } from '../../constants';
import { ARTIFACTS } from '../../services/artifactRegistry';
import { BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS } from '../../constants';
import { t, TEXT_IDS } from '../../services/localization';


const ALL_PARTS = [...BITS, ...ENGINES, ...COOLERS, ...HULLS, ...LOGIC_CORES, ...CONTROL_UNITS, ...GEARBOXES, ...POWER_CORES, ...ARMORS];

const FusionTab: React.FC<FusionTabProps> = ({
    resources,
    inventory,
    depth,
    heatStabilityTimer,
    integrity,
    drill
}) => {
    const [selectedArtifactsForFusion, setSelectedArtifactsForFusion] = useState<string[]>([]);
    const fusionUpgrade = useGameStore(s => s.fusionUpgrade);
    const transmuteArtifacts = useGameStore(s => s.transmuteArtifacts);
    const lang = useGameStore(s => s.settings.language);


    const inventoryList = Object.values(inventory) as InventoryItem[];

    const toggleArtifactSelection = (id: string) => {
        setSelectedArtifactsForFusion(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return prev;

            const item = inventory[id];
            if (!item) return prev;
            const def = ARTIFACTS.find(a => a.id === item.defId);

            if (prev.length > 0) {
                const first = inventory[prev[0]];
                const firstDef = ARTIFACTS.find(a => a.id === first?.defId);
                if (firstDef?.rarity !== def?.rarity) return prev;
            }
            return [...prev, id];
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* TRANSMUTATION */}
            <div className="bg-zinc-900 border border-amber-900/50 p-4">
                <h3 className="text-xl pixel-text text-amber-500 mb-2">{t(TEXT_IDS.TRANSMUTATION_TITLE, lang)}</h3>
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="text-zinc-500 text-xs">{t(TEXT_IDS.TRANSMUTATION_DESC, lang)}</div>
                    <button
                        onClick={() => {
                            transmuteArtifacts(selectedArtifactsForFusion);
                            setSelectedArtifactsForFusion([]);
                        }}
                        disabled={selectedArtifactsForFusion.length !== 3}
                        className={`px-4 py-2 font-bold transition-all ${selectedArtifactsForFusion.length === 3 ? 'bg-amber-600 text-black hover:bg-amber-500' : 'bg-zinc-800 text-zinc-600'}`}
                    >
                        {t(TEXT_IDS.TRANSMUTATION_BUTTON, lang)}
                    </button>
                </div>
                <div className="grid grid-cols-6 md:grid-cols-8 gap-2 mt-4 bg-black/50 p-2 border border-zinc-800">
                    {inventoryList.filter(i => i.isIdentified && !i.isEquipped).map(item => {
                        const isSelected = selectedArtifactsForFusion.includes(item.instanceId);
                        const def = ARTIFACTS.find(a => a.id === item.defId);
                        return (
                            <button
                                key={item.instanceId}
                                onClick={() => toggleArtifactSelection(item.instanceId)}
                                className={`w-10 h-10 border transition-all relative flex items-center justify-center text-xl
                  ${isSelected ? 'bg-amber-500/20 border-amber-500 scale-110 z-10' : 'bg-black border-zinc-700 hover:border-zinc-500'}
                `}
                            >
                                {def?.icon}
                                {isSelected && <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />}
                            </button>
                        );
                    })}
                    {inventoryList.filter(i => i.isIdentified && !i.isEquipped).length === 0 && (
                        <div className="col-span-full text-center text-xs text-zinc-600 py-4">{t(TEXT_IDS.TRANSMUTATION_NO_ARTIFACTS, lang)}</div>
                    )}
                </div>
            </div>

            {/* FUSION RECIPES */}
            <div className="bg-zinc-900 border border-purple-900/50 p-4">
                <h3 className="text-xl pixel-text text-purple-400 mb-4 border-b border-purple-900 pb-2">{t(TEXT_IDS.FUSION_ATOMIC_RECONSTRUCTOR, lang)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FUSION_RECIPES.map(recipe => {
                        const targetPart = ALL_PARTS.find(p => p.id === recipe.resultId);
                        const hasCatalyst = resources[recipe.catalyst.resource] >= recipe.catalyst.amount;

                        let conditionMet = true;
                        let conditionStatus = t(TEXT_IDS.FUSION_COMPLETED, lang);
                        let statusColor = "text-green-500";

                        if (recipe.condition) {
                            if (recipe.condition.type === 'DEPTH_REACHED') {
                                if (depth < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = `${Math.floor(depth)} / ${recipe.condition.target}m`;
                                    statusColor = "text-red-500";
                                }
                            } else if (recipe.condition.type === 'ZERO_HEAT') {
                                if (heatStabilityTimer < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = `${heatStabilityTimer.toFixed(1)}s / ${recipe.condition.target}s`;
                                    statusColor = "text-orange-500";
                                }
                            } else if (recipe.condition.type === 'NO_DAMAGE') {
                                if (integrity < recipe.condition.target) {
                                    conditionMet = false;
                                    conditionStatus = t(TEXT_IDS.FUSION_HULL_DAMAGED, lang);
                                    statusColor = "text-red-500";
                                }
                            }
                        }


                        // Проверка наличия компонента (предыдущего тира)
                        // drill типизирован в props, но для надежности добавим null-check
                        const currentPart = Object.values(drill || {}).find((p: { id: string }) => p.id === recipe.componentAId) as { id: string } | undefined;
                        const currentPartId = currentPart ? currentPart.id : null;
                        const hasRequiredPart = currentPartId === recipe.componentAId;

                        // Если деталь уже улучшена до результата или выше (для отображения скрытия/галочки можно доработать, но пока блокируем кнопку)
                        // НО: У нас drill хранит текущую, если мы апгрейднули до 13, то current будет 13.
                        // Рецепт требует 12. Если у нас 13, рецепт нам уже не нужен (или выполнен).
                        // Здесь мы проверяем: можем ли мы сделать апгрейд.
                        // Мы можем сделать апгрейд ТОЛЬКО если у нас сейчас стоит componentAId.

                        // Получаем текущую деталь в этом слоте
                        let currentSlotPart: any = null;
                        const allPartsArrays = [BITS, ENGINES, COOLERS, HULLS, LOGIC_CORES, CONTROL_UNITS, GEARBOXES, POWER_CORES, ARMORS];
                        const targetSlot: string | null = null;

                        for (const arr of allPartsArrays) {
                            if (arr.some(p => p.id === recipe.resultId)) {
                                // Нашли массив, к которому относится рецепт.
                                // Теперь нужно найти, какая деталь сейчас стоит в этом слоте у игрока.
                                // Проще: мы передали drill целиком.
                                // Нам нужно знать, к какому слоту относится recipe.resultId.
                                // Но у нас нет явной мапы recipe -> slot.
                                // Придется искать.
                                if (arr === BITS) currentSlotPart = drill.bit;
                                else if (arr === ENGINES) currentSlotPart = drill.engine;
                                else if (arr === COOLERS) currentSlotPart = drill.cooling;
                                else if (arr === HULLS) currentSlotPart = drill.hull;
                                else if (arr === LOGIC_CORES) currentSlotPart = drill.logic;
                                else if (arr === CONTROL_UNITS) currentSlotPart = drill.control;
                                else if (arr === GEARBOXES) currentSlotPart = drill.gearbox;
                                else if (arr === POWER_CORES) currentSlotPart = drill.power;
                                else if (arr === ARMORS) currentSlotPart = drill.armor;
                                break;
                            }
                        }

                        const isCorrectTierEquipped = currentSlotPart?.id === recipe.componentAId;
                        const isAlreadyUpgraded = currentSlotPart?.tier >= (targetPart?.tier || 99);

                        const canCraft = hasCatalyst && conditionMet && isCorrectTierEquipped;

                        return (
                            <div key={recipe.id} className="bg-black border border-purple-600/30 p-4 flex flex-col justify-between group hover:border-purple-500 transition-colors">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-red-500 font-bold pixel-text text-xs leading-snug">{targetPart ? t(targetPart.name, lang) : recipe.resultId}</h4>
                                        <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1 rounded">GODLY</span>
                                    </div>

                                    <div className="text-[10px] text-zinc-400 mb-3 border-l-2 border-purple-800 pl-2">
                                        "{t(recipe.description, lang)}"
                                    </div>


                                    <div className="space-y-1 mb-4 bg-zinc-900/50 p-2">
                                        <div className="flex justify-between text-[9px] font-mono">
                                            <span className="text-zinc-500">{t(TEXT_IDS.FUSION_REQUIRED, lang)}</span>
                                            <span className={hasCatalyst ? "text-white" : "text-red-500"}>
                                                {recipe.catalyst.amount} {recipe.catalyst.resource}
                                            </span>
                                        </div>


                                        {recipe.condition && (
                                            <div className="flex justify-between text-[9px] font-mono border-t border-zinc-800 pt-1 mt-1">
                                                <span className="text-zinc-500">{recipe.condition.description}:</span>
                                                <span className={statusColor}>
                                                    {conditionStatus}
                                                </span>
                                            </div>
                                        )}

                                        {!isCorrectTierEquipped && !isAlreadyUpgraded && (
                                            <div className="flex justify-between text-[9px] font-mono border-t border-zinc-800 pt-1 mt-1 text-red-500">
                                                <span>{t(TEXT_IDS.FUSION_REQUIRED, lang)}</span>
                                                <span>{t(TEXT_IDS.FUSION_PREVIOUS_TIER_REQUIRED, lang)}</span>
                                            </div>
                                        )}

                                        {isAlreadyUpgraded && (
                                            <div className="flex justify-between text-[9px] font-mono border-t border-zinc-800 pt-1 mt-1 text-green-500">
                                                <span>{t(TEXT_IDS.FUSION_STATUS, lang)}</span>
                                                <span>{t(TEXT_IDS.FUSION_ALREADY_UPGRADED, lang)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => fusionUpgrade(recipe.id)}
                                    disabled={!canCraft}
                                    className={`w-full py-3 pixel-text text-xs font-bold transition-all
                    ${canCraft
                                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_#9333ea]'
                                            : isAlreadyUpgraded
                                                ? 'bg-green-900/20 text-green-500 border border-green-900 cursor-default'
                                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                  `}
                                >
                                    {isAlreadyUpgraded ? t(TEXT_IDS.FUSION_INSTALLED, lang) : canCraft ? t(TEXT_IDS.FUSION_SYNTHESIZE, lang) : t(TEXT_IDS.FUSION_UNAVAILABLE, lang)}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FusionTab;
