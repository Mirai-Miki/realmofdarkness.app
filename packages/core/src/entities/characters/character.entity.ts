import type { Splats, Snowflake } from "@realm/common";
import type { ActiveEffect } from "../../value-objects/";

import { SheetStatus, RealmError } from "@realm/common";
import { Experience } from "../../value-objects/";

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
   * If this character is a sheet or not.
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
   * Active effects currently applied to the character.
   */
  public activeEffects: ActiveEffect[] = [];

  /**
   * Adds an active effect to the character.
   * @param effect The effect to add
   */
  public addEffect(effect: ActiveEffect): void {
    this.activeEffects.push(effect);
  }

  /**
   * Removes an active effect by ID.
   * @param effectId The ID of the effect to remove
   */
  public removeEffect(effectId: string): void {
    this.activeEffects = this.activeEffects.filter((e) => e.id !== effectId);
  }

  /**
   * Gets all effects targeting a specific property.
   * @param target The target property name
   */
  public getEffectsFor(target: string): ActiveEffect[] {
    return this.activeEffects.filter((e) => e.target === target);
  }

  /**
   * Applies active effects to a base value.
   * Pipeline: Base -> ADD -> MULTIPLY -> OVERRIDE
   * @param target The target property name
   * @param baseValue The base value to modify
   * @returns The final modified value
   */
  protected applyEffects(target: string, baseValue: number): number {
    const effects = this.getEffectsFor(target);

    // 1. Check for overrides first (if any override exists, it takes precedence)
    const override = effects.find((e) => e.type === "OVERRIDE");
    if (override) return override.value;

    let value = baseValue;

    // 2. Apply additions
    effects
      .filter((e) => e.type === "ADD" || e.type === undefined)
      .forEach((e) => (value += e.value));

    // 3. Apply multipliers
    effects
      .filter((e) => e.type === "MULTIPLY")
      .forEach((e) => (value *= e.value));

    return value;
  }

  /**
   * Gets the character's game system version.
   * Subclasses must implement this.
   *
   * @returns The game system version ("5th", "20th", "CoD")
   */
  public abstract getVersion(): string;
}
