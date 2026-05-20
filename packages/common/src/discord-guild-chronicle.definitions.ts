/**
 * Discord Guild Chronicle join table entity definitions.
 * Defines the DTO, Zod schemas, and repository interface for the Many-to-Many relationship.
 *
 * @packageDocumentation
 */
import { z } from "zod";
import type { Snowflake } from "./primitives";
import { SnowflakeSchema } from "./primitives";

// ============================================================================
// Discord Guild Chronicle DTOs
// ============================================================================

/**
 * Discord Guild Chronicle entity DTO.
 *
 * Represents the join table record linking a Discord Guild to a Chronicle.
 */
export const DiscordGuildChronicleDataSchema = z.object({
  discordId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type DiscordGuildChronicleData = z.infer<
  typeof DiscordGuildChronicleDataSchema
>;

/**
 * Input Data for creating & updating a discord guild chronicle link.
 */
export const DiscordGuildChronicleRepositoryInputSchema = z.object({
  discordId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
});
export type DiscordGuildChronicleRepositoryInput = z.infer<
  typeof DiscordGuildChronicleRepositoryInputSchema
>;

// ============================================================================
// Discord Guild Chronicle Repository Interface
// ============================================================================

/**
 * Repository interface for Discord Guild Chronicle persistence.
 *
 * Defines the contract for managing the Many-to-Many relationship between
 * Discord Guilds and Chronicles.
 */
export interface IDiscordGuildChronicleRepository {
  /**
   * Link a discord guild to a chronicle.
   *
   * @param input - Discord guild ID and chronicle ID
   * @returns Created link data
   */
  link(
    input: DiscordGuildChronicleRepositoryInput
  ): Promise<DiscordGuildChronicleData>;

  /**
   * Unlink a discord guild from a chronicle.
   *
   * @param input - Discord guild ID and chronicle ID
   */
  unlink(input: DiscordGuildChronicleRepositoryInput): Promise<void>;

  /**
   * Find all chronicles linked to a specific discord guild.
   *
   * @param discordId - Discord guild snowflake ID
   * @returns Array of link data
   */
  findByDiscordId(discordId: Snowflake): Promise<DiscordGuildChronicleData[]>;

  /**
   * Find all discord guilds linked to a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of link data
   */
  findByChronicleId(
    chronicleId: Snowflake
  ): Promise<DiscordGuildChronicleData[]>;
}
