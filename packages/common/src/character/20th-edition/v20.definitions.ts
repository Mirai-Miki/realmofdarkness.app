import type { ICharacter20th } from "./character-20th.definitions.js";

import { z } from "zod";
import { Character20thSchema } from "./character-20th.definitions.js";
import { Splat } from "../character.definitions.js";

// ===========================================================================
// 20th Edition Vampire Character Constraints & Schema
// ===========================================================================

export const Vampire20thConstraints = {
  BloodPoolCurrent: { min: 0, max: 50 },
  BloodPoolTotal: { min: 1, max: 50 },
} as const;

export const BloodTrackerFieldSchema = z
  .object({
    current: z
      .int()
      .min(Vampire20thConstraints.BloodPoolCurrent.min)
      .max(Vampire20thConstraints.BloodPoolCurrent.max),
    total: z
      .int()
      .min(Vampire20thConstraints.BloodPoolTotal.min)
      .max(Vampire20thConstraints.BloodPoolTotal.max),
  })
  .refine((data) => data.current <= data.total, {
    message: "Current blood cannot exceed maximum blood",
    path: ["current"],
  });
export type BloodTrackerField = z.infer<typeof BloodTrackerFieldSchema>;

export const Vampire20thDtoSchema = Character20thSchema.extend({
  splat: z.literal(Splat.Vampire20th),
  bloodPool: BloodTrackerFieldSchema,
});
export type Vampire20thDto = z.infer<typeof Vampire20thDtoSchema>;

// ============================================================================
// 20th Edition Vampire Character Entity Interface
// ============================================================================

/**
 * Vampire 20th Anniversary character interface.
 * Extends 20th Anniversary base with vampire-specific mechanics.
 */
export interface IVampire20th extends ICharacter20th {
  // Blood pool getters
  get bloodPool(): IBloodTracker;

  // Blood pool methods
  spendBlood(amount: number): void;
  slakeBlood(amount: number): void;
  setCurrentBlood(amount: number): void;
  setBloodPool(current: number, total: number): void;

  toDto(): Vampire20thDto;
}

/**
 * Vampire 20th Blood Pool Tracker Value Object
 */
export interface IBloodTracker extends BloodTrackerField {
  readonly current: number;
  readonly total: number;

  spend(amount: number): IBloodTracker;
  slake(amount: number): IBloodTracker;
  setCurrent(amount: number): IBloodTracker;
  setMax(amount: number): IBloodTracker;
}
