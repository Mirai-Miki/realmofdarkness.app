import type {
  ChronicleMemberRepositoryInput,
  ChronicleMemberData,
  Snowflake,
} from "@realm/common";

import { RealmError } from "@realm/common";

/**
 * Domain entity representing a User's membership in a Chronicle.
 *
 * A ChronicleMember connects a User to a Chronicle and tracks chronicle-specific
 * information like permissions (storyteller), boosts, and profile data.
 *
 * This entity wraps ChronicleMemberData with business logic and validation.
 */
export class ChronicleMember {
  private _data: ChronicleMemberData;

  /**
   * Creates an instance of ChronicleMember.
   *
   * @param data - The raw chronicle member data
   *
   * @example
   * ```typescript
   * const member = new ChronicleMember(memberData);
   * ```
   */
  constructor(data: ChronicleMemberData) {
    this._data = { ...data };
  }

  // ============================================================================
  // Getters
  // ============================================================================

  public get chronicleId(): Snowflake {
    return this._data.chronicleId;
  }

  public get userId(): Snowflake {
    return this._data.userId;
  }

  public get isStoryteller(): boolean {
    return this._data.isStoryteller;
  }

  public get boosted(): number {
    return this._data.boosted;
  }

  public get nickname(): string {
    return this._data.nickname;
  }

  public get avatarUrl(): string {
    return this._data.avatarUrl;
  }

  public get createdAt(): Date {
    return this._data.createdAt;
  }

  public get lastUpdated(): Date {
    return this._data.lastUpdated;
  }

  // ============================================================================
  // Profile Methods
  // ============================================================================

  /**
   * Update the member's nickname.
   *
   * @param nickname - New nickname
   *
   * @example
   * ```typescript
   * member.setNickname("New Nickname");
   * ```
   */
  public setNickname(nickname: string): void {
    this._data.nickname = nickname;
  }

  /**
   * Update the member's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   *
   * @example
   * ```typescript
   * member.setAvatarUrl("https://cdn.discordapp.com/avatars/...");
   * ```
   */
  public setAvatarUrl(avatarUrl: string): void {
    this._data.avatarUrl = avatarUrl;
  }

  // ============================================================================
  // Boost Methods
  // ============================================================================

  /**
   * Add a boost to this member's chronicle.
   *
   * @example
   * ```typescript
   * member.addBoost();
   * ```
   */
  public addBoost(): void {
    this._data.boosted += 1;
  }

  /**
   * Remove a boost from this member's chronicle.
   *
   * @throws {RealmError} If the member does not have any boosts to remove
   *
   * @example
   * ```typescript
   * member.removeBoost();
   * ```
   */
  public removeBoost(): void {
    if (this._data.boosted <= 0) {
      throw new RealmError("Member has no boosts to remove");
    }
    this._data.boosted -= 1;
  }

  /**
   * Check if member is boosting this chronicle.
   *
   * @returns True if the member has at least one active boost
   *
   * @example
   * ```typescript
   * const isBoosting = member.isBoosting();
   * ```
   */
  public isBoosting(): boolean {
    return this._data.boosted > 0;
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Extract the Data from this entity.
   *
   * @returns Chronicle Member Data for persistence
   *
   * @example
   * ```typescript
   * const data = member.toData();
   * ```
   */
  public toData(): ChronicleMemberData {
    return { ...this._data };
  }

  /**
   * Extract repository input data from this entity.
   * Excludes isStoryteller and timestamps (managed by repository/database).
   *
   * @returns Chronicle Member repository input data
   *
   * @example
   * ```typescript
   * const input = member.toRepositoryInput();
   * ```
   */
  public toRepositoryInput(): ChronicleMemberRepositoryInput {
    return {
      userId: this._data.userId,
      chronicleId: this._data.chronicleId,
      nickname: this._data.nickname,
      boosted: this._data.boosted,
      avatarUrl: this._data.avatarUrl,
    };
  }
}
