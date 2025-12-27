/**
 * Chronicles of Darkness - Dice Contracts
 *
 * Service-level contracts for CoD dice mechanics.
 */

import { z } from "zod";

// ============================================================================
// Dice Service Contracts
// ============================================================================

export const CodDiceSchema = z.object({
  pool: z.int().min(0).max(50),
  bonus: z.int().default(0),
  penalty: z.int().default(0),
  targetNumber: z.int().min(2).max(10).default(8),
  rerollThreshold: z.int().min(8).max(10).default(10),
  rote: z.boolean().default(false),
  willpower: z.boolean().default(false),
  specialty: z.boolean().default(false),
});
export type CodDice = z.infer<typeof CodDiceSchema>;

export const CodResultType = {
  DramaticFailure: "dramaticFailure",
  Failure: "failure",
  Success: "success",
  ExceptionalSuccess: "exceptionalSuccess",
} as const;
export const CodResultTypeSchema = z.enum(CodResultType);
export type CodResultType = z.infer<typeof CodResultTypeSchema>;

export const CodDiceResultSchema = z.object({
  pool: z.int(),
  finalPool: z.int(),
  targetNumber: z.int(),
  rerollThreshold: z.int(),

  isChanceDie: z.boolean(),

  initialDice: z.array(z.int().min(1).max(10)),
  roteDice: z.array(z.int().min(1).max(10)).default([]),
  cascadeRerolls: z.array(z.int().min(1).max(10)).default([]),
  allDice: z.array(z.int().min(1).max(10)),

  successes: z.int().min(0),
  tens: z.int().min(0),

  willpowerSpent: z.boolean(),
  resultType: CodResultTypeSchema,
});
export type CodDiceResult = z.infer<typeof CodDiceResultSchema>;

// ============================================================================
// Action Contracts
// ============================================================================

export const CoDRollActionInputSchema = z.object({
  userId: z.bigint(),
  characterId: z.int().optional(),
  guildId: z.bigint().optional(),

  pool: z.int().min(0).max(50),
  bonus: z.int().default(0),
  penalty: z.int().default(0),
  specialty: z.boolean().default(false),
  willpower: z.boolean().default(false),
  rote: z.boolean().default(false),

  notes: z.string().max(500).optional(),
});
export type CoDRollActionInput = z.infer<typeof CoDRollActionInputSchema>;

export const CoDRollActionResultSchema = z.object({
  roll: CodDiceResultSchema,
  characterId: z.int().optional(),
  characterName: z.string().optional(),
  willpowerBefore: z.int().min(0).max(10).optional(),
  willpowerAfter: z.int().min(0).max(10).optional(),
  notes: z.string().optional(),
});
export type CoDRollActionResult = z.infer<typeof CoDRollActionResultSchema>;
