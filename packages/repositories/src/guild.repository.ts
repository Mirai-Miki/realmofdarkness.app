import { eq } from "drizzle-orm";
import { db, guilds, insertGuildSchema } from "@realm/database";
import type { GuildDb } from "@realm/database";
import type {
  IGuildRepository,
  GuildData,
  Snowflake,
  CreateGuildInput,
  UpsertGuildInput,
} from "@realm/common";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { GuildMapper } from "./mappers/guild.mapper";

/**
 * Repository implementation for Guild entity using Drizzle ORM.
 *
 * Handles all database operations for guilds including CRUD operations
 * and queries. Returns Guild Data that can be hydrated into domain entities.
 *
 * @example
 * ```typescript
 * const repo = new GuildRepository();
 * const guildData = await repo.findById("123456789012345678");
 * ```
 */
export class GuildRepository implements IGuildRepository {
  /**
   * Check if guild database record has actually changed by comparing relevant fields.
   * Excludes id and timestamps from comparison.
   *
   * @param current - Current guild record from database
   * @param incoming - New guild record to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: GuildDb, incoming: Partial<GuildDb>): boolean {
    const keysToCompare = Object.keys(incoming).filter(
      (key) => !["id", "createdAt", "lastUpdated"].includes(key)
    ) as (keyof GuildDb)[];

    for (const key of keysToCompare) {
      if (JSON.stringify(current[key]) !== JSON.stringify(incoming[key])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find a guild by Discord guild ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns Guild Data if found, null otherwise
   */
  public async findById(id: Snowflake): Promise<GuildData | null> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      const result = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return GuildMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to find guild by ID", {
        cause: error,
        fields: { guildId: id },
      });
    }
  }

  /**
   * Create a new guild.
   *
   * @param input - Create guild input (without timestamps)
   * @throws {RealmError} If creation fails or guild already exists
   * @returns Created guild Data
   */
  public async create(input: CreateGuildInput): Promise<GuildData> {
    try {
      // Validate snowflake format first
      SnowflakeSchema.parse(input.id);

      const dbRecord = GuildMapper.fromCreateInput(input);

      // Validate with Zod schema before inserting
      const validated = insertGuildSchema.parse(dbRecord);

      const result = await db.insert(guilds).values(validated).returning();

      return GuildMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to create guild", {
        cause: error,
        fields: { guildId: input.id },
      });
    }
  }

  /**
   * Update an existing guild.
   * Only performs database update if data has actually changed.
   *
   * @param guild - Guild Data to update
   * @returns Updated guild Data (or current data if no changes)
   */
  public async update(guild: GuildData): Promise<GuildData> {
    try {
      // Validate snowflake format first
      SnowflakeSchema.parse(guild.id);

      // Fetch current guild to check for changes
      const currentResult = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, guild.id))
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("Guild not found for update", {
          fields: { guildId: guild.id },
        });
      }

      const currentDb = currentResult[0];
      const incomingDb = GuildMapper.fromData(guild);

      // Check if anything actually changed
      if (!this.hasChanges(currentDb, incomingDb)) {
        // No changes detected - return current data without updating
        return GuildMapper.toData(currentDb);
      }

      // Data has changed - proceed with update
      const validated = insertGuildSchema.partial().parse({
        ...incomingDb,
        lastUpdated: new Date(),
      });

      const result = await db
        .update(guilds)
        .set(validated)
        .where(eq(guilds.id, guild.id))
        .returning();

      return GuildMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to update guild", {
        cause: error,
        fields: { guildId: guild.id },
      });
    }
  }

  /**
   * Upsert a guild.
   * If guild exists: updates provided fields only if data has changed.
   * If guild doesn't exist: creates new guild.
   *
   * @param input - Guild data to upsert
   * @returns Upserted guild Data
   */
  public async upsert(input: UpsertGuildInput): Promise<GuildData> {
    try {
      // Validate snowflake format first
      SnowflakeSchema.parse(input.id);

      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(input.id);

      // Check if guild exists
      const existingResult = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, validatedId))
        .limit(1);

      if (existingResult.length > 0) {
        // Guild exists - check if data has changed
        const currentDb = existingResult[0];
        const incomingDb: Partial<GuildDb> = {
          name: input.name,
          iconUrl: input.iconUrl,
        };

        if (input.storytellerRoleIds !== undefined) {
          incomingDb.storytellerRoleIds = input.storytellerRoleIds;
        }

        if (!this.hasChanges(currentDb, incomingDb)) {
          // No changes - return existing data without updating
          return GuildMapper.toData(currentDb);
        }
      }

      // Either guild doesn't exist, or data has changed - proceed with upsert
      const now = new Date();

      // Build insert values
      const insertValues = insertGuildSchema.parse({
        id: validatedId,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
        createdAt: now,
        lastUpdated: now,
      });

      // Build conflict update set
      const conflictUpdate: Partial<typeof guilds.$inferInsert> = {
        name: input.name,
        iconUrl: input.iconUrl,
        lastUpdated: now,
      };

      if (input.storytellerRoleIds !== undefined) {
        conflictUpdate.storytellerRoleIds = input.storytellerRoleIds;
      }

      const validatedUpdate = insertGuildSchema.partial().parse(conflictUpdate);

      const [result] = await db
        .insert(guilds)
        .values(insertValues)
        .onConflictDoUpdate({
          target: guilds.id,
          set: validatedUpdate,
        })
        .returning();

      return GuildMapper.toData(result);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to upsert guild", {
        cause: error,
        fields: { guildId: input.id, guildName: input.name },
      });
    }
  }

  /**
   * Delete a guild by ID.
   *
   * @param id - Discord guild snowflake ID
   */
  public async delete(id: Snowflake): Promise<void> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      await db.delete(guilds).where(eq(guilds.id, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete guild", {
        cause: error,
        fields: { guildId: id },
      });
    }
  }

  /**
   * Check if a guild exists by ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns True if guild exists
   */
  public async exists(id: Snowflake): Promise<boolean> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      const result = await db
        .select({ id: guilds.id })
        .from(guilds)
        .where(eq(guilds.id, validatedId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check guild existence", {
        cause: error,
        fields: { guildId: id },
      });
    }
  }
}
