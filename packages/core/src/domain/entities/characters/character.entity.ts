import type { Splats } from "../../../types/character.types.js";
import type { Snowflake } from "../../../types/index.js";
import { SheetStatus } from "types";
import { RealmError } from "@realm/logger/errors";

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
  public id: number | null = null;

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
   * Total experience points earned
   */
  public expTotal: number = 0;

  /**
   * Current unspent experience points
   */
  public expCurrent: number = 0;

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
   * Track field changes for change detection
   * @private
   */
  protected _changes: Record<string, unknown> = {};

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
   * @param data.expTotal - Total experience points (default: 0)
   * @param data.expCurrent - Current unspent experience (default: 0)
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
    id?: number | null;
    guildId?: Snowflake | null;
    isSheet?: boolean;
    expTotal?: number;
    expCurrent?: number;
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
    this.id = data.id ?? null;
    this.guildId = data.guildId ?? null;
    this.isSheet = data.isSheet ?? false;
    this.expTotal = data.expTotal ?? 0;
    this.expCurrent = data.expCurrent ?? 0;
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
    return this.expCurrent >= cost;
  }

  /**
   * Spends experience points.
   *
   * @param cost - The experience cost to spend
   * @throws {ClientError} If character doesn't have enough experience
   */
  public spendExperience(cost: number): void {
    if (!this.canAffordExperience(cost)) {
      throw new RealmError(
        `Insufficient experience. Required: ${cost}, Available: ${this.expCurrent}`
      );
    }
    this.expCurrent -= cost;
    this.markChanged("expCurrent", this.expCurrent);
  }

  /**
   * Awards experience points.
   *
   * @param amount - The amount of experience to award
   */
  public awardExperience(amount: number): void {
    if (amount < 0) {
      throw new RealmError("Cannot award negative experience");
    }
    this.expTotal += amount;
    this.expCurrent += amount;
    this.markChanged("expTotal", this.expTotal);
    this.markChanged("expCurrent", this.expCurrent);
  }

  /**
   * Sets the total experience (for character creation/loading).
   *
   * @param total - The total experience points
   */
  public setExperienceTotal(total: number): void {
    if (total < 0) {
      throw new RealmError("Experience total cannot be negative");
    }
    this.expTotal = total;
    this.markChanged("expTotal", total);
  }

  /**
   * Sets the current unspent experience.
   *
   * @param current - The current unspent experience points
   */
  public setExperienceCurrent(current: number): void {
    if (current < 0) {
      throw new RealmError("Current experience cannot be negative");
    }
    if (current > this.expTotal) {
      throw new Error("Current experience cannot exceed total experience");
    }
    this.expCurrent = current;
    this.markChanged("expCurrent", current);
  }

  /**
   * Marks a field as changed for change tracking.
   *
   * @param field - The field name that changed
   * @param value - The new value
   * @protected
   */
  protected markChanged(field: string, value: unknown): void {
    this._changes[field] = value;
    this.lastUpdated = new Date();
  }

  /**
   * Gets the changes made to this character since last save.
   *
   * @returns Object containing changed fields and their new values
   */
  public getChanges(): Record<string, unknown> {
    return { ...this._changes };
  }

  /**
   * Checks if the character has unsaved changes.
   *
   * @returns True if there are unsaved changes
   */
  public hasChanges(): boolean {
    return Object.keys(this._changes).length > 0;
  }

  /**
   * Clears the change tracking (typically after successful save).
   */
  public clearChanges(): void {
    this._changes = {};
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

    if (this.expCurrent < 0) {
      errors.push("Current experience cannot be negative");
    }

    if (this.expCurrent > this.expTotal) {
      errors.push("Current experience cannot exceed total experience");
    }

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
