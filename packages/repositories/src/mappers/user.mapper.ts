import type { UserDb } from "@realm/database";
import type { UserDto } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between User database records and User DTOs.
 *
 * Handles the conversion of:
 * - Database records (UserDb) → DTOs (UserDto)
 * - DTOs (UserDto) → Database records (UserDb)
 *
 * @example
 * ```typescript
 * // Database → DTO
 * const userDto = UserMapper.toDto(dbRecord);
 *
 * // DTO → Database
 * const dbRecord = UserMapper.fromDto(userDto);
 * ```
 */
export class UserMapper {
  /**
   * Convert database record to User DTO.
   *
   * @param db - User database record
   * @returns User DTO
   * @throws {RealmError} If mapping fails
   */
  static toDto(db: UserDb): UserDto {
    try {
      return {
        id: db.id,
        username: db.username,
        displayName: db.displayName,
        avatarUrl: db.avatarUrl,
        createdAt: db.createdAt,
        lastActive: db.lastActive,
      };
    } catch (error) {
      throw new RealmError("Failed to map user from database to DTO", {
        cause: error,
        fields: { userId: db.id },
      });
    }
  }

  /**
   * Convert User DTO to database record.
   *
   * @param dto - User DTO
   * @returns User database record (without timestamps for insert)
   * @throws {RealmError} If mapping fails
   */
  static fromDto(
    dto: UserDto
  ): Omit<UserDb, "createdAt" | "updatedAt" | "lastActive"> {
    try {
      return {
        id: dto.id,
        username: dto.username,
        displayName: dto.displayName,
        email: "", // Not in DTO, set by auth system
        avatarUrl: dto.avatarUrl || "",
        registered: true, // Implied by existence of DTO
        admin: false, // Set by separate admin management
      };
    } catch (error) {
      throw new RealmError("Failed to map user from DTO to database", {
        cause: error,
      });
    }
  }
}
