import { eq } from "drizzle-orm";
import { db, guilds } from "@realm/database";
import type {
  IGuildRepository,
  GuildData,
  Snowflake,
  UpsertGuildInput,
} from "@realm/common";
import { RealmError } from "@realm/common";
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
   * Find a guild by Discord guild ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns Guild Data if found, null otherwise
   */
  async findById(id: Snowflake): Promise<GuildData | null> {
    try {
      const result = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return GuildMapper.toData(result[0]);
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
   * @param guild - Guild Data to create
   * @returns Created guild Data
   */
  async create(guild: GuildData): Promise<GuildData> {
    try {
      const dbRecord = GuildMapper.fromData(guild);

      const result = await db.insert(guilds).values(dbRecord).returning();

      return GuildMapper.toData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to create guild", {
        cause: error,
        fields: { guildId: guild.id },
      });
    }
  }

  /**
   * Update an existing guild.
   *
   * @param guild - Guild Data to update
   * @returns Updated guild Data
   */
  async update(guild: GuildData): Promise<GuildData> {
    try {
      const dbRecord = GuildMapper.fromData(guild);

      const result = await db
        .update(guilds)
        .set({
          ...dbRecord,
          lastUpdated: new Date(),
        })
        .where(eq(guilds.id, guild.id))
        .returning();

      if (result.length === 0) {
        throw new RealmError("Guild not found for update", {
          fields: { guildId: guild.id },
        });
      }

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
   * If guild exists: updates provided fields (name, iconUrl, and storytellerRoleIds if provided).
   * If guild doesn't exist: creates new guild.
   *
   * @param input - Guild data to upsert
   * @returns Upserted guild Data
   */
  async upsert(input: UpsertGuildInput): Promise<GuildData> {
    const now = new Date();

    // Build the conflict update set dynamically based on provided fields
    const updateSet: {
      name: string;
      iconUrl: string;
      storytellerRoleIds?: Snowflake[];
      lastUpdated: Date;
    } = {
      name: input.name,
      iconUrl: input.iconUrl,
      lastUpdated: now,
    };

    // If storytellerRoleIds provided, update them
    if (input.storytellerRoleIds !== undefined) {
      updateSet.storytellerRoleIds = input.storytellerRoleIds;
    }

    const [result] = await db
      .insert(guilds)
      .values({
        id: input.id,
        name: input.name,
        iconUrl: input.iconUrl,
        storytellerRoleIds: input.storytellerRoleIds || [],
        createdAt: now,
        lastUpdated: now,
      })
      .onConflictDoUpdate({
        target: guilds.id,
        set: updateSet,
      })
      .returning();

    return result;
  }

  /**
   * Delete a guild by ID.
   *
   * @param id - Discord guild snowflake ID
   */
  async delete(id: Snowflake): Promise<void> {
    try {
      await db.delete(guilds).where(eq(guilds.id, id));
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
  async exists(id: Snowflake): Promise<boolean> {
    try {
      const result = await db
        .select({ id: guilds.id })
        .from(guilds)
        .where(eq(guilds.id, id))
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
