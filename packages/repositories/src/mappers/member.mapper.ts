import type { MemberDb } from "@realm/database";
import type { MemberDto } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between Member database records and Member DTOs.
 *
 * Handles the conversion of:
 * - Database records (MemberDb) → Data Transfer Objects (MemberDto)
 * - Data Transfer Objects (MemberDto) → Database records (MemberDb)
 *
 * @example
 * ```typescript
 * // Database → DTO
 * const memberDto = MemberMapper.toDto(dbRecord);
 *
 * // DTO → Database
 * const dbRecord = MemberMapper.fromDto(memberDto);
 * ```
 */
export class MemberMapper {
  /**
   * Convert database record to Member DTO.
   *
   * @param db - Member database record
   * @returns Member DTO
   * @throws {RealmError} If mapping fails
   */
  static toDto(db: MemberDb): MemberDto {
    try {
      return {
        guildId: db.guildId,
        userId: db.userId,
        isStoryteller: db.storyteller,
        experienceAwarded: db.boosted,
        joinedAt: db.createdAt,
        lastActive: db.lastUpdated,
      };
    } catch (error) {
      throw new RealmError("Failed to map member from database to DTO", {
        cause: error,
        fields: {
          guildId: db.guildId,
          userId: db.userId,
        },
      });
    }
  }

  /**
   * Convert Member DTO to database record.
   *
   * @param dto - Member DTO
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDto(dto: MemberDto): Omit<MemberDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        guildId: dto.guildId,
        userId: dto.userId,
        admin: false, // Set by separate admin management logic
        storyteller: dto.isStoryteller,
        boosted: dto.experienceAwarded,
        nickname: "", // Set by Discord sync
        avatarUrl: "", // Set by Discord sync
      };
    } catch (error) {
      throw new RealmError("Failed to map member from DTO to database", {
        cause: error,
        fields: {
          guildId: dto.guildId,
          userId: dto.userId,
        },
      });
    }
  }
}
