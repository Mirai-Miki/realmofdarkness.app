import type { MemberDb } from "@realm/database";
import type { MemberData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between Member database records and Member Data.
 *
 * Handles the conversion of:
 * - Database records (MemberDb) → Data (MemberData)
 * - Data (MemberData) → Database records (MemberDb)
 *
 * @example
 * ```typescript
 * // Database → Data
 * const memberData = MemberMapper.toData(dbRecord);
 *
 * // Data → Database
 * const dbRecord = MemberMapper.fromData(memberData);
 * ```
 */
export class MemberMapper {
  /**
   * Convert database record to Member Data.
   *
   * @param db - Member database record
   * @returns Member Data
   * @throws {RealmError} If mapping fails
   */
  static toData(db: MemberDb): MemberData {
    try {
      return {
        guildId: db.guildId,
        userId: db.userId,
        admin: db.admin,
        roleIds: db.roleIds,
        boosted: db.boosted,
        nickname: db.nickname,
        avatarUrl: db.avatarUrl,
        createdAt: db.createdAt,
        lastUpdated: db.lastUpdated,
      };
    } catch (error) {
      throw new RealmError("Failed to map member from database to Data", {
        cause: error,
        fields: {
          guildId: db.guildId,
          userId: db.userId,
        },
      });
    }
  }

  /**
   * Convert Member Data to database record.
   *
   * @param data - Member Data
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromData(
    data: MemberData
  ): Omit<MemberDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        guildId: data.guildId,
        userId: data.userId,
        admin: data.admin,
        roleIds: data.roleIds,
        boosted: data.boosted,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
      };
    } catch (error) {
      throw new RealmError("Failed to map member from Data to database", {
        cause: error,
        fields: {
          guildId: data.guildId,
          userId: data.userId,
        },
      });
    }
  }
}
