import type {
  DiscordGuildDb,
  UpdateDiscordGuildData,
  InsertDiscordGuildData,
} from "@realm/database";
import type {
  IDiscordGuildRepository,
  DiscordGuildData,
  Snowflake,
  DiscordGuildRepositoryInput,
} from "@realm/common";

import { eq } from "drizzle-orm";
import {
  db,
  discordGuilds,
  insertDiscordGuildSchema,
  updateDiscordGuildSchema,
} from "@realm/database";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { hasDataChanged } from "./repository.utilities";

/**
 * Convert database record to DiscordGuildData.
 */
function toDiscordGuildData(db: DiscordGuildDb): DiscordGuildData {
  return {
    discordId: db.discordId,
    name: db.name,
    iconUrl: db.iconUrl,
    storytellerRoleIds: db.storytellerRoleIds,
    createdAt: db.createdAt,
    lastUpdated: db.lastUpdated,
  };
}

/**
 * Repository implementation for Discord Guild entity using Drizzle ORM.
 */
export class DiscordGuildRepository implements IDiscordGuildRepository {
  private hasChanges(
    current: DiscordGuildDb,
    incoming: UpdateDiscordGuildData
  ): boolean {
    return hasDataChanged<DiscordGuildDb, UpdateDiscordGuildData>(
      current,
      incoming
    );
  }

  /**
   * Find a Discord guild configuration by its Discord snowflake ID.
   *
   * @param discordId - Discord guild snowflake ID
   * @returns The discord guild config if found, null otherwise
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const guild = await repository.findById("123456789012345678");
   * ```
   */
  public async findById(
    discordId: Snowflake
  ): Promise<DiscordGuildData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);

      const result = await db
        .select()
        .from(discordGuilds)
        .where(eq(discordGuilds.discordId, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toDiscordGuildData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find discord guild by ID", {
        cause: error,
        fields: { discordId },
      });
    }
  }

  // findByChronicleId removed (delegated to DiscordGuildChronicleRepository)

  /**
   * Create a new Discord guild configuration record.
   *
   * @param input - Repository input representing the new guild configuration
   * @returns The created DiscordGuildData configuration
   * @throws {RealmError} If validation or database insertion fails
   *
   * @example
   * ```typescript
   * const guild = await repository.create({
   *   discordId: "123456789012345678",
   *   name: "My Server",
   * });
   * ```
   */
  public async create(
    input: DiscordGuildRepositoryInput
  ): Promise<DiscordGuildData> {
    try {
      const dbRecord: InsertDiscordGuildData = {
        discordId: input.discordId,
        name: input.name,
        iconUrl: input.iconUrl || "",
        storytellerRoleIds: input.storytellerRoleIds || [],
      };

      const validatedData = insertDiscordGuildSchema.parse(dbRecord);

      const [result] = await db
        .insert(discordGuilds)
        .values(validatedData)
        .returning();

      return toDiscordGuildData(result);
    } catch (error) {
      throw new RealmError("Failed to create discord guild", {
        cause: error,
        fields: { discordId: input.discordId },
      });
    }
  }

  /**
   * Update an existing Discord guild configuration.
   *
   * @param input - Repository input representing updated fields
   * @param options - Optional flags (e.g. ignoreNotFound)
   * @returns The updated DiscordGuildData configuration, or null if ignoreNotFound is true and guild isn't found
   * @throws {RealmError} If database update fails, or if not found and ignoreNotFound is false
   *
   * @example
   * ```typescript
   * const updated = await repository.update({
   *   discordId: "123456789012345678",
   *   name: "Updated Name",
   * });
   * ```
   */
  public async update(
    input: DiscordGuildRepositoryInput
  ): Promise<DiscordGuildData>;
  public async update(
    input: DiscordGuildRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<DiscordGuildData | null>;
  public async update(
    input: DiscordGuildRepositoryInput,
    options?: { ignoreNotFound: boolean }
  ): Promise<DiscordGuildData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(input.discordId);

      const currentResult = await db
        .select()
        .from(discordGuilds)
        .where(eq(discordGuilds.discordId, validatedId))
        .limit(1);

      if (currentResult.length === 0) {
        if (!options?.ignoreNotFound) {
          throw new RealmError("Discord guild not found for update", {
            fields: { discordId: input.discordId },
          });
        }
        return null;
      }

      return await this.performUpdate(input, currentResult[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to update discord guild", {
        cause: error,
        fields: { discordId: input.discordId },
      });
    }
  }

  private async performUpdate(
    input: DiscordGuildRepositoryInput,
    currentGuild: DiscordGuildDb
  ): Promise<DiscordGuildData> {
    try {
      const updateData: UpdateDiscordGuildData = {
        discordId: input.discordId,
        storytellerRoleIds:
          input.storytellerRoleIds !== undefined
            ? input.storytellerRoleIds
            : currentGuild.storytellerRoleIds,
        name: input.name !== undefined ? input.name : currentGuild.name,
        iconUrl:
          input.iconUrl !== undefined ? input.iconUrl : currentGuild.iconUrl,
        lastUpdated: new Date(),
      };

      if (!this.hasChanges(currentGuild, updateData)) {
        return toDiscordGuildData(currentGuild);
      }

      const validatedData = updateDiscordGuildSchema.parse(updateData);

      const [result] = await db
        .update(discordGuilds)
        .set(validatedData)
        .where(eq(discordGuilds.discordId, input.discordId))
        .returning();

      return toDiscordGuildData(result);
    } catch (error) {
      throw new RealmError("Failed to update discord guild", {
        cause: error,
        fields: { discordId: input.discordId },
      });
    }
  }

  /**
   * Create or update a Discord guild configuration (upsert).
   *
   * @param input - Repository input representing the guild configuration
   * @returns The upserted DiscordGuildData configuration
   * @throws {RealmError} If database upsert fails
   *
   * @example
   * ```typescript
   * const guild = await repository.upsert({
   *   discordId: "123456789012345678",
   *   name: "Upserted Server",
   * });
   * ```
   */
  public async upsert(
    input: DiscordGuildRepositoryInput
  ): Promise<DiscordGuildData> {
    try {
      const existingResult = await db
        .select()
        .from(discordGuilds)
        .where(eq(discordGuilds.discordId, input.discordId))
        .limit(1);

      if (existingResult.length > 0) {
        return await this.performUpdate(input, existingResult[0]);
      } else {
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert discord guild", {
        cause: error,
        fields: { discordId: input.discordId, name: input.name },
      });
    }
  }

  /**
   * Delete a Discord guild configuration record.
   *
   * @param discordId - Discord guild snowflake ID
   * @throws {RealmError} If deletion fails
   *
   * @example
   * ```typescript
   * await repository.delete("123456789012345678");
   * ```
   */
  public async delete(discordId: Snowflake): Promise<void> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);
      await db
        .delete(discordGuilds)
        .where(eq(discordGuilds.discordId, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete discord guild", {
        cause: error,
        fields: { discordId },
      });
    }
  }

  /**
   * Check if a Discord guild configuration exists.
   *
   * @param discordId - Discord guild snowflake ID
   * @returns True if the guild configuration exists, false otherwise
   * @throws {RealmError} If database check fails
   *
   * @example
   * ```typescript
   * const exists = await repository.exists("123456789012345678");
   * ```
   */
  public async exists(discordId: Snowflake): Promise<boolean> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);

      const result = await db
        .select({ discordId: discordGuilds.discordId })
        .from(discordGuilds)
        .where(eq(discordGuilds.discordId, validatedId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check discord guild existence", {
        cause: error,
        fields: { discordId },
      });
    }
  }
}
