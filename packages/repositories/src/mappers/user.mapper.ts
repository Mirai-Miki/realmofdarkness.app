import type { UserDb } from "@realm/database";
import { User } from "@realm/core";
import { RealmError } from "@realm/errors";

/**
 * Mapper for translating between User database records and User domain entities.
 *
 * Handles the conversion of:
 * - Database records (UserDb) → Domain entities (User)
 * - Domain entities (User) → Database records (UserDb)
 *
 * @example
 * ```typescript
 * // Database → Domain
 * const user = UserMapper.toDomain(dbRecord);
 *
 * // Domain → Database
 * const dbRecord = UserMapper.fromDomain(user);
 * ```
 */
export class UserMapper {
  /**
   * Convert database record to User domain entity.
   *
   * @param db - User database record
   * @returns User domain entity
   * @throws {RealmError} If mapping fails
   */
  static toDomain(db: UserDb): User {
    try {
      return new User({
        id: db.id,
        username: db.username,
        displayName: db.displayName,
        email: db.email,
        avatarUrl: db.avatarUrl,
        registered: db.registered,
        admin: db.admin,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt,
        lastActive: db.lastActive,
      });
    } catch (error) {
      throw new RealmError("Failed to map user from database to domain", {
        cause: error,
        fields: { userId: db.id },
      });
    }
  }

  /**
   * Convert User domain entity to database record.
   *
   * @param user - User domain entity
   * @returns User database record (without timestamps for insert)
   * @throws {RealmError} If mapping fails
   */
  static fromDomain(
    user: User
  ): Omit<UserDb, "createdAt" | "updatedAt" | "lastActive"> {
    try {
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        registered: user.registered,
        admin: user.admin,
      };
    } catch (error) {
      throw new RealmError("Failed to map user from domain to database", {
        cause: error,
      });
    }
  }
}
