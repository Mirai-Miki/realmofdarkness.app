import { z } from "zod";

import type { Snowflake } from "./primitives";
import { SnowflakeSchema } from "./primitives";

export const SupporterLevel = {
  Base: "base",
  Mortal: "mortal",
  Fledgling: "fledgling",
  Neonate: "neonate",
  Ancilla: "ancilla",
  Elder: "elder",
  Methuselah: "methuselah",
  Antediluvian: "antediluvian",
} as const;

export const SupporterLevelSchema = z.enum(SupporterLevel);
export type SupporterLevel = z.infer<typeof SupporterLevelSchema>;

export const BoostsSchema = z.int().min(0);
export const FirstSupportedSchema = z.date().nullable();

/**
 * Supporter entity DTO schema.
 */
export const SupporterDataSchema = z.object({
  userId: SnowflakeSchema,
  level: SupporterLevelSchema,
  boosts: BoostsSchema,
  firstSupported: FirstSupportedSchema,
});
export type SupporterData = z.infer<typeof SupporterDataSchema>;

/**
 * Input DTO for creating a new supporter.
 */
export const CreateSupporterInputSchema = z.object({
  userId: SnowflakeSchema,
  level: SupporterLevelSchema.default(SupporterLevel.Base),
  boosts: BoostsSchema.default(0),
  firstSupported: FirstSupportedSchema.default(null),
});
export type CreateSupporterInput = z.infer<typeof CreateSupporterInputSchema>;

/**
 * Input DTO for updating a supporter.
 */
export const UpdateSupporterInputSchema = z.object({
  level: SupporterLevelSchema.optional(),
  boosts: BoostsSchema.optional(),
  firstSupported: FirstSupportedSchema.optional(),
});
export type UpdateSupporterInput = z.infer<typeof UpdateSupporterInputSchema>;

/**
 * Repository interface for Supporter entity persistence operations.
 *
 * This interface defines the contract for managing supporter subscriptions,
 * boost allocations, and billing information.
 *
 * @remarks
 * Implementations handle actual data storage (PostgreSQL, REST API, etc.).
 * Separated from User repository to maintain single responsibility.
 *
 * @example
 * ```typescript
 * // In application service
 * class SubscriptionService {
 *   constructor(private supporterRepo: ISupporterRepository) {}
 *
 *   async upgradeSubscription(userId: string, newLevel: SupporterName) {
 *     const supporter = await this.supporterRepo.findByUserId(userId);
 *     if (supporter) {
 *       supporter.updateLevel(newLevel, getBoostsForLevel(newLevel));
 *       await this.supporterRepo.update(supporter);
 *     } else {
 *       await this.supporterRepo.create(new Supporter({ userId, level: newLevel, ... }));
 *     }
 *   }
 * }
 * ```
 */
export interface ISupporterRepository {
  /**
   * Find a supporter by their user ID.
   * If no supporter record exists, returns a default Base tier supporter.
   * This ensures consistency - all users have supporter limits even if not subscribed.
   *
   * @param userId - Discord user snowflake ID
   * @returns Supporter state (never null - defaults to Base tier for non-supporters)
   * @throws {RealmError} If database query fails
   */
  findByUserId(userId: Snowflake): Promise<SupporterData>;

  /**
   * Find all supporters (paginated).
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of supporter states
   * @throws {RealmError} If database query fails
   */
  findAll(limit?: number, offset?: number): Promise<SupporterData[]>;

  /**
   * Find all supporters by tier level.
   *
   * @param level - Supporter tier level
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of supporter states
   * @throws {RealmError} If database query fails
   */
  findByLevel(
    level: SupporterLevel,
    limit?: number,
    offset?: number
  ): Promise<SupporterData[]>;

  /**
   * Find supporters with available boosts.
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of supporter states with totalBoosts > 0
   * @throws {RealmError} If database query fails
   */
  findWithAvailableBoosts(
    limit?: number,
    offset?: number
  ): Promise<SupporterData[]>;

  /**
   * Create a new supporter subscription.
   *
   * @param supporter - Supporter state to create
   * @returns Created supporter state with updated metadata
   * @throws {RealmError} If creation fails or supporter already exists
   */
  create(supporter: SupporterData): Promise<SupporterData>;

  /**
   * Update an existing supporter subscription.
   *
   * @param supporter - Supporter state to update
   * @returns Updated supporter state with refreshed metadata
   * @throws {RealmError} If update fails or supporter doesn't exist
   */
  update(supporter: SupporterData): Promise<SupporterData>;

  /**
   * Delete a supporter subscription (user cancels).
   *
   * @param userId - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   */
  delete(userId: Snowflake): Promise<void>;

  /**
   * Check if a user is a supporter.
   *
   * @param userId - Discord user snowflake ID
   * @returns True if user has an active supporter record
   * @throws {RealmError} If query fails
   */
  exists(userId: Snowflake): Promise<boolean>;

  /**
   * Count total number of supporters.
   *
   * @returns Total supporter count
   * @throws {RealmError} If query fails
   */
  count(): Promise<number>;

  /**
   * Count supporters by tier level.
   *
   * @param level - Supporter tier level
   * @returns Count of supporters at this level
   * @throws {RealmError} If query fails
   */
  countByLevel(level: SupporterLevel): Promise<number>;
}
