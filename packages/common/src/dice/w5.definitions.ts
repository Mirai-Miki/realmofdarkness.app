/**
 * Werewolf: The Apocalypse 5th Edition - Dice Contracts
 *
 * Service-level contracts for W5 dice mechanics.
 */

import { z } from "zod";

// ============================================================================
// Standard Roll Service Contracts
// ============================================================================

export const W5StandardDiceSchema = z.object({
  pool: z.number().int().min(0).max(50),
  rage: z.number().int().min(0).max(5).default(0),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),
});
export type W5StandardDice = z.infer<typeof W5StandardDiceSchema>;

export const W5ResultType = {
  BrutalFailure: "brutalFailure",
  TotalFailure: "totalFailure",
  Failure: "failure",
  Success: "success",
  RageCritical: "rageCritical",
  Critical: "critical",
} as const;
export const W5ResultTypeField = z.enum(W5ResultType);
export type W5ResultType = z.infer<typeof W5ResultTypeField>;

export const W5StandardResultSchema = z.object({
  pool: z.number().int(),
  normalDice: z.number().int(),
  rageDice: z.number().int(),
  difficulty: z.number().int(),

  blackDice: z.array(z.number().int().min(1).max(10)),
  redDice: z.array(z.number().int().min(1).max(10)),
  rerollHistory: z.array(z.string()).default([]),

  successes: z.number().int().min(0),
  criticalPairs: z.number().int().min(0),
  margin: z.number().int(),

  rageCritical: z.boolean(),
  brutalOutcome: z.boolean(),
  totalFailure: z.boolean(),

  resultType: W5ResultTypeField,

  canReroll: z.boolean(),
  failedDiceIndices: z.array(z.number().int()).default([]),
});
export type W5StandardResult = z.infer<typeof W5StandardResultSchema>;

export const W5RerollDiceSchema = z.object({
  diceIndices: z.array(z.number().int()).min(1).max(3),
  originalRoll: W5StandardResultSchema,
});
export type W5RerollDice = z.infer<typeof W5RerollDiceSchema>;

// ============================================================================
// Rage Check Service Contracts
// ============================================================================

export const W5RageCheckDiceSchema = z.object({
  reroll: z.boolean().default(false),
});
export type W5RageCheckDice = z.infer<typeof W5RageCheckDiceSchema>;

export const W5RageCheckResultSchema = z.object({
  die: z.number().int().min(1).max(10),
  rerollDie: z.number().int().min(1).max(10).optional(),
  passed: z.boolean(),
  rageChanged: z.number().int().min(-1).max(1),
});
export type W5RageCheckResult = z.infer<typeof W5RageCheckResultSchema>;

export const W5DoubleRageCheckDiceSchema = z.object({
  reroll: z.boolean().default(false),
});
export type W5DoubleRageCheckDice = z.infer<typeof W5DoubleRageCheckDiceSchema>;

export const W5DoubleRageCheckResultSchema = z.object({
  firstDie: z.number().int().min(1).max(10),
  secondDie: z.number().int().min(1).max(10),
  rerollFirstDie: z.number().int().min(1).max(10).optional(),
  rerollSecondDie: z.number().int().min(1).max(10).optional(),
  passed: z.boolean(),
  rageChanged: z.number().int().min(-2).max(1),
});
export type W5DoubleRageCheckResult = z.infer<
  typeof W5DoubleRageCheckResultSchema
>;

// ============================================================================
// Action Contracts
// ============================================================================

export const W5RollActionInputSchema = z.object({
  userId: z.bigint(),
  characterId: z.number().int().optional(),
  guildId: z.bigint().optional(),

  pool: z.number().int().min(0).max(50),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),

  autoRage: z.boolean().default(true),
  rageOverride: z.number().int().min(0).max(5).optional(),

  notes: z.string().max(500).optional(),
});
export type W5RollActionInput = z.infer<typeof W5RollActionInputSchema>;

export const W5RollActionResultSchema = z.object({
  roll: W5StandardResultSchema,
  characterId: z.number().int().optional(),
  characterName: z.string().optional(),
  rageBefore: z.number().int().min(0).max(5).optional(),
  rageAfter: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});
export type W5RollActionResult = z.infer<typeof W5RollActionResultSchema>;
