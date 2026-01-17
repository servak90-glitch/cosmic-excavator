/**
 * Mathematical Utility Functions for Game Balance
 * 
 * Provides probability distributions and statistical functions
 * for event systems, resource spawning, and game mechanics.
 */

// ============================================================================
// PROBABILITY DISTRIBUTIONS
// ============================================================================

/**
 * Calculates the probability of k events occurring in a Poisson distribution
 * Formula: P(k) = (λ^k × e^(-λ)) / k!
 * 
 * @param k - Number of events
 * @param lambda - Average rate of occurrence
 * @returns Probability value between 0 and 1
 */
export function poissonProbability(k: number, lambda: number): number {
    if (k < 0 || lambda < 0) return 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Calculates the probability of at least one event occurring over time
 * Formula: P(≥1) = 1 - e^(-λt)
 * 
 * Useful for: checking if a random event should trigger this frame
 * 
 * @param lambda - Event rate per hour (e.g., 0.05 = 5% per hour)
 * @param hours - Time period in hours (e.g., deltaTime/3600 for seconds→hours)
 * @returns Probability value between 0 and 1
 * 
 * @example
 * const deltaSeconds = 0.016; // ~60 FPS
 * const deltaHours = deltaSeconds / 3600;
 * const chance = poissonEventChance(0.05, deltaHours);
 * if (Math.random() < chance) { triggerEvent(); }
 */
export function poissonEventChance(lambda: number, hours: number): number {
    if (lambda <= 0 || hours <= 0) return 0;
    return 1 - Math.exp(-lambda * hours);
}

/**
 * Exponential decay function for depth/distance-based probabilities
 * Formula: P(x) = baseChance × e^(-x / scale)
 * 
 * Useful for: rarity increasing with depth, resource scarcity
 * 
 * @param baseChance - Initial probability at x=0
 * @param value - Current value (depth, distance, etc.)
 * @param scale - Decay rate (higher = slower decay)
 * @returns Decayed probability value
 * 
 * @example
 * // Rare artifact: 1% at surface, ~0.37% at 5000m
 * const chance = exponentialDecay(0.01, depth, 5000);
 */
export function exponentialDecay(
    baseChance: number,
    value: number,
    scale: number
): number {
    if (scale <= 0) return 0;
    return baseChance * Math.exp(-value / scale);
}

/**
 * Normal (Gaussian) distribution sample using Box-Muller transform
 * 
 * Useful for: reward amounts, damage variation, natural randomness
 * 
 * @param mean - Center value (μ)
 * @param stdDev - Standard deviation (σ) - spread of values
 * @returns Random value following normal distribution
 * 
 * @example
 * // Reward: 100 ± 25 (95% between 50 and 150)
 * const reward = Math.max(50, Math.min(150, normalDistribution(100, 25)));
 */
export function normalDistribution(mean: number, stdDev: number): number {
    // Box-Muller transform for generating normal distribution
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
}

/**
 * Uniform random value between min and max (inclusive)
 * 
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random value in range [min, max]
 */
export function uniform(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Uniform random integer between min and max (inclusive)
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export function uniformInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// WEIGHTED RANDOM
// ============================================================================

/**
 * Selects a random item from a weighted list
 * Probabilities are automatically normalized: P(item_i) = weight_i / Σ(weights)
 * 
 * @param items - Array of objects with {item, weight}
 * @returns Selected item
 * 
 * @example
 * const loot = weightedRandom([
 *   { item: 'common', weight: 70 },   // 70% chance
 *   { item: 'rare', weight: 25 },     // 25% chance
 *   { item: 'epic', weight: 5 }       // 5% chance
 * ]);
 */
export function weightedRandom<T>(
    items: Array<{ item: T; weight: number }>
): T {
    if (items.length === 0) {
        throw new Error('weightedRandom: items array is empty');
    }

    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

    if (totalWeight <= 0) {
        throw new Error('weightedRandom: total weight must be positive');
    }

    let random = Math.random() * totalWeight;

    for (const { item, weight } of items) {
        random -= weight;
        if (random <= 0) return item;
    }

    // Fallback (should never reach here due to floating point)
    return items[items.length - 1].item;
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Calculates Expected Value (EV) from a list of outcomes
 * Formula: EV = Σ(probability_i × reward_i)
 * 
 * Useful for: balancing risk vs reward, economic validation
 * 
 * @param outcomes - Array of {prob, reward} pairs
 * @returns Expected value
 * 
 * @example
 * // Pirate Raid: 50% success (keep 10k), 50% fail (lose all)
 * const ev = expectedValue([
 *   { prob: 0.5, reward: 10000 },
 *   { prob: 0.5, reward: 0 }
 * ]); // Result: 5000₵ expected
 */
export function expectedValue(
    outcomes: Array<{ prob: number; reward: number }>
): number {
    return outcomes.reduce((sum, o) => sum + (o.prob * o.reward), 0);
}

/**
 * Clamps a value between min and max
 * 
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * 
 * @param start - Start value (at t=0)
 * @param end - End value (at t=1)
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * clamp(t, 0, 1);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Factorial function (n!)
 * Uses memoization for performance
 * 
 * @param n - Non-negative integer
 * @returns n! (factorial)
 */
const factorialCache: Record<number, number> = { 0: 1, 1: 1 };

export function factorial(n: number): number {
    if (n < 0) return 0;
    if (n > 170) return Infinity; // Overflow protection

    // Check cache
    if (factorialCache[n] !== undefined) {
        return factorialCache[n];
    }

    // Calculate and cache
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
        factorialCache[i] = result;
    }

    return result;
}

/**
 * Percentage chance check
 * 
 * @param percent - Percentage (0-100)
 * @returns True if random check succeeds
 * 
 * @example
 * if (percentChance(25)) { // 25% chance
 *   triggerRareEvent();
 * }
 */
export function percentChance(percent: number): boolean {
    return Math.random() * 100 < percent;
}

/**
 * Rolls a dice with N sides
 * 
 * @param sides - Number of sides (e.g., 6 for d6)
 * @returns Random value from 1 to sides (inclusive)
 */
export function rollDice(sides: number): number {
    return uniformInt(1, sides);
}
