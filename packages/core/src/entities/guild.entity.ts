import {
  RealmError,
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
  type GuildDto,
} from "@realm/common";

/**
 * Domain entity representing a Discord Guild (Server).
 *
 * A Guild represents a Discord server that uses the bot. It manages
 * bot configuration, character tracking, and member permissions for that server.
 *
 * This entity wraps a GuildDto with business logic and validation.
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
 * const dto = guild.toDto();
 * ```
 */
export class Guild {
  private _dto: GuildDto;

  constructor(dto: GuildDto) {
    this._dto = { ...dto };
  }

  // Getters
  public get id(): string {
    return this._dto.id;
  }

  public get name(): string {
    return this._dto.name;
  }

  public get iconUrl(): string | undefined {
    return this._dto.iconUrl;
  }

  public get storytellerRoles(): string[] {
    return this._dto.storytellerRoleIds;
  }

  public get createdAt(): Date {
    return this._dto.createdAt;
  }

  public get updatedAt(): Date {
    return this._dto.lastUpdated;
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
    this._dto.name = name;
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
    this._dto.iconUrl = iconUrl;
  }

  /**
   * Add a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public addStorytellerRole(roleId: string): void {
    if (!this._dto.storytellerRoleIds.includes(roleId)) {
      this._dto.storytellerRoleIds.push(roleId);
    }
  }

  /**
   * Remove a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public removeStorytellerRole(roleId: string): void {
    const index = this._dto.storytellerRoleIds.indexOf(roleId);
    if (index > -1) {
      this._dto.storytellerRoleIds.splice(index, 1);
    }
  }

  /**
   * Extract the DTO from this entity.
   *
   * @returns Guild DTO for persistence
   */
  public toDto(): GuildDto {
    return { ...this._dto };
  }
}
