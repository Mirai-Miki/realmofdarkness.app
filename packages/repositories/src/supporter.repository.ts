import { eq, gt } from "drizzle-orm";
import { supporters, type Database } from "@realm/database";
import { RealmError } from "@realm/errors";
import { logger } from "@realm/logger";
import type { Snowflake } from "@realm/core";
import { Supporter } from "@realm/core";
import { type ISupporterRepository, SupporterName } from "@realm/core";
import { SupporterMapper } from "./mappers/supporter.mapper.js";

/**
 * Repository for Supporter entity persistence operations.
 *
 * Handles CRUD operations for supporter subscriptions and boost allocations.
 * Separated from UserRepository to maintain single responsibility.
 *
 * @example
 * ```typescript
 * const supporterRepo = new SupporterRepository(db);
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
  constructor(private db: Database) {}

  /**
   * Find a supporter by their user ID.
   * If no supporter record exists, returns a default Base tier supporter.
   * This ensures consistency - all users have supporter limits even if not subscribed.
   *
   * @param userId - Discord user snowflake ID
   * @returns Supporter entity (never null - defaults to Base tier)
   * @throws {RealmError} If database query fails
   */
  async findByUserId(userId: Snowflake): Promise<Supporter> {
    try {
      const result = await this.db
        .select()
        .from(supporters)
        .where(eq(supporters.userId, userId))
        .limit(1);

      if (result.length === 0) {
        // Return default Base tier supporter for users without subscription
        return new Supporter({
          userId,
          level: SupporterName.Base,
          totalBoosts: 0,
          firstSupported: null,
          lastSupported: null,
        });
      }

      return SupporterMapper.toDomain(result[0]);
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
   * @returns Array of Supporter entities
   * @throws {RealmError} If database query fails
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<Supporter[]> {
    try {
      const results = await this.db
        .select()
        .from(supporters)
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toDomain(db));
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
   * @returns Array of Supporter entities
   * @throws {RealmError} If database query fails
   */
  async findByLevel(
    level: SupporterName,
    limit: number = 100,
    offset: number = 0
  ): Promise<Supporter[]> {
    try {
      const results = await this.db
        .select()
        .from(supporters)
        .where(eq(supporters.level, level))
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toDomain(db));
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
   * @returns Array of Supporter entities with totalBoosts > 0
   * @throws {RealmError} If database query fails
   */
  async findWithAvailableBoosts(
    limit: number = 100,
    offset: number = 0
  ): Promise<Supporter[]> {
    try {
      const results = await this.db
        .select()
        .from(supporters)
        .where(gt(supporters.totalBoosts, 0))
        .limit(limit)
        .offset(offset);

      return results.map((db) => SupporterMapper.toDomain(db));
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
   * @param supporter - Supporter entity to create
   * @returns Created supporter entity with updated metadata
   * @throws {RealmError} If creation fails or supporter already exists
   */
  async create(supporter: Supporter): Promise<Supporter> {
    try {
      const dbRecord = SupporterMapper.fromDomain(supporter);

      const result = await this.db
        .insert(supporters)
        .values(dbRecord)
        .returning();

      logger.info("Supporter created", {
        fields: {
          userId: result[0].userId,
          level: result[0].level,
          location: "SupporterRepository.create",
        },
      });

      return SupporterMapper.toDomain(result[0]);
    } catch (error) {
      throw new RealmError("Failed to create supporter", {
        cause: error,
        fields: {
          userId: supporter.userId,
          location: "SupporterRepository.create",
        },
      });
    }
  }

  /**
   * Update an existing supporter subscription.
   *
   * @param supporter - Supporter entity to update
   * @returns Updated supporter entity with refreshed metadata
   * @throws {RealmError} If update fails or supporter doesn't exist
   */
  async update(supporter: Supporter): Promise<Supporter> {
    try {
      const dbRecord = SupporterMapper.fromDomain(supporter);

      const result = await this.db
        .update(supporters)
        .set(dbRecord)
        .where(eq(supporters.userId, supporter.userId))
        .returning();

      if (result.length === 0) {
        throw new RealmError("Supporter not found for update", {
          fields: {
            userId: supporter.userId,
            location: "SupporterRepository.update",
          },
        });
      }

      logger.info("Supporter updated", {
        fields: {
          userId: result[0].userId,
          level: result[0].level,
          location: "SupporterRepository.update",
        },
      });

      return SupporterMapper.toDomain(result[0]);
    } catch (error) {
      throw new RealmError("Failed to update supporter", {
        cause: error,
        fields: {
          userId: supporter.userId,
          location: "SupporterRepository.update",
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
      await this.db.delete(supporters).where(eq(supporters.userId, userId));

      logger.info("Supporter deleted", {
        fields: { userId, location: "SupporterRepository.delete" },
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
      const result = await this.db
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
      const result = await this.db
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
  async countByLevel(level: SupporterName): Promise<number> {
    try {
      const result = await this.db
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
