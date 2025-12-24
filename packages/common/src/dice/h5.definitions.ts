/**
 * Hunter: The Vigil 5th Edition - Dice Contracts
 *
 * Service-level contracts for H5 dice mechanics.
 */

import { z } from "zod";

// ============================================================================
// Dice Service Contracts
// ============================================================================

export const H5DiceSchema = z.object({
  pool: z.number().int().min(0).max(50),
  desperation: z.number().int().min(0).max(5).default(0),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),
});
export type H5Dice = z.infer<typeof H5DiceSchema>;

export const H5ResultType = {
  Despair: "despair",
  TotalFailure: "totalFailure",
  Failure: "failure",
  Success: "success",
  CriticalOverreach: "criticalOverreach",
  ChooseYourFate: "chooseYourFate",
  Critical: "critical",
} as const;
export const H5ResultTypeSchema = z.enum(H5ResultType);
export type H5ResultType = z.infer<typeof H5ResultTypeSchema>;

export const H5DiceResultSchema = z.object({
  pool: z.number().int(),
  normalDice: z.number().int(),
  desperationDice: z.number().int(),
  difficulty: z.number().int(),

  blackDice: z.array(z.number().int().min(1).max(10)),
  purpleDice: z.array(z.number().int().min(1).max(10)),
  rerollHistory: z.array(z.string()).default([]),

  successes: z.number().int().min(0),
  criticalPairs: z.number().int().min(0),
  margin: z.number().int(),

  overreach: z.boolean(),
  despair: z.boolean(),
  totalFailure: z.boolean(),

  resultType: H5ResultTypeSchema,

  canReroll: z.boolean(),
  failedDiceIndices: z.array(z.number().int()).default([]),
});
export type H5DiceResult = z.infer<typeof H5DiceResultSchema>;

export const H5RerollDiceSchema = z.object({
  diceIndices: z.array(z.number().int()).min(1).max(3),
  originalRoll: H5DiceResultSchema,
});
export type H5RerollDice = z.infer<typeof H5RerollDiceSchema>;

// ============================================================================
// Action Contracts
// ============================================================================

export const H5RollActionInputSchema = z.object({
  userId: z.bigint(),
  characterId: z.number().int().optional(),
  guildId: z.bigint().optional(),

  pool: z.number().int().min(0).max(50),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),

  autoDesperation: z.boolean().default(true),
  desperationOverride: z.number().int().min(0).max(5).optional(),

  notes: z.string().max(500).optional(),
});
export type H5RollActionInput = z.infer<typeof H5RollActionInputSchema>;

export const H5RollActionResultSchema = z.object({
  roll: H5DiceResultSchema,
  characterId: z.number().int().optional(),
  characterName: z.string().optional(),
  desperationBefore: z.number().int().min(0).max(5).optional(),
  desperationAfter: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});
export type H5RollActionResult = z.infer<typeof H5RollActionResultSchema>;
