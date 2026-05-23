import type { UserRepositoryInput, Snowflake } from "@realm/common";

import {
  RealmError,
  DisplayNameSchema,
  AvatarUrlSchema,
  type UserData,
} from "@realm/common";

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

  public get discordId(): Snowflake | null {
    return this._data.discordId;
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
   * @throws {RealmError} If display name is invalid according to DisplayNameSchema
   */
  public updateDisplayName(displayName: string): void {
    const result = DisplayNameSchema.safeParse(displayName);
    if (!result.success) {
      throw new RealmError("Invalid display name", { cause: result.error });
    }
    this._data.displayName = result.data;
  }

  /**
   * Update the user's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   * @throws {RealmError} If avatar URL is invalid according to AvatarUrlSchema
   */
  public updateAvatarUrl(avatarUrl: string): void {
    const result = AvatarUrlSchema.safeParse(avatarUrl);
    if (!result.success) {
      throw new RealmError("Invalid avatar URL", { cause: result.error });
    }
    this._data.avatarUrl = result.data;
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
      discordId: this._data.discordId,
      displayName: this._data.displayName,
      avatarUrl: this._data.avatarUrl,
      admin: this._data.admin,
    };
  }
}
