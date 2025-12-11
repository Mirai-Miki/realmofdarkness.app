import { RealmError } from "@realm/errors";
import type { Snowflake } from "../../types";

export interface MemberProps {
  guildId: Snowflake;
  userId: Snowflake;
  admin: boolean;
  storyteller: boolean;
  boosted: boolean;
  nickname: string;
  avatarUrl: string;
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Domain entity representing a User's membership in a Guild.
 *
 * A Member connects a User to a Guild and tracks guild-specific
 * information like permissions (admin, storyteller), boost status,
 * and display information (nickname, avatar).
 *
 * @example
 * ```typescript
 * const member = new Member({
 *   guildId: "123456789012345678",
 *   userId: "987654321098765432",
 *   admin: false,
 *   storyteller: true,
 *   boosted: false,
 *   nickname: "Player One",
 *   avatarUrl: "https://cdn.discordapp.com/avatars/...",
 * });
 *
 * member.grantStoryteller();
 * member.updateNickname("New Nickname");
 * ```
 */
export class Member {
  private readonly _guildId: Snowflake;
  private readonly _userId: Snowflake;
  private _admin: boolean;
  private _storyteller: boolean;
  private _boosted: boolean;
  private _nickname: string;
  private _avatarUrl: string;
  private _createdAt: Date;
  private _lastUpdated: Date;

  constructor(props: MemberProps) {
    this._guildId = props.guildId;
    this._userId = props.userId;
    this._admin = props.admin;
    this._storyteller = props.storyteller;
    this._boosted = props.boosted;
    this._nickname = props.nickname;
    this._avatarUrl = props.avatarUrl;
    this._createdAt = props.createdAt;
    this._lastUpdated = props.lastUpdated;
  }

  // Getters
  public get guildId(): Snowflake {
    return this._guildId;
  }

  public get userId(): Snowflake {
    return this._userId;
  }

  public get admin(): boolean {
    return this._admin;
  }

  public get storyteller(): boolean {
    return this._storyteller;
  }

  public get boosted(): boolean {
    return this._boosted;
  }

  public get nickname(): string {
    return this._nickname;
  }

  public get avatarUrl(): string {
    return this._avatarUrl;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get lastUpdated(): Date {
    return this._lastUpdated;
  }

  // Business methods

  /**
   * Grant admin permissions to this member.
   */
  public grantAdmin(): void {
    this._admin = true;
  }

  /**
   * Revoke admin permissions from this member.
   */
  public revokeAdmin(): void {
    this._admin = false;
  }

  /**
   * Grant storyteller permissions to this member.
   */
  public grantStoryteller(): void {
    this._storyteller = true;
  }

  /**
   * Revoke storyteller permissions from this member.
   */
  public revokeStoryteller(): void {
    this._storyteller = false;
  }

  /**
   * Mark this member as boosting the guild.
   */
  public markAsBoosted(): void {
    this._boosted = true;
  }

  /**
   * Mark this member as no longer boosting the guild.
   */
  public markAsNotBoosted(): void {
    this._boosted = false;
  }

  /**
   * Update the member's nickname.
   *
   * @param nickname - New nickname (can be empty string)
   */
  public setNickname(nickname: string): void {
    if (nickname.length > 100) {
      throw new RealmError("Nickname cannot exceed 100 characters");
    }
    this._nickname = nickname;
  }

  /**
   * Update the member's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   */
  public setAvatarUrl(avatarUrl: string): void {
    if (avatarUrl.length > 500) {
      throw new RealmError("Avatar URL cannot exceed 500 characters");
    }
    this._avatarUrl = avatarUrl;
  }

  /**
   * Check if the member has any elevated permissions (admin or storyteller).
   *
   * @returns True if member is admin or storyteller
   */
  public hasStaffPermissions(): boolean {
    return this._admin || this._storyteller;
  }

  /**
   * Check if the member has a custom nickname set.
   *
   * @returns True if nickname is not empty
   */
  public hasNickname(): boolean {
    return this._nickname.length > 0;
  }

  /**
   * Clear the member's nickname.
   */
  public clearNickname(): void {
    this._nickname = "";
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
