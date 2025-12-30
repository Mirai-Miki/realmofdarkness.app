import type {
  MemberRepositoryInput,
  MemberData,
  Snowflake,
} from "@realm/common";

import { RealmError } from "@realm/common";

/**
 * Domain entity representing a User's membership in a Guild.
 *
 * A Member connects a User to a Guild and tracks guild-specific
 * information like permissions (admin), role assignments, boosts,
 * and profile data.
 *
 * Storyteller status is derived from roleIds matching guild.storytellerRoles.
 *
 * This entity wraps MemberData with business logic and validation.
 *
 * @example
 * ```typescript
 * const member = new Member({
 *   guildId: "123456789012345678",
 *   userId: "987654321098765432",
 *   admin: false,
 *   roleIds: ["111111111111111111", "222222222222222222"],
 *   boosted: 0,
 *   nickname: "Dracula",
 *   avatarUrl: "https://cdn.discordapp.com/...",
 *   createdAt: new Date(),
 *   lastUpdated: new Date(),
 * });
 *
 * // Check permissions (needs guild storyteller roles)
 * const isStoryteller = member.isStoryteller(guild.storytellerRoles);
 * const isStaff = member.isStaff(guild.storytellerRoles);
 *
 * member.addBoost();
 * const data = member.toData();
 * ```
 */
export class Member {
  private _data: MemberData;

  constructor(data: MemberData) {
    this._data = { ...data };
  }

  // ============================================================================
  // Getters
  // ============================================================================

  public get guildId(): Snowflake {
    return this._data.guildId;
  }

  public get userId(): Snowflake {
    return this._data.userId;
  }

  public get admin(): boolean {
    return this._data.admin;
  }

  public get roleIds(): Snowflake[] {
    return [...this._data.roleIds];
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
  // Permission Methods
  // ============================================================================

  /**
   * Check if member is a storyteller in this guild.
   *
   * Storyteller status is derived by checking if any of the member's
   * roleIds match the guild's storyteller role IDs.
   *
   * @param storytellerRoles - Array of storyteller role IDs from the guild
   * @returns True if member has at least one storyteller role
   *
   * @example
   * ```typescript
   * const guild = await guildService.getById(guildId);
   * const isStoryteller = member.isStoryteller(guild.storytellerRoles);
   * ```
   */
  public isStoryteller(storytellerRoles: Snowflake[]): boolean {
    // Early return if no storyteller roles configured
    if (storytellerRoles.length === 0) return false;

    // Check for intersection between member roles and storyteller roles
    // Using Set for O(1) lookup instead of O(n) with includes()
    const storytellerRoleSet = new Set(storytellerRoles);
    return this._data.roleIds.some((roleId) => storytellerRoleSet.has(roleId));
  }

  /**
   * Check if member has staff permissions (admin OR storyteller).
   *
   * This is the most commonly used permission check. Optimized for performance
   * with early returns and Set-based lookups.
   *
   * @param storytellerRoles - Array of storyteller role IDs from the guild
   * @returns True if member is admin or has a storyteller role
   *
   * @example
   * ```typescript
   * const guild = await guildService.getById(guildId);
   * const isStaff = member.isStaff(guild.storytellerRoles);
   * if (isStaff) {
   *   // Allow staff-only action
   * }
   * ```
   */
  public isStaff(storytellerRoles: Snowflake[]): boolean {
    // Early return for admin (most common fast path)
    if (this._data.admin) return true;

    // Check storyteller status
    return this.isStoryteller(storytellerRoles);
  }

  /**
   * Grant admin permissions to this member.
   */
  public grantAdmin(): void {
    this._data.admin = true;
  }

  /**
   * Revoke admin permissions from this member.
   */
  public revokeAdmin(): void {
    this._data.admin = false;
  }

  // ============================================================================
  // Profile Methods
  // ============================================================================

  /**
   * Update the member's nickname.
   *
   * @param nickname - New nickname
   */
  public setNickname(nickname: string): void {
    this._data.nickname = nickname;
  }

  /**
   * Update the member's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   */
  public setAvatarUrl(avatarUrl: string): void {
    this._data.avatarUrl = avatarUrl;
  }

  /**
   * Update the member's role IDs.
   *
   * @param roleIds - New array of role IDs
   */
  public setRoleIds(roleIds: Snowflake[]): void {
    this._data.roleIds = [...roleIds];
  }

  // ============================================================================
  // Boost Methods
  // ============================================================================

  /**
   * Add a boost to this member's guild.
   */
  public addBoost(): void {
    this._data.boosted += 1;
  }

  /**
   * Remove a boost from this member's guild.
   *
   * @throws {RealmError} If no boosts to remove
   */
  public removeBoost(): void {
    if (this._data.boosted <= 0) {
      throw new RealmError("Member has no boosts to remove");
    }
    this._data.boosted -= 1;
  }

  /**
   * Check if member is boosting this guild.
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
   * @returns Member Data for persistence
   */
  public toData(): MemberData {
    return { ...this._data };
  }

  /**
   * Extract repository input data from this entity.
   * Excludes createdAt and lastActive (managed by repository).
   *
   * @returns Member repository input data
   */
  public toRepositoryInput(): MemberRepositoryInput {
    return {
      userId: this._data.userId,
      guildId: this._data.guildId,
      roleIds: this._data.roleIds,
      admin: this._data.admin,
      nickname: this._data.nickname,
      boosted: this._data.boosted,
      avatarUrl: this._data.avatarUrl,
    };
  }
}
