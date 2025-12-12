import { RealmError, type UserDto } from "@realm/common";

/**
 * Domain entity representing a User.
 *
 * Handles user identity, profile, and authentication concerns.
 * For subscription/supporter information, use the Supporter entity.
 *
 * This entity wraps a UserDto with business logic and validation.
 */
export class User {
  private _dto: UserDto;

  constructor(dto: UserDto) {
    this._dto = { ...dto };
  }

  // Getters
  public get id(): string {
    return this._dto.id;
  }

  public get username(): string {
    return this._dto.username;
  }

  public get displayName(): string {
    return this._dto.displayName;
  }

  public get avatarUrl(): string | undefined {
    return this._dto.avatarUrl;
  }

  public get createdAt(): Date {
    return this._dto.createdAt;
  }

  public get lastActive(): Date {
    return this._dto.lastActive;
  }

  // Business methods

  /**
   * Update the user's username.
   *
   * @param username - New username
   */
  public updateUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new RealmError("Username cannot be empty");
    }
    this._dto.username = username;
  }

  /**
   * Update the user's display name.
   *
   * @param displayName - New display name
   */
  public updateDisplayName(displayName: string): void {
    if (!displayName || displayName.trim().length === 0) {
      throw new RealmError("Display name cannot be empty");
    }
    this._dto.displayName = displayName;
  }

  /**
   * Update the user's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   */
  public updateAvatarUrl(avatarUrl: string): void {
    this._dto.avatarUrl = avatarUrl;
  }

  /**
   * Update the user's last active timestamp.
   */
  public updateLastActive(): void {
    this._dto.lastActive = new Date();
  }

  /**
   * Extract the DTO from this entity.
   *
   * @returns User DTO for persistence
   */
  public toDto(): UserDto {
    return { ...this._dto };
  }
}
