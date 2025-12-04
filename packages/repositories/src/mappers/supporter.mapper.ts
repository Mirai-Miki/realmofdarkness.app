import type { SupporterDb } from "@realm/database";
import { Supporter } from "@realm/core";
import { RealmError } from "@realm/errors";

/**
 * Mapper for translating between Supporter database records and Supporter domain entities.
 *
 * Handles the conversion of:
 * - Database records (SupporterDb) → Domain entities (Supporter)
 * - Domain entities (Supporter) → Database records (SupporterDb)
 *
 * @example
 * ```typescript
 * // Database → Domain
 * const supporter = SupporterMapper.toDomain(dbRecord);
 *
 * // Domain → Database
 * const dbRecord = SupporterMapper.fromDomain(supporter);
 * ```
 */
export class SupporterMapper {
  /**
   * Convert database record to Supporter domain entity.
   *
   * @param db - Supporter database record
   * @returns Supporter domain entity
   * @throws {RealmError} If mapping fails
   */
  static toDomain(db: SupporterDb): Supporter {
    try {
      return new Supporter({
        userId: db.userId,
        level: db.level,
        totalBoosts: db.totalBoosts,
        firstSupported: db.firstSupported,
        lastSupported: db.lastSupported,
      });
    } catch (error) {
      throw new RealmError("Failed to map supporter from database to domain", {
        cause: error,
        fields: { userId: db.userId },
      });
    }
  }

  /**
   * Convert Supporter domain entity to database record.
   *
   * @param supporter - Supporter domain entity
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDomain(
    supporter: Supporter
  ): Omit<SupporterDb, "createdAt" | "updatedAt"> {
    try {
      return {
        userId: supporter.userId,
        level: supporter.getLevel(),
        totalBoosts: supporter.totalBoosts,
        firstSupported: supporter.firstSupported,
        lastSupported: supporter.lastSupported,
      };
    } catch (error) {
      throw new RealmError("Failed to map supporter from domain to database", {
        cause: error,
        fields: { userId: supporter.userId },
      });
    }
  }
}
