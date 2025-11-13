import type { GuildMember } from "discord.js";
import type { MemberDb } from "database/schema/members";

import { RealmError } from "shared";
import { members } from "database/schema/members";
import { logger } from "shared/logger";
import { eq, and } from "drizzle-orm";
import { db } from "database";
import { AppGuild } from "./AppGuild.js";
import { AppUser } from "./AppUser.js";

const location = "bot/src/entities/AppMember.ts";

/**
 * Extended Member class that combines Discord.js GuildMember functionality with database operations.
 *
 * This class automatically ensures the member exists in the database during construction,
 * providing type safety since database data is always loaded after successful construction.
 *
 * @example
 * ```typescript
 * // Basic usage - static method ensures DB data is loaded
 * const appMember = await AppMember.from(interaction.member);
 *
 * // Safe to access database properties immediately
 * console.log(`Admin: ${appMember.isAdmin}`);
 * console.log(`Storyteller: ${appMember.isStoryteller}`);
 *
 * // Access Discord.js functionality
 * const roles = appMember.djs.roles.cache;
 * ```
 */
export class AppMember {
  /** The Discord.js GuildMember instance - public for full access to Discord functionality */
  public readonly djs: GuildMember;

  /** Reference to the AppGuild this member belongs to */
  public readonly guild: AppGuild;

  /** Reference to the AppUser for this member */
  public readonly user: AppUser;

  /** Database data - loaded  */
  private _dbData: MemberDb;

  /** Tracks if there are unsaved changes */
  private _hasChanges = false;

  /**
   * Private constructor - use AppMember.from() to create instances
   */
  private constructor(member: GuildMember, dbData: MemberDb) {
    this.djs = member;
    this._dbData = dbData;
  }

  /**
   * Creates an AppMember instance from a Discord.js GuildMember.
   * Automatically updates or creates the member in the database.
   *
   * @param member - The Discord.js GuildMember instance
   * @returns A new AppMember instance with guaranteed database data
   * @throws RealmError if database operations fail
   *
   * @example
   * ```typescript
   * // In a command handler
   * const appMember = await AppMember.from(interaction.member);
   *
   * // Database data is guaranteed to be loaded
   * console.log(appMember.isAdmin); // Safe to access
   * ```
   */
  static async fetch(member: GuildMember): Promise<AppMember> {
    try {
      // Try to load existing member data
      const [existingMember] = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.guildId, member.guild.id),
            eq(members.userId, member.user.id)
          )
        )
        .limit(1);

      let memberData: MemberDb;
      let update: boolean = false;

      if (existingMember) {
        // Member exists, use existing data
        update = true;
        memberData = existingMember;
        logger.debug(
          `Loaded existing member ${member.user.username} in guild ${(member.guild.name, { location })}`
        );
      } else {
        // Member doesn't exist, create them
        const newMember = {
          guildId: member.guild.id,
          userId: member.user.id,
          nickname: member.displayName,
          avatarUrl: member.displayAvatarURL(),
          admin: false,
          storyteller: false,
          defaultCharacterId: null,
        };

        const [createdMember] = await db
          .insert(members)
          .values(newMember)
          .returning();

        memberData = createdMember;

        this.pushMemberCreateEvent();

        logger.info(
          `Created new member ${member.user.username} in guild ${member.guild.name} in database`,
          { location }
        );
      }

      const appMember = new AppMember(member, memberData);
      if (update) {
        await appMember.update();
      }
      return appMember;
    } catch (error) {
      throw new RealmError(
        `Failed to initialize AppMember for ${member.user.id} in guild ${member.guild.id}`,
        {
          cause: error,
          location,
        }
      );
    }
  }

  /**
   * Deletes the member from the database.
   *
   * @param member - The Discord.js GuildMember to delete
   * @returns Promise resolving to true if deleted successfully
   *
   * @example
   * ```typescript
   * await AppMember.delete(member);
   * ```
   */
  static async delete(member: GuildMember): Promise<boolean> {
    try {
      await db
        .delete(members)
        .where(
          and(
            eq(members.guildId, member.guild.id),
            eq(members.userId, member.user.id)
          )
        );

      this.pushMemberDeleteEvent();
      logger.info(
        `Deleted member ${member.user.username} from guild ${member.guild.name} in database`
      );
      return true;
    } catch (error) {
      throw new RealmError(
        `Failed to delete member ${member.user.id} from guild ${member.guild.id}`,
        {
          cause: error,
          location,
        }
      );
    }
  }

  /**
   * Saves any changes to the database. Only updates if there are actual changes.
   *
   * @returns Promise resolving to true if saved successfully
   *
   * @example
   * ```typescript
   * appMember.setAdmin(true);
   * await appMember.update(); // Saves the admin change
   * ```
   */
  async update(): Promise<boolean> {
    if (!this.hasChanges()) {
      logger.debug(
        `No changes to save for member ${this.djs.user.username} in guild ${this.djs.guild.name}`
      );
      return true; // No changes to save
    }

    try {
      // Prepare update data - include Discord data that might have changed
      const updateData = {
        nickname: this.djs.nickname || "",
        avatarUrl: this.djs.displayAvatarURL(),
        admin: this._dbData.admin,
        storyteller: this._dbData.storyteller,
        defaultCharacterId: this._dbData.defaultCharacterId,
        lastUpdated: new Date(),
      };

      const [updatedMember] = await db
        .update(members)
        .set(updateData)
        .where(
          and(
            eq(members.guildId, this.djs.guild.id),
            eq(members.userId, this.djs.user.id)
          )
        )
        .returning();

      if (!updatedMember) {
        throw new RealmError(
          `Member ${this.djs.user.id} in guild ${this.djs.guild.id} not found when trying to save`,
          { location }
        );
      }

      this._dbData = updatedMember;
      this._hasChanges = false;

      this.pushMemberUpdateEvent();

      logger.debug(
        `Saved changes for member ${this.djs.user.username} in guild ${this.djs.guild.name}`,
        { location }
      );
      return true;
    } catch (error) {
      throw new RealmError(
        `Failed to save member ${this.djs.user.id} in guild ${this.djs.guild.id}`,
        {
          cause: error,
          location,
        }
      );
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
   * if (appMember.hasChanges()) {
   *   await appMember.update();
   * }
   * ```
   */
  hasChanges(): boolean {
    // Check if Discord data has changed
    if (
      this._dbData.nickname !== this.djs.displayName ||
      this._dbData.avatarUrl !== this.djs.displayAvatarURL()
    ) {
      this._hasChanges = true;
    }
    return this._hasChanges;
  }

  // Database property getters - safe to access since data is guaranteed to be loaded

  /**
   * Gets whether the member is an admin.
   */
  get isAdmin(): boolean {
    return this._dbData.admin;
  }

  /**
   * Gets whether the member is a storyteller.
   */
  get isStoryteller(): boolean {
    return this._dbData.storyteller;
  }

  /**
   * Gets the member's nickname in this guild.
   */
  get nickname(): string {
    return this._dbData.nickname;
  }

  /**
   * Gets the member's avatar URL for this guild.
   */
  get avatarUrl(): string {
    return this._dbData.avatarUrl;
  }

  /**
   * Gets the member's default character ID in this guild.
   */
  get defaultCharacterId(): string | null {
    return this._dbData.defaultCharacterId;
  }

  /**
   * Gets the member's creation timestamp from the database.
   */
  get createdAt(): Date {
    return this._dbData.createdAt;
  }

  /**
   * Gets the member's last update timestamp.
   */
  get lastUpdated(): Date {
    return this._dbData.lastUpdated;
  }

  // Setters that mark data as changed

  /**
   * Sets the member's admin status and marks data as changed.
   * Call update() to persist changes to the database.
   *
   * @param isAdmin - Whether the member should be an admin
   */
  setAdmin(isAdmin: boolean): void {
    if (this._dbData.admin === isAdmin) {
      return;
    }
    this._dbData.admin = isAdmin;
    this._hasChanges = true;
  }

  /**
   * Sets the member's storyteller status and marks data as changed.
   * Call update() to persist changes to the database.
   *
   * @param isStoryteller - Whether the member should be a storyteller
   */
  setStoryteller(isStoryteller: boolean): void {
    if (this._dbData.storyteller === isStoryteller) {
      return;
    }
    this._dbData.storyteller = isStoryteller;
    this._hasChanges = true;
  }

  /**
   * Sets the member's default character ID and marks data as changed.
   * Call update() to persist changes to the database.
   *
   * @param characterId - The character ID to set as default
   */
  setDefaultCharacter(characterId: string | null): void {
    if (this._dbData.defaultCharacterId === characterId) {
      return;
    }
    this._dbData.defaultCharacterId = characterId;
    this._hasChanges = true;
  }

  // Convenience properties

  /**
   * Gets the member's guild ID.
   */
  get guildId(): string {
    return this.djs.guild.id;
  }

  /**
   * Gets the member's user ID.
   */
  get userId(): string {
    return this.djs.user.id;
  }

  /**
   * Gets the member's username (delegates to Discord.js User).
   */
  get username(): string {
    return this.djs.user.username;
  }

  /**
   * Gets the member's display name (nickname or username).
   */
  get displayName(): string {
    return this.djs.displayName;
  }
}
