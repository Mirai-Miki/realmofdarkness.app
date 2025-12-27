/**
 * Hunter: The Vigil 5th Edition Dice Service
 *
 * Implements H5 dice mechanics (same as V5 but with Desperation dice instead of Hunger):
 * - Roll d10s with normal (black) and desperation (purple) dice
 * - Successes on 6+ (including 10s)
 * - Pairs of 10s = critical success (+4 successes total)
 * - Critical Overreach: critical with desperation 10s (player chooses effect)
 * - Despair: no successes + desperation 1 (bad outcome)
 * - Total Failure: no successes, no desperation 1
 * - Choose Your Fate: critical with desperation 10s AND normal 10s (special outcome)
 */
import type { H5Dice, H5DiceResult, H5ResultType } from "@realm/common";

import { RealmError } from "@realm/common";
import { DiceService } from "./base-dice.service.js";

export class H5DiceService extends DiceService {
  /**
   * Roll Hunter 5th Edition dice pool.
   *
   * @param input - Dice pool configuration with desperation dice
   * @returns Roll result with successes, criticals, and outcome type
   *
   * @throws {RealmError} If desperation dice exceed total pool
   *
   * @example
   * ```typescript
   * const service = new H5DiceService();
   * const result = service.roll({
   *   pool: 5,
   *   desperation: 2,
   *   difficulty: 3,
   *   specialty: false
   * });
   * // Rolls 3 black dice + 2 purple desperation dice
   * // Need 3+ successes to succeed
   * ```
   */
  public roll(input: H5Dice): H5DiceResult {
    const pool = input.pool;
    const desperation = input.desperation ?? 0;
    const difficulty = input.difficulty ?? 1;

    // Validate desperation doesn't exceed pool
    if (desperation > pool) {
      throw new RealmError(
        `Desperation dice (${desperation}) cannot exceed total pool (${pool}).`,
        {
          fields: {
            desperation: desperation.toString(),
            pool: pool.toString(),
          },
        }
      );
    }

    // Calculate normal (black) dice vs desperation (purple) dice
    const normalDiceCount = pool - desperation;

    // Roll dice
    const blackDice = this.generateDice(normalDiceCount, 10);
    const purpleDice = this.generateDice(desperation, 10);

    // Count successes and criticals
    let successes = 0;
    let normalCriticals = 0;
    let desperationCriticals = 0;
    let desperationOnes = 0;

    // Process black dice
    for (const die of blackDice) {
      if (die >= 6) successes++;
      if (die === 10) normalCriticals++;
    }

    // Process desperation dice
    for (const die of purpleDice) {
      if (die >= 6) successes++;
      if (die === 10) desperationCriticals++;
      if (die === 1) desperationOnes++;
    }

    // Calculate critical pairs
    const totalCriticals = normalCriticals + desperationCriticals;
    const criticalPairs = Math.floor(totalCriticals / 2);

    // Each pair of 10s adds 2 extra successes (they already counted as 1 each)
    successes += criticalPairs * 2;

    // Determine result type
    const overreach = criticalPairs > 0 && desperationCriticals > 0; // Critical Overreach
    const despair = successes === 0 && desperationOnes > 0; // Despair
    const totalFailure = successes === 0 && desperationOnes === 0;
    const chooseYourFate =
      criticalPairs > 0 && desperationCriticals > 0 && normalCriticals > 0;
    const critical = criticalPairs > 0 && !overreach;

    let resultType: H5ResultType;
    if (despair) {
      resultType = "despair";
    } else if (totalFailure) {
      resultType = "totalFailure";
    } else if (successes < difficulty) {
      resultType = "failure";
    } else if (chooseYourFate) {
      resultType = "chooseYourFate";
    } else if (overreach) {
      resultType = "criticalOverreach";
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
      desperationDice: desperation,
      difficulty,
      blackDice,
      purpleDice,
      rerollHistory: [],
      successes,
      criticalPairs,
      margin,
      overreach,
      despair: despair || false,
      totalFailure: totalFailure || false,
      resultType,
      canReroll,
      failedDiceIndices,
    };
  }
}
