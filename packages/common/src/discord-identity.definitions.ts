/**
 * Discord Identity entity definitions.
 * Defines the Discord Identity DTO, Zod schemas, and repository interface.
 *
 * @packageDocumentation
 */
import { z } from "zod";
import type { Snowflake } from "./primitives";
import { SnowflakeSchema } from "./primitives";

// ============================================================================
// Discord Identity DTOs
// ============================================================================

/**
 * Discord Identity entity DTO.
 *
 * Represents the 1:1 mapping between a Discord snowflake ID and a Realm of Darkness user ID.
 */
export const DiscordIdentityDataSchema = z.object({
  discordId: SnowflakeSchema,
  userId: SnowflakeSchema,
  createdAt: z.date(),
});
export type DiscordIdentityData = z.infer<typeof DiscordIdentityDataSchema>;

/**
 * Input Data for creating a discord identity.
 *
 * Used by the Discord Identity repository for persistence operations.
 */
export const DiscordIdentityRepositoryInputSchema = z.object({
  discordId: SnowflakeSchema,
  userId: SnowflakeSchema,
});
export type DiscordIdentityRepositoryInput = z.infer<
  typeof DiscordIdentityRepositoryInputSchema
>;

// ============================================================================
// Discord Identity Repository Interface
// ============================================================================

/**
 * Repository interface for Discord Identity entity persistence.
 *
 * Defines the contract for Discord Identity data access operations.
 */
export interface IDiscordIdentityRepository {
  /**
   * Find a discord identity by its Discord ID.
   *
   * @param discordId - Discord snowflake ID
   * @returns Discord identity data if found, null otherwise
   */
  findByDiscordId(discordId: Snowflake): Promise<DiscordIdentityData | null>;

  /**
   * Find a discord identity by its User ID.
   *
   * @param userId - RoD User snowflake ID
   * @returns Discord identity data if found, null otherwise
   */
  findByUserId(userId: Snowflake): Promise<DiscordIdentityData | null>;

  /**
   * Create a new discord identity.
   *
   * @param input - Discord identity input data
   * @returns Created discord identity data
   */
  create(input: DiscordIdentityRepositoryInput): Promise<DiscordIdentityData>;

  /**
   * Upsert a discord identity.
   *
   * @param input - Discord identity input data
   * @returns Upserted discord identity data
   */
  upsert(input: DiscordIdentityRepositoryInput): Promise<DiscordIdentityData>;

  /**
   * Delete a discord identity by its Discord ID.
   *
   * @param discordId - Discord snowflake ID
   */
  deleteByDiscordId(discordId: Snowflake): Promise<void>;

  /**
   * Delete a discord identity by its User ID.
   *
   * @param userId - RoD User snowflake ID
   */
  deleteByUserId(userId: Snowflake): Promise<void>;

  /**
   * Check if a discord identity exists by Discord ID.
   *
   * @param discordId - Discord snowflake ID
   * @returns True if discord identity exists
   */
  existsByDiscordId(discordId: Snowflake): Promise<boolean>;

  /**
   * Check if a discord identity exists by User ID.
   *
   * @param userId - RoD User snowflake ID
   * @returns True if discord identity exists
   */
  existsByUserId(userId: Snowflake): Promise<boolean>;
}
