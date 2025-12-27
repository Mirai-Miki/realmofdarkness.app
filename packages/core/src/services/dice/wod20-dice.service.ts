/**
 * World of Darkness 20th Anniversary Dice Service
 *
 * Implements V20/W20 dice mechanics:
 * - Roll d10s, count successes (>= difficulty)
 * - 10s with specialty count as 2 successes
 * - 1s can cancel successes (unless cancelOnes is true)
 * - Botch = no successes + at least one 1
 * - Supports nightmare/paradox dice tracking
 */
import type { Wod20DiceInput, Wod20DiceResult } from "@realm/common";

import { RealmError } from "@realm/common";
import { DiceService } from "./base-dice.service.js";

export class Wod20DiceService extends DiceService {
  /**
   * Roll WoD 20th Anniversary dice pool.
   *
   * @param input - Dice pool configuration
   * @returns Roll result with successes, dice values, and outcome type
   *
   * @example
   * ```typescript
   * const service = new Wod20DiceService();
   * const result = service.roll({
   *   pool: 6,
   *   difficulty: 7,
   *   specialty: true,
   *   willpower: true,
   *   modifier: 0,
   *   nightmareDice: 2,
   *   cancelOnes: false
   * });
   * // Rolls 4 normal dice + 2 nightmare dice
   * // 10s count as 2 successes (specialty)
   * // +1 auto-success from willpower
   * ```
   */
  public roll(input: Wod20DiceInput): Wod20DiceResult {
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
      dice: normalDice,
      nightmareDice,
      successes,
      resultType,
    };
  }
}
