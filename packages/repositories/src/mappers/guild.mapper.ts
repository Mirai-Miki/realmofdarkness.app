import type { GuildDb } from "@realm/database";
import type { GuildData, CreateGuildInput } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Mapper for translating between Guild database records and Guild Data.
 *
 * Handles the conversion of:
 * - Database records (GuildDb) → Data (GuildData)
 * - Data (GuildData) → Database records (GuildDb)
 *
 * @example
 * ```typescript
 * // Database → Data
 * const guildData = GuildMapper.toData(dbRecord);
 *
 * // Data → Database
 * const dbRecord = GuildMapper.fromData(guildData);
 * ```
 */
export class GuildMapper {
  /**
   * Convert database record to Guild Data.
   *
   * @param db - Guild database record
   * @returns Guild Data
   * @throws {RealmError} If mapping fails
   */
  public static toData(db: GuildDb): GuildData {
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
      throw new RealmError("Failed to map guild from database to Data", {
        cause: error,
        fields: { guildId: db.id },
      });
    }
  }

  /**
   * Convert Guild Data to database record.
   *
   * @param data - Guild Data
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  public static fromData(
    data: GuildData
  ): Omit<GuildDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        id: data.id,
        name: data.name,
        iconUrl: data.iconUrl,
        storytellerRoleIds: data.storytellerRoleIds,
      };
    } catch (error) {
      throw new RealmError("Failed to map guild from Data to database", {
        cause: error,
        fields: { guildId: data.id },
      });
    }
  }

  /**
   * Convert CreateGuildInput to database record.
   * Used when creating new guilds from API/Bot input.
   *
   * @param input - Create guild input (validated user input)
   * @returns Database record (without auto-generated timestamps)
   * @throws {RealmError} If mapping fails
   */
  public static fromCreateInput(
    input: CreateGuildInput
  ): Omit<GuildDb, "createdAt" | "lastUpdated"> {
    try {
      return {
        id: input.id,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
      };
    } catch (error) {
      throw new RealmError(
        "Failed to map CreateGuildInput to database record",
        {
          cause: error,
          fields: { guildId: input.id },
        }
      );
    }
  }
}
