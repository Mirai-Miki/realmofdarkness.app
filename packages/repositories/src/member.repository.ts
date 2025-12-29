import { db, members, guilds, insertMemberSchema } from "@realm/database";
import type { MemberDb } from "@realm/database";
import type {
  IMemberRepository,
  MemberData,
  CreateMemberInput,
  UpsertMemberInput,
  Snowflake,
} from "@realm/common";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { eq, and, or, gt, sum, sql } from "drizzle-orm";

import { MemberMapper } from "./mappers/member.mapper";

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
   * Excludes id and timestamps from comparison.
   *
   * @param current - Current member record from database
   * @param incoming - New member record to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: MemberDb, incoming: Partial<MemberDb>): boolean {
    const keysToCompare = Object.keys(incoming).filter(
      (key) => !["guildId", "userId", "createdAt", "lastUpdated"].includes(key)
    ) as (keyof MemberDb)[];

    for (const key of keysToCompare) {
      if (JSON.stringify(current[key]) !== JSON.stringify(incoming[key])) {
        return true;
      }
    }

    return false;
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

      return MemberMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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

      return result.map((record) => MemberMapper.toData(record));
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to find members by user", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Create a new member record.
   *
   * @param input - Create member input (without timestamps)
   * @returns The created member Data
   * @throws {RealmError} If creation fails or member already exists
   */
  public async create(input: CreateMemberInput): Promise<MemberData> {
    try {
      // Validate snowflake formats first
      SnowflakeSchema.parse(input.guildId);
      SnowflakeSchema.parse(input.userId);

      const dbRecord = MemberMapper.fromCreateInput(input);

      // Validate with Zod schema before inserting
      const validated = insertMemberSchema.parse(dbRecord);

      const result = await db.insert(members).values(validated).returning();

      return MemberMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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
   * @param member - Member Data with updated values
   * @returns Updated member Data (or current data if no changes)
   */
  public async update(member: MemberData): Promise<MemberData> {
    try {
      // Validate snowflake formats first
      SnowflakeSchema.parse(member.guildId);
      SnowflakeSchema.parse(member.userId);

      // Fetch current member to check for changes
      const currentResult = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, member.guildId),
            eq(members.userId, member.userId)
          )
        )
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("Member not found for update", {
          fields: {
            guildId: member.guildId,
            userId: member.userId,
          },
        });
      }

      const currentDb = currentResult[0];
      const incomingDb = MemberMapper.fromData(member);

      // Check if anything actually changed
      if (!this.hasChanges(currentDb, incomingDb)) {
        // No changes detected - return current data without updating
        return MemberMapper.toData(currentDb);
      }

      // Data has changed - proceed with update
      const validated = insertMemberSchema.partial().parse({
        ...incomingDb,
        lastUpdated: new Date(),
      });

      const result = await db
        .update(members)
        .set(validated)
        .where(
          and(
            eq(members.guildId, member.guildId),
            eq(members.userId, member.userId)
          )
        )
        .returning();

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
   * Upsert a member.
   * If member exists: updates provided fields only if data has changed.
   * If member doesn't exist: creates new member.
   *
   * @param input - Member data to upsert
   * @returns Upserted member Data
   */
  public async upsert(input: UpsertMemberInput): Promise<MemberData> {
    try {
      // Validate snowflake formats first
      const validatedGuildId = SnowflakeSchema.parse(input.guildId);
      const validatedUserId = SnowflakeSchema.parse(input.userId);

      // Check if member exists
      const existingResult = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, validatedGuildId),
            eq(members.userId, validatedUserId)
          )
        )
        .limit(1);

      if (existingResult.length > 0) {
        // Member exists - check if data has changed
        const currentDb = existingResult[0];
        const incomingDb: Partial<MemberDb> = {
          admin: input.admin,
          boosted: input.boosted,
          nickname: input.nickname || "",
          avatarUrl: input.avatarUrl || "",
        };

        if (input.roleIds !== undefined) {
          incomingDb.roleIds = input.roleIds;
        }

        if (!this.hasChanges(currentDb, incomingDb)) {
          // No changes - return existing data without updating
          return MemberMapper.toData(currentDb);
        }
      }

      // Either member doesn't exist, or data has changed - proceed with upsert
      const now = new Date();

      // Build insert values
      const insertValues = insertMemberSchema.parse({
        guildId: validatedGuildId,
        userId: validatedUserId,
        admin: input.admin || false,
        roleIds: input.roleIds || [],
        boosted: input.boosted || 0,
        nickname: input.nickname || "",
        avatarUrl: input.avatarUrl || "",
        createdAt: now,
        lastUpdated: now,
      });

      // Build conflict update set
      const conflictUpdate: Partial<typeof members.$inferInsert> = {
        lastUpdated: now,
      };

      if (input.admin !== undefined) {
        conflictUpdate.admin = input.admin;
      }
      if (input.roleIds !== undefined) {
        conflictUpdate.roleIds = input.roleIds;
      }
      if (input.boosted !== undefined) {
        conflictUpdate.boosted = input.boosted;
      }
      if (input.nickname !== undefined) {
        conflictUpdate.nickname = input.nickname;
      }
      if (input.avatarUrl !== undefined) {
        conflictUpdate.avatarUrl = input.avatarUrl;
      }

      const validatedUpdate = insertMemberSchema
        .partial()
        .parse(conflictUpdate);

      const [result] = await db
        .insert(members)
        .values(insertValues)
        .onConflictDoUpdate({
          target: [members.guildId, members.userId],
          set: validatedUpdate,
        })
        .returning();

      return MemberMapper.toData(result);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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
      // Validate snowflake format
      const validatedGuildId = SnowflakeSchema.parse(guildId);

      const result = await db
        .select()
        .from(members)
        .where(
          and(eq(members.guildId, validatedGuildId), gt(members.boosted, 0))
        );

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
