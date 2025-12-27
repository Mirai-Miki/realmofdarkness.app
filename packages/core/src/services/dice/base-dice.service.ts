/**
 * Base Dice Service
 *
 * Abstract base class providing shared dice rolling functionality
 * for all World of Darkness game systems.
 *
 * Uses cryptographically secure random number generation from Node's crypto module.
 */
import type {
  GeneralDice,
  GeneralDiceResult,
  DiceSetResult,
} from "@realm/common";

import { randomInt } from "crypto";

/**
 * Abstract base service for dice rolling across all game systems.
 *
 * Provides:
 * - Cryptographically secure RNG via `generateDice()`
 * - General dice rolling (D&D-style XdY format)
 * - Common utilities for all system-specific implementations
 *
 * @example
 * ```typescript
 * class Wod20DiceService extends DiceService {
 *   roll(input: Wod20DiceInput): Wod20DiceResult {
 *     const dice = this.generateDice(input.pool, 10);
 *     // ... V20 logic
 *   }
 * }
 * ```
 */
export abstract class DiceService {
  /**
   * Generate multiple dice using cryptographically secure RNG.
   *
   * Uses Node's `crypto.randomInt()` to ensure unpredictable,
   * fair dice rolls.
   *
   * @param amount - Number of dice to roll (default: 1)
   * @param sides - Number of sides per die (default: 10)
   * @returns Array of random integers from 1 to sides (inclusive)
   *
   * @example
   * ```typescript
   * const dice = this.generateDice(5, 10); // Roll 5d10
   * // Returns: [7, 3, 10, 4, 6]
   * ```
   */
  protected generateDice(amount: number = 1, sides: number = 10): number[] {
    const results: number[] = [];
    for (let i = 0; i < amount; i++) {
      // randomInt upper bound is exclusive, so sides + 1 gives us 1 to sides
      results.push(randomInt(1, sides + 1));
    }
    return results;
  }

  /**
   * Roll general dice (D&D-style system-agnostic rolling).
   *
   * Supports:
   * - Multiple dice sets (e.g., "3d10 + 2d6")
   * - Flat modifiers
   * - Target number for success checks
   *
   * This method is used by Discord bot commands when players
   * want to roll arbitrary dice outside of WoD mechanics.
   *
   * @param input - Dice sets, modifier, and optional target number
   * @returns Roll results with individual dice, totals, and success state
   *
   * @example
   * ```typescript
   * const result = service.generalRoll({
   *   diceSets: [
   *     { count: 3, sides: 10 },
   *     { count: 2, sides: 6 }
   *   ],
   *   modifier: 5,
   *   targetNumber: 20
   * });
   * // result.total = (3d10 sum) + (2d6 sum) + 5
   * // result.success = (total >= 20)
   * ```
   */
  public generalRoll(input: GeneralDice): GeneralDiceResult {
    const sets: DiceSetResult[] = [];
    let subtotal = 0;

    // Roll each dice set
    for (const diceSet of input.diceSets) {
      const results = this.generateDice(diceSet.amount, diceSet.sides);
      const total = results.reduce((sum, die) => sum + die, 0);
      subtotal += total;

      sets.push({
        amount: diceSet.amount,
        sides: diceSet.sides,
        results,
        total,
      });
    }

    // Apply modifier
    const modifier = input.modifier ?? 0;
    const total = subtotal + modifier;

    // Check success if target number provided
    const success =
      input.targetNumber !== undefined
        ? total >= input.targetNumber
        : undefined;

    return {
      sets,
      modifier,
      subtotal,
      total,
      targetNumber: input.targetNumber,
      success,
    };
  }
}
