/**
 * Discord Guild entity definitions.
 * Defines the Discord Guild DTO, Zod schemas, and repository interface.
 *
 * @packageDocumentation
 */
import { z } from "zod";
import type { Snowflake } from "./primitives";
import {
  SnowflakeSchema,
  DiscordCdnUrlOrEmptySchema,
  GuildNameConstraints,
} from "./primitives";

// ============================================================================
// Discord Guild Field Schemas
// ============================================================================

/**
 * Discord Guild name with length constraints.
 */
export const DiscordGuildNameSchema = z
  .string()
  .min(GuildNameConstraints.MinLength)
  .max(GuildNameConstraints.MaxLength);

/**
 * Discord Guild icon URL from Discord CDN.
 */
export const DiscordGuildIconUrlSchema = DiscordCdnUrlOrEmptySchema;

/**
 * Array of role IDs that have storyteller permissions in the Discord guild.
 */
export const StorytellerRolesSchema = z.array(SnowflakeSchema);

// ============================================================================
// Discord Guild DTOs
// ============================================================================

/**
 * Discord Guild entity DTO.
 *
 * Represents the full data structure of a Discord guild configuration,
 * including its linked chronicle.
 */
export const DiscordGuildDataSchema = z.object({
  discordId: SnowflakeSchema,
  name: DiscordGuildNameSchema,
  iconUrl: DiscordGuildIconUrlSchema,
  storytellerRoleIds: StorytellerRolesSchema.default([]),
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type DiscordGuildData = z.infer<typeof DiscordGuildDataSchema>;

/**
 * Input Data for creating & updating a discord guild.
 *
 * Used by the Discord Guild repository for persistence operations.
 */
export const DiscordGuildRepositoryInputSchema = z.object({
  discordId: SnowflakeSchema,
  name: DiscordGuildNameSchema,
  iconUrl: DiscordGuildIconUrlSchema.optional(),
  storytellerRoleIds: StorytellerRolesSchema.optional(),
});
export type DiscordGuildRepositoryInput = z.infer<
  typeof DiscordGuildRepositoryInputSchema
>;

// ============================================================================
// Discord Guild Repository Interface
// ============================================================================

/**
 * Repository interface for Discord Guild entity persistence.
 *
 * Defines the contract for Discord Guild data access operations.
 */
export interface IDiscordGuildRepository {
  /**
   * Find a discord guild by its Discord ID.
   *
   * @param discordId - Discord guild snowflake ID
   * @returns Discord guild data if found, null otherwise
   */
  findById(discordId: Snowflake): Promise<DiscordGuildData | null>;

  /**
   * Create a new discord guild.
   *
   * @param input - Discord guild input data
   * @returns Created discord guild data
   */
  create(input: DiscordGuildRepositoryInput): Promise<DiscordGuildData>;

  /**
   * Update an existing discord guild.
   *
   * @param input - Discord guild update input (discordId required)
   * @param options - Update options
   * @param options.ignoreNotFound - If true, returns null instead of throwing when guild doesn't exist
   * @returns Updated discord guild data
   */
  update(input: DiscordGuildRepositoryInput): Promise<DiscordGuildData>;
  update(
    input: DiscordGuildRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<DiscordGuildData | null>;

  /**
   * Upsert a discord guild.
   *
   * @param input - Discord guild data to upsert
   * @returns Upserted discord guild data
   */
  upsert(input: DiscordGuildRepositoryInput): Promise<DiscordGuildData>;

  /**
   * Delete a discord guild by its Discord ID.
   *
   * @param discordId - Discord guild snowflake ID
   */
  delete(discordId: Snowflake): Promise<void>;

  /**
   * Check if a discord guild exists by ID.
   *
   * @param discordId - Discord guild snowflake ID
   * @returns True if discord guild exists
   */
  exists(discordId: Snowflake): Promise<boolean>;
}
