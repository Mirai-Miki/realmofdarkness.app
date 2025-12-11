import { RealmError } from "@realm/errors";

export interface GuildProps {
  id: string;
  name: string;
  iconUrl: string;
  trackerChannel: string;
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Domain entity representing a Discord Guild (Server).
 *
 * A Guild represents a Discord server that uses the bot. It manages
 * bot configuration, character tracking, and member permissions for that server.
 *
 * @example
 * ```typescript
 * const guild = new Guild({
 *   id: "123456789012345678",
 *   name: "My WoD Server",
 *   iconUrl: "https://cdn.discordapp.com/icons/...",
 *   trackerChannel: "987654321098765432",
 * });
 *
 * guild.updateTrackerChannel("111222333444555666");
 * ```
 */
export class Guild {
  private readonly _id: string;
  private _name: string;
  private _iconUrl: string;
  private _trackerChannel: string;
  private _createdAt: Date;
  private _lastUpdated: Date;

  constructor(props: GuildProps) {
    this._id = props.id;
    this._name = props.name;
    this._iconUrl = props.iconUrl;
    this._trackerChannel = props.trackerChannel;
    this._createdAt = props.createdAt;
    this._lastUpdated = props.lastUpdated;
  }

  // Getters
  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get iconUrl(): string {
    return this._iconUrl;
  }

  public get trackerChannel(): string {
    return this._trackerChannel;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get lastUpdated(): Date {
    return this._lastUpdated;
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
    this._name = name;
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
    this._iconUrl = iconUrl;
  }

  /**
   * Update the tracker channel for this guild.
   *
   * @param channelId - Discord channel snowflake ID
   */
  public updateTrackerChannel(channelId: string): void {
    this._trackerChannel = channelId;
  }

  /**
   * Check if a tracker channel is configured.
   *
   * @returns True if tracker channel is set
   */
  public hasTrackerChannel(): boolean {
    return this._trackerChannel.length > 0;
  }

  /**
   * Clear the tracker channel.
   */
  public clearTrackerChannel(): void {
    this._trackerChannel = "";
  }

  /**
   * Set the createdAt timestamp.
   *
   * @internal This should only be used by repositories or migration tools.
   * @param date - The creation timestamp
   */
  public setCreatedAt(date: Date): void {
    this._createdAt = date;
  }

  /**
   * Set the lastUpdated timestamp.
   *
   * @internal This should only be used by repositories or migration tools.
   * @param date - The last updated timestamp
   */
  public setLastUpdated(date: Date): void {
    this._lastUpdated = date;
  }
}
