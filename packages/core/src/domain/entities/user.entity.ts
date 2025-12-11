export interface UserProps {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  avatarUrl: string;
  registered: boolean;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

/**
 * Domain entity representing a User.
 *
 * Handles user identity, profile, and authentication concerns.
 * For subscription/supporter information, use the Supporter entity.
 */
export class User {
  private readonly _id: string;
  private _username: string;
  private _displayName: string;
  private _email: string | null;
  private _avatarUrl: string;
  private _registered: boolean;
  private _admin: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private _lastActive: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._displayName = props.displayName;
    this._email = props.email ?? null;
    this._avatarUrl = props.avatarUrl;
    this._registered = props.registered;
    this._admin = props.admin;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._lastActive = props.lastActive;
  }

  // Getters
  public get id(): string {
    return this._id;
  }

  public get username(): string {
    return this._username;
  }

  public get displayName(): string {
    return this._displayName;
  }

  public get email(): string | null {
    return this._email;
  }

  public get avatarUrl(): string {
    return this._avatarUrl;
  }

  public get registered(): boolean {
    return this._registered;
  }

  public get admin(): boolean {
    return this._admin;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get lastActive(): Date {
    return this._lastActive;
  }

  // Business methods

  /**
   * Update the user's username.
   *
   * @param username - New username
   */
  public updateUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new Error("Username cannot be empty");
    }
    this._username = username;
  }

  /**
   * Update the user's display name.
   *
   * @param displayName - New display name
   */
  public updateDisplayName(displayName: string): void {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error("Display name cannot be empty");
    }
    this._displayName = displayName;
  }

  /**
   * Update the user's email address.
   *
   * @param email - New email address (or null to clear)
   */
  public updateEmail(email: string | null): void {
    this._email = email;
  }

  /**
   * Update the user's avatar URL.
   *
   * @param avatarUrl - New avatar URL
   */
  public updateAvatarUrl(avatarUrl: string): void {
    this._avatarUrl = avatarUrl;
  }

  /**
   * Mark the user as registered.
   */
  public register(): void {
    this._registered = true;
  }

  /**
   * Mark the user as unregistered.
   */
  public unregister(): void {
    this._registered = false;
  }

  /**
   * Grant admin privileges to the user.
   */
  public grantAdmin(): void {
    this._admin = true;
  }

  /**
   * Revoke admin privileges from the user.
   */
  public revokeAdmin(): void {
    this._admin = false;
  }

  /**
   * Update the user's last active timestamp.
   */
  public updateLastActive(): void {
    this._lastActive = new Date();
  }

  /**
   * Set the createdAt timestamp.
   *
   * @internal This should only be used by repositories or migration tools.
   * @param date - The creation timestamp
   */
  public setCreatedAt(date: Date): void {
    // Note: _createdAt is readonly, but this method allows controlled setting
    // TypeScript will allow this because we're inside the class
    (this as any)._createdAt = date;
  }

  /**
   * Set the updatedAt timestamp.
   *
   * @internal This should only be used by repositories or migration tools.
   * @param date - The updated timestamp
   */
  public setUpdatedAt(date: Date): void {
    // Note: _updatedAt is readonly, but this method allows controlled setting
    (this as any)._updatedAt = date;
  }
}
