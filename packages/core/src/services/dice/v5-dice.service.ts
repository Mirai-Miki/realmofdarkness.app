/**
 * Vampire: The Masquerade 5th Edition Dice Service
 *
 * Implements V5 dice mechanics:
 * - Roll d10s with normal (black) and hunger (red) dice
 * - Successes on 6+ (including 10s)
 * - Pairs of 10s = critical success (+4 successes total)
 * - Messy Critical: critical with hunger 10s
 * - Bestial Failure: no successes + hunger 1
 * - Total Failure: no successes, no hunger 1
 */
import type { V5Dice, V5DiceResult, V5DiceResultType } from "@realm/common";

import { RealmError } from "@realm/common";
import { DiceService } from "./base-dice.service.js";

export class V5DiceService extends DiceService {
  /**
   * Roll Vampire 5th Edition dice pool.
   *
   * @param input - Dice pool configuration with hunger dice
   * @returns Roll result with successes, criticals, and outcome type
   *
   * @throws {RealmError} If hunger dice exceed total pool
   *
   * @example
   * ```typescript
   * const service = new V5DiceService();
   * const result = service.roll({
   *   pool: 6,
   *   hunger: 2,
   *   difficulty: 3,
   *   specialty: false
   * });
   * // Rolls 4 black dice + 2 red hunger dice
   * // Need 3+ successes to succeed
   * ```
   */
  public roll(input: V5Dice): V5DiceResult {
    const pool = input.pool;
    const hunger = input.hunger ?? 0;
    const difficulty = input.difficulty ?? 1;
    const specialty = input.specialty ?? false;

    // Validate hunger doesn't exceed pool
    if (hunger > pool) {
      throw new RealmError(
        `Hunger dice (${hunger}) cannot exceed total pool (${pool}).`,
        {
          fields: { hunger: hunger.toString(), pool: pool.toString() },
        }
      );
    }

    // Calculate normal (black) dice vs hunger (red) dice
    const normalDiceCount = pool - hunger;

    // Roll dice
    const blackDice = this.generateDice(normalDiceCount, 10);
    const redDice = this.generateDice(hunger, 10);

    // Count successes and criticals
    let successes = 0;
    let normalCriticals = 0;
    let hungerCriticals = 0;
    let hungerOnes = 0;

    // Process black dice
    for (const die of blackDice) {
      if (die >= 6) successes++;
      if (die === 10) normalCriticals++;
    }

    // Process hunger dice
    for (const die of redDice) {
      if (die >= 6) successes++;
      if (die === 10) hungerCriticals++;
      if (die === 1) hungerOnes++;
    }

    // Calculate critical pairs
    const totalCriticals = normalCriticals + hungerCriticals;
    const criticalPairs = Math.floor(totalCriticals / 2);

    // Each pair of 10s adds 2 extra successes (they already counted as 1 each)
    successes += criticalPairs * 2;

    // Add specialty die if applicable
    let poolModified = pool;
    if (specialty) {
      poolModified += 1;
      // Specialty adds one die - for now we'll simulate it as adding 1 success
      // In a real implementation, you'd roll one more die
      // But based on the old bot code, specialty just adds to the pool before rolling
    }

    // Determine result type
    const messyCritical = criticalPairs > 0 && hungerCriticals > 0;
    const bestialFailure = successes === 0 && hungerOnes > 0;
    const totalFailure = successes === 0 && hungerOnes === 0;
    const critical = criticalPairs > 0 && !messyCritical;

    let resultType: V5DiceResultType;
    if (bestialFailure) {
      resultType = "bestialFailure";
    } else if (totalFailure) {
      resultType = "totalFailure";
    } else if (successes < difficulty) {
      resultType = "failure";
    } else if (messyCritical) {
      resultType = "messyCritical";
    } else if (critical) {
      resultType = "critical";
    } else {
      resultType = "success";
    }

    // Calculate margin
    const margin = successes - difficulty;

    // Determine if reroll is possible (any black die < 6)
    const canReroll = blackDice.some((die) => die < 6);
    const failedDiceIndices: number[] = [];
    if (canReroll) {
      blackDice.forEach((die, index) => {
        if (die < 6) failedDiceIndices.push(index);
      });
    }

    return {
      pool,
      normalDice: normalDiceCount,
      hungerDice: hunger,
      difficulty,
      blackDice,
      redDice,
      rerollHistory: [],
      successes,
      criticalPairs,
      margin,
      messyCritical,
      bestialFailure: bestialFailure || false,
      totalFailure: totalFailure || false,
      resultType,
      canReroll,
      failedDiceIndices,
    };
  }
}
