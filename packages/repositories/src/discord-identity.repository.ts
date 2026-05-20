import type {
  DiscordIdentityDb,
  UpdateDiscordIdentityData,
  InsertDiscordIdentityData,
} from "@realm/database";
import type {
  IDiscordIdentityRepository,
  DiscordIdentityData,
  Snowflake,
  DiscordIdentityRepositoryInput,
} from "@realm/common";

import { eq } from "drizzle-orm";
import {
  db,
  discordIdentities,
  insertDiscordIdentitySchema,
  updateDiscordIdentitySchema,
} from "@realm/database";
import { RealmError, SnowflakeSchema } from "@realm/common";

/**
 * Convert database record to DiscordIdentityData.
 */
function toDiscordIdentityData(db: DiscordIdentityDb): DiscordIdentityData {
  return {
    discordId: db.discordId,
    userId: db.userId,
    createdAt: db.createdAt,
  };
}

/**
 * Repository implementation for Discord Identity mapping using Drizzle ORM.
 */
export class DiscordIdentityRepository implements IDiscordIdentityRepository {
  /**
   * Find a Discord identity mapping by its Discord snowflake ID.
   *
   * @param discordId - Discord user snowflake ID
   * @returns The discord identity mapping if found, null otherwise
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const identity = await repository.findByDiscordId("123456789012345678");
   * ```
   */
  public async findByDiscordId(
    discordId: Snowflake
  ): Promise<DiscordIdentityData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);

      const result = await db
        .select()
        .from(discordIdentities)
        .where(eq(discordIdentities.discordId, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toDiscordIdentityData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find discord identity by discord ID", {
        cause: error,
        fields: { discordId },
      });
    }
  }

  /**
   * Find a Discord identity mapping by its RoD User ID.
   *
   * @param userId - RoD User snowflake ID
   * @returns The discord identity mapping if found, null otherwise
   * @throws {RealmError} If the database query fails
   *
   * @example
   * ```typescript
   * const identity = await repository.findByUserId("987654321098765432");
   * ```
   */
  public async findByUserId(
    userId: Snowflake
  ): Promise<DiscordIdentityData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(discordIdentities)
        .where(eq(discordIdentities.userId, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toDiscordIdentityData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find discord identity by user ID", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Create a new Discord identity mapping record.
   *
   * @param input - Repository input representing the identity mapping
   * @returns The created DiscordIdentityData mapping
   * @throws {RealmError} If validation or database insertion fails
   *
   * @example
   * ```typescript
   * const identity = await repository.create({
   *   discordId: "123456789012345678",
   *   userId: "987654321098765432",
   *   username: "discord_user",
   * });
   * ```
   */
  public async create(
    input: DiscordIdentityRepositoryInput
  ): Promise<DiscordIdentityData> {
    try {
      const dbRecord: InsertDiscordIdentityData = {
        discordId: input.discordId,
        userId: input.userId,
      };

      const validatedData = insertDiscordIdentitySchema.parse(dbRecord);

      const [result] = await db
        .insert(discordIdentities)
        .values(validatedData)
        .returning();

      return toDiscordIdentityData(result);
    } catch (error) {
      throw new RealmError("Failed to create discord identity", {
        cause: error,
        fields: { discordId: input.discordId, userId: input.userId },
      });
    }
  }

  /**
   * Create or update a Discord identity mapping (upsert).
   *
   * @param input - Repository input representing the identity mapping
   * @returns The upserted DiscordIdentityData mapping
   * @throws {RealmError} If database upsert fails
   *
   * @example
   * ```typescript
   * const identity = await repository.upsert({
   *   discordId: "123456789012345678",
   *   userId: "987654321098765432",
   *   username: "discord_user",
   * });
   * ```
   */
  public async upsert(
    input: DiscordIdentityRepositoryInput
  ): Promise<DiscordIdentityData> {
    try {
      const existingResult = await db
        .select()
        .from(discordIdentities)
        .where(eq(discordIdentities.discordId, input.discordId))
        .limit(1);

      if (existingResult.length > 0) {
        const updateData: UpdateDiscordIdentityData = {
          discordId: input.discordId,
          userId: input.userId,
        };
        const validatedData = updateDiscordIdentitySchema.parse(updateData);
        const [result] = await db
          .update(discordIdentities)
          .set(validatedData)
          .where(eq(discordIdentities.discordId, input.discordId))
          .returning();
        return toDiscordIdentityData(result);
      } else {
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert discord identity", {
        cause: error,
        fields: { discordId: input.discordId, userId: input.userId },
      });
    }
  }

  /**
   * Delete a Discord identity mapping by its Discord snowflake ID.
   *
   * @param discordId - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   *
   * @example
   * ```typescript
   * await repository.deleteByDiscordId("123456789012345678");
   * ```
   */
  public async deleteByDiscordId(discordId: Snowflake): Promise<void> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);
      await db
        .delete(discordIdentities)
        .where(eq(discordIdentities.discordId, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete discord identity by discord ID", {
        cause: error,
        fields: { discordId },
      });
    }
  }

  /**
   * Delete a Discord identity mapping by its RoD User ID.
   *
   * @param userId - RoD User snowflake ID
   * @throws {RealmError} If deletion fails
   *
   * @example
   * ```typescript
   * await repository.deleteByUserId("987654321098765432");
   * ```
   */
  public async deleteByUserId(userId: Snowflake): Promise<void> {
    try {
      const validatedId = SnowflakeSchema.parse(userId);
      await db
        .delete(discordIdentities)
        .where(eq(discordIdentities.userId, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete discord identity by user ID", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Check if a Discord identity mapping exists by Discord snowflake ID.
   *
   * @param discordId - Discord user snowflake ID
   * @returns True if the mapping exists, false otherwise
   * @throws {RealmError} If database check fails
   *
   * @example
   * ```typescript
   * const exists = await repository.existsByDiscordId("123456789012345678");
   * ```
   */
  public async existsByDiscordId(discordId: Snowflake): Promise<boolean> {
    try {
      const validatedId = SnowflakeSchema.parse(discordId);
      const result = await db
        .select({ discordId: discordIdentities.discordId })
        .from(discordIdentities)
        .where(eq(discordIdentities.discordId, validatedId))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      throw new RealmError(
        "Failed to check discord identity existence by discord ID",
        {
          cause: error,
          fields: { discordId },
        }
      );
    }
  }

  /**
   * Check if a Discord identity mapping exists by RoD User ID.
   *
   * @param userId - RoD User snowflake ID
   * @returns True if the mapping exists, false otherwise
   * @throws {RealmError} If database check fails
   *
   * @example
   * ```typescript
   * const exists = await repository.existsByUserId("987654321098765432");
   * ```
   */
  public async existsByUserId(userId: Snowflake): Promise<boolean> {
    try {
      const validatedId = SnowflakeSchema.parse(userId);
      const result = await db
        .select({ discordId: discordIdentities.discordId })
        .from(discordIdentities)
        .where(eq(discordIdentities.userId, validatedId))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      throw new RealmError(
        "Failed to check discord identity existence by user ID",
        {
          cause: error,
          fields: { userId },
        }
      );
    }
  }
}
