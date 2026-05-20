import type {
  DiscordGuildData,
  DiscordGuildRepositoryInput,
  Snowflake,
} from "@realm/common";

import {
  RealmError,
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
} from "@realm/common";

/**
 * Domain entity representing a Discord Guild (Server).
 *
 * A DiscordGuild represents a Discord server that can be linked to one or more Chronicles.
 * It manages bot configuration and storyteller permissions for that server.
 *
 * This entity wraps DiscordGuildData with business logic and validation.
 */
export class DiscordGuild {
  private _data: DiscordGuildData;

  /**
   * Creates an instance of DiscordGuild.
   *
   * @param data - The raw Discord guild data
   *
   * @example
   * ```typescript
   * const guild = new DiscordGuild(guildData);
   * ```
   */
  constructor(data: DiscordGuildData) {
    this._data = { ...data };
  }

  // Getters
  public get discordId(): Snowflake {
    return this._data.discordId;
  }

  public get name(): string {
    return this._data.name;
  }

  public get iconUrl(): string {
    return this._data.iconUrl;
  }

  public get storytellerRoleIds(): Snowflake[] {
    return [...this._data.storytellerRoleIds];
  }

  public get createdAt(): Date {
    return this._data.createdAt;
  }

  public get updatedAt(): Date {
    return this._data.lastUpdated;
  }

  // Business methods

  /**
   * Update the discord guild's name.
   *
   * @param name - New discord guild name
   * @throws {RealmError} If the name is empty or exceeds the maximum length
   *
   * @example
   * ```typescript
   * guild.updateName("My New Guild Name");
   * ```
   */
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new RealmError("Discord guild name cannot be empty");
    }
    if (name.length > GuildNameConstraints.MaxLength) {
      throw new RealmError(
        `Discord guild name cannot exceed ${GuildNameConstraints.MaxLength} characters`
      );
    }
    this._data.name = name;
  }

  /**
   * Update the discord guild's icon URL.
   *
   * @param iconUrl - New icon URL
   * @throws {RealmError} If the URL exceeds the maximum length
   *
   * @example
   * ```typescript
   * guild.updateIconUrl("https://cdn.discordapp.com/icons/...");
   * ```
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
   *
   * @example
   * ```typescript
   * guild.addStorytellerRole("123456789012345678");
   * ```
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
   *
   * @example
   * ```typescript
   * guild.removeStorytellerRole("123456789012345678");
   * ```
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
   * @returns Discord Guild Data for persistence
   *
   * @example
   * ```typescript
   * const data = guild.toData();
   * ```
   */
  public toData(): DiscordGuildData {
    return { ...this._data };
  }

  /**
   * Extract repository input data from this entity.
   * Excludes createdAt and lastUpdated (managed by repository).
   *
   * @returns Discord Guild repository input data
   *
   * @example
   * ```typescript
   * const input = guild.toRepositoryInput();
   * ```
   */
  public toRepositoryInput(): DiscordGuildRepositoryInput {
    return {
      discordId: this._data.discordId,
      name: this._data.name,
      iconUrl: this._data.iconUrl,
      storytellerRoleIds: this._data.storytellerRoleIds,
    };
  }
}
