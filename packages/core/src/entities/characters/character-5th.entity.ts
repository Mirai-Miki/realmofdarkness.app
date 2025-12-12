import type { Splats, SheetStatus, Snowflake } from "@realm/common";
import type { Experience } from "../../value-objects/index.js";

import { Character } from "./character.entity.js";
import { DamageTracker5th, Skill } from "../../value-objects/index.js";

/**
 * Base character entity for all 5th Edition game systems.
 * This is the intermediate class for V5, Hunter5th, Werewolf5th, etc.
 *
 * @remarks
 * Character5th adds 5th edition specific mechanics:
 * - Willpower with superficial/aggravated damage (DamageTracker5th VO)
 * - Health with superficial/aggravated damage (DamageTracker5th VO)
 * - Attributes (9 attributes rated 1-5)
 * - Skills (27 skills rated 0-5 with optional specialties, using Skill VO)
 *
 * Inheritance: Character → Character5th → Vampire5th/Hunter5th/etc
 *
 * @example
 * ```typescript
 * // Not instantiated directly - use specific character types
 * const vampire = new Vampire5th({
 *   name: 'Dracula',
 *   userId: '123456789',
 *   splat: Splats.Vampire5th,
 *   health: new DamageTracker5th(7, 0, 0),
 *   willpower: new DamageTracker5th(5, 0, 0)
 * });
 * ```
 */
export abstract class Character5th extends Character {
  /**
   * Willpower tracker with superficial and aggravated damage (immutable Value Object)
   */
  public willpower: DamageTracker5th;

  /**
   * Health tracker with superficial and aggravated damage (immutable Value Object)
   */
  public health: DamageTracker5th;

  /**
   * Character attributes (Physical, Social, Mental)
   * Each rated 1-5
   */
  public attributes: {
    strength: number;
    dexterity: number;
    stamina: number;
    charisma: number;
    manipulation: number;
    composure: number;
    intelligence: number;
    wits: number;
    resolve: number;
  };

  /**
   * Character skills (9 per category: Physical, Social, Mental)
   * Each is a Skill value object with rating (0-5) and optional specialties
   */
  public skills: {
    // Physical
    athletics: Skill;
    brawl: Skill;
    craft: Skill;
    drive: Skill;
    firearms: Skill;
    melee: Skill;
    larceny: Skill;
    stealth: Skill;
    survival: Skill;
    // Social
    animalKen: Skill;
    etiquette: Skill;
    insight: Skill;
    intimidation: Skill;
    leadership: Skill;
    performance: Skill;
    persuasion: Skill;
    streetwise: Skill;
    subterfuge: Skill;
    // Mental
    academics: Skill;
    awareness: Skill;
    finance: Skill;
    investigation: Skill;
    medicine: Skill;
    occult: Skill;
    politics: Skill;
    science: Skill;
    technology: Skill;
  };

  /**
   * Creates a new Character5th instance.
   *
   * @param data - Character initialization data
   * @param data.name - Character name
   * @param data.userId - Discord user ID (Snowflake)
   * @param data.splat - Character type/splat
   * @param data.id - Database ID
   * @param data.guildId - Guild ID (optional)
   * @param data.isSheet - Whether this is the active sheet
   * @param data.experience - Character experience (optional)
   * @param data.status - Character status (optional)
   * @param data.color - Theme color (optional)
   * @param data.thumbnail - Avatar URL (optional)
   * @param data.createdAt - Creation timestamp (optional)
   * @param data.lastUpdated - Last update timestamp (optional)
   * @param data.health - Health tracker (default: total 4, no damage)
   * @param data.willpower - Willpower tracker (default: total 2, no damage)
   * @param data.attributes - Character attributes (default: all 1)
   * @param data.skills - Character skills (default: all 0)
   */
  protected constructor(data: {
    // Base Character fields
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
    // Character5th specific fields
    health?: DamageTracker5th;
    willpower?: DamageTracker5th;
    attributes?: Partial<Character5th["attributes"]>;
    skills?: Partial<Character5th["skills"]>;
  }) {
    // Pass only Character fields to super
    super({
      name: data.name,
      userId: data.userId,
      splat: data.splat,
      id: data.id,
      guildId: data.guildId,
      isSheet: data.isSheet,
      experience: data.experience,
      status: data.status,
      color: data.color,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated,
    });

    // Initialize willpower (must be DamageTracker5th)
    this.willpower = data.willpower ?? new DamageTracker5th(2, 0, 0);

    // Initialize health (must be DamageTracker5th)
    this.health = data.health ?? new DamageTracker5th(4, 0, 0);

    // Initialize attributes with defaults (all start at 1)
    this.attributes = {
      strength: 1,
      dexterity: 1,
      stamina: 1,
      charisma: 1,
      manipulation: 1,
      composure: 1,
      intelligence: 1,
      wits: 1,
      resolve: 1,
      ...data.attributes,
    };

    // Initialize skills with Skill VOs (all start at rating 0, no specialties)
    this.skills = {
      athletics: Skill.zero(),
      brawl: Skill.zero(),
      craft: Skill.zero(),
      drive: Skill.zero(),
      firearms: Skill.zero(),
      melee: Skill.zero(),
      larceny: Skill.zero(),
      stealth: Skill.zero(),
      survival: Skill.zero(),
      animalKen: Skill.zero(),
      etiquette: Skill.zero(),
      insight: Skill.zero(),
      intimidation: Skill.zero(),
      leadership: Skill.zero(),
      performance: Skill.zero(),
      persuasion: Skill.zero(),
      streetwise: Skill.zero(),
      subterfuge: Skill.zero(),
      academics: Skill.zero(),
      awareness: Skill.zero(),
      finance: Skill.zero(),
      investigation: Skill.zero(),
      medicine: Skill.zero(),
      occult: Skill.zero(),
      politics: Skill.zero(),
      science: Skill.zero(),
      technology: Skill.zero(),
      ...data.skills,
    };
  }

  // ==========================================
  // WILLPOWER METHODS (using Value Object)
  // ==========================================

  /**
   * Takes superficial willpower damage.
   *
   * @param amount - Amount of superficial damage
   */
  public takeSuperficialWillpowerDamage(amount: number): void {
    this.willpower = this.willpower.takeSuperficial(amount);
  }

  /**
   * Takes aggravated willpower damage.
   *
   * @param amount - Amount of aggravated damage
   */
  public takeAggravatedWillpowerDamage(amount: number): void {
    this.willpower = this.willpower.takeAggravated(amount);
  }

  /**
   * Heals superficial willpower damage.
   *
   * @param amount - Amount to heal
   */
  public healSuperficialWillpower(amount: number): void {
    this.willpower = this.willpower.healSuperficial(amount);
  }

  /**
   * Heals aggravated willpower damage.
   *
   * @param amount - Amount to heal
   */
  public healAggravatedWillpower(amount: number): void {
    this.willpower = this.willpower.healAggravated(amount);
  }

  /**
   * Sets total willpower.
   *
   * @param total - New total willpower
   */
  public setWillpowerTotal(total: number): void {
    this.willpower = this.willpower.setTotal(total);
  }

  /**
   * Gets current willpower (total - damage).
   *
   * @returns Current willpower value
   */
  public getCurrentWillpower(): number {
    return this.willpower.current;
  }

  /**
   * Checks if character is at full willpower.
   *
   * @returns True if no willpower damage
   */
  public isWillpowerImpaired(): boolean {
    return this.willpower.isImpaired;
  }

  // ==========================================
  // HEALTH METHODS (using Value Object)
  // ==========================================

  /**
   * Takes superficial health damage.
   *
   * @param amount - Amount of superficial damage
   */
  public takeSuperficialHealthDamage(amount: number): void {
    this.health = this.health.takeSuperficial(amount);
  }

  /**
   * Takes aggravated health damage.
   *
   * @param amount - Amount of aggravated damage
   */
  public takeAggravatedHealthDamage(amount: number): void {
    this.health = this.health.takeAggravated(amount);
  }

  /**
   * Heals superficial health damage.
   *
   * @param amount - Amount to heal
   */
  public healSuperficialHealth(amount: number): void {
    this.health = this.health.healSuperficial(amount);
  }

  /**
   * Heals aggravated health damage.
   *
   * @param amount - Amount to heal
   */
  public healAggravatedHealth(amount: number): void {
    this.health = this.health.healAggravated(amount);
  }

  /**
   * Sets total health.
   *
   * @param total - New total health
   */
  public setHealthTotal(total: number): void {
    this.health = this.health.setTotal(total);
  }

  /**
   * Gets current health (total - damage).
   *
   * @returns Current health value
   */
  public getCurrentHealth(): number {
    return this.health.current;
  }

  /**
   * Checks if character is at full health.
   *
   * @returns True if no health damage
   */
  public isHealthImpaired(): boolean {
    return this.health.isImpaired;
  }

  /**
   * Checks if character is incapacitated (no health remaining).
   *
   * @returns True if health is fully damaged
   */
  public isIncapacitated(): boolean {
    return this.health.isImpaired;
  }

  // ==========================================
  // ATTRIBUTES & SKILLS
  // ==========================================

  /**
   * Gets an attribute value (with active effects applied).
   *
   * @param attribute - Attribute name
   * @returns Attribute value (1-5 + effects)
   */
  public getAttribute(attribute: keyof Character5th["attributes"]): number {
    const baseValue = this.attributes[attribute];
    return this.applyEffects(attribute, baseValue);
  }

  /**
   * Gets the raw attribute value (without active effects).
   * Useful for editing or displaying base stats.
   *
   * @param attribute - Attribute name
   * @returns Base attribute value (1-5)
   */
  public getRawAttribute(attribute: keyof Character5th["attributes"]): number {
    return this.attributes[attribute];
  }

  /**
   * Sets an attribute value.
   *
   * @param attribute - Attribute name
   * @param value - New value (1-5)
   */
  public setAttribute(
    attribute: keyof Character5th["attributes"],
    value: number
  ): void {
    this.attributes[attribute] = value;
    this.lastUpdated = new Date();
  }

  /**
   * Gets a skill.
   *
   * @param skill - Skill name
   * @returns Skill value object
   */
  public getSkill(skill: keyof Character5th["skills"]): Skill {
    return this.skills[skill];
  }

  /**
   * Gets a skill rating (with active effects applied).
   *
   * @param skill - Skill name
   * @returns Skill rating (0-5 + effects)
   */
  public getSkillRating(skill: keyof Character5th["skills"]): number {
    const baseValue = this.skills[skill].rating;
    return this.applyEffects(skill, baseValue);
  }

  /**
   * Gets the raw skill rating (without active effects).
   *
   * @param skill - Skill name
   * @returns Base skill rating (0-5)
   */
  public getRawSkillRating(skill: keyof Character5th["skills"]): number {
    return this.skills[skill].rating;
  }

  /**
   * Sets a skill rating.
   *
   * @param skill - Skill name
   * @param rating - New rating (0-5)
   */
  public setSkillRating(
    skill: keyof Character5th["skills"],
    rating: number
  ): void {
    this.skills[skill] = this.skills[skill].setRating(rating);
    this.lastUpdated = new Date();
  }

  /**
   * Adds a specialty to a skill.
   *
   * @param skill - Skill name
   * @param specialty - Specialty name
   */
  public addSkillSpecialty(
    skill: keyof Character5th["skills"],
    specialty: string
  ): void {
    this.skills[skill] = this.skills[skill].addSpecialty(specialty);
    this.lastUpdated = new Date();
  }

  /**
   * Removes a specialty from a skill.
   *
   * @param skill - Skill name
   * @param specialty - Specialty name
   */
  public removeSkillSpecialty(
    skill: keyof Character5th["skills"],
    specialty: string
  ): void {
    this.skills[skill] = this.skills[skill].removeSpecialty(specialty);
    this.lastUpdated = new Date();
  }

  // ==========================================
  // CHARACTER OVERRIDES
  // ==========================================

  /**
   * Gets the game system version.
   *
   * @returns "5th"
   */
  public getVersion(): string {
    return "5th";
  }

  /**
   * Validates the character data.
   * Includes base validation plus 5th edition specific checks.
   *
   * @returns Object containing validation status and any error messages
   */
  public override validate(): { isValid: boolean; errors: string[] } {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];

    // Note: Value Objects self-validate, so no need to check trackers

    // Validate attributes (1-5)
    for (const [attr, value] of Object.entries(this.attributes)) {
      if (value < 1 || value > 5) {
        errors.push(`Attribute ${attr} must be between 1 and 5`);
      }
    }

    // Skills self-validate via Skill VO, but we can add additional checks if needed
    // For now, Skill VO ensures rating is 0-5

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
