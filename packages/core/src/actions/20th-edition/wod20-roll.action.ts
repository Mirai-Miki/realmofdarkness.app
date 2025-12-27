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
import { Wod20DiceService } from "../../services/dice/index";

export class Wod20RollAction {
  private diceService: Wod20DiceService;

  constructor() {
    this.diceService = new Wod20DiceService();
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
  public execute(input: Wod20RollActionInput): Wod20RollActionResult {
    // Execute dice roll via service
    const rollResult = this.diceService.roll({
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
    };

    return result;
  }
}
