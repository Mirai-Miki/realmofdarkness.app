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
  public readonly id: string;
  public username: string;
  public displayName: string;
  public email: string | null;
  public avatarUrl: string;
  public registered: boolean;
  public admin: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public lastActive: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.displayName = props.displayName;
    this.email = props.email ?? null;
    this.avatarUrl = props.avatarUrl;
    this.registered = props.registered;
    this.admin = props.admin;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastActive = props.lastActive;
  }

  /**
   * Update the user's last active timestamp.
   */
  public updateLastActive(): void {
    this.lastActive = new Date();
  }
}
