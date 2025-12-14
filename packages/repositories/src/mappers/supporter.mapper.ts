import type { SupporterDb } from "@realm/database";
import type { SupporterDto } from "@realm/common";
import { RealmError, SupporterLevel } from "@realm/common";

/**
 * Mapper for translating between Supporter database records and Supporter DTOs.
 *
 * Handles the conversion of:
 * - Database records (SupporterDb) → Data Transfer Objects (SupporterDto)
 * - Data Transfer Objects (SupporterDto) → Database records (SupporterDb)
 *
 * @example
 * ```typescript
 * // Database → DTO
 * const supporterDto = SupporterMapper.toDto(dbRecord);
 *
 * // DTO → Database
 * const dbRecord = SupporterMapper.fromDto(supporterDto);
 * ```
 */
export class SupporterMapper {
  /**
   * Convert database record to Supporter DTO.
   *
   * @param db - Supporter database record
   * @returns Supporter DTO
   * @throws {RealmError} If mapping fails
   */
  static toDto(db: SupporterDb): SupporterDto {
    try {
      return {
        userId: db.userId,
        level: db.level as SupporterLevel,
        boosts: db.boosts,
        firstSupported: db.firstSupported,
      };
    } catch (error) {
      throw new RealmError("Failed to map supporter from database to DTO", {
        cause: error,
        fields: { userId: db.userId },
      });
    }
  }

  /**
   * Convert Supporter DTO to database record.
   *
   * @param dto - Supporter DTO
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDto(
    dto: SupporterDto
  ): Omit<SupporterDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        userId: dto.userId,
        level: dto.level,
        boosts: dto.boosts,
        firstSupported: dto.firstSupported,
      };
    } catch (error) {
      throw new RealmError("Failed to map supporter from DTO to database", {
        cause: error,
        fields: { userId: dto.userId },
      });
    }
  }
}
