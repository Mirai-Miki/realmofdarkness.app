import type { GuildDb } from "@realm/database";
import type { GuildDto } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between Guild database records and Guild DTOs.
 *
 * Handles the conversion of:
 * - Database records (GuildDb) → Data Transfer Objects (GuildDto)
 * - Data Transfer Objects (GuildDto) → Database records (GuildDb)
 *
 * @example
 * ```typescript
 * // Database → DTO
 * const guildDto = GuildMapper.toDto(dbRecord);
 *
 * // DTO → Database
 * const dbRecord = GuildMapper.fromDto(guildDto);
 * ```
 */
export class GuildMapper {
  /**
   * Convert database record to Guild DTO.
   *
   * @param db - Guild database record
   * @returns Guild DTO
   * @throws {RealmError} If mapping fails
   */
  static toDto(db: GuildDb): GuildDto {
    try {
      return {
        id: db.id,
        name: db.name,
        iconUrl: db.iconUrl || "",
        storytellerRoleIds: db.storytellerRoleIds,
        createdAt: db.createdAt,
        lastUpdated: db.lastUpdated,
      };
    } catch (error) {
      throw new RealmError("Failed to map guild from database to DTO", {
        cause: error,
        fields: { guildId: db.id },
      });
    }
  }

  /**
   * Convert Guild DTO to database record.
   *
   * @param dto - Guild DTO
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDto(dto: GuildDto): Omit<GuildDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        id: dto.id,
        name: dto.name,
        iconUrl: dto.iconUrl,
        storytellerRoleIds: dto.storytellerRoleIds,
      };
    } catch (error) {
      throw new RealmError("Failed to map guild from DTO to database", {
        cause: error,
        fields: { guildId: dto.id },
      });
    }
  }
}
