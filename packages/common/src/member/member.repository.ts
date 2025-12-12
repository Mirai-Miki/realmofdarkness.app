import type { Snowflake } from "../primitives/index.js";
import type { MemberDto } from "./member.dto.js";

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
 * const newMember = new Member({ ... });
 * await memberRepo.create(newMember);
 * ```
 */
export interface IMemberRepository {
  /**
   * Find a member by their composite key (guild + user).
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns The member if found, null otherwise
   */
  findByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<MemberDto | null>;

  /**
   * Find all members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of member states in the guild (empty if none)
   */
  findByGuild(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all guilds a user is a member of.
   *
   * @param userId - Discord user ID
   * @returns Array of member states for this user (empty if none)
   */
  findByUser(userId: Snowflake): Promise<MemberDto[]>;

  /**
   * Create a new member record.
   *
   * @param member - Member state to create
   * @returns The created member state
   * @throws {RealmError} If member already exists or database error occurs
   */
  create(member: MemberDto): Promise<MemberDto>;

  /**
   * Update an existing member record.
   *
   * @param member - Member state with updated values
   * @returns The updated member state
   * @throws {RealmError} If member does not exist or database error occurs
   */
  update(member: MemberDto): Promise<MemberDto>;

  /**
   * Delete a member record.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @throws {RealmError} If database error occurs
   */
  delete(guildId: Snowflake, userId: Snowflake): Promise<void>;

  /**
   * Delete all member records for a specific guild.
   *
   * @param guildId - Discord guild ID
   * @throws {RealmError} If database error occurs
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
   * @returns Array of admin member states (empty if none)
   */
  findAdminsByGuild(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all storyteller members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of storyteller member DTOs (empty if none)
   */
  findStorytellers(guildId: Snowflake): Promise<MemberDto[]>;

  /**
   * Find all Staff members in a guild.
   *
   * Staff members are those with either admin or storyteller roles.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member states (empty if none)
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
