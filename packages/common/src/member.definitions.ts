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
export const MemberAdminField = z.boolean();

/**
 * Array of Discord role IDs the member has in this guild.
 */
export const MemberRoleIdsField = z.array(SnowflakeSchema);

/**
 * Number of boosts this user has assigned to this guild.
 */
export const MemberBoostCountField = z.int().min(0);

/**
 * Member's nickname in this guild.
 */
export const MemberNicknameField = z
  .string()
  .max(UsernameConstraints.MaxLength);

/**
 * Member's avatar URL for this guild.
 */
export const MemberAvatarUrlField = z.string().max(DiscordCdnUrlMaxLength);

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
export const MemberDtoSchema = z.object({
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema,
  admin: MemberAdminField,
  roleIds: MemberRoleIdsField,
  boosted: MemberBoostCountField,
  nickname: MemberNicknameField,
  avatarUrl: MemberAvatarUrlField,
  createdAt: z.date(),
  lastUpdated: z.date(),
});
export type MemberDto = z.infer<typeof MemberDtoSchema>;

/**
 * Input DTO for creating a new member.
 *
 * Used by services to validate input before hydrating the Member entity.
 * Does not include date fields as those are managed by the repository.
 */
export const CreateMemberInputSchema = z.object({
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema,
  admin: MemberAdminField.default(false),
  roleIds: MemberRoleIdsField.default([]),
  boosted: MemberBoostCountField.default(0),
  nickname: MemberNicknameField.default(""),
  avatarUrl: MemberAvatarUrlField.default(""),
});
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

/**
 * Input DTO for syncing member data from Discord.
 *
 * Used when Discord sends updated member information.
 */
export const SyncMemberInputSchema = z.object({
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema,
  admin: MemberAdminField,
  roleIds: MemberRoleIdsField,
  nickname: MemberNicknameField,
  avatarUrl: MemberAvatarUrlField,
});
export type SyncMemberInput = z.infer<typeof SyncMemberInputSchema>;

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
   * @returns The member DTO if found, null otherwise
   */
  findByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<MemberDto | null>;

  /**
   * Find all members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of member DTOs in the guild (empty if none)
   */
  findByGuild(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all guilds a user is a member of.
   *
   * @param userId - Discord user ID
   * @returns Array of member DTOs for this user (empty if none)
   */
  findByUser(userId: Snowflake): Promise<MemberDto[]>;

  /**
   * Create a new member record.
   *
   * @param member - Member DTO to create
   * @returns The created member DTO with timestamps
   */
  create(member: MemberDto): Promise<MemberDto>;

  /**
   * Update an existing member record.
   *
   * @param member - Member DTO with updated values
   * @returns The updated member DTO
   */
  update(member: MemberDto): Promise<MemberDto>;

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
   * @returns Array of admin member DTOs (empty if none)
   */
  findAdminsByGuild(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all staff members in a guild.
   *
   * Staff members are those with either admin privileges or storyteller roles.
   * Fetches the guild's storyteller roles automatically and checks for intersection.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member DTOs (empty if none)
   */
  findStaffMembers(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all boosting members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of boosting member DTOs (empty if none)
   */
  findBoostingMembers(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Count the total number of boosts a user has assigned across all guilds.
   *
   * @param userId - Discord user ID
   * @returns Total number of boosts
   */
  countTotalBoostsByUser(userId: Snowflake): Promise<number>;
}
