/**
 * World of Darkness 20th Anniversary Roll Action
 *
 * Coordinates dice rolling for WoD 20th Anniversary system.
 * Executes dice roll via service and returns formatted result.
 *
 * @packageDocumentation
 */

import type {
  Wod20RollActionInput,
  Wod20RollActionResult,
} from "@realm/common";
import { DiceService } from "../../services/dice/dice.service.js";

export class Wod20RollAction {
  private diceService: DiceService;

  constructor() {
    this.diceService = new DiceService();
  }

  /**
   * Execute a WoD 20th Anniversary dice roll.
   *
   * @param input - Roll parameters including pool, difficulty, modifiers (already validated at API/Bot edge)
   * @returns Roll result with dice outcomes and metadata
   *
   * @example
   * ```typescript
   * const action = new Wod20RollAction();
   * const result = action.execute({
   *   userId: 123456789n,
   *   pool: 5,
   *   difficulty: 6,
   *   specialty: false,
   *   willpower: false,
   *   modifier: 0,
   * });
   * console.log(result.roll.successes); // Number of successes rolled
   * ```
   */
  execute(input: Wod20RollActionInput): Wod20RollActionResult {
    // Trust input - already validated at API/Bot edge

    // Execute dice roll via service
    const rollResult = this.diceService.Wod20({
      pool: input.pool,
      difficulty: input.difficulty,
      specialty: input.specialty,
      willpower: input.willpower,
      modifier: input.modifier,
      nightmareDice: input.nightmareDice,
      cancelOnes: input.cancelOnes,
    });

    // Build action result
    const result: Wod20RollActionResult = {
      roll: rollResult,
      characterId: input.characterId,
      notes: input.notes,
    };

    return result;
  }
}
