import { eq, gt } from "drizzle-orm";
import { db, supporters } from "@realm/database";
import { RealmError, SupporterLevel } from "@realm/common";
import type {
  ILogger,
  Snowflake,
  ISupporterRepository,
  SupporterData,
} from "@realm/common";
import { SupporterMapper } from "./mappers/supporter.mapper.js";

/**
 * Repository for Supporter entity persistence operations.
 *
 * Handles CRUD operations for supporter subscriptions and boost allocations.
 * Separated from UserRepository to maintain single responsibility.
 *
 * @example
 * ```typescript
 * const supporterRepo = new SupporterRepository();
 *
 * // Find supporter by user ID
 * const supporter = await supporterRepo.findByUserId("123456789012345678");
 *
 * // Create new supporter
 * const newSupporter = new Supporter({ ... });
 * await supporterRepo.create(newSupporter);
 * ```
 */
export class SupporterRepository implements ISupporterRepository {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Find a supporter by their user ID.
   * If no supporter record exists, returns a default Base tier supporter.
   * This ensures consistency - all users have supporter limits even if not subscribed.
   *
   * @param userId - Discord user snowflake ID
   * @returns Supporter Data (never null - defaults to Base tier)
   * @throws {RealmError} If database query fails
   */
  async findByUserId(userId: Snowflake): Promise<SupporterData> {
    try {
      const result = await db
        .select()
        .from(supporters)
        .where(eq(supporters.userId, userId))
        .limit(1);

      if (result.length === 0) {
        // Return default Base tier supporter for users without subscription
        return {
          userId,
          level: SupporterLevel.Base,
          boosts: 0,
          firstSupported: null,
        };
      }

      return SupporterMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find supporter by user ID", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Find all supporters (paginated).
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of Supporter Data
   * @throws {RealmError} If database query fails
   */
  async findAll(
    limit: number = 100,
    offset: number = 0
  ): Promise<SupporterData[]> {
    try {
      const results = await db
        .select()
        .from(supporters)
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toData(db));
    } catch (error) {
      throw new RealmError("Failed to find all supporters", {
        cause: error,
        fields: {
          limit: limit.toString(),
          offset: offset.toString(),
        },
      });
    }
  }

  /**
   * Find all supporters by tier level.
   *
   * @param level - Supporter tier level
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of Supporter Data
   * @throws {RealmError} If database query fails
   */
  async findByLevel(
    level: SupporterLevel,
    limit: number = 100,
    offset: number = 0
  ): Promise<SupporterData[]> {
    try {
      const results = await db
        .select()
        .from(supporters)
        .where(eq(supporters.level, level))
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toData(db));
    } catch (error) {
      throw new RealmError("Failed to find supporters by level", {
        cause: error,
        fields: {
          level,
          limit: limit.toString(),
          offset: offset.toString(),
        },
      });
    }
  }

  /**
   * Find supporters with available boosts.
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of Supporter Data with totalBoosts > 0
   * @throws {RealmError} If database query fails
   */
  async findWithAvailableBoosts(
    limit: number = 100,
    offset: number = 0
  ): Promise<SupporterData[]> {
    try {
      const results = await db
        .select()
        .from(supporters)
        .where(gt(supporters.boosts, 0))
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toData(db));
    } catch (error) {
      throw new RealmError("Failed to find supporters with available boosts", {
        cause: error,
        fields: {
          limit: limit.toString(),
          offset: offset.toString(),
        },
      });
    }
  }

  /**
   * Create a new supporter subscription.
   *
   * @param supporter - Supporter Data to create
   * @returns Created supporter Data with updated metadata
   * @throws {RealmError} If creation fails or supporter already exists
   */
  async create(supporter: SupporterData): Promise<SupporterData> {
    try {
      const dbRecord = SupporterMapper.fromData(supporter);

      const result = await db.insert(supporters).values(dbRecord).returning();

      this.logger.info("Supporter created", {
        fields: {
          userId: result[0].userId,
          level: result[0].level,
        },
      });

      return SupporterMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to create supporter", {
        cause: error,
        fields: {
          userId: supporter.userId,
        },
      });
    }
  }

  /**
   * Update an existing supporter subscription.
   *
   * @param supporter - Supporter Data to update
   * @returns Updated supporter Data with refreshed metadata
   * @throws {RealmError} If update fails or supporter doesn't exist
   */
  async update(supporter: SupporterData): Promise<SupporterData> {
    try {
      const dbRecord = SupporterMapper.fromData(supporter);

      const result = await db
        .update(supporters)
        .set(dbRecord)
        .where(eq(supporters.userId, supporter.userId))
        .returning();

      if (result.length === 0) {
        throw new RealmError("Supporter not found for update", {
          fields: {
            userId: supporter.userId,
          },
        });
      }

      this.logger.info("Supporter updated", {
        fields: {
          userId: result[0].userId,
          level: result[0].level,
        },
      });

      return SupporterMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to update supporter", {
        cause: error,
        fields: {
          userId: supporter.userId,
        },
      });
    }
  }

  /**
   * Delete a supporter subscription.
   *
   * @param userId - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   */
  async delete(userId: Snowflake): Promise<void> {
    try {
      await db.delete(supporters).where(eq(supporters.userId, userId));

      this.logger.info("Supporter deleted", {
        fields: { userId },
      });
    } catch (error) {
      throw new RealmError("Failed to delete supporter", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Check if a user is a supporter.
   *
   * @param userId - Discord user snowflake ID
   * @returns True if user has a supporter record
   * @throws {RealmError} If query fails
   */
  async exists(userId: Snowflake): Promise<boolean> {
    try {
      const result = await db
        .select({ userId: supporters.userId })
        .from(supporters)
        .where(eq(supporters.userId, userId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check if supporter exists", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Count total number of supporters.
   *
   * @returns Total supporter count
   * @throws {RealmError} If query fails
   */
  async count(): Promise<number> {
    try {
      const result = await db
        .select({ userId: supporters.userId })
        .from(supporters);

      return result.length;
    } catch (error) {
      throw new RealmError("Failed to count supporters", {
        cause: error,
      });
    }
  }

  /**
   * Count supporters by tier level.
   *
   * @param level - Supporter tier level
   * @returns Count of supporters at this level
   * @throws {RealmError} If query fails
   */
  async countByLevel(level: SupporterLevel): Promise<number> {
    try {
      const result = await db
        .select({ userId: supporters.userId })
        .from(supporters)
        .where(eq(supporters.level, level));

      return result.length;
    } catch (error) {
      throw new RealmError("Failed to count supporters by level", {
        cause: error,
        fields: { level },
      });
    }
  }
}
