/**
 * Werewolf: The Apocalypse 5th Edition Dice Service
 *
 * Implements W5 dice mechanics (same as V5 but with Rage dice instead of Hunger):
 * - Roll d10s with normal (black) and rage (red) dice
 * - Successes on 6+ (including 10s)
 * - Pairs of 10s = critical success (+4 successes total)
 * - Rage Critical: critical with rage 10s (triggers Rage)
 * - Brutal Failure: no successes + rage 1 (triggers Rage)
 * - Total Failure: no successes, no rage 1
 */
import type {
  W5StandardDice,
  W5StandardResult,
  W5ResultType,
} from "@realm/common";

import { RealmError } from "@realm/common";
import { DiceService } from "./base-dice.service.js";

export class W5DiceService extends DiceService {
  /**
   * Roll Werewolf 5th Edition dice pool.
   *
   * @param input - Dice pool configuration with rage dice
   * @returns Roll result with successes, criticals, and outcome type
   *
   * @throws {RealmError} If rage dice exceed total pool
   *
   * @example
   * ```typescript
   * const service = new W5DiceService();
   * const result = service.roll({
   *   pool: 7,
   *   rage: 3,
   *   difficulty: 2,
   *   specialty: false
   * });
   * // Rolls 4 black dice + 3 red rage dice
   * // Need 2+ successes to succeed
   * ```
   */
  public roll(input: W5StandardDice): W5StandardResult {
    const pool = input.pool;
    const rage = input.rage ?? 0;
    const difficulty = input.difficulty ?? 1;

    // Validate rage doesn't exceed pool
    if (rage > pool) {
      throw new RealmError(
        `Rage dice (${rage}) cannot exceed total pool (${pool}).`,
        {
          fields: { rage: rage.toString(), pool: pool.toString() },
        }
      );
    }

    // Calculate normal (black) dice vs rage (red) dice
    const normalDiceCount = pool - rage;

    // Roll dice
    const blackDice = this.generateDice(normalDiceCount, 10);
    const redDice = this.generateDice(rage, 10);

    // Count successes and criticals
    let successes = 0;
    let normalCriticals = 0;
    let rageCriticals = 0;
    let rageOnes = 0;

    // Process black dice
    for (const die of blackDice) {
      if (die >= 6) successes++;
      if (die === 10) normalCriticals++;
    }

    // Process rage dice
    for (const die of redDice) {
      if (die >= 6) successes++;
      if (die === 10) rageCriticals++;
      if (die === 1) rageOnes++;
    }

    // Calculate critical pairs
    const totalCriticals = normalCriticals + rageCriticals;
    const criticalPairs = Math.floor(totalCriticals / 2);

    // Each pair of 10s adds 2 extra successes (they already counted as 1 each)
    successes += criticalPairs * 2;

    // Determine result type
    const rageCritical = criticalPairs > 0 && rageCriticals > 0;
    const brutalOutcome = successes === 0 && rageOnes > 0; // Brutal Failure
    const totalFailure = successes === 0 && rageOnes === 0;
    const critical = criticalPairs > 0 && !rageCritical;

    let resultType: W5ResultType;
    if (brutalOutcome) {
      resultType = "brutalFailure";
    } else if (totalFailure) {
      resultType = "totalFailure";
    } else if (successes < difficulty) {
      resultType = "failure";
    } else if (rageCritical) {
      resultType = "rageCritical";
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
      rageDice: rage,
      difficulty,
      blackDice,
      redDice,
      rerollHistory: [],
      successes,
      criticalPairs,
      margin,
      rageCritical,
      brutalOutcome,
      totalFailure: totalFailure || false,
      resultType,
      canReroll,
      failedDiceIndices,
    };
  }
}
