import { RealmError, type UserData } from "@realm/common";

/**
 * Domain entity representing a User.
 *
 * Handles user identity, profile, and authentication concerns.
 * For subscription/supporter information, use the Supporter entity.
 *
 * This entity wraps UserData with business logic and validation.
 */
export class User {
  private _data: UserData;

  constructor(data: UserData) {
    this._data = { ...data };
  }

  // Getters
  public get id(): string {
    return this._data.id;
  }

  public get username(): string {
    return this._data.username;
  }

  public get displayName(): string {
    return this._data.displayName;
  }

  public get avatarUrl(): string | undefined {
    return this._data.avatarUrl;
  }

  public get createdAt(): Date {
    return this._data.createdAt;
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
    this._data.username = username;
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
    this._data.displayName = displayName;
  }

  /**
   * Update the user's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   */
  public updateAvatarUrl(avatarUrl: string): void {
    this._data.avatarUrl = avatarUrl;
  }

  /**
   * Extract the Data from this entity.
   *
   * @returns User Data for persistence
   */
  public toData(): UserData {
    return { ...this._data };
  }
}
