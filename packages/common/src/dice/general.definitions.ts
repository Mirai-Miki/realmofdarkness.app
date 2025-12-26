/**
 * General Dice Roller - Dice Contracts
 *
 * Service-level contracts for D&D-style dice rolling.
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

export const GeneralDiceConstraints = {
  DiceSetFormatMaxLength: 9,
  ModifierMin: -1000,
  ModifierMax: 1000,
  DifficultyMin: 1,
  DifficultyMax: 1000,
} as const;

// ============================================================================
// Service Contracts
// ============================================================================

export const DiceSetSchema = z.object({
  count: z.int().min(1).max(50),
  sides: z.int().min(2).max(500),
});
export type DiceSet = z.infer<typeof DiceSetSchema>;

export const GeneralDiceSchema = z.object({
  diceSets: z.array(DiceSetSchema).min(1).max(5),
  modifier: z.int().default(0),
  targetNumber: z.int().optional(),
});
export type GeneralDice = z.infer<typeof GeneralDiceSchema>;

export const DiceSetResultSchema = z.object({
  count: z.int(),
  sides: z.int(),
  results: z.array(z.int()),
  total: z.int(),
});
export type DiceSetResult = z.infer<typeof DiceSetResultSchema>;

export const GeneralDiceResultSchema = z.object({
  sets: z.array(DiceSetResultSchema),
  modifier: z.int(),
  subtotal: z.int(),
  total: z.int(),
  targetNumber: z.int().optional(),
  success: z.boolean().optional(),
});
export type GeneralDiceResult = z.infer<typeof GeneralDiceResultSchema>;

// ============================================================================
// Action Contracts
// ============================================================================

export const GeneralRollActionInputSchema = z.object({
  userId: z.bigint(),
  guildId: z.bigint().optional(),

  diceSets: z.array(DiceSetSchema).min(1).max(5),
  modifier: z.int().default(0),
  targetNumber: z.int().optional(),

  notes: z.string().max(500).optional(),
});
export type GeneralRollActionInput = z.infer<
  typeof GeneralRollActionInputSchema
>;

export const GeneralRollActionResultSchema = z.object({
  roll: GeneralDiceResultSchema,
  notes: z.string().optional(),
});
export type GeneralRollActionResult = z.infer<
  typeof GeneralRollActionResultSchema
>;
