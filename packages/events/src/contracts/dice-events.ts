import { z } from "zod";
import { BaseEventSchema } from "./base-event.js";

/**
 * Request to perform a dice roll.
 * Channel: realm:dice:roll:request
 *
 * @remarks
 * This event is domain-focused (game mechanic), not transport-focused.
 * Can be published by API, bot, web app, or any future component.
 *
 * The `rollId` field links requests with results. When publishing a request,
 * generate a UUID and use the same ID to match the corresponding result event.
 *
 * @example
 * ```typescript
 * import { v4 as uuidv4 } from "uuid";
 *
 * const rollId = uuidv4();
 *
 * await client.publish(Channels.DICE_ROLL_REQUEST, DiceRollRequestSchema, {
 *   type: "dice:roll:request",
 *   data: {
 *     rollId,
 *     system: "V5",
 *     pool: 6,
 *     hungerDice: 2,
 *     characterName: "Dracula",
 *   },
 * });
 * ```
 */
export const DiceRollRequestSchema = BaseEventSchema.extend({
  type: z.literal("dice:roll:request"),
  data: z.object({
    /** Unique roll ID for matching request/result */
    rollId: z.uuid(),

    /** Game system */
    system: z.enum(["V5", "V20", "CoD"]),

    /** Number of dice to roll */
    pool: z.int().positive(),

    /** Difficulty (target number) - system-specific */
    difficulty: z.int().optional(),

    /** V5 only: Number of hunger dice */
    hungerDice: z.int().optional(),

    /** Optional: Character rolling dice */
    characterId: z.int().optional(),
    characterName: z.string().optional(),
  }),
});

export type DiceRollRequest = z.infer<typeof DiceRollRequestSchema>;

/**
 * Result of a dice roll.
 * Channel: realm:dice:roll:result
 *
 * @remarks
 * Published by whatever component handles the roll (domain service, bot, etc.).
 * The `rollId` field matches the corresponding request event.
 *
 * Result can be consumed by multiple apps:
 * - Bot posts to Discord
 * - API shows in web UI
 * - Analytics tracks roll statistics
 *
 * @example
 * ```typescript
 * await client.publish(Channels.DICE_ROLL_RESULT, DiceRollResultSchema, {
 *   type: "dice:roll:result",
 *   data: {
 *     rollId, // Matches request
 *     system: "V5",
 *     pool: 6,
 *     results: [10, 8, 6, 5, 3, 1],
 *     successes: 3,
 *     criticals: 1,
 *     messyCritical: false,
 *     bestialFailure: false,
 *   },
 * });
 * ```
 */
export const DiceRollResultSchema = BaseEventSchema.extend({
  type: z.literal("dice:roll:result"),
  data: z.object({
    /** Matches request rollId */
    rollId: z.string().uuid(),

    /** Game system */
    system: z.enum(["V5", "V20", "CoD"]),

    /** Number of dice rolled */
    pool: z.int(),

    /** Difficulty (target number) - system-specific */
    difficulty: z.int().optional(),

    /** Individual die results */
    results: z.array(z.int()),

    /** Total successes */
    successes: z.int(),

    /** Number of critical successes (10s) */
    criticals: z.int().optional(),

    /** V5: Messy critical (10s with hunger dice) */
    messyCritical: z.boolean().optional(),

    /** V5: Bestial failure (0 successes with hunger 1s) */
    bestialFailure: z.boolean().optional(),

    /** V20: Botch (0 successes with 1s) */
    botch: z.boolean().optional(),
  }),
});

export type DiceRollResult = z.infer<typeof DiceRollResultSchema>;

/**
 * Discriminated union of all dice events.
 * Use this for pattern subscriptions (realm:dice:*)
 */
export const DiceEventSchema = z.discriminatedUnion("type", [
  DiceRollRequestSchema,
  DiceRollResultSchema,
]);

export type DiceEvent = z.infer<typeof DiceEventSchema>;
