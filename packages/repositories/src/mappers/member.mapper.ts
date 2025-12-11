import type { MemberDb } from "@realm/database";
import { Member } from "@realm/core";
import { RealmError } from "@realm/errors";

/**
 * Mapper for translating between Member database records and Member domain entities.
 *
 * Handles the conversion of:
 * - Database records (MemberDb) → Domain entities (Member)
 * - Domain entities (Member) → Database records (MemberDb)
 *
 * @example
 * ```typescript
 * // Database → Domain
 * const member = MemberMapper.toDomain(dbRecord);
 *
 * // Domain → Database
 * const dbRecord = MemberMapper.fromDomain(member);
 * ```
 */
export class MemberMapper {
  /**
   * Convert database record to Member domain entity.
   *
   * @param db - Member database record
   * @returns Member domain entity
   * @throws {RealmError} If mapping fails
   */
  static toDomain(db: MemberDb): Member {
    try {
      return new Member({
        guildId: db.guildId,
        userId: db.userId,
        admin: db.admin,
        storyteller: db.storyteller,
        boosted: db.boosted,
        nickname: db.nickname,
        avatarUrl: db.avatarUrl,
        createdAt: db.createdAt,
        lastUpdated: db.lastUpdated,
      });
    } catch (error) {
      throw new RealmError("Failed to map member from database to domain", {
        cause: error,
        fields: {
          guildId: db.guildId,
          userId: db.userId,
        },
      });
    }
  }

  /**
   * Convert Member domain entity to database record.
   *
   * @param member - Member domain entity
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDomain(member: Member): MemberDb {
    try {
      const guildId: string = member.guildId;
      const userId: string = member.userId;
      const admin: boolean = member.admin;
      const storyteller: boolean = member.storyteller;
      const boosted: number = member.boosted;
      const nickname: string = member.nickname;
      const avatarUrl: string = member.avatarUrl;
      const createdAt: Date = member.createdAt;
      const lastUpdated: Date = member.lastUpdated;

      return {
        guildId,
        userId,
        admin,
        storyteller,
        boosted,
        nickname,
        avatarUrl,
        createdAt,
        lastUpdated,
      };
    } catch (error) {
      throw new RealmError("Failed to map member from domain to database", {
        cause: error,
        fields: {
          guildId: member.guildId,
          userId: member.userId,
        },
      });
    }
  }
}
