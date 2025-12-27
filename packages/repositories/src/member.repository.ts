import { db, members, guilds } from "@realm/database";
import type { IMemberRepository, MemberData, Snowflake } from "@realm/common";
import { RealmError } from "@realm/common";
import { eq, and, or, gt, sum, sql } from "drizzle-orm";

import { MemberMapper } from "./mappers/member.mapper.js";

/**
 * Repository implementation for Member entities.
 *
 * Handles persistence operations for guild members using the singleton database connection.
 * Returns Member Data that can be hydrated into domain entities.
 * Members have a composite primary key (guildId + userId).
 *
 * @example
 * ```typescript
 * const memberRepo = new MemberRepository();
 *
 * // Find specific member
 * const memberData = await memberRepo.findByGuildAndUser(guildId, userId);
 *
 * // Create member
 * const newMemberData = { ... };
 * await memberRepo.create(newMemberData);
 * ```
 */
export class MemberRepository implements IMemberRepository {
  /**
   * Find a member by their composite key (guild + user).
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns The member Data if found, null otherwise
   */
  public async findByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<MemberData | null> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), eq(members.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return MemberMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find member by guild and user", {
        cause: error,
        fields: { guildId, userId },
      });
    }
  }

  /**
   * Find all members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of members in the guild (empty if none)
   */
  public async findByGuild(guildId: Snowflake): Promise<MemberData[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.guildId, guildId));

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      throw new RealmError("Failed to find members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all guilds a user is a member of.
   *
   * @param userId - Discord user ID
   * @returns Array of member records for this user (empty if none)
   */
  public async findByUser(userId: Snowflake): Promise<MemberData[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.userId, userId));

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      throw new RealmError("Failed to find members by user", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Create a new member record.
   *
   * @param member - Member Data to create
   * @returns The created member Data
   * @throws {RealmError} If member already exists or database error occurs
   */
  public async create(member: MemberData): Promise<MemberData> {
    try {
      const dbRecord = MemberMapper.fromData(member);

      const result = await db.insert(members).values(dbRecord).returning();

      return MemberMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to create member", {
        cause: error,
        fields: {
          guildId: member.guildId,
          userId: member.userId,
        },
      });
    }
  }

  /**
   * Update an existing member record.
   *
   * @param member - Member Data with updated values
   * @returns The updated member Data
   * @throws {RealmError} If member does not exist or database error occurs
   */
  public async update(member: MemberData): Promise<MemberData> {
    try {
      const dbRecord = MemberMapper.fromData(member);

      const result = await db
        .update(members)
        .set({
          ...dbRecord,
          lastUpdated: new Date(),
        })
        .where(
          and(
            eq(members.guildId, member.guildId),
            eq(members.userId, member.userId)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new RealmError("Member not found for update", {
          fields: {
            guildId: member.guildId,
            userId: member.userId,
          },
        });
      }

      return MemberMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to update member", {
        cause: error,
        fields: {
          guildId: member.guildId,
          userId: member.userId,
        },
      });
    }
  }

  /**
   * Delete a member record.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @throws {RealmError} If database error occurs
   */
  public async delete(guildId: Snowflake, userId: Snowflake): Promise<void> {
    try {
      await db
        .delete(members)
        .where(and(eq(members.guildId, guildId), eq(members.userId, userId)));
    } catch (error) {
      throw new RealmError("Failed to delete member", {
        cause: error,
        fields: { guildId, userId },
      });
    }
  }

  /**
   * Check if a member exists.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns True if member exists, false otherwise
   */
  public async exists(guildId: Snowflake, userId: Snowflake): Promise<boolean> {
    try {
      const result = await db
        .select({ guildId: members.guildId })
        .from(members)
        .where(and(eq(members.guildId, guildId), eq(members.userId, userId)))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check member existence", {
        cause: error,
        fields: { guildId, userId },
      });
    }
  }

  /**
   * Count total members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Number of members in the guild
   */
  public async countByGuild(guildId: Snowflake): Promise<number> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.guildId, guildId));

      return result.length;
    } catch (error) {
      throw new RealmError("Failed to count members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all admin members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of admin member Data (empty if none)
   */
  public async findAdminsByGuild(guildId: Snowflake): Promise<MemberData[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), eq(members.admin, true)));

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      throw new RealmError("Failed to find admins by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all staff members in a guild.
   *
   * Staff members are those with either admin privileges or storyteller roles.
   * Fetches the guild's storyteller roles from the database and checks for roleIds intersection.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member Data (empty if none)
   */
  public async findStaffMembers(guildId: Snowflake): Promise<MemberData[]> {
    try {
      // First, get the guild's storyteller role IDs
      const guildResult = await db
        .select({ storytellerRoleIds: guilds.storytellerRoleIds })
        .from(guilds)
        .where(eq(guilds.id, guildId))
        .limit(1);

      if (guildResult.length === 0) {
        // Guild doesn't exist, return empty array
        return [];
      }

      const storytellerRoles = guildResult[0].storytellerRoleIds;

      // Query members who are either admins OR have any storyteller role
      const result = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, guildId),
            or(
              eq(members.admin, true),
              sql`${members.roleIds} && ${storytellerRoles}` // Array overlap: has any storyteller role
            )
          )
        );

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      throw new RealmError("Failed to find staff members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all boosting members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of boosting member Data (empty if none)
   */
  public async findBoostingMembers(guildId: Snowflake): Promise<MemberData[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), gt(members.boosted, 0)));

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      throw new RealmError("Failed to find boosting members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Count the total number of boosts a user has assigned across all guilds.
   *
   * @param userId - Discord user ID
   * @returns Total number of boosts
   */
  public async countTotalBoostsByUser(userId: Snowflake): Promise<number> {
    try {
      const result = await db
        .select({ total: sum(members.boosted) })
        .from(members)
        .where(eq(members.userId, userId));

      // drizzle sum returns string likely, or null if no matches
      return Number(result[0]?.total ?? 0);
    } catch (error) {
      throw new RealmError("Failed to count total boosts by user", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Delete all member records for a specific guild.
   *
   * @param guildId - Discord guild ID
   * @throws {RealmError} If database error occurs
   */
  public async deleteByGuild(guildId: Snowflake): Promise<void> {
    try {
      await db.delete(members).where(eq(members.guildId, guildId));
    } catch (error) {
      throw new RealmError("Failed to delete all members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }
}
