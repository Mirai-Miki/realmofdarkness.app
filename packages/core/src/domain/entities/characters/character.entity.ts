import type { Splats, Snowflake } from "types";
import { SheetStatus } from "types";
import { RealmError } from "@realm/errors";
import { Experience } from "../../value-objects/character/experience.vo.js";

/**
 * Base Character entity representing all common character data across all game systems.
 * This is a pure domain entity with no external dependencies.
 *
 * @remarks
 * This is the root of the character inheritance hierarchy. All character types
 * (5th, 20th, CoD) extend from this base class which contains fields common to all systems.
 *
 * Inheritance hierarchy:
 * - Character (base) → Character5th/Character20th/CharacterCoD → Vampire5th/Werewolf20th/etc
 *
 * @example
 * ```typescript
 * // Not instantiated directly - use specific character types
 * const vampire = new Vampire5th({
 *   name: 'Dracula',
 *   userId: 123456789n,
 *   splat: Splats.Vampire5th
 * });
 * ```
 */
export abstract class Character {
  /**
   * Database ID (null for new characters not yet persisted)
   */
  public id: Snowflake;

  /**
   * Character name (max 50 characters)
   */
  public name: string;

  /**
   * Discord user ID (snowflake)
   */
  public readonly userId: Snowflake;

  /**
   * Discord guild/chronicle ID (snowflake, null if not in a guild)
   */
  public guildId: Snowflake | null = null;

  /**
   * Character type/splat (vampire, werewolf, hunter, etc.)
   */
  public readonly splat: Splats;

  /**
   * Whether this is the user's active character sheet in the guild
   */
  public isSheet: boolean = false;

  /**
   * Character experience (total earned and current unspent)
   */
  public experience: Experience = Experience.zero();

  /**
   * Character sheet status (Draft, Review, Active, Dead, Archive)
   */
  public status: SheetStatus = SheetStatus.Draft;

  /**
   * Theme color for embeds (hex color code)
   */
  public color: string = "#000000";

  /**
   * Character avatar/faceclaim URL
   */
  public thumbnail: string | null = null;

  /**
   * Timestamp when character was created
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when character was last updated
   */
  public lastUpdated: Date;

  /**
   * Creates a new Character instance.
   *
   * @param data - Character initialization data
   * @param data.name - Character name (1-50 characters)
   * @param data.userId - Discord user ID
   * @param data.splat - Character type/splat
   * @param data.id - Database ID (optional for new characters)
   * @param data.guildId - Guild ID (optional)
   * @param data.isSheet - Whether this is the active sheet (default: false)
   * @param data.experience - Character experience (default: zero)
   * @param data.status - Character status (default: Draft)
   * @param data.color - Theme color (default: #000000)
   * @param data.thumbnail - Avatar URL (optional)
   * @param data.createdAt - Creation timestamp (default: now)
   * @param data.lastUpdated - Last update timestamp (default: now)
   */
  protected constructor(data: {
    name: string;
    userId: Snowflake;
    splat: Splats;
    id: Snowflake;
    guildId?: Snowflake | null;
    isSheet?: boolean;
    experience?: Experience;
    status?: SheetStatus;
    color?: string;
    thumbnail?: string | null;
    createdAt?: Date;
    lastUpdated?: Date;
  }) {
    this.validateName(data.name);

    this.name = data.name;
    this.userId = data.userId;
    this.splat = data.splat;
    this.id = data.id;
    this.guildId = data.guildId ?? null;
    this.isSheet = data.isSheet ?? false;
    this.experience = data.experience ?? Experience.zero();
    this.status = data.status ?? ("Draft" as SheetStatus);
    this.color = data.color ?? "#000000";
    this.thumbnail = data.thumbnail ?? null;
    this.createdAt = data.createdAt ?? new Date();
    this.lastUpdated = data.lastUpdated ?? new Date();
  }

  /**
   * Validates character name.
   *
   * @param name - The name to validate
   * @throws {RealmError} If name is invalid
   * @private
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new RealmError("Character name cannot be empty");
    }
    if (name.length > 50) {
      throw new RealmError("Character name cannot exceed 50 characters");
    }
  }

  /**
   * Checks if character has enough unspent experience to afford a purchase.
   *
   * @param cost - The experience cost
   * @returns True if character can afford the cost
   */
  public canAffordExperience(cost: number): boolean {
    return this.experience.canAfford(cost);
  }

  /**
   * Spends experience points.
   *
   * @param cost - The experience cost to spend
   * @throws {RealmError} If character doesn't have enough experience
   */
  public spendExperience(cost: number): void {
    this.experience = this.experience.spend(cost);
    this.lastUpdated = new Date();
  }

  /**
   * Awards experience points.
   *
   * @param amount - The amount of experience to award
   */
  public awardExperience(amount: number): void {
    this.experience = this.experience.award(amount);
    this.lastUpdated = new Date();
  }

  /**
   * Sets the total experience (for character creation/loading).
   *
   * @param total - The total experience points
   */
  public setExperienceTotal(total: number): void {
    this.experience = this.experience.setTotal(total);
    this.lastUpdated = new Date();
  }

  /**
   * Sets the current unspent experience.
   *
   * @param current - The current unspent experience points
   */
  public setExperienceCurrent(current: number): void {
    this.experience = this.experience.setCurrent(current);
    this.lastUpdated = new Date();
  }

  /**
   * Validates the character data.
   * Subclasses should override to add specific validation rules.
   *
   * @returns Object containing validation status and any error messages
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("Character name is required");
    }

    if (this.name.length > 50) {
      errors.push("Character name cannot exceed 50 characters");
    }

    // Experience validation handled by Experience value object

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets the character's game system version.
   * Subclasses must implement this.
   *
   * @returns The game system version ("5th", "20th", "CoD")
   */
  public abstract getVersion(): string;
}
