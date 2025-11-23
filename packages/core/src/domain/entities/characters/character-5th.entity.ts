import { Character } from "./character.entity.js";
import type { Splats, SheetStatus, Snowflake } from "types";
import { DamageTracker5th } from "../../value-objects/index.js";

/**
 * Base character entity for all 5th Edition game systems.
 * This is the intermediate class for V5, Hunter5th, Werewolf5th, etc.
 *
 * @remarks
 * Character5th adds 5th edition specific mechanics:
 * - Willpower with superficial/aggravated damage (Value Object)
 * - Health with superficial/aggravated damage (Value Object)
 * - Attributes (9 attributes rated 1-5)
 * - Skills (27 skills rated 0-5)
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
   * Each rated 0-5
   */
  public skills: {
    // Physical
    athletics: number;
    brawl: number;
    craft: number;
    drive: number;
    firearms: number;
    melee: number;
    larceny: number;
    stealth: number;
    survival: number;
    // Social
    animalKen: number;
    etiquette: number;
    insight: number;
    intimidation: number;
    leadership: number;
    performance: number;
    persuasion: number;
    streetwise: number;
    subterfuge: number;
    // Mental
    academics: number;
    awareness: number;
    finance: number;
    investigation: number;
    medicine: number;
    occult: number;
    politics: number;
    science: number;
    technology: number;
  };

  /**
   * Creates a new Character5th instance.
   *
   * @param data - Character initialization data
   * @param data.name - Character name
   * @param data.userId - Discord user ID (Snowflake)
   * @param data.splat - Character type/splat
   * @param data.health - Health tracker (default: total 4, no damage)
   * @param data.willpower - Willpower tracker (default: total 2, no damage)
   * @param data.attributes - Character attributes (default: all 1)
   * @param data.skills - Character skills (default: all 0)
   * Additional base Character fields are also accepted
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
    health?:
      | DamageTracker5th
      | { total: number; superficial: number; aggravated: number };
    willpower?:
      | DamageTracker5th
      | { total: number; superficial: number; aggravated: number };
    attributes?: Partial<Character5th["attributes"]>;
    skills?: Partial<Character5th["skills"]>;
  }) {
    super(data);

    // Initialize willpower (accept Value Object or plain object)
    if (data.willpower instanceof DamageTracker5th) {
      this.willpower = data.willpower;
    } else if (data.willpower) {
      this.willpower = new DamageTracker5th(
        data.willpower.total,
        data.willpower.superficial,
        data.willpower.aggravated
      );
    } else {
      this.willpower = new DamageTracker5th(2, 0, 0); // Default
    }

    // Initialize health (accept Value Object or plain object)
    if (data.health instanceof DamageTracker5th) {
      this.health = data.health;
    } else if (data.health) {
      this.health = new DamageTracker5th(
        data.health.total,
        data.health.superficial,
        data.health.aggravated
      );
    } else {
      this.health = new DamageTracker5th(4, 0, 0); // Default
    }

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

    // Initialize skills with defaults (all start at 0)
    this.skills = {
      athletics: 0,
      brawl: 0,
      craft: 0,
      drive: 0,
      firearms: 0,
      melee: 0,
      larceny: 0,
      stealth: 0,
      survival: 0,
      animalKen: 0,
      etiquette: 0,
      insight: 0,
      intimidation: 0,
      leadership: 0,
      performance: 0,
      persuasion: 0,
      streetwise: 0,
      subterfuge: 0,
      academics: 0,
      awareness: 0,
      finance: 0,
      investigation: 0,
      medicine: 0,
      occult: 0,
      politics: 0,
      science: 0,
      technology: 0,
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
    this.markChanged("willpower", this.willpower);
  }

  /**
   * Takes aggravated willpower damage.
   *
   * @param amount - Amount of aggravated damage
   */
  public takeAggravatedWillpowerDamage(amount: number): void {
    this.willpower = this.willpower.takeAggravated(amount);
    this.markChanged("willpower", this.willpower);
  }

  /**
   * Heals superficial willpower damage.
   *
   * @param amount - Amount to heal
   */
  public healSuperficialWillpower(amount: number): void {
    this.willpower = this.willpower.healSuperficial(amount);
    this.markChanged("willpower", this.willpower);
  }

  /**
   * Heals aggravated willpower damage.
   *
   * @param amount - Amount to heal
   */
  public healAggravatedWillpower(amount: number): void {
    this.willpower = this.willpower.healAggravated(amount);
    this.markChanged("willpower", this.willpower);
  }

  /**
   * Sets total willpower.
   *
   * @param total - New total willpower
   */
  public setWillpowerTotal(total: number): void {
    this.willpower = this.willpower.setTotal(total);
    this.markChanged("willpower", this.willpower);
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
  public isWillpowerFull(): boolean {
    return this.willpower.isEmpty;
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
    this.markChanged("health", this.health);
  }

  /**
   * Takes aggravated health damage.
   *
   * @param amount - Amount of aggravated damage
   */
  public takeAggravatedHealthDamage(amount: number): void {
    this.health = this.health.takeAggravated(amount);
    this.markChanged("health", this.health);
  }

  /**
   * Heals superficial health damage.
   *
   * @param amount - Amount to heal
   */
  public healSuperficialHealth(amount: number): void {
    this.health = this.health.healSuperficial(amount);
    this.markChanged("health", this.health);
  }

  /**
   * Heals aggravated health damage.
   *
   * @param amount - Amount to heal
   */
  public healAggravatedHealth(amount: number): void {
    this.health = this.health.healAggravated(amount);
    this.markChanged("health", this.health);
  }

  /**
   * Sets total health.
   *
   * @param total - New total health
   */
  public setHealthTotal(total: number): void {
    this.health = this.health.setTotal(total);
    this.markChanged("health", this.health);
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
  public isHealthFull(): boolean {
    return this.health.isEmpty;
  }

  /**
   * Checks if character is incapacitated (no health remaining).
   *
   * @returns True if health is fully damaged
   */
  public isIncapacitated(): boolean {
    return this.health.isFull;
  }

  // ==========================================
  // ATTRIBUTES & SKILLS
  // ==========================================

  /**
   * Gets an attribute value.
   *
   * @param attribute - Attribute name
   * @returns Attribute value (1-5)
   */
  public getAttribute(attribute: keyof Character5th["attributes"]): number {
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
    this.markChanged("attributes", this.attributes);
  }

  /**
   * Gets a skill value.
   *
   * @param skill - Skill name
   * @returns Skill value (0-5)
   */
  public getSkill(skill: keyof Character5th["skills"]): number {
    return this.skills[skill];
  }

  /**
   * Sets a skill value.
   *
   * @param skill - Skill name
   * @param value - New value (0-5)
   */
  public setSkill(skill: keyof Character5th["skills"], value: number): void {
    this.skills[skill] = value;
    this.markChanged("skills", this.skills);
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

    // Validate skills (0-5)
    for (const [skill, value] of Object.entries(this.skills)) {
      if (value < 0 || value > 5) {
        errors.push(`Skill ${skill} must be between 0 and 5`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
