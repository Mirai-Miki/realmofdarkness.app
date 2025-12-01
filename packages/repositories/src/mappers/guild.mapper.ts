import type { GuildDb } from "@realm/database";
import { Guild } from "@realm/core";
import { RealmError } from "@realm/errors";

/**
 * Mapper for translating between Guild database records and Guild domain entities.
 *
 * Handles the conversion of:
 * - Database records (GuildDb) → Domain entities (Guild)
 * - Domain entities (Guild) → Database records (GuildDb)
 *
 * @example
 * ```typescript
 * // Database → Domain
 * const guild = GuildMapper.toDomain(dbRecord);
 *
 * // Domain → Database
 * const dbRecord = GuildMapper.fromDomain(guild);
 * ```
 */
export class GuildMapper {
  /**
   * Convert database record to Guild domain entity.
   *
   * @param db - Guild database record
   * @returns Guild domain entity
   * @throws {RealmError} If mapping fails
   */
  static toDomain(db: GuildDb): Guild {
    try {
      return new Guild({
        id: db.id,
        name: db.name,
        iconUrl: db.iconUrl,
        trackerChannel: db.trackerChannel,
      });
    } catch (error) {
      throw new RealmError("Failed to map guild from database to domain", {
        cause: error,
        fields: { guildId: db.id },
      });
    }
  }

  /**
   * Convert Guild domain entity to database record.
   *
   * @param guild - Guild domain entity
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  static fromDomain(guild: Guild): Omit<GuildDb, "createdAt" | "lastUpdated"> {
    try {
      const guildId: string = guild.id;
      const guildName: string = guild.name;
      const guildIconUrl: string = guild.iconUrl;
      const guildTrackerChannel: string = guild.trackerChannel;

      return {
        id: guildId,
        name: guildName,
        iconUrl: guildIconUrl,
        trackerChannel: guildTrackerChannel,
      };
    } catch (error) {
      throw new RealmError("Failed to map guild from domain to database", {
        cause: error,
        fields: { guildId: guild.id },
      });
    }
  }
}
