/**
 * Zod validation schemas and TypeScript types for World of Darkness 20th Anniversary Edition dice rolling.
 *
 * @packageDocumentation
 */

import { z } from "zod";
import { SnowflakeSchema } from "../primitives/index.js";

// ============================================================================
// Constants
// ============================================================================

export const Wod20DiceConstraints = {
  PoolMin: 1,
  PoolMax: 50,
  DifficultyMin: 2,
  DifficultyMax: 10,
  DifficultyDefault: 6,
  ModifierMin: -10,
  ModifierMax: 10,
  NightmareDiceMin: 1,
  NightmareDiceMax: 50,
  SpecialtyMaxLength: 100,
} as const;

// ============================================================================
// Field Schemas
// ============================================================================

export const Wod20DicePoolField = z
  .int()
  .min(Wod20DiceConstraints.PoolMin)
  .max(Wod20DiceConstraints.PoolMax);

export const Wod20DifficultyField = z
  .int()
  .min(Wod20DiceConstraints.DifficultyMin)
  .max(Wod20DiceConstraints.DifficultyMax);

export const Wod20ModifierField = z
  .int()
  .min(Wod20DiceConstraints.ModifierMin)
  .max(Wod20DiceConstraints.ModifierMax);

export const Wod20NightmareDiceField = z
  .int()
  .min(Wod20DiceConstraints.NightmareDiceMin)
  .max(Wod20DiceConstraints.NightmareDiceMax);

export const Wod20DieResultField = z.int().min(1).max(10);

export const Wod20SpecialtyField = z.boolean();
export const Wod20WillpowerField = z.boolean();

// ============================================================================
// Service Schemas
// ============================================================================

export const Wod20DiceInputSchema = z.object({
  pool: Wod20DicePoolField,
  difficulty: Wod20DifficultyField.default(
    Wod20DiceConstraints.DifficultyDefault
  ),
  specialty: Wod20SpecialtyField.default(false),
  willpower: Wod20WillpowerField.default(false),
  modifier: Wod20ModifierField.default(0),
  nightmareDice: Wod20NightmareDiceField.default(0),
  cancelOnes: z.boolean().default(false),
});
export type Wod20DiceInput = z.infer<typeof Wod20DiceInputSchema>;

export const Wod20DiceResultType = {
  Botch: "botch",
  Failure: "failure",
  Success: "success",
} as const;
export const Wod20DiceResultTypeField = z.enum(Wod20DiceResultType);
export type Wod20DiceResultType = z.infer<typeof Wod20DiceResultTypeField>;

export const Wod20DiceResultSchema = z.object({
  dice: z.array(Wod20DieResultField),
  nightmareDice: z.array(Wod20DieResultField),
  successes: z.int(),
  resultType: Wod20DiceResultTypeField,
});
export type Wod20DiceResult = z.infer<typeof Wod20DiceResultSchema>;

// ============================================================================
// Action Schemas
// ============================================================================

export const Wod20RollActionInputSchema = z
  .object({
    userId: SnowflakeSchema,
    characterId: z.int().optional(),
    guildId: SnowflakeSchema.optional(),
    pool: Wod20DicePoolField,
    nightmareDice: Wod20NightmareDiceField.default(0),
    difficulty: Wod20DifficultyField.default(
      Wod20DiceConstraints.DifficultyDefault
    ),
    specialty: Wod20SpecialtyField.default(false),
    willpower: Wod20WillpowerField.default(false),
    modifier: Wod20ModifierField.default(0),
    cancelOnes: z.boolean().default(false),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.pool >= data.nightmareDice, {
    message: "Pool must be greater than or equal to nightmare dice",
    path: ["nightmareDice"],
  });
export type Wod20RollActionInput = z.infer<typeof Wod20RollActionInputSchema>;

export const Wod20RollActionResultSchema = z.object({
  roll: Wod20DiceResultSchema,
  characterId: z.int().optional(),
  characterName: z.string().optional(),
  notes: z.string().optional(),
});
export type Wod20RollActionResult = z.infer<typeof Wod20RollActionResultSchema>;
