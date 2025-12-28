import type { UserDb } from "@realm/database";
import type { UserData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between User database records and User Data.
 *
 * Handles the conversion of:
 * - Database records (UserDb) → Data (UserData)
 * - Data (UserData) → Database records (UserDb)
 *
 * @example
 * ```typescript
 * // Database → Data
 * const userData = UserMapper.toData(dbRecord);
 *
 * // Data → Database
 * const dbRecord = UserMapper.fromData(userData);
 * ```
 */
export class UserMapper {
  /**
   * Convert database record to User Data.
   *
   * @param db - User database record
   * @returns User Data
   * @throws {RealmError} If mapping fails
   */
  public static toData(db: UserDb): UserData {
    try {
      return {
        id: db.id,
        username: db.username,
        displayName: db.displayName,
        admin: db.admin,
        avatarUrl: db.avatarUrl,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt,
      };
    } catch (error) {
      throw new RealmError("Failed to map user from database to Data", {
        cause: error,
        fields: { userId: db.id },
      });
    }
  }

  /**
   * Convert User Data to database record.
   *
   * @param data - User Data
   * @returns User database record (without timestamps for insert)
   * @throws {RealmError} If mapping fails
   */
  public static fromData(
    data: UserData
  ): Omit<UserDb, "createdAt" | "updatedAt" | "lastActive"> {
    try {
      return {
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || "",
        admin: false, // Set by separate admin management
      };
    } catch (error) {
      throw new RealmError("Failed to map user from Data to database", {
        cause: error,
      });
    }
  }
}
