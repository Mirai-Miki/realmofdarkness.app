import type {
  GuildDb,
  UpdateGuildData,
  InsertGuildData,
} from "@realm/database";
import type {
  IGuildRepository,
  GuildData,
  Snowflake,
  CreateGuildInput,
  UpdateGuildInput,
  UpsertGuildInput,
} from "@realm/common";

import { eq } from "drizzle-orm";
import {
  db,
  guilds,
  insertGuildSchema,
  updateGuildSchema,
} from "@realm/database";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { hasDataChanged } from "./repository.utilities";

/**
 * Convert database record to GuildData.
 */
function toGuildData(db: GuildDb): GuildData {
  return {
    id: db.id,
    name: db.name,
    iconUrl: db.iconUrl,
    storytellerRoleIds: db.storytellerRoleIds,
    createdAt: db.createdAt,
    lastUpdated: db.lastUpdated,
  };
}

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
   *
   * @param current - Current guild record from database
   * @param incoming - New guild data to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: GuildDb, incoming: UpdateGuildData): boolean {
    return hasDataChanged<GuildDb, UpdateGuildData>(current, incoming);
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

      return toGuildData(result[0]);
    } catch (error) {
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
      const dbRecord: InsertGuildData = {
        id: input.id,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
      };

      // Validate with insert schema
      const validatedData = insertGuildSchema.parse(dbRecord);

      const [result] = await db
        .insert(guilds)
        .values(validatedData)
        .returning();

      return toGuildData(result);
    } catch (error) {
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
   * @param input - Guild update input data
   * @returns Updated guild Data (or current data if no changes)
   */
  public async update(input: UpdateGuildInput): Promise<GuildData> {
    try {
      const validatedId = SnowflakeSchema.parse(input.id);

      // Fetch current guild to check for changes
      const currentResult = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, validatedId))
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("Guild not found for update", {
          fields: { guildId: input.id },
        });
      }

      const currentDb = currentResult[0];

      // Build update object with proper typing
      const updateData: UpdateGuildData = {
        id: input.id,
        storytellerRoleIds:
          input.storytellerRoleIds !== undefined
            ? input.storytellerRoleIds
            : currentDb.storytellerRoleIds,
        name: input.name !== undefined ? input.name : currentDb.name,
        iconUrl:
          input.iconUrl !== undefined ? input.iconUrl : currentDb.iconUrl,
        lastUpdated: new Date(),
      };

      // Check if anything actually changed
      if (!this.hasChanges(currentDb, updateData)) {
        // No changes detected - return current data without updating
        return toGuildData(currentDb);
      }

      // Validate with update schema
      const validatedData = updateGuildSchema.parse(updateData);

      const [result] = await db
        .update(guilds)
        .set(validatedData)
        .where(eq(guilds.id, input.id))
        .returning();

      return toGuildData(result);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error; // Re-throw known RealmErrors
      }
      throw new RealmError("Failed to update guild", {
        cause: error,
        fields: { guildId: input.id },
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
      // Check if guild exists
      const existingResult = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, input.id))
        .limit(1);

      if (existingResult.length > 0) {
        // Guild exists - update it
        const currentDb = existingResult[0];

        const updateData: UpdateGuildData = {
          id: input.id,
          name: input.name,
          storytellerRoleIds:
            input.storytellerRoleIds !== undefined
              ? input.storytellerRoleIds
              : currentDb.storytellerRoleIds,
          iconUrl: input.iconUrl,
          lastUpdated: new Date(),
        };

        if (!this.hasChanges(currentDb, updateData)) {
          // No changes - return existing data
          return toGuildData(currentDb);
        }

        // Data has changed - update
        const validatedData = updateGuildSchema.parse(updateData);

        const [result] = await db
          .update(guilds)
          .set(validatedData)
          .where(eq(guilds.id, input.id))
          .returning();

        return toGuildData(result);
      }

      // Guild doesn't exist - insert it
      const insertData: InsertGuildData = {
        id: input.id,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
      };

      const validatedData = insertGuildSchema.parse(insertData);

      const [result] = await db
        .insert(guilds)
        .values(validatedData)
        .returning();

      return toGuildData(result);
    } catch (error) {
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
