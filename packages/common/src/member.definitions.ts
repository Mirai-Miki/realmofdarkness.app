import { z } from "zod";
import {
  SnowflakeSchema,
  UsernameConstraints,
  DiscordCdnUrlMaxLength,
} from "./primitives";
import type { Snowflake } from "./primitives";

// ============================================================================
// Member Field Schemas
// ============================================================================

/**
 * Whether the member has admin permissions in this guild.
 */
export const MemberAdminSchema = z.boolean();

/**
 * Array of Discord role IDs the member has in this guild.
 */
export const MemberRoleIdsSchema = z.array(SnowflakeSchema);

/**
 * Number of boosts this user has assigned to this guild.
 */
export const MemberBoostCountSchema = z.int().min(0);

/**
 * Member's nickname in this guild.
 */
export const MemberNicknameSchema = z
  .string()
  .max(UsernameConstraints.MaxLength);

/**
 * Member's avatar URL for this guild.
 */
export const MemberAvatarUrlSchema = z.string().max(DiscordCdnUrlMaxLength);

// ============================================================================
// Member DTOs
// ============================================================================

/**
 * Member entity DTO.
 *
 * Represents the full data structure of a user-guild membership.
 * Domain `Member` class wraps this with permission and boost logic.
 *
 * Uses composite key: userId + guildId
 */
export const MemberDataSchema = z.object({
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema,
  admin: MemberAdminSchema,
  roleIds: MemberRoleIdsSchema,
  boosted: MemberBoostCountSchema,
  nickname: MemberNicknameSchema,
  avatarUrl: MemberAvatarUrlSchema,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type MemberData = z.infer<typeof MemberDataSchema>;

/**
 * Input Data for creating & updating a member.
 *
 * Used by services to validate input before hydrating the Member entity.
 * Does not include date fields as those are managed by the repository.
 */
export const MemberRepositoryInputSchema = z.object({
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema,
  admin: MemberAdminSchema.default(false),
  roleIds: MemberRoleIdsSchema.default([]),
  nickname: MemberNicknameSchema.default(""),
  avatarUrl: MemberAvatarUrlSchema.default(""),
  boosted: MemberBoostCountSchema.optional(),
});
export type MemberRepositoryInput = z.infer<typeof MemberRepositoryInputSchema>;

/**
 * Input DTO for adding a boost to a member.
 *
 * Contains ALL required data including guild ID and user ID.
 */
export const AddBoostInputSchema = z.object({
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
});
export type AddBoostInput = z.infer<typeof AddBoostInputSchema>;

/**
 * Input DTO for removing a boost from a member.
 *
 * Contains ALL required data including guild ID and user ID.
 */
export const RemoveBoostInputSchema = z.object({
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
});
export type RemoveBoostInput = z.infer<typeof RemoveBoostInputSchema>;

/**
 * Input DTO for deleting a member.
 *
 * Contains ALL required data including guild ID and user ID.
 */
export const DeleteMemberInputSchema = z.object({
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
});
export type DeleteMemberInput = z.infer<typeof DeleteMemberInputSchema>;

/**
 * Input DTO for checking if a member exists.
 *
 * Contains ALL required data including guild ID and user ID.
 */
export const MemberExistsInputSchema = z.object({
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
});
export type MemberExistsInput = z.infer<typeof MemberExistsInputSchema>;

// ============================================================================
// Member Repository Interface
// ============================================================================

/**
 * Repository contract for Member persistence operations.
 *
 * Implementations will handle actual data storage (database, cache, etc.).
 * This interface defines the contract that all implementations must follow.
 *
 * Members use a composite key (guildId + userId), so most operations
 * require both values.
 *
 * @example
 * ```typescript
 * const memberRepo = new MemberRepository();
 *
 * // Find a specific member
 * const member = await memberRepo.findByGuildAndUser(guildId, userId);
 *
 * // Get all members in a guild
 * const members = await memberRepo.findByGuild(guildId);
 *
 * // Create new member
 * await memberRepo.create(memberDto);
 * ```
 */
export interface IMemberRepository {
  /**
   * Find a member by their composite key (guild + user).
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns The member data if found, null otherwise
   */
  findByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<MemberData | null>;

  /**
   * Find all members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of member data in the guild (empty if none)
   */
  findByGuild(guildId: Snowflake): Promise<MemberData[]>;

  /**
   * Find all member user IDs in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of user IDs in the guild
   */
  findIdsByGuild(guildId: Snowflake): Promise<Snowflake[]>;

  /**
   * Find all guilds a user is a member of.
   *
   * @param userId - Discord user ID
   * @returns Array of member data for this user (empty if none)
   */
  findByUser(userId: Snowflake): Promise<MemberData[]>;

  /**
   * Create a new member record.
   *
   * @param input - Member creation input data (without timestamps)
   * @returns The created member data with timestamps set by repository
   */
  create(input: MemberRepositoryInput): Promise<MemberData>;

  /**
   * Update an existing member record.
   *
   * @param input - Member update input (userId, guildId required, other fields optional)
   * @param options - Update options
   * @param options.ignoreNotFound - If true, returns null instead of throwing when member doesn't exist
   * @returns The updated member data
   * @throws {RealmError} If update fails or member doesn't exist (unless options.ignoreNotFound is true)
   */
  update(input: MemberRepositoryInput): Promise<MemberData>;
  update(
    input: MemberRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<MemberData | null>;

  /**
   * Upsert a member.
   * If member exists: updates provided fields only if data has changed.
   * If member doesn't exist: creates new member.
   *
   * @param input - Member data to upsert
   * @returns Upserted member data
   */
  upsert(input: MemberRepositoryInput): Promise<MemberData>;

  /**
   * Delete a member record.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   */
  delete(guildId: Snowflake, userId: Snowflake): Promise<void>;

  /**
   * Delete all member records for a specific guild.
   *
   * @param guildId - Discord guild ID
   */
  deleteByGuild(guildId: Snowflake): Promise<void>;

  /**
   * Check if a member exists.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns True if member exists, false otherwise
   */
  exists(guildId: Snowflake, userId: Snowflake): Promise<boolean>;

  /**
   * Count total members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Number of members in the guild
   */
  countByGuild(guildId: Snowflake): Promise<number>;

  /**
   * Find all admin members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of admin member data (empty if none)
   */
  findAdminsByGuild(guildId: Snowflake): Promise<MemberData[]>;

  /**
   * Find all staff members in a guild.
   *
   * Staff members are those with either admin privileges or storyteller roles.
   * Fetches the guild's storyteller roles automatically and checks for intersection.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member data (empty if none)
   */
  findStaffMembers(guildId: Snowflake): Promise<MemberData[]>;

  /**
   * Find all boosting members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of boosting member data (empty if none)
   */
  findBoostingMembers(guildId: Snowflake): Promise<MemberData[]>;

  /**
   * Count the total number of boosts a user has assigned across all guilds.
   *
   * @param userId - Discord user ID
   * @returns Total number of boosts
   */
  countTotalBoostsByUser(userId: Snowflake): Promise<number>;
}
