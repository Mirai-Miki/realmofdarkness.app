/**
 * Chronicle Member entity definitions.
 * Defines the Chronicle Member DTO, Zod schemas, and repository interface.
 *
 * @packageDocumentation
 */
import { z } from "zod";
import type { Snowflake } from "./primitives";
import {
  SnowflakeSchema,
  UsernameConstraints,
  DiscordCdnUrlMaxLength,
} from "./primitives";

// ============================================================================
// Chronicle Member Field Schemas
// ============================================================================

/**
 * Number of boosts a chronicle member has assigned to this chronicle.
 */
export const ChronicleMemberBoostCountSchema = z.number().int().min(0);

/**
 * Nickname of the member specific to this chronicle.
 */
export const ChronicleMemberNicknameSchema = z
  .string()
  .max(UsernameConstraints.MaxLength);

/**
 * Avatar URL of the member specific to this chronicle.
 */
export const ChronicleMemberAvatarUrlSchema = z
  .string()
  .max(DiscordCdnUrlMaxLength);

// ============================================================================
// Chronicle Member DTOs
// ============================================================================

/**
 * Chronicle Member entity DTO.
 *
 * Represents the full data structure of a user's membership in a chronicle.
 * The `isStoryteller` property is dynamically hydrated by the repository.
 */
export const ChronicleMemberDataSchema = z.object({
  chronicleId: SnowflakeSchema,
  userId: SnowflakeSchema,
  isStoryteller: z.boolean().default(false),
  boosted: ChronicleMemberBoostCountSchema,
  nickname: ChronicleMemberNicknameSchema,
  avatarUrl: ChronicleMemberAvatarUrlSchema,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type ChronicleMemberData = z.infer<typeof ChronicleMemberDataSchema>;

/**
 * Input Data for creating & updating a chronicle member.
 *
 * Used by the Chronicle Member repository for persistence operations.
 * Excludes `isStoryteller` and timestamps, which are handled separately.
 */
export const ChronicleMemberRepositoryInputSchema = z.object({
  chronicleId: SnowflakeSchema,
  userId: SnowflakeSchema,
  nickname: ChronicleMemberNicknameSchema.default(""),
  avatarUrl: ChronicleMemberAvatarUrlSchema.default(""),
  boosted: ChronicleMemberBoostCountSchema.optional(),
});
export type ChronicleMemberRepositoryInput = z.infer<
  typeof ChronicleMemberRepositoryInputSchema
>;

// ============================================================================
// Chronicle Member Repository Interface
// ============================================================================

/**
 * Repository interface for Chronicle Member entity persistence.
 *
 * Defines the contract for Chronicle Member data access operations.
 */
export interface IChronicleMemberRepository {
  /**
   * Find a chronicle member by chronicle ID and user ID.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   * @returns Chronicle member data if found, null otherwise
   */
  findByChronicleAndUser(
    chronicleId: Snowflake,
    userId: Snowflake
  ): Promise<ChronicleMemberData | null>;

  /**
   * Find all members in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of chronicle member data
   */
  findByChronicle(chronicleId: Snowflake): Promise<ChronicleMemberData[]>;

  /**
   * Find all user IDs in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of user snowflake IDs
   */
  findIdsByChronicle(chronicleId: Snowflake): Promise<Snowflake[]>;

  /**
   * Find all chronicles a user is a member of.
   *
   * @param userId - User snowflake ID
   * @returns Array of chronicle member data
   */
  findByUser(userId: Snowflake): Promise<ChronicleMemberData[]>;

  /**
   * Create a new chronicle member.
   *
   * @param input - Chronicle member input data
   * @returns Created chronicle member data
   */
  create(input: ChronicleMemberRepositoryInput): Promise<ChronicleMemberData>;

  /**
   * Update an existing chronicle member.
   *
   * @param input - Chronicle member update input (chronicleId and userId required)
   * @returns Updated chronicle member data
   */
  update(input: ChronicleMemberRepositoryInput): Promise<ChronicleMemberData>;
  update(
    input: ChronicleMemberRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<ChronicleMemberData | null>;

  /**
   * Upsert a chronicle member.
   *
   * @param input - Chronicle member data to upsert
   * @returns Upserted chronicle member data
   */
  upsert(input: ChronicleMemberRepositoryInput): Promise<ChronicleMemberData>;

  /**
   * Delete a chronicle member.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   */
  delete(chronicleId: Snowflake, userId: Snowflake): Promise<void>;

  /**
   * Delete all members for a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   */
  deleteByChronicle(chronicleId: Snowflake): Promise<void>;

  /**
   * Check if a member exists in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   * @returns True if member exists
   */
  exists(chronicleId: Snowflake, userId: Snowflake): Promise<boolean>;

  /**
   * Count the number of members in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Total number of members
   */
  countByChronicle(chronicleId: Snowflake): Promise<number>;

  /**
   * Find all storytellers in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of storyteller chronicle member data
   */
  findStorytellersByChronicle(
    chronicleId: Snowflake
  ): Promise<ChronicleMemberData[]>;

  /**
   * Find all members who have boosted a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of boosted chronicle member data
   */
  findBoostingMembers(chronicleId: Snowflake): Promise<ChronicleMemberData[]>;

  /**
   * Count total boosts assigned by a user across all chronicles.
   *
   * @param userId - User snowflake ID
   * @returns Total number of boosts
   */
  countTotalBoostsByUser(userId: Snowflake): Promise<number>;
}
