import type { SupporterDb } from "@realm/database";
import type { SupporterData, SupporterLevel } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between Supporter database records and Supporter Data.
 *
 * Handles the conversion of:
 * - Database records (SupporterDb) → Data (SupporterData)
 * - Data (SupporterData) → Database records (SupporterDb)
 *
 * @example
 * ```typescript
 * // Database → Data
 * const supporterData = SupporterMapper.toData(dbRecord);
 *
 * // Data → Database
 * const dbRecord = SupporterMapper.fromData(supporterData);
 * ```
 */
export class SupporterMapper {
  /**
   * Convert database record to Supporter Data.
   *
   * @param db - Supporter database record
   * @returns Supporter Data
   * @throws {RealmError} If mapping fails
   */
  public static toData(db: SupporterDb): SupporterData {
    try {
      return {
        userId: db.userId,
        level: db.level as SupporterLevel,
        boosts: db.boosts,
        firstSupported: db.firstSupported,
      };
    } catch (error) {
      throw new RealmError("Failed to map supporter from database to Data", {
        cause: error,
        fields: { userId: db.userId },
      });
    }
  }

  /**
   * Convert Supporter Data to database record.
   *
   * @param data - Supporter Data
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  public static fromData(
    data: SupporterData
  ): Omit<SupporterDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        userId: data.userId,
        level: data.level,
        boosts: data.boosts,
        firstSupported: data.firstSupported,
      };
    } catch (error) {
      throw new RealmError("Failed to map supporter from Data to database", {
        cause: error,
        fields: { userId: data.userId },
      });
    }
  }
}
