/**
 * World of Darkness 20th Anniversary Roll Action
 *
 * Coordinates dice rolling for WoD 20th Anniversary system.
 * Validates input, executes dice roll via service, and returns formatted result.
 *
 * @packageDocumentation
 */

import type {
  Wod20RollActionInput,
  Wod20RollActionResult,
} from "@realm/common";
import { Wod20RollActionInputSchema, UserError } from "@realm/common";
import { DiceService } from "../../services/dice.service.js";

export class Wod20RollAction {
  private diceService: DiceService;

  constructor() {
    this.diceService = new DiceService();
  }

  /**
   * Execute a WoD 20th Anniversary dice roll.
   *
   * @param input - Roll parameters including pool, difficulty, modifiers
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
    // Validate input at convergence point
    const validationResult = Wod20RollActionInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new UserError("Invalid roll input", {
        fields: {
          validationErrors: JSON.stringify(validationResult.error.issues),
        },
      });
    }
    const validated = validationResult.data;

    // Execute dice roll via service
    const rollResult = this.diceService.Wod20({
      pool: validated.pool,
      difficulty: validated.difficulty,
      specialty: validated.specialty,
      willpower: validated.willpower,
      modifier: validated.modifier,
      nightmareDice: validated.nightmareDice,
      cancelOnes: validated.cancelOnes,
    });

    // Build action result
    const result: Wod20RollActionResult = {
      roll: rollResult,
      characterId: validated.characterId,
      notes: validated.notes,
    };

    return result;
  }
}
