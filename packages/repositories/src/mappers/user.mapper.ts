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
  static toData(db: UserDb): UserData {
    try {
      return {
        id: db.id,
        username: db.username,
        displayName: db.displayName,
        email: db.email,
        registered: db.registered,
        admin: db.admin,
        avatarUrl: db.avatarUrl,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt,
        lastActive: db.lastActive,
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
  static fromData(
    data: UserData
  ): Omit<UserDb, "createdAt" | "updatedAt" | "lastActive"> {
    try {
      return {
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        email: "", // Not in Data, set by auth system
        avatarUrl: data.avatarUrl || "",
        registered: true, // Implied by existence of Data
        admin: false, // Set by separate admin management
      };
    } catch (error) {
      throw new RealmError("Failed to map user from Data to database", {
        cause: error,
      });
    }
  }
}
