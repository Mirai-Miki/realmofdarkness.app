import { eq } from "drizzle-orm";
import { db, guilds } from "@realm/database";
import type { IGuildRepository, Snowflake } from "@realm/core";
import type { Guild } from "@realm/core";
import { RealmError } from "@realm/errors";
import { GuildMapper } from "./mappers/guild.mapper";

/**
 * Repository implementation for Guild entity using Drizzle ORM.
 *
 * Handles all database operations for guilds including CRUD operations
 * and queries.
 *
 * @example
 * ```typescript
 * const repo = new GuildRepository();
 * const guild = await repo.findById("123456789012345678");
 * ```
 */
export class GuildRepository implements IGuildRepository {
  /**
   * Find a guild by Discord guild ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns Guild if found, null otherwise
   */
  async findById(id: Snowflake): Promise<Guild | null> {
    try {
      const result = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return GuildMapper.toDomain(result[0]);
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
   * @param guild - Guild entity to create
   * @returns Created guild
   */
  async create(guild: Guild): Promise<Guild> {
    try {
      const dbRecord = GuildMapper.fromDomain(guild);

      const result = await db.insert(guilds).values(dbRecord).returning();

      return GuildMapper.toDomain(result[0]);
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
   * @param guild - Guild entity to update
   * @returns Updated guild
   */
  async update(guild: Guild): Promise<Guild> {
    try {
      const dbRecord = GuildMapper.fromDomain(guild);

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

      return GuildMapper.toDomain(result[0]);
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
