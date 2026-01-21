import { CraftingRecipe, ResourceType } from '../types';

/**
 * Crafting Recipes - рецепты для производства расходников в мастерских
 */
export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'craft_repair_kit',
        name: { RU: 'Сборка Ремкомплекта', EN: 'Repair Kit Assembly' },
        description: {
            RU: 'Создает 1 ремкомплект из обломков и железа.',
            EN: 'Creates 1 repair kit from scrap and iron.'
        },
        requiredFacility: 'workshop_facility',
        input: [
            { resource: ResourceType.IRON, amount: 50 },
            { resource: ResourceType.SCRAP, amount: 100 }
        ],
        output: { resource: ResourceType.REPAIR_KIT, amount: 1 }
    },
    {
        id: 'craft_coolant_paste',
        name: { RU: 'Синтез Хладагента', EN: 'Coolant Synthesis' },
        description: {
            RU: 'Создает 1 единицу охлаждающей пасты.',
            EN: 'Creates 1 unit of coolant paste.'
        },
        requiredFacility: 'advanced_workshop',
        input: [
            { resource: ResourceType.ICE, amount: 100 },
            { resource: ResourceType.SCRAP, amount: 200 }
        ],
        output: { resource: ResourceType.COOLANT_PASTE, amount: 1 }
    },
    {
        id: 'craft_advanced_coolant',
        name: { RU: 'Продвинутый Хладагент', EN: 'Advanced Coolant' },
        description: {
            RU: 'Производство высокоэффективного охладителя.',
            EN: 'Production of high-efficiency coolant.'
        },
        requiredFacility: 'advanced_workshop',
        input: [
            { resource: ResourceType.ICE, amount: 200 },
            { resource: ResourceType.TITANIUM, amount: 50 },
            { resource: ResourceType.SCRAP, amount: 500 }
        ],
        output: { resource: ResourceType.ADVANCED_COOLANT, amount: 1 }
    }
];

export function getCraftingRecipeById(id: string): CraftingRecipe | undefined {
    return CRAFTING_RECIPES.find(r => r.id === id);
}

export function canCraftRecipe(recipe: CraftingRecipe, resources: any): boolean {
    for (const item of recipe.input) {
        if ((resources[item.resource] || 0) < item.amount) return false;
    }
    return true;
}
