import type { GuildData, GuildRepositoryInput, Snowflake } from "@realm/common";

import {
  RealmError,
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
} from "@realm/common";

/**
 * Domain entity representing a Discord Guild (Server).
 *
 * A Guild represents a Discord server that uses the bot. It manages
 * bot configuration, character tracking, and member permissions for that server.
 *
 * This entity wraps GuildData with business logic and validation.
 *
 * @example
 * ```typescript
 * const guild = new Guild({
 *   id: "123456789012345678",
 *   name: "My WoD Server",
 *   iconUrl: "https://cdn.discordapp.com/icons/...",
 *   trackerChannel: "987654321098765432",
 *   storytellerRoles: [],
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * guild.updateTrackerChannel("111222333444555666");
 * const data = guild.toData();
 * ```
 */
export class Guild {
  private _data: GuildData;

  constructor(data: GuildData) {
    this._data = { ...data };
  }

  // Getters
  public get id(): Snowflake {
    return this._data.id;
  }

  public get name(): string {
    return this._data.name;
  }

  public get iconUrl(): string | undefined {
    return this._data.iconUrl;
  }

  public get storytellerRoles(): string[] {
    return this._data.storytellerRoleIds;
  }

  public get createdAt(): Date {
    return this._data.createdAt;
  }

  public get updatedAt(): Date {
    return this._data.lastUpdated;
  }

  // Business methods

  /**
   * Update the guild's name.
   *
   * @param name - New guild name
   */
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new RealmError("Guild name cannot be empty");
    }
    if (name.length > GuildNameConstraints.MaxLength) {
      throw new RealmError(
        `Guild name cannot exceed ${GuildNameConstraints.MaxLength} characters`
      );
    }
    this._data.name = name;
  }

  /**
   * Update the guild's icon URL.
   *
   * @param iconUrl - New icon URL
   */
  public updateIconUrl(iconUrl: string): void {
    if (iconUrl.length > DiscordCdnUrlMaxLength) {
      throw new RealmError(
        `Icon URL cannot exceed ${DiscordCdnUrlMaxLength} characters`
      );
    }
    this._data.iconUrl = iconUrl;
  }

  /**
   * Add a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public addStorytellerRole(roleId: Snowflake): void {
    if (!this._data.storytellerRoleIds.includes(roleId)) {
      this._data.storytellerRoleIds.push(roleId);
    }
  }

  /**
   * Remove a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public removeStorytellerRole(roleId: Snowflake): void {
    const index = this._data.storytellerRoleIds.indexOf(roleId);
    if (index > -1) {
      this._data.storytellerRoleIds.splice(index, 1);
    }
  }

  /**
   * Extract the Data from this entity.
   *
   * @returns Guild Data for persistence
   */
  public toData(): GuildData {
    return { ...this._data };
  }

  /**
   * Extract repository input data from this entity.
   * Excludes createdAt and lastUpdated (managed by repository).
   *
   * @returns Guild repository input data
   */
  public toRepositoryInput(): GuildRepositoryInput {
    return {
      id: this._data.id,
      name: this._data.name,
      iconUrl: this._data.iconUrl,
      storytellerRoleIds: this._data.storytellerRoleIds,
    };
  }
}
