import type { GuildDb } from "@realm/database";
import type { Guild } from "discord.js";

import { RealmError } from "@realm/core";
import { logger } from "@realm/core/logger";
import { db } from "@realm/database";
import { guilds } from "@realm/database/schema/guilds";
import { eq } from "drizzle-orm";

const location = "bot/src/entities/AppGuild.ts";

/**
 * Extended Guild class that combines Discord.js Guild functionality with database operations.
 *
 * This class automatically ensures the guild exists in the database during construction,
 * providing type safety since database data is always loaded after successful construction.
 *
 * @example
 * ```typescript
 * // Basic usage - constructor ensures DB data is loaded
 * const appGuild = await AppGuild.from(interaction.guild);
 *
 * // Safe to access database properties immediately
 * console.log(`Tracker Channel: ${appGuild.trackerChannel}`);
 * console.log(`Created: ${appGuild.createdAt}`);
 *
 * // Access Discord.js functionality
 * const channels = appGuild.djs.channels.cache;
 * ```
 */
export class AppGuild {
  /** The Discord.js Guild instance - public for full access to Discord functionality */
  public readonly djs: Guild;

  /** Database data - guaranteed to be loaded after successful construction */
  private _dbData: GuildDb;

  /** Tracks if there are unsaved changes */
  private _hasChanges = false;

  /**
   * Private constructor - use AppGuild.from() to create instances
   */
  private constructor(guild: Guild, dbData: GuildDb) {
    this.djs = guild;
    this._dbData = dbData;
  }

  /**
   * Creates an AppGuild instance from a Discord.js Guild.
   * Automatically updates or creates the guild in the database.
   *
   * @param guild - The Discord.js Guild instance
   * @returns A new AppGuild instance with guaranteed database data
   * @throws RealmError if database operations fail
   *
   * @example
   * ```typescript
   * // In a command handler
   * const appGuild = await AppGuild.from(interaction.guild);
   *
   * // Database data is guaranteed to be loaded
   * console.log(appGuild.trackerChannel); // Safe to access
   * ```
   */
  static async from(guild: Guild): Promise<AppGuild> {
    try {
      // Try to load existing guild data
      const [existingGuild] = await db
        .select()
        .from(guilds)
        .where(eq(guilds.id, guild.id))
        .limit(1);

      let guildData: GuildDb;
      let update: boolean = false;

      if (existingGuild) {
        // Guild exists, use existing data
        update = true;
        guildData = existingGuild;
        logger.debug(`Loaded existing guild ${guild.name} (${guild.id})`);
      } else {
        // Guild doesn't exist, create it
        const newGuild = {
          id: guild.id,
          name: guild.name,
          iconUrl: guild.iconURL() || "",
        };

        const [createdGuild] = await db
          .insert(guilds)
          .values(newGuild)
          .returning();

        guildData = createdGuild;
        // this.pushGuildCreateEvent();

        logger.info(
          `Created new guild ${guild.name} (${guild.id}) in database`
        );
      }

      const appGuild = new AppGuild(guild, guildData);
      if (update) {
        await appGuild.update();
      }
      return appGuild;
    } catch (error) {
      throw new RealmError(`Failed to initialize AppGuild for ${guild.id}`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Deletes the guild from the database.
   *
   * @returns Promise resolving to true if deleted successfully
   *
   * @example
   * ```typescript
   * await AppGuild.delete(guild);
   * ```
   */
  static async delete(guild: Guild): Promise<boolean> {
    try {
      await db.delete(guilds).where(eq(guilds.id, guild.id));
      logger.info(`Deleted guild ${guild.name} (${guild.id}) from database`);

      // Now we need to push a guild delete event
      // this.pushGuildDeleteEvent();

      return true;
    } catch (error) {
      throw new RealmError(`Failed to delete guild ${guild.id}`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Saves any changes to the database. Only updates if there are actual changes.
   *
   * @returns Promise resolving to true if saved successfully
   *
   * @example
   * ```typescript
   * appGuild.setTrackerChannel("123456789");
   * await appGuild.save(); // Saves the tracker channel change
   * ```
   */
  async update(): Promise<boolean> {
    if (!this.hasChanges()) {
      logger.debug(
        `No changes to save for guild ${this.djs.name} (${this.djs.id})`
      );
      return true; // No changes to save
    }

    try {
      // Prepare update data - include Discord data that might have changed
      const updateData = {
        name: this.djs.name,
        iconUrl: this.djs.iconURL() || "",
        trackerChannel: this._dbData.trackerChannel,
        lastUpdated: new Date(),
      };

      const [updatedGuild] = await db
        .update(guilds)
        .set(updateData)
        .where(eq(guilds.id, this.djs.id))
        .returning();

      if (!updatedGuild) {
        throw new RealmError(
          `Guild ${this.djs.id} not found when trying to save`,
          { location }
        );
      }

      this._dbData = updatedGuild;
      this._hasChanges = false;

      // We need to push the guild update event
      // this.pushGuildUpdateEvent();

      logger.debug(
        `Saved changes for guild ${this.djs.name} (${this.djs.id})`,
        { location }
      );
      return true;
    } catch (error) {
      throw new RealmError(`Failed to save guild ${this.djs.id}`, {
        cause: error,
        location,
      });
    }
  }

  /**
   * Checks if there are unsaved changes to the database data.
   * This compares Discord data with database data to detect changes.
   *
   * @returns True if there are unsaved changes
   *
   * @example
   * ```typescript
   * if (appGuild.hasChanges()) {
   *   await appGuild.save();
   * }
   * ```
   */
  hasChanges(): boolean {
    // Check if Discord data has changed
    if (
      this._dbData.name !== this.djs.name ||
      this._dbData.iconUrl !== (this.djs.iconURL() || "")
    ) {
      this._hasChanges = true;
    }
    return this._hasChanges;
  }

  // Database property getters - safe to access since data is guaranteed to be loaded

  /**
   * Gets the guild's tracker channel ID.
   */
  get trackerChannel(): string {
    return this._dbData.trackerChannel;
  }

  /**
   * Gets the guild's creation timestamp from the database.
   */
  get createdAt(): Date {
    return this._dbData.createdAt;
  }

  /**
   * Gets the guild's last update timestamp.
   */
  get lastUpdated(): Date {
    return this._dbData.lastUpdated;
  }

  // Setters that mark data as changed

  /**
   * Sets the guild's tracker channel and marks data as changed.
   * Call save() to persist changes to the database.
   *
   * @param channelId - The new tracker channel ID
   */
  setTrackerChannel(channelId: string): void {
    if (this._dbData.trackerChannel === channelId) {
      return;
    }
    this._dbData.trackerChannel = channelId;
    this._hasChanges = true;
  }

  // Convenience properties

  /**
   * Gets the guild's ID (delegates to Discord.js Guild).
   */
  get id(): string {
    return this.djs.id;
  }

  /**
   * Gets the guild's name (delegates to Discord.js Guild).
   */
  get name(): string {
    return this.djs.name;
  }
}
