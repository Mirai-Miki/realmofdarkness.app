import type {
  DiscordGuildData,
  DiscordGuildRepositoryInput,
  Snowflake,
} from "@realm/common";

import {
  RealmError,
  DiscordGuildNameSchema,
  DiscordGuildIconUrlSchema,
  SnowflakeSchema,
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
   * @throws {RealmError} If name is invalid according to DiscordGuildNameSchema
   *
   * @example
   * ```typescript
   * guild.updateName("My New Guild Name");
   * ```
   */
  public updateName(name: string): void {
    const result = DiscordGuildNameSchema.safeParse(name);
    if (!result.success) {
      throw new RealmError("Invalid Discord guild name", {
        cause: result.error,
      });
    }
    this._data.name = result.data;
  }

  /**
   * Update the discord guild's icon URL.
   *
   * @param iconUrl - New icon URL
   * @throws {RealmError} If icon URL is invalid according to DiscordGuildIconUrlSchema
   *
   * @example
   * ```typescript
   * guild.updateIconUrl("https://cdn.discordapp.com/icons/...");
   * ```
   */
  public updateIconUrl(iconUrl: string): void {
    const result = DiscordGuildIconUrlSchema.safeParse(iconUrl);
    if (!result.success) {
      throw new RealmError("Invalid icon URL", { cause: result.error });
    }
    this._data.iconUrl = result.data;
  }

  /**
   * Add a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   * @throws {RealmError} If roleId is invalid according to SnowflakeSchema
   *
   * @example
   * ```typescript
   * guild.addStorytellerRole("123456789012345678");
   * ```
   */
  public addStorytellerRole(roleId: Snowflake): void {
    const result = SnowflakeSchema.safeParse(roleId);
    if (!result.success) {
      throw new RealmError("Invalid role ID format", { cause: result.error });
    }
    if (!this._data.storytellerRoleIds.includes(result.data)) {
      this._data.storytellerRoleIds.push(result.data);
    }
  }

  /**
   * Remove a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   * @throws {RealmError} If roleId is invalid according to SnowflakeSchema
   *
   * @example
   * ```typescript
   * guild.removeStorytellerRole("123456789012345678");
   * ```
   */
  public removeStorytellerRole(roleId: Snowflake): void {
    const result = SnowflakeSchema.safeParse(roleId);
    if (!result.success) {
      throw new RealmError("Invalid role ID format", { cause: result.error });
    }
    const index = this._data.storytellerRoleIds.indexOf(result.data);
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
