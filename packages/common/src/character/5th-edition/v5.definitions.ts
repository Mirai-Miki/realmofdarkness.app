import type { ICharacter5th } from "./character-5th.definitions";

import { z } from "zod";
import { Character5thDataSchema } from "./character-5th.definitions";
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

// Individual field schemas for validation
export const HungerDataSchema = z
  .int()
  .min(Vampire5thConstraints.Hunger.min)
  .max(Vampire5thConstraints.Hunger.max);

// Schema for validating hunger increase/decrease amounts
export const HungerAmountSchema = z.int().min(0).max(5);

export const Vampire5thDataSchema = Character5thDataSchema.extend({
  splat: z.literal(Splat.Vampire5th),
  hunger: HungerDataSchema,
});
export type Vampire5thData = z.infer<typeof Vampire5thDataSchema>;

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

  toData(): Vampire5thData;
}
