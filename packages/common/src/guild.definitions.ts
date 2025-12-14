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
  DISCORD_FIELD_RULES,
} from "./primitives";

// ============================================================================
// Guild Field Schemas
// ============================================================================

/**
 * Guild name with length constraints.
 */
export const GuildNameField = z
  .string()
  .min(DISCORD_FIELD_RULES.guildName.minLength)
  .max(DISCORD_FIELD_RULES.guildName.maxLength);

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
 */
export const UpdateGuildInputSchema = z.object({
  name: GuildNameField.optional(),
  iconUrl: GuildIconUrlField.optional(),
  storytellerRoleIds: StorytellerRolesField.optional(),
});
export type UpdateGuildInput = z.infer<typeof UpdateGuildInputSchema>;

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
