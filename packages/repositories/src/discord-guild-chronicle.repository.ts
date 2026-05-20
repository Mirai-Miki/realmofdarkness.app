import type {
  DiscordGuildChronicleDb,
  InsertDiscordGuildChronicleData,
} from "@realm/database";
import type {
  IDiscordGuildChronicleRepository,
  DiscordGuildChronicleData,
  Snowflake,
  DiscordGuildChronicleRepositoryInput,
} from "@realm/common";

import { and, eq } from "drizzle-orm";
import {
  db,
  discordGuildChronicles,
  insertDiscordGuildChronicleSchema,
} from "@realm/database";
import { RealmError, SnowflakeSchema } from "@realm/common";

/**
 * Convert database record to DiscordGuildChronicleData.
 */
function toDiscordGuildChronicleData(
  db: DiscordGuildChronicleDb
): DiscordGuildChronicleData {
  return {
    discordId: db.discordId,
    chronicleId: db.chronicleId,
    createdAt: db.createdAt,
    lastUpdated: db.lastUpdated,
  };
}

/**
 * Repository implementation for Discord Guild Chronicle join table using Drizzle ORM.
 */
export class DiscordGuildChronicleRepository implements IDiscordGuildChronicleRepository {
  /**
   * Link a discord guild to a chronicle.
   */
  public async link(
    input: DiscordGuildChronicleRepositoryInput
  ): Promise<DiscordGuildChronicleData> {
    try {
      const dbRecord: InsertDiscordGuildChronicleData = {
        discordId: input.discordId,
        chronicleId: input.chronicleId,
      };

      const validatedData = insertDiscordGuildChronicleSchema.parse(dbRecord);

      const [result] = await db
        .insert(discordGuildChronicles)
        .values(validatedData)
        .onConflictDoNothing() // Prevent duplicate links throwing errors
        .returning();

      // If it already existed, onConflictDoNothing returns empty array.
      // We should fetch the existing one.
      if (!result) {
        const existingResult = await db
          .select()
          .from(discordGuildChronicles)
          .where(
            and(
              eq(discordGuildChronicles.discordId, validatedData.discordId),
              eq(discordGuildChronicles.chronicleId, validatedData.chronicleId)
            )
          )
          .limit(1);
        return toDiscordGuildChronicleData(existingResult[0]);
      }

      return toDiscordGuildChronicleData(result);
    } catch (error) {
      throw new RealmError("Failed to link discord guild to chronicle", {
        cause: error,
        fields: { discordId: input.discordId, chronicleId: input.chronicleId },
      });
    }
  }

  /**
   * Unlink a discord guild from a chronicle.
   */
  public async unlink(
    input: DiscordGuildChronicleRepositoryInput
  ): Promise<void> {
    try {
      const validDiscordId = SnowflakeSchema.parse(input.discordId);
      const validChronicleId = SnowflakeSchema.parse(input.chronicleId);

      await db
        .delete(discordGuildChronicles)
        .where(
          and(
            eq(discordGuildChronicles.discordId, validDiscordId),
            eq(discordGuildChronicles.chronicleId, validChronicleId)
          )
        );
    } catch (error) {
      throw new RealmError("Failed to unlink discord guild from chronicle", {
        cause: error,
        fields: { discordId: input.discordId, chronicleId: input.chronicleId },
      });
    }
  }

  /**
   * Find all chronicles linked to a specific discord guild.
   */
  public async findByDiscordId(
    discordId: Snowflake
  ): Promise<DiscordGuildChronicleData[]> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);

      const result = await db
        .select()
        .from(discordGuildChronicles)
        .where(eq(discordGuildChronicles.discordId, validatedId));

      return result.map(toDiscordGuildChronicleData);
    } catch (error) {
      throw new RealmError(
        "Failed to find discord guild chronicles by discord ID",
        {
          cause: error,
          fields: { discordId },
        }
      );
    }
  }

  /**
   * Find all discord guilds linked to a specific chronicle.
   */
  public async findByChronicleId(
    chronicleId: Snowflake
  ): Promise<DiscordGuildChronicleData[]> {
    try {
      const validatedId = SnowflakeSchema.parse(chronicleId);

      const result = await db
        .select()
        .from(discordGuildChronicles)
        .where(eq(discordGuildChronicles.chronicleId, validatedId));

      return result.map(toDiscordGuildChronicleData);
    } catch (error) {
      throw new RealmError(
        "Failed to find discord guild chronicles by chronicle ID",
        {
          cause: error,
          fields: { chronicleId },
        }
      );
    }
  }
}
