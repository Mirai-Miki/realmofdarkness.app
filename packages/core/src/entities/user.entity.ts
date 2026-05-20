import type { UserRepositoryInput, Snowflake } from "@realm/common";

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
  public get id(): Snowflake {
    return this._data.id;
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

  /**
   * Extract repository input data from this entity.
   * Excludes createdAt and lastActive (managed by repository).
   *
   * @returns User repository input data
   */
  public toRepositoryInput(): UserRepositoryInput {
    return {
      id: this._data.id,
      displayName: this._data.displayName,
      avatarUrl: this._data.avatarUrl,
      admin: this._data.admin,
    };
  }
}
