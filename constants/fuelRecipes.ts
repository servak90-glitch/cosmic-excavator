import { ResourceType } from '../types';
import type { FacilityId, Resources } from '../types';

export interface FuelRecipe {
    id: string;
    name: string;
    input: { resource: ResourceType; amount: number };
    output: { resource: ResourceType; amount: number };
    description: string;
    requiredFacility: FacilityId | null;  // null = доступен всегда
}

// Рецепты переработки
export const FUEL_RECIPES: FuelRecipe[] = [
    {
        id: 'clay_to_oil',
        name: 'Глина → Нефть',
        input: { resource: ResourceType.CLAY, amount: 100 },
        output: { resource: ResourceType.OIL, amount: 10 },
        description: 'Переработка глины в сырую нефть (10:1)',
        requiredFacility: 'basic_refinery'
    },
    {
        id: 'stone_to_gas',
        name: 'Камень → Газ',
        input: { resource: ResourceType.STONE, amount: 50 },
        output: { resource: ResourceType.GAS, amount: 10 },
        description: 'Газификация камня (5:1)',
        requiredFacility: 'basic_refinery'
    },
    {
        id: 'coal_to_oil',
        name: 'Уголь → Нефть',
        input: { resource: ResourceType.COAL, amount: 20 },
        output: { resource: ResourceType.OIL, amount: 15 },
        description: 'Ликвефакция угля (4:3, эффективнее)',
        requiredFacility: 'advanced_refinery'
    }
];

/**
 * Найти рецепт по ID
 */
export function getRecipeById(id: string): FuelRecipe | undefined {
    return FUEL_RECIPES.find(r => r.id === id);
}

/**
 * Проверить возможность крафта
 */
export function canCraftRecipe(
    recipe: FuelRecipe,
    resources: Partial<Resources>,
    facilities: FacilityId[] = []
): boolean {
    // Проверка facility
    if (recipe.requiredFacility && !facilities.includes(recipe.requiredFacility)) {
        return false;
    }

    // Проверка ресурсов
    const available = resources[recipe.input.resource] || 0;
    return available >= recipe.input.amount;
}
