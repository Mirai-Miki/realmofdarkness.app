/**
 * Vampire: The Masquerade 5th Edition - Dice Contracts
 *
 * Service-level contracts for V5 dice mechanics.
 */

import { z } from "zod";

// ============================================================================
// Standard Roll Service Contracts
// ============================================================================

export const V5DiceInputSchema = z.object({
  pool: z.number().int().min(0).max(50),
  hunger: z.number().int().min(0).max(5).default(0),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),
  bloodSurge: z.number().int().min(0).max(10).optional(),
});
export type V5Dice = z.infer<typeof V5DiceInputSchema>;

export const V5DiceResultType = {
  BestialFailure: "bestialFailure",
  TotalFailure: "totalFailure",
  Failure: "failure",
  Success: "success",
  MessyCritical: "messyCritical",
  Critical: "critical",
} as const;
export const V5DiceResultTypeField = z.enum(V5DiceResultType);
export type V5DiceResultType = z.infer<typeof V5DiceResultTypeField>;

export const BloodSurgeResultSchema = z.object({
  diceAdded: z.number().int().min(1).max(6),
  bloodPotency: z.number().int().min(0).max(10),
});
export type BloodSurgeResult = z.infer<typeof BloodSurgeResultSchema>;

export const V5DiceResultSchema = z.object({
  pool: z.number().int(),
  normalDice: z.number().int(),
  hungerDice: z.number().int(),
  difficulty: z.number().int(),

  blackDice: z.array(z.number().int().min(1).max(10)),
  redDice: z.array(z.number().int().min(1).max(10)),
  rerollHistory: z.array(z.string()).default([]),

  successes: z.number().int().min(0),
  criticalPairs: z.number().int().min(0),
  margin: z.number().int(),

  messyCritical: z.boolean(),
  bestialFailure: z.boolean(),
  totalFailure: z.boolean(),

  resultType: V5DiceResultTypeField,

  bloodSurge: BloodSurgeResultSchema.optional(),

  canReroll: z.boolean(),
  failedDiceIndices: z.array(z.number().int()).default([]),
});
export type V5DiceResult = z.infer<typeof V5DiceResultSchema>;

export const V5RerollDiceSchema = z.object({
  diceIndices: z.array(z.number().int()).min(1).max(3),
  originalRoll: V5DiceResultSchema,
});
export type V5RerollDice = z.infer<typeof V5RerollDiceSchema>;

// ============================================================================
// Rouse Check Service Contracts
// ============================================================================

export const V5RouseDiceSchema = z.object({
  reroll: z.boolean().default(false),
});
export type V5RouseDice = z.infer<typeof V5RouseDiceSchema>;

export const V5RouseResultSchema = z.object({
  die: z.number().int().min(1).max(10),
  rerollDie: z.number().int().min(1).max(10).optional(),
  passed: z.boolean(),
  hungerGained: z.number().int().min(0).max(1),
});
export type V5RouseResult = z.infer<typeof V5RouseResultSchema>;

// ============================================================================
// Remorse Dice Service Contracts
// ============================================================================

export const V5RemorseDiceSchema = z.object({
  humanity: z.number().int().min(0).max(10),
  stains: z.number().int().min(0).max(10),
});
export type V5RemorseDice = z.infer<typeof V5RemorseDiceSchema>;

export const V5RemorseResultSchema = z.object({
  pool: z.number().int().min(0),
  dice: z.array(z.number().int().min(1).max(10)),
  successes: z.number().int().min(0),
  stainsRemoved: z.number().int().min(0),
  humanityLost: z.number().int().min(0).max(1),
  newHumanity: z.number().int().min(0).max(10),
  newStains: z.number().int().min(0).max(10),
});
export type V5RemorseResult = z.infer<typeof V5RemorseResultSchema>;

// ============================================================================
// Compulsion Dice Service Contracts
// ============================================================================

export const Compulsion = {
  Hunger: "Hunger",
  Dominance: "Dominance",
  Harm: "Harm",
  Paranoia: "Paranoia",
} as const;
export const CompulsionSchema = z.enum(Compulsion);
export type Compulsion = z.infer<typeof CompulsionSchema>;

export const ClanCompulsion = {
  Judgment: "Judgment",
  Rebellion: "Rebellion",
  FeralImpulses: "Feral Impulses",
  Morbidity: "Morbidity",
  Ruthlessness: "Ruthlessness",
  Delusion: "Delusion",
  Transgression: "Transgression",
  Cryptophilia: "Cryptophilia",
  Tempting: "Tempting Fate",
  Affective: "Affective Empathy",
  Obsession: "Obsession",
  Perfectionism: "Perfectionism",
  Covetousness: "Covetousness",
  Arrogance: "Arrogance",
  Caitiff: "Caitiff",
} as const;
export const ClanCompulsionSchema = z.enum(ClanCompulsion);
export type ClanCompulsion = z.infer<typeof ClanCompulsionSchema>;

export const V5CompulsionDiceSchema = z.object({
  clan: z.string().optional(),
});
export type V5CompulsionDice = z.infer<typeof V5CompulsionDiceSchema>;

export const V5CompulsionResultSchema = z.object({
  die: z.number().int().min(1).max(10),
  compulsion: z.string(),
  isClanCompulsion: z.boolean(),
});
export type V5CompulsionResult = z.infer<typeof V5CompulsionResultSchema>;

// ============================================================================
// Action Contracts
// ============================================================================

export const V5RollActionInputSchema = z.object({
  userId: z.bigint(),
  characterId: z.number().int().optional(),
  guildId: z.bigint().optional(),

  pool: z.number().int().min(0).max(50),
  difficulty: z.number().int().min(1).max(20).default(1),
  specialty: z.boolean().default(false),

  autoHunger: z.boolean().default(true),
  hungerOverride: z.number().int().min(0).max(5).optional(),

  bloodSurge: z.boolean().default(false),

  notes: z.string().max(500).optional(),
});
export type V5RollActionInput = z.infer<typeof V5RollActionInputSchema>;

export const V5RollActionResultSchema = z.object({
  roll: V5DiceResultSchema,
  characterId: z.number().int().optional(),
  characterName: z.string().optional(),
  hungerBefore: z.number().int().min(0).max(5).optional(),
  hungerAfter: z.number().int().min(0).max(5).optional(),
  notes: z.string().optional(),
});
export type V5RollActionResult = z.infer<typeof V5RollActionResultSchema>;

export const V5RouseActionInputSchema = z.object({
  userId: z.bigint(),
  characterId: z.number().int(),
  reroll: z.boolean().default(false),
});
export type V5RouseActionInput = z.infer<typeof V5RouseActionInputSchema>;

export const V5RouseActionResultSchema = z.object({
  check: V5RouseResultSchema,
  characterId: z.number().int(),
  characterName: z.string(),
  hungerBefore: z.number().int().min(0).max(5),
  hungerAfter: z.number().int().min(0).max(5),
});
export type V5RouseActionResult = z.infer<typeof V5RouseActionResultSchema>;
