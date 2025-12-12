import { RealmError, type GuildDto } from "@realm/common";

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

  public get trackerChannel(): string | undefined {
    return this._dto.trackerChannel;
  }

  public get storytellerRoles(): string[] {
    return this._dto.storytellerRoles;
  }

  public get createdAt(): Date {
    return this._dto.createdAt;
  }

  public get updatedAt(): Date {
    return this._dto.updatedAt;
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
    if (name.length > 200) {
      throw new RealmError("Guild name cannot exceed 200 characters");
    }
    this._dto.name = name;
    this._dto.updatedAt = new Date();
  }

  /**
   * Update the guild's icon URL.
   *
   * @param iconUrl - New icon URL
   */
  public updateIconUrl(iconUrl: string): void {
    if (iconUrl.length > 500) {
      throw new RealmError("Icon URL cannot exceed 500 characters");
    }
    this._dto.iconUrl = iconUrl;
    this._dto.updatedAt = new Date();
  }

  /**
   * Update the tracker channel for this guild.
   *
   * @param channelId - Discord channel snowflake ID
   */
  public updateTrackerChannel(channelId: string): void {
    this._dto.trackerChannel = channelId;
    this._dto.updatedAt = new Date();
  }

  /**
   * Check if a tracker channel is configured.
   *
   * @returns True if tracker channel is set
   */
  public hasTrackerChannel(): boolean {
    return !!this._dto.trackerChannel && this._dto.trackerChannel.length > 0;
  }

  /**
   * Clear the tracker channel.
   */
  public clearTrackerChannel(): void {
    this._dto.trackerChannel = undefined;
    this._dto.updatedAt = new Date();
  }

  /**
   * Add a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public addStorytellerRole(roleId: string): void {
    if (!this._dto.storytellerRoles.includes(roleId)) {
      this._dto.storytellerRoles.push(roleId);
      this._dto.updatedAt = new Date();
    }
  }

  /**
   * Remove a storyteller role.
   *
   * @param roleId - Discord role snowflake ID
   */
  public removeStorytellerRole(roleId: string): void {
    const index = this._dto.storytellerRoles.indexOf(roleId);
    if (index > -1) {
      this._dto.storytellerRoles.splice(index, 1);
      this._dto.updatedAt = new Date();
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
