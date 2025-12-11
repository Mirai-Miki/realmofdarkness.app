import { db, members } from "@realm/database";
import type { IMemberRepository } from "@realm/core";
import type { Member } from "@realm/core";
import type { Snowflake } from "@realm/core";
import { RealmError } from "@realm/errors";
import { eq, and, or, gt, sum } from "drizzle-orm";

import { MemberMapper } from "./mappers/member.mapper.js";

/**
 * Repository implementation for Member entities.
 *
 * Handles persistence operations for guild members using the singleton database connection.
 * Members have a composite primary key (guildId + userId).
 *
 * @example
 * ```typescript
 * const memberRepo = new MemberRepository();
 *
 * // Find specific member
 * const member = await memberRepo.findByGuildAndUser(guildId, userId);
 *
 * // Create member
 * const newMember = new Member({ ... });
 * await memberRepo.create(newMember);
 * ```
 */
export class MemberRepository implements IMemberRepository {
  /**
   * Find a member by their composite key (guild + user).
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @returns The member if found, null otherwise
   */
  async findByGuildAndUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<Member | null> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), eq(members.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return MemberMapper.toDomain(result[0]);
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
  async findByGuild(guildId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.guildId, guildId));

      return result.map((record) => MemberMapper.toDomain(record));
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
  async findByUser(userId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(eq(members.userId, userId));

      return result.map((record) => MemberMapper.toDomain(record));
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
   * @param member - Member entity to create
   * @returns The created member
   * @throws {RealmError} If member already exists or database error occurs
   */
  async create(member: Member): Promise<Member> {
    try {
      const dbRecord = MemberMapper.fromDomain(member);

      const result = await db.insert(members).values(dbRecord).returning();

      return MemberMapper.toDomain(result[0]);
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
   * @param member - Member entity with updated values
   * @returns The updated member
   * @throws {RealmError} If member does not exist or database error occurs
   */
  async update(member: Member): Promise<Member> {
    try {
      const dbRecord = MemberMapper.fromDomain(member);

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

      return MemberMapper.toDomain(result[0]);
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
  async delete(guildId: Snowflake, userId: Snowflake): Promise<void> {
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
  async exists(guildId: Snowflake, userId: Snowflake): Promise<boolean> {
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
  async countByGuild(guildId: Snowflake): Promise<number> {
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
   * @returns Array of admin members (empty if none)
   */
  async findAdminsByGuild(guildId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), eq(members.admin, true)));

      return result.map((record) => MemberMapper.toDomain(record));
    } catch (error) {
      throw new RealmError("Failed to find admins by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all storyteller members in a guild.
   *
   * @param guildId - Discord guild ID
   * @returns Array of storyteller members (empty if none)
   */
  async findStorytellers(guildId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(
          and(eq(members.guildId, guildId), eq(members.storyteller, true))
        );

      return result.map((record) => MemberMapper.toDomain(record));
    } catch (error) {
      throw new RealmError("Failed to find storytellers by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }

  /**
   * Find all Staff members in a guild.
   *
   * Staff members are those with either admin or storyteller roles.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff members (empty if none)
   */
  async findStaffMembers(guildId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, guildId),
            or(eq(members.admin, true), eq(members.storyteller, true))
          )
        );

      return result.map((record) => MemberMapper.toDomain(record));
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
   * @returns Array of boosting members (empty if none)
   */
  async findBoostingMembers(guildId: Snowflake): Promise<Member[]> {
    try {
      const result = await db
        .select()
        .from(members)
        .where(and(eq(members.guildId, guildId), gt(members.boosted, 0)));

      return result.map((record) => MemberMapper.toDomain(record));
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
  async countTotalBoostsByUser(userId: Snowflake): Promise<number> {
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
  async deleteByGuild(guildId: Snowflake): Promise<void> {
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
