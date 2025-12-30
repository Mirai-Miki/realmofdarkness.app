import type {
  MemberDb,
  UpdateMemberData,
  InsertMemberData,
} from "@realm/database";
import {
  db,
  members,
  guilds,
  insertMemberSchema,
  updateMemberSchema,
} from "@realm/database";
import type {
  IMemberRepository,
  MemberData,
  MemberRepositoryInput,
  Snowflake,
} from "@realm/common";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { eq, and, or, gt, sum, sql } from "drizzle-orm";
import { hasDataChanged } from "./repository.utilities";

/**
 * Convert database record to MemberData.
 */
function toMemberData(db: MemberDb): MemberData {
  return {
    userId: db.userId,
    guildId: db.guildId,
    admin: db.admin,
    roleIds: db.roleIds,
    boosted: db.boosted,
    nickname: db.nickname,
    avatarUrl: db.avatarUrl,
    createdAt: db.createdAt,
    lastUpdated: db.lastUpdated,
  };
}

/**
 * Repository implementation for Member entities.
 *
 * Handles all database operations for members including CRUD operations
 * and queries. Returns Member Data that can be hydrated into domain entities.
 * Members have a composite primary key (guildId + userId).
 *
 * @example
 * ```typescript
 * const repo = new MemberRepository();
 * const memberData = await repo.findByGuildAndUser(guildId, userId);
 * ```
 */
export class MemberRepository implements IMemberRepository {
  /**
   * Check if member database record has actually changed by comparing relevant fields.
   *
   * @param current - Current member record from database
   * @param incoming - New member data to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: MemberDb, incoming: UpdateMemberData): boolean {
    return hasDataChanged<MemberDb, UpdateMemberData>(current, incoming, [
      "guildId",
      "userId",
      "createdAt",
      "lastUpdated",
    ]);
  }

  private async performUpdate(
    input: MemberRepositoryInput,
    currentMember: MemberDb
  ): Promise<MemberData> {
    try {
      // Build update object with proper typing
      const updateData: UpdateMemberData = {
        guildId: input.guildId,
        userId: input.userId,
        admin: input.admin !== undefined ? input.admin : currentMember.admin,
        roleIds:
          input.roleIds !== undefined ? input.roleIds : currentMember.roleIds,
        boosted:
          input.boosted !== undefined ? input.boosted : currentMember.boosted,
        nickname:
          input.nickname !== undefined
            ? input.nickname
            : currentMember.nickname,
        avatarUrl:
          input.avatarUrl !== undefined
            ? input.avatarUrl
            : currentMember.avatarUrl,
        lastUpdated: new Date(),
      };

      // Check if anything actually changed
      if (!this.hasChanges(currentMember, updateData)) {
        // No changes detected - return current data without updating
        return toMemberData(currentMember);
      }

      // Validate with update schema
      const validatedData = updateMemberSchema.parse(updateData);

      const [result] = await db
        .update(members)
        .set(validatedData)
        .where(
          and(
            eq(members.guildId, input.guildId),
            eq(members.userId, input.userId)
          )
        )
        .returning();

      return toMemberData(result);
    } catch (error) {
      throw new RealmError("Failed to update member", {
        cause: error,
        fields: { guildId: input.guildId, userId: input.userId },
      });
    }
  }
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
      // Validate snowflake formats
      const validatedGuildId = SnowflakeSchema.parse(guildId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, validatedGuildId),
            eq(members.userId, validatedUserId)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toMemberData(result[0]);
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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      const result = await db
        .select()
        .from(members)
        .where(eq(members.guildId, validatedGuildId));

      return result.map(toMemberData);
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
      // Validate snowflake format
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(members)
        .where(eq(members.userId, validatedUserId));

      return result.map(toMemberData);
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
   * @param input - Member creation input (without timestamps)
   * @returns The created member Data
   * @throws {RealmError} If creation fails or member already exists
   */
  public async create(input: MemberRepositoryInput): Promise<MemberData> {
    try {
      const dbRecord: InsertMemberData = {
        guildId: input.guildId,
        userId: input.userId,
        admin: input.admin,
        roleIds: input.roleIds,
        boosted: input.boosted,
        nickname: input.nickname,
        avatarUrl: input.avatarUrl,
      };

      // Validate with insert schema
      const validatedData = insertMemberSchema.parse(dbRecord);

      const [result] = await db
        .insert(members)
        .values(validatedData)
        .returning();

      return toMemberData(result);
    } catch (error) {
      throw new RealmError("Failed to create member", {
        cause: error,
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });
    }
  }

  /**
   * Update an existing member record.
   * Only performs database update if data has actually changed.
   *
   * @param input - Member update input data
   * @returns Updated member Data (or current data if no changes)
   */
  public async update(input: MemberRepositoryInput): Promise<MemberData> {
    try {
      // Validate snowflake formats first
      SnowflakeSchema.parse(input.guildId);
      SnowflakeSchema.parse(input.userId);

      // Fetch current member to check for changes
      const currentResult = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, input.guildId),
            eq(members.userId, input.userId)
          )
        )
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("Member not found for update", {
          fields: {
            guildId: input.guildId,
            userId: input.userId,
          },
        });
      }

      return await this.performUpdate(input, currentResult[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error; // Re-throw known RealmErrors
      }
      throw new RealmError("Failed to update member", {
        cause: error,
        fields: {
          guildId: input.guildId,
          userId: input.userId,
        },
      });
    }
  }

  /**
   * Upsert a member.
   * If member exists: updates provided fields only if data has changed.
   * If member doesn't exist: creates new member.
   *
   * @param input - Member data to upsert
   * @returns Upserted member Data
   */
  public async upsert(input: MemberRepositoryInput): Promise<MemberData> {
    try {
      // Check if member exists
      const existingResult = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, input.guildId),
            eq(members.userId, input.userId)
          )
        )
        .limit(1);

      if (existingResult.length > 0) {
        // Member exists - update it
        return await this.performUpdate(input, existingResult[0]);
      } else {
        // Member doesn't exist - insert it
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert member", {
        cause: error,
        fields: { guildId: input.guildId, userId: input.userId },
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
      // Validate snowflake formats
      const validatedGuildId = SnowflakeSchema.parse(guildId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      await db
        .delete(members)
        .where(
          and(
            eq(members.guildId, validatedGuildId),
            eq(members.userId, validatedUserId)
          )
        );
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
      // Validate snowflake formats
      const validatedGuildId = SnowflakeSchema.parse(guildId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select({ guildId: members.guildId })
        .from(members)
        .where(
          and(
            eq(members.guildId, validatedGuildId),
            eq(members.userId, validatedUserId)
          )
        )
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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      const result = await db
        .select()
        .from(members)
        .where(eq(members.guildId, validatedGuildId));

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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      const result = await db
        .select()
        .from(members)
        .where(
          and(eq(members.guildId, validatedGuildId), eq(members.admin, true))
        );

      return result.map(toMemberData);
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
   * Fetches the guild's storyteller roles automatically and checks for intersection.
   *
   * @param guildId - Discord guild ID
   * @returns Array of staff member Data (empty if none)
   */
  public async findStaffMembers(guildId: Snowflake): Promise<MemberData[]> {
    try {
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      // First, get the guild's storyteller role IDs
      const guildResult = await db
        .select({ storytellerRoleIds: guilds.storytellerRoleIds })
        .from(guilds)
        .where(eq(guilds.id, validatedGuildId))
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
            eq(members.guildId, validatedGuildId),
            or(
              eq(members.admin, true),
              sql`${members.roleIds} && ${storytellerRoles}` // Array overlap: has any storyteller role
            )
          )
        );

      return result.map(toMemberData);
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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      const result = await db
        .select()
        .from(members)
        .where(
          and(eq(members.guildId, validatedGuildId), gt(members.boosted, 0))
        );

      return result.map((record) => toMemberData(record));
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
      // Validate snowflake format
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select({ total: sum(members.boosted) })
        .from(members)
        .where(eq(members.userId, validatedUserId));

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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      await db.delete(members).where(eq(members.guildId, validatedGuildId));
    } catch (error) {
      throw new RealmError("Failed to delete all members by guild", {
        cause: error,
        fields: { guildId },
      });
    }
  }
}
