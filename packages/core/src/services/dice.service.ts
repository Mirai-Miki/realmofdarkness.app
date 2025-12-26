/**
 * Dice Rolling Service
 *
 * Handles dice rolling mechanics for all World of Darkness game systems.
 * Uses cryptographically secure random number generation.
 */
import type { Wod20DiceInput, Wod20DiceResult } from "@realm/common";

import { randomInt } from "crypto";
import { RealmError } from "@realm/common";

export class DiceService {
  /**
   * Roll WoD 20th Anniversary dice pool.
   *
   * @param input - Dice pool configuration
   * @returns Roll result with successes, dice values, and outcome type
   */
  Wod20(input: Wod20DiceInput): Wod20DiceResult {
    let successes = 0;
    let ones = 0;
    let tens = 0;

    if (input.pool < input.nightmareDice) {
      throw new RealmError(
        `Nightmare dice (${input.nightmareDice}) cannot exceed total pool (${input.pool}).`
      );
    }

    // Roll normal dice
    const normalDice = this.generateDice(input.pool - input.nightmareDice, 10);
    // Roll nightmare dice (same mechanics but tracked separately)
    const nightmareDice = this.generateDice(input.nightmareDice, 10);

    for (const die of [...normalDice, ...nightmareDice]) {
      if (die === 1) {
        ones++;
      } else if (input.specialty && die === 10) {
        // With specialty, 10s count as 2 successes
        successes++;
        tens++;
      } else if (die >= input.difficulty) {
        // Normal success (including 10s without specialty)
        successes++;
      }
    }

    if (!input.cancelOnes) {
      // Cancel successes with ones
      // Cancel non-ten successes first, then cancel 10s only if needed
      const nonTenSuccesses = successes - tens;
      const cancelledNonTens = Math.min(nonTenSuccesses, ones);
      const remainingOnes = ones - cancelledNonTens;
      const cancelledTens = Math.min(tens, remainingOnes);

      successes -= cancelledNonTens + cancelledTens;
      tens -= cancelledTens;
    }

    // If specialty is active, add remaining tens to successes (they count as 2)
    if (input.specialty && tens > 0) {
      successes += tens;
    }

    // Apply willpower and modifiers (automatic successes)
    const willpowerSpent = input.willpower;
    const modifierApplied = input.modifier;

    if (willpowerSpent) {
      successes++;
    }
    successes += modifierApplied;

    // Determine result type and botch
    // Botch only if no successes AND at least one 1 (and cancelOnes is false)
    const botch = successes === 0 && ones > 0 && !input.cancelOnes;
    let resultType: "botch" | "failure" | "success";
    if (botch) {
      resultType = "botch";
    } else if (successes === 0) {
      resultType = "failure";
    } else {
      resultType = "success";
    }

    return {
      pool: input.pool,
      difficulty: input.difficulty,
      dice: normalDice,
      nightmareDice,
      successes,
      willpowerSpent,
      modifierApplied,
      botch,
      resultType,
    };
  }

  /**
   * Generate multiple dice using cryptographically secure RNG.
   *
   * @param amount - Number of dice to roll (default: 1)
   * @param sides - Number of sides per die (default: 10)
   * @returns Array of random integers from 1 to sides (inclusive)
   * @private
   */
  private generateDice(amount: number = 1, sides: number = 10): number[] {
    const results: number[] = [];
    for (let i = 0; i < amount; i++) {
      // randomInt upper bound is exclusive, so sides + 1 gives us 1 to sides
      results.push(randomInt(1, sides + 1));
    }
    return results;
  }
}
