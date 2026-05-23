/**
 * Chronicle entity definitions.
 * Defines the Chronicle DTO, Zod schemas, and repository interface.
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
// Chronicle Field Schemas
// ============================================================================

/**
 * Chronicle name with length constraints.
 */
export const ChronicleNameSchema = z
  .string()
  .min(GuildNameConstraints.MinLength)
  .max(GuildNameConstraints.MaxLength);

/**
 * Chronicle icon URL from Discord CDN.
 */
export const ChronicleIconUrlSchema = DiscordCdnUrlOrEmptySchema;

// ============================================================================
// Chronicle DTOs
// ============================================================================

/**
 * Chronicle entity DTO.
 *
 * Represents the full data structure of a Chronicle (game session) configuration.
 */
export const ChronicleDataSchema = z.object({
  id: SnowflakeSchema,
  name: ChronicleNameSchema,
  iconUrl: ChronicleIconUrlSchema,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type ChronicleData = z.infer<typeof ChronicleDataSchema>;

/**
 * Input Data for creating & updating a chronicle.
 *
 * Used by the Chronicle repository for persistence operations.
 */
export const ChronicleRepositoryInputSchema = z.object({
  id: SnowflakeSchema,
  name: ChronicleNameSchema,
  iconUrl: ChronicleIconUrlSchema.optional(),
});
export type ChronicleRepositoryInput = z.infer<
  typeof ChronicleRepositoryInputSchema
>;

export const CreateChronicleInputSchema = ChronicleRepositoryInputSchema.omit({
  id: true,
});
export type CreateChronicleInput = z.infer<typeof CreateChronicleInputSchema>;

// ============================================================================
// Chronicle Repository Interface
// ============================================================================

/**
 * Repository interface for Chronicle entity persistence.
 *
 * Defines the contract for Chronicle data access operations.
 */
export interface IChronicleRepository {
  /**
   * Find a chronicle by its snowflake ID.
   *
   * @param id - Chronicle snowflake ID
   * @returns Chronicle data if found, null otherwise
   */
  findById(id: Snowflake): Promise<ChronicleData | null>;

  /**
   * Find all chronicle IDs.
   *
   * @returns Array of all chronicle IDs
   */
  findAllIds(): Promise<Snowflake[]>;

  /**
   * Create a new chronicle.
   *
   * @param input - Chronicle input data (without timestamps and id)
   * @returns Created chronicle data
   */
  create(input: CreateChronicleInput): Promise<ChronicleData>;

  /**
   * Update an existing chronicle.
   *
   * @param input - Chronicle update input (id required, other fields optional)
   * @param options - Update options
   * @param options.ignoreNotFound - If true, returns null instead of throwing when chronicle doesn't exist
   * @returns Updated chronicle data
   */
  update(input: ChronicleRepositoryInput): Promise<ChronicleData>;
  update(
    input: ChronicleRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<ChronicleData | null>;

  /**
   * Upsert a chronicle.
   * If chronicle exists: updates name and iconUrl.
   * If chronicle doesn't exist: creates new chronicle.
   *
   * @param input - Chronicle data to upsert
   * @returns Upserted chronicle data
   */
  upsert(input: ChronicleRepositoryInput): Promise<ChronicleData>;

  /**
   * Delete a chronicle by ID.
   *
   * @param id - Chronicle snowflake ID
   */
  delete(id: Snowflake): Promise<void>;

  /**
   * Check if a chronicle exists by ID.
   *
   * @param id - Chronicle snowflake ID
   * @returns True if chronicle exists
   */
  exists(id: Snowflake): Promise<boolean>;
}
