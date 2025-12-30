/**
 * Guild entity definitions.
 * Defines the Guild DTO, Zod schemas, and repository interface.
 *
 * @packageDocumentation
 */
import type { Snowflake } from "./primitives";

import { z } from "zod";
import {
  SnowflakeSchema,
  DiscordUrlSchema,
  GuildNameConstraints,
} from "./primitives";

// ============================================================================
// Guild Field Schemas
// ============================================================================

/**
 * Guild name with length constraints.
 */
export const GuildNameSchema = z
  .string()
  .min(GuildNameConstraints.MinLength)
  .max(GuildNameConstraints.MaxLength);

/**
 * Guild icon URL from Discord CDN.
 */
export const GuildIconUrlSchema = DiscordUrlSchema;

/**
 * Array of role IDs that have storyteller permissions.
 */
export const StorytellerRolesSchema = z.array(SnowflakeSchema);

// ============================================================================
// Guild DTOs
// ============================================================================

/**
 * Guild entity DTO.
 *
 * Represents the full data structure of a Discord guild configuration.
 * Domain `Guild` class wraps this with role management and settings logic.
 */
export const GuildDataSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameSchema,
  iconUrl: GuildIconUrlSchema,
  storytellerRoleIds: StorytellerRolesSchema.default([]),
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type GuildData = z.infer<typeof GuildDataSchema>;

/**
 * Input Data for creating & updating a guild.
 *
 * Used by the Guild repository for persistence operations.
 */
export const GuildRepositoryInputSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameSchema,
  iconUrl: GuildIconUrlSchema,
  storytellerRoleIds: StorytellerRolesSchema.optional(),
});
export type GuildRepositoryInput = z.infer<typeof GuildRepositoryInputSchema>;

/**
 * Input DTO for adding a storyteller role to a guild.
 *
 * Contains ALL required data including guild and role IDs.
 */
export const AddStorytellerRoleInputSchema = z.object({
  guildId: SnowflakeSchema,
  roleId: SnowflakeSchema,
});
export type AddStorytellerRoleInput = z.infer<
  typeof AddStorytellerRoleInputSchema
>;

/**
 * Input DTO for removing a storyteller role from a guild.
 *
 * Contains ALL required data including guild and role IDs.
 */
export const RemoveStorytellerRoleInputSchema = z.object({
  guildId: SnowflakeSchema,
  roleId: SnowflakeSchema,
});
export type RemoveStorytellerRoleInput = z.infer<
  typeof RemoveStorytellerRoleInputSchema
>;

// ============================================================================
// Guild Repository Interface
// ============================================================================

/**
 * Repository interface for Guild entity persistence.
 *
 * Defines the contract for Guild data access operations.
 * Implementations handle the actual database interactions.
 */
export interface IGuildRepository {
  /**
   * Find a guild by Discord guild ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns Guild data if found, null otherwise
   */
  findById(id: Snowflake): Promise<GuildData | null>;

  /**
   * Create a new guild.
   *
   * @param input - Guild input data (without timestamps)
   * @returns Created guild data
   */
  create(input: GuildRepositoryInput): Promise<GuildData>;

  /**
   * Update an existing guild.
   *
   * @param input - Guild update input (id required, other fields optional)
   * @returns Updated guild data
   */
  update(input: GuildRepositoryInput): Promise<GuildData>;

  /**
   * Upsert a guild.
   * If guild exists: updates name and iconUrl.
   * If guild doesn't exist: creates new guild.
   *
   * @param input - Guild data to upsert
   * @returns Upserted guild data
   */
  upsert(input: GuildRepositoryInput): Promise<GuildData>;

  /**
   * Delete a guild by ID.
   *
   * @param id - Discord guild snowflake ID
   */
  delete(id: Snowflake): Promise<void>;

  /**
   * Check if a guild exists by ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns True if guild exists
   */
  exists(id: Snowflake): Promise<boolean>;
}
