import type { ICharacter5th } from "./character-5th.definitions.js";

import { z } from "zod";
import { Character5thSchema } from "./character-5th.definitions";
import { Splat } from "../character.definitions";

// ===========================================================================
// 5th Edition Vampire Character Constraints & Schema
// ===========================================================================

export const Vampire5thConstraints = {
  DateOfDeath: { min: 0, max: 20 },
  ApparentAge: { min: 0, max: 50 },
  Sire: { min: 0, max: 50 },
  Hunger: { min: 0, max: 5 },
  BloodPotency: { min: 0, max: 10 },
  Generation: { min: 1, max: 18 },
} as const;

export const Vampire5thDtoSchema = Character5thSchema.extend({
  splat: z.literal(Splat.Vampire5th),
  hunger: z.int().min(0).max(5),
});
export type Vampire5thDto = z.infer<typeof Vampire5thDtoSchema>;

// ============================================================================
// 5th Edition Vampire Character Entity Interface
// ============================================================================

/**
 * Vampire 5th Edition character interface.
 * Extends 5th Edition base with vampire-specific mechanics.
 */
export interface IVampire5th extends ICharacter5th {
  get hunger(): number;

  // Vampire-specific methods
  increaseHunger(amount?: number): number;
  decreaseHunger(amount?: number): number;
  setHunger(value: number): number;

  toDto(): Vampire5thDto;
}
