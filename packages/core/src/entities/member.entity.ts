import { RealmError, type MemberDto, type Snowflake } from "@realm/common";

/**
 * Domain entity representing a User's membership in a Guild.
 *
 * A Member connects a User to a Guild and tracks guild-specific
 * information like permissions (storyteller), experience awards,
 * and activity.
 *
 * This entity wraps a MemberDto with business logic and validation.
 *
 * @example
 * ```typescript
 * const member = new Member({
 *   guildId: "123456789012345678",
 *   userId: "987654321098765432",
 *   isStoryteller: true,
 *   experienceAwarded: 0,
 *   joinedAt: new Date(),
 *   lastActive: new Date(),
 * });
 *
 * member.grantStoryteller();
 * member.awardExperience(5);
 * const dto = member.toDto();
 * ```
 */
export class Member {
  private _dto: MemberDto;

  constructor(dto: MemberDto) {
    this._dto = { ...dto };
  }

  // Getters
  public get guildId(): Snowflake {
    return this._dto.guildId;
  }

  public get userId(): Snowflake {
    return this._dto.userId;
  }

  public get isStoryteller(): boolean {
    return this._dto.isStoryteller;
  }

  public get experienceAwarded(): number {
    return this._dto.experienceAwarded;
  }

  public get joinedAt(): Date {
    return this._dto.joinedAt;
  }

  public get lastActive(): Date {
    return this._dto.lastActive;
  }

  // Business methods

  /**
   * Grant storyteller permissions to this member.
   */
  public grantStoryteller(): void {
    this._dto.isStoryteller = true;
    this._dto.lastActive = new Date();
  }

  /**
   * Revoke storyteller permissions from this member.
   */
  public revokeStoryteller(): void {
    this._dto.isStoryteller = false;
    this._dto.lastActive = new Date();
  }

  /**
   * Award experience to this member.
   *
   * @param amount - Amount of experience to award
   */
  public awardExperience(amount: number): void {
    if (amount < 0) {
      throw new RealmError("Experience amount cannot be negative");
    }
    this._dto.experienceAwarded += amount;
    this._dto.lastActive = new Date();
  }

  /**
   * Update the member's last active timestamp.
   */
  public updateLastActive(): void {
    this._dto.lastActive = new Date();
  }

  /**
   * Extract the DTO from this entity.
  /**
   * Extract the DTO from this entity.
   *
   * @returns Member DTO for persistence
   */
  public toDto(): MemberDto {
    return { ...this._dto };
  }
}
