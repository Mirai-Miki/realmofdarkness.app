import type {
  ChronicleMemberDb,
  UpdateChronicleMemberData,
  InsertChronicleMemberData,
} from "@realm/database";
import {
  db,
  chronicleMembers,
  insertChronicleMemberSchema,
  updateChronicleMemberSchema,
} from "@realm/database";
import type {
  IChronicleMemberRepository,
  ChronicleMemberData,
  ChronicleMemberRepositoryInput,
  Snowflake,
} from "@realm/common";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { eq, and, gt, sum } from "drizzle-orm";
import { hasDataChanged } from "./repository.utilities";

/**
 * Convert database record to ChronicleMemberData.
 * The `isStoryteller` boolean is hydrated based on the database join or boolean flag from the query.
 */
function toChronicleMemberData(
  db: ChronicleMemberDb,
  isStoryteller: boolean = false
): ChronicleMemberData {
  return {
    chronicleId: db.chronicleId,
    userId: db.userId,
    isStoryteller,
    boosted: db.boosted,
    nickname: db.nickname,
    avatarUrl: db.avatarUrl,
    createdAt: db.createdAt,
    lastUpdated: db.lastUpdated,
  };
}

/**
 * Repository implementation for Chronicle Member entities.
 */
export class ChronicleMemberRepository implements IChronicleMemberRepository {
  private hasChanges(
    current: ChronicleMemberDb,
    incoming: UpdateChronicleMemberData
  ): boolean {
    return hasDataChanged<ChronicleMemberDb, UpdateChronicleMemberData>(
      current,
      incoming,
      ["chronicleId", "userId", "createdAt", "lastUpdated"]
    );
  }

  private async performUpdate(
    input: ChronicleMemberRepositoryInput,
    currentMember: ChronicleMemberDb
  ): Promise<ChronicleMemberData> {
    try {
      const updateData: UpdateChronicleMemberData = {
        chronicleId: input.chronicleId,
        userId: input.userId,
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

      if (!this.hasChanges(currentMember, updateData)) {
        return toChronicleMemberData(currentMember);
      }

      const validatedData = updateChronicleMemberSchema.parse(updateData);

      const [result] = await db
        .update(chronicleMembers)
        .set(validatedData)
        .where(
          and(
            eq(chronicleMembers.chronicleId, input.chronicleId),
            eq(chronicleMembers.userId, input.userId)
          )
        )
        .returning();

      return toChronicleMemberData(result);
    } catch (error) {
      throw new RealmError("Failed to update chronicle member", {
        cause: error,
        fields: { chronicleId: input.chronicleId, userId: input.userId },
      });
    }
  }

  /**
   * Find a chronicle member by their chronicle ID and user ID.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   * @returns The chronicle member data if found, null otherwise
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const member = await repository.findByChronicleAndUser("chronicleId", "userId");
   * ```
   */
  public async findByChronicleAndUser(
    chronicleId: Snowflake,
    userId: Snowflake
  ): Promise<ChronicleMemberData | null> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, validatedChronicleId),
            eq(chronicleMembers.userId, validatedUserId)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toChronicleMemberData(result[0]);
    } catch (error) {
      throw new RealmError(
        "Failed to find chronicle member by chronicle and user",
        {
          cause: error,
          fields: { chronicleId, userId },
        }
      );
    }
  }

  /**
   * Find all members belonging to a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of chronicle member configurations
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const members = await repository.findByChronicle("chronicleId");
   * ```
   */
  public async findByChronicle(
    chronicleId: Snowflake
  ): Promise<ChronicleMemberData[]> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);

      const result = await db
        .select()
        .from(chronicleMembers)
        .where(eq(chronicleMembers.chronicleId, validatedChronicleId));

      return result.map((row) => toChronicleMemberData(row));
    } catch (error) {
      throw new RealmError("Failed to find members by chronicle", {
        cause: error,
        fields: { chronicleId },
      });
    }
  }

  /**
   * Find all user IDs belonging to a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of user snowflake IDs
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const userIds = await repository.findIdsByChronicle("chronicleId");
   * ```
   */
  public async findIdsByChronicle(
    chronicleId: Snowflake
  ): Promise<Snowflake[]> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);

      const result = await db
        .select({ userId: chronicleMembers.userId })
        .from(chronicleMembers)
        .where(eq(chronicleMembers.chronicleId, validatedChronicleId));

      return result.map((row) => row.userId);
    } catch (error) {
      throw new RealmError("Failed to find member IDs by chronicle", {
        cause: error,
        fields: { chronicleId },
      });
    }
  }

  /**
   * Find all chronicle memberships for a specific user.
   *
   * @param userId - User snowflake ID
   * @returns Array of chronicle member configurations
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const memberships = await repository.findByUser("userId");
   * ```
   */
  public async findByUser(userId: Snowflake): Promise<ChronicleMemberData[]> {
    try {
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(chronicleMembers)
        .where(eq(chronicleMembers.userId, validatedUserId));

      return result.map((row) => toChronicleMemberData(row));
    } catch (error) {
      throw new RealmError("Failed to find members by user", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Create a new chronicle member record.
   *
   * @param input - Repository input representing the new chronicle member
   * @returns The created ChronicleMemberData configuration
   * @throws {RealmError} If validation or database insertion fails
   *
   * @example
   * ```typescript
   * const member = await repository.create({
   *   chronicleId: "chronicleId",
   *   userId: "userId",
   *   nickname: "Bob",
   * });
   * ```
   */
  public async create(
    input: ChronicleMemberRepositoryInput
  ): Promise<ChronicleMemberData> {
    try {
      const dbRecord: InsertChronicleMemberData = {
        chronicleId: input.chronicleId,
        userId: input.userId,
        boosted: input.boosted,
        nickname: input.nickname,
        avatarUrl: input.avatarUrl,
      };

      const validatedData = insertChronicleMemberSchema.parse(dbRecord);

      const [result] = await db
        .insert(chronicleMembers)
        .values(validatedData)
        .returning();

      return toChronicleMemberData(result);
    } catch (error) {
      throw new RealmError("Failed to create chronicle member", {
        cause: error,
        fields: {
          chronicleId: input.chronicleId,
          userId: input.userId,
        },
      });
    }
  }

  /**
   * Update an existing chronicle member configuration.
   *
   * @param input - Repository input representing updated fields
   * @param options - Optional flags (e.g. ignoreNotFound)
   * @returns The updated ChronicleMemberData configuration, or null if ignoreNotFound is true and member isn't found
   * @throws {RealmError} If database update fails, or if not found and ignoreNotFound is false
   *
   * @example
   * ```typescript
   * const updated = await repository.update({
   *   chronicleId: "chronicleId",
   *   userId: "userId",
   *   nickname: "New Bob",
   * });
   * ```
   */
  public async update(
    input: ChronicleMemberRepositoryInput
  ): Promise<ChronicleMemberData>;
  public async update(
    input: ChronicleMemberRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<ChronicleMemberData | null>;
  public async update(
    input: ChronicleMemberRepositoryInput,
    options?: { ignoreNotFound: boolean }
  ): Promise<ChronicleMemberData | null> {
    try {
      SnowflakeSchema.parse(input.chronicleId);
      SnowflakeSchema.parse(input.userId);

      const currentResult = await db
        .select()
        .from(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, input.chronicleId),
            eq(chronicleMembers.userId, input.userId)
          )
        )
        .limit(1);

      if (currentResult.length === 0) {
        if (!options?.ignoreNotFound) {
          throw new RealmError("Chronicle member not found for update", {
            fields: {
              chronicleId: input.chronicleId,
              userId: input.userId,
            },
          });
        }
        return null;
      }

      return await this.performUpdate(input, currentResult[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to update chronicle member", {
        cause: error,
        fields: {
          chronicleId: input.chronicleId,
          userId: input.userId,
        },
      });
    }
  }

  /**
   * Create or update a chronicle member configuration (upsert).
   *
   * @param input - Repository input representing the chronicle member
   * @returns The upserted ChronicleMemberData configuration
   * @throws {RealmError} If database upsert fails
   *
   * @example
   * ```typescript
   * const member = await repository.upsert({
   *   chronicleId: "chronicleId",
   *   userId: "userId",
   *   nickname: "Bob",
   * });
   * ```
   */
  public async upsert(
    input: ChronicleMemberRepositoryInput
  ): Promise<ChronicleMemberData> {
    try {
      const existingResult = await db
        .select()
        .from(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, input.chronicleId),
            eq(chronicleMembers.userId, input.userId)
          )
        )
        .limit(1);

      if (existingResult.length > 0) {
        return await this.performUpdate(input, existingResult[0]);
      } else {
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert chronicle member", {
        cause: error,
        fields: { chronicleId: input.chronicleId, userId: input.userId },
      });
    }
  }

  /**
   * Delete a chronicle member record.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   * @throws {RealmError} If deletion fails
   *
   * @example
   * ```typescript
   * await repository.delete("chronicleId", "userId");
   * ```
   */
  public async delete(
    chronicleId: Snowflake,
    userId: Snowflake
  ): Promise<void> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      await db
        .delete(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, validatedChronicleId),
            eq(chronicleMembers.userId, validatedUserId)
          )
        );
    } catch (error) {
      throw new RealmError("Failed to delete chronicle member", {
        cause: error,
        fields: { chronicleId, userId },
      });
    }
  }

  /**
   * Delete all chronicle members belonging to a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @throws {RealmError} If deletion fails
   *
   * @example
   * ```typescript
   * await repository.deleteByChronicle("chronicleId");
   * ```
   */
  public async deleteByChronicle(chronicleId: Snowflake): Promise<void> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);
      await db
        .delete(chronicleMembers)
        .where(eq(chronicleMembers.chronicleId, validatedChronicleId));
    } catch (error) {
      throw new RealmError("Failed to delete all members by chronicle", {
        cause: error,
        fields: { chronicleId },
      });
    }
  }

  /**
   * Check if a chronicle member exists.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @param userId - User snowflake ID
   * @returns True if the chronicle member exists, false otherwise
   * @throws {RealmError} If database check fails
   *
   * @example
   * ```typescript
   * const exists = await repository.exists("chronicleId", "userId");
   * ```
   */
  public async exists(
    chronicleId: Snowflake,
    userId: Snowflake
  ): Promise<boolean> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select({ chronicleId: chronicleMembers.chronicleId })
        .from(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, validatedChronicleId),
            eq(chronicleMembers.userId, validatedUserId)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check chronicle member existence", {
        cause: error,
        fields: { chronicleId, userId },
      });
    }
  }

  /**
   * Count the total number of members in a chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns The total number of members
   * @throws {RealmError} If database query fails
   *
   * @example
   * ```typescript
   * const count = await repository.countByChronicle("chronicleId");
   * ```
   */
  public async countByChronicle(chronicleId: Snowflake): Promise<number> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);

      const result = await db
        .select()
        .from(chronicleMembers)
        .where(eq(chronicleMembers.chronicleId, validatedChronicleId));

      return result.length;
    } catch (error) {
      throw new RealmError("Failed to count members by chronicle", {
        cause: error,
        fields: { chronicleId },
      });
    }
  }

  /**
   * Find all storytellers for a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of storyteller chronicle member configurations
   *
   * @example
   * ```typescript
   * const storytellers = await repository.findStorytellersByChronicle("chronicleId");
   * ```
   */
  public findStorytellersByChronicle(
    chronicleId: Snowflake
  ): Promise<ChronicleMemberData[]> {
    // Currently storytellers are managed via Discord Roles which we don't have direct access to here.
    // To be implemented fully via Discord identities or an API layer.
    // For now returning an empty array.
    if (!chronicleId) return Promise.resolve([]);
    return Promise.resolve([]);
  }

  /**
   * Find all members boosting a specific chronicle.
   *
   * @param chronicleId - Chronicle snowflake ID
   * @returns Array of chronicle member configurations that are currently boosting
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const boostingMembers = await repository.findBoostingMembers("chronicleId");
   * ```
   */
  public async findBoostingMembers(
    chronicleId: Snowflake
  ): Promise<ChronicleMemberData[]> {
    try {
      const validatedChronicleId = SnowflakeSchema.parse(chronicleId);

      const result = await db
        .select()
        .from(chronicleMembers)
        .where(
          and(
            eq(chronicleMembers.chronicleId, validatedChronicleId),
            gt(chronicleMembers.boosted, 0)
          )
        );

      return result.map((record) => toChronicleMemberData(record));
    } catch (error) {
      throw new RealmError("Failed to find boosting members by chronicle", {
        cause: error,
        fields: { chronicleId },
      });
    }
  }

  /**
   * Count the total number of boosts a user has active across all chronicles.
   *
   * @param userId - User snowflake ID
   * @returns The total number of boosts
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const totalBoosts = await repository.countTotalBoostsByUser("userId");
   * ```
   */
  public async countTotalBoostsByUser(userId: Snowflake): Promise<number> {
    try {
      const validatedUserId = SnowflakeSchema.parse(userId);

      const result = await db
        .select({ total: sum(chronicleMembers.boosted) })
        .from(chronicleMembers)
        .where(eq(chronicleMembers.userId, validatedUserId));

      return Number(result[0]?.total ?? 0);
    } catch (error) {
      throw new RealmError("Failed to count total boosts by user", {
        cause: error,
        fields: { userId },
      });
    }
  }
}
