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
export const GuildNameField = z
  .string()
  .min(GuildNameConstraints.MinLength)
  .max(GuildNameConstraints.MaxLength);

/**
 * Guild icon URL from Discord CDN.
 */
export const GuildIconUrlField = DiscordUrlSchema;

/**
 * Array of role IDs that have storyteller permissions.
 */
export const StorytellerRolesField = z.array(SnowflakeSchema);

// ============================================================================
// Guild DTOs
// ============================================================================

/**
 * Guild entity DTO.
 *
 * Represents the full data structure of a Discord guild configuration.
 * Domain `Guild` class wraps this with role management and settings logic.
 */
export const GuildDtoSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameField,
  iconUrl: GuildIconUrlField,
  storytellerRoleIds: StorytellerRolesField.default([]),
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type GuildDto = z.infer<typeof GuildDtoSchema>;

/**
 * Input DTO for creating a new guild.
 *
 * Used by services to validate input before hydrating the Guild entity.
 * Does not include date fields as those are managed by the repository.
 */
export const CreateGuildInputSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameField,
  iconUrl: GuildIconUrlField,
  storytellerRoleIds: StorytellerRolesField.default([]),
});
export type CreateGuildInput = z.infer<typeof CreateGuildInputSchema>;

/**
 * Input DTO for updating guild settings.
 *
 * Used when syncing guild data from Discord or updating settings.
 * Contains ALL required data including the guild ID.
 */
export const UpdateGuildInputSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameField.optional(),
  iconUrl: GuildIconUrlField.optional(),
  storytellerRoleIds: StorytellerRolesField.optional(),
});
export type UpdateGuildInput = z.infer<typeof UpdateGuildInputSchema>;

/**
 * Input for upserting a guild.
 * Works like update, but creates if guild doesn't exist.
 * - If guild exists: updates provided fields
 * - If guild doesn't exist: creates new guild (storytellerRoleIds defaults to [])
 */
export const UpsertGuildInputSchema = z.object({
  id: SnowflakeSchema,
  name: GuildNameField,
  iconUrl: GuildIconUrlField,
  storytellerRoleIds: StorytellerRolesField.optional(),
});
export type UpsertGuildInput = z.infer<typeof UpsertGuildInputSchema>;

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
  findById(id: Snowflake): Promise<GuildDto | null>;

  /**
   * Create a new guild.
   *
   * @param guild - Guild DTO to create
   * @returns Created guild DTO
   */
  create(guild: GuildDto): Promise<GuildDto>;

  /**
   * Update an existing guild.
   *
   * @param guild - Guild DTO to update
   * @returns Updated guild DTO
   */
  update(guild: GuildDto): Promise<GuildDto>;

  /**
   * Upsert a guild.
   * If guild exists: updates name and iconUrl.
   * If guild doesn't exist: creates new guild.
   *
   * @param input - Guild data to upsert
   * @returns Upserted guild DTO
   */
  upsert(input: UpsertGuildInput): Promise<GuildDto>;

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
