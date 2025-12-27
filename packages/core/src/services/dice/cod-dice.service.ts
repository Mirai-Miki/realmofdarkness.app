/**
 * Chronicles of Darkness Dice Service
 *
 * Implements CoD 2e dice mechanics:
 * - Roll d10s, count successes (>= target, default 8)
 * - 10-again: reroll 10s (or 9-again with specialty, 8-again with quality)
 * - Rote action: reroll all failures once
 * - Chance die: when pool ≤ 0, roll 1 die (10 = dramatic success, 1 = dramatic failure)
 * - Exceptional success: 5+ successes
 */
import type { CodDice, CodDiceResult, CodResultType } from "@realm/common";

import { DiceService } from "./base-dice.service.js";

export class CodDiceService extends DiceService {
  /**
   * Roll Chronicles of Darkness dice pool.
   *
   * @param input - Dice pool configuration with CoD-specific mechanics
   * @returns Roll result with successes, rerolls, and outcome type
   *
   * @example
   * ```typescript
   * const service = new CodDiceService();
   * const result = service.roll({
   *   pool: 6,
   *   bonus: 2,
   *   penalty: 1,
   *   targetNumber: 8,
   *   rerollThreshold: 10, // 10-again
   *   rote: false,
   *   willpower: true,
   *   specialty: false
   * });
   * // Effective pool: 6 + 2 - 1 = 7
   * // Successes on 8+, reroll 10s
   * // +3 successes from willpower
   * ```
   */
  public roll(input: CodDice): CodDiceResult {
    const basePool = input.pool ?? 0;
    const bonus = input.bonus ?? 0;
    const penalty = input.penalty ?? 0;
    const targetNumber = input.targetNumber ?? 8;
    let rerollThreshold = input.rerollThreshold ?? 10;
    const rote = input.rote ?? false;
    const willpower = input.willpower ?? false;
    const specialty = input.specialty ?? false;

    // Specialty gives 9-again instead of 10-again
    if (specialty && rerollThreshold === 10) {
      rerollThreshold = 9;
    }

    // Calculate final pool
    let finalPool = basePool + bonus - penalty;
    const isChanceDie = finalPool <= 0;

    // Chance die: always roll exactly 1 die
    if (isChanceDie) {
      finalPool = 1;
    }

    // Roll initial dice
    const initialDice = this.generateDice(finalPool, 10);
    const roteDice: number[] = [];
    const cascadeRerolls: number[] = [];

    let successes = 0;
    let tens = 0;

    // Process initial dice
    for (const die of initialDice) {
      if (die >= targetNumber) successes++;
      if (die === 10) tens++;
    }

    // Rote action: reroll all failures once (only if not chance die)
    if (rote && !isChanceDie) {
      const failures = initialDice.filter((die) => die < targetNumber);
      if (failures.length > 0) {
        const roteRerolls = this.generateDice(failures.length, 10);
        roteDice.push(...roteRerolls);

        for (const die of roteRerolls) {
          if (die >= targetNumber) successes++;
          if (die === 10) tens++;
        }
      }
    }

    // Cascade rerolls (X-again mechanic)
    // Collect all dice that meet reroll threshold from initial + rote
    let rerollableDice = [
      ...initialDice.filter((die) => die >= rerollThreshold),
      ...roteDice.filter((die) => die >= rerollThreshold),
    ];

    // Keep rerolling until no more dice meet threshold
    while (rerollableDice.length > 0) {
      const rerolls = this.generateDice(rerollableDice.length, 10);
      cascadeRerolls.push(...rerolls);

      for (const die of rerolls) {
        if (die >= targetNumber) successes++;
        if (die === 10) tens++;
      }

      // Check if any of these rerolls also meet threshold
      rerollableDice = rerolls.filter((die) => die >= rerollThreshold);
    }

    // Add willpower (3 bonus dice that also contribute to 10-again)
    if (willpower && !isChanceDie) {
      const willpowerDice = this.generateDice(3, 10);
      cascadeRerolls.push(...willpowerDice);

      for (const die of willpowerDice) {
        if (die >= targetNumber) successes++;
        if (die === 10) tens++;
      }

      // Willpower dice can also trigger X-again
      let wpRerollable = willpowerDice.filter((die) => die >= rerollThreshold);
      while (wpRerollable.length > 0) {
        const wpRerolls = this.generateDice(wpRerollable.length, 10);
        cascadeRerolls.push(...wpRerolls);

        for (const die of wpRerolls) {
          if (die >= targetNumber) successes++;
          if (die === 10) tens++;
        }

        wpRerollable = wpRerolls.filter((die) => die >= rerollThreshold);
      }
    }

    // Determine result type
    let resultType: CodResultType;

    if (isChanceDie) {
      // Chance die special rules
      if (initialDice[0] === 10) {
        resultType = "exceptionalSuccess"; // Dramatic success on chance die
        successes = 1;
      } else if (initialDice[0] === 1) {
        resultType = "dramaticFailure";
        successes = 0;
      } else if (initialDice[0] >= targetNumber) {
        resultType = "success";
        successes = 1;
      } else {
        resultType = "failure";
        successes = 0;
      }
    } else {
      // Normal roll
      if (successes >= 5) {
        resultType = "exceptionalSuccess";
      } else if (successes > 0) {
        resultType = "success";
      } else if (initialDice.includes(1) && !rote) {
        // Dramatic failure only on regular failure with 1 (not on rote)
        resultType = "dramaticFailure";
      } else {
        resultType = "failure";
      }
    }

    // Combine all dice for display
    const allDice = [...initialDice, ...roteDice, ...cascadeRerolls];

    return {
      pool: basePool,
      finalPool,
      targetNumber,
      rerollThreshold,
      isChanceDie,
      initialDice,
      roteDice,
      cascadeRerolls,
      allDice,
      successes,
      tens,
      willpowerSpent: willpower,
      resultType,
    };
  }
}
