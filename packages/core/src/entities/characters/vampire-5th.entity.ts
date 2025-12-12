import type { Snowflake, Splats, SheetStatus } from "@realm/common";
import type { Experience, DamageTracker5th } from "../../value-objects";

import { Character5th } from "./character-5th.entity.js";

/**
 * Type definitions for Vampire 5th Edition
 */

// Typed clan keys (prevents typos)
export type ClanKey5th =
  | "brujah"
  | "gangrel"
  | "malkavian"
  | "nosferatu"
  | "toreador"
  | "tremere"
  | "ventrue"
  | "banuHaqim"
  | "hecata"
  | "lasombra"
  | "ministryOfSet"
  | "ravnos"
  | "salubri"
  | "tzimisce"
  | "caitiff"
  | "thinblood";

export type PredatorTypeKey5th =
  | "alleycat"
  | "bagger"
  | "bloodLeech"
  | "cleaver"
  | "consensualist"
  | "farmer"
  | "osiris"
  | "sandman"
  | "siren"
  | "extortionist"
  | "graverobber"
  | "grim-reaper"
  | "pursuer"
  | "scene-queen"
  | "trapdoor";

export type BloodResonanceKey5th =
  | "choleric" // Anger (Celerity, Potence)
  | "melancholic" // Sadness (Fortitude, Obfuscate)
  | "phlegmatic" // Calm (Auspex, Dominate)
  | "sanguine"; // Pleasure (Blood Sorcery, Presence)

export type DisciplineKey5th =
  | "animalism"
  | "auspex"
  | "bloodSorcery"
  | "celerity"
  | "dominate"
  | "fortitude"
  | "obfuscate"
  | "potence"
  | "presence"
  | "protean"
  | "thinbloodAlchemy"
  | "oblivion";

/**
 * Active effect applied by banes, powers, etc.
 * TODO: Move to shared types when implementing effects system
 */
export interface ActiveEffect {
  key: string;
  name: string;
  description: string;
  // Mechanical effects would go here
}

/**
 * Clan bane with mechanical effects
 */
export interface Bane5th {
  /** Unique identifier for this bane */
  key: string;

  /** Display name */
  name: string;

  /** Description of the bane */
  description: string;

  /** Mechanical effects applied by this bane */
  effect?: ActiveEffect[];
}

/**
 * Vampire clan definition (fully resolved from repository)
 */
export interface ClanDefinition5th {
  /** Unique identifier (typed key from static registry or 'custom') */
  key: ClanKey5th | "custom";

  /** Display name */
  name: string;

  /** In-clan disciplines (keys) */
  inClanDisciplines: DisciplineKey5th[];

  /** Clan bane */
  bane: Bane5th;

  /** Clan compulsion */
  compulsion: string;
}

/**
 * Predator type definition (fully resolved from repository)
 */
export interface PredatorTypeDefinition5th {
  /** Unique identifier (typed key from static registry or 'custom') */
  key: PredatorTypeKey5th | "custom";

  /** Display name */
  name: string;
}

/**
 * Blood resonance definition (fully resolved from repository)
 */
export interface BloodResonance5th {
  /** Unique identifier (typed key or 'custom') */
  key: BloodResonanceKey5th | "custom";

  /** Display name */
  name: string;

  /** Disciplines that benefit from this resonance */
  disciplineBonus: DisciplineKey5th[];
}

/**
 * Blood Potency value object with all calculated values
 * This is immutable - use BloodPotency5th.create(value) to generate
 */
export class BloodPotency5th {
  /** Blood potency rating (0-10) */
  public readonly value: number;

  /** Blood surge bonus dice */
  public readonly surgeDice: number;

  /** Superficial health healed per rouse check */
  public readonly mendAmount: number;

  /** Discipline power bonus dice */
  public readonly powerBonus: number;

  /** Can reroll one die on rouse checks at this BP */
  public readonly rouseReroll: boolean;

  /** Bane severity */
  public readonly severity: number;

  /** Feeding penalty details */
  public readonly feedingPenalty: {
    /** Animal blood is useless at this BP */
    animalBloodUseless: boolean;

    /** Penalty to slake hunger when feeding */
    slakePenalty: number;

    /** Must kill to reduce hunger below this threshold (null if no requirement) */
    mustKillThreshold: number | null;
  };

  private constructor(value: number) {
    if (value < 0 || value > 10) {
      throw new Error("Blood Potency must be between 0 and 10");
    }

    this.value = value;

    // Calculate surge dice (V5 core p215-216)
    if (value <= 2) this.surgeDice = 2;
    else if (value <= 4) this.surgeDice = 3;
    else if (value <= 6) this.surgeDice = 4;
    else if (value <= 9) this.surgeDice = 5;
    else this.surgeDice = 6;

    // Calculate mend amount (V5 core p213)
    if (value === 0) this.mendAmount = 1;
    else if (value <= 2) this.mendAmount = 2;
    else if (value <= 6) this.mendAmount = 3;
    else if (value <= 9) this.mendAmount = 4;
    else this.mendAmount = 5;

    // Calculate power bonus (V5 core p215-216)
    if (value <= 1) this.powerBonus = 0;
    else if (value <= 4) this.powerBonus = 1;
    else if (value === 5) this.powerBonus = 2;
    else if (value <= 7) this.powerBonus = 3;
    else if (value <= 9) this.powerBonus = 4;
    else this.powerBonus = 5;

    // Rouse reroll available at BP 2+
    this.rouseReroll = value >= 2;

    // Calculate bane severity (V5 core p215-216)
    if (value === 0) this.severity = 0;
    else if (value <= 2) this.severity = 2;
    else if (value <= 4) this.severity = 3;
    else if (value <= 6) this.severity = 4;
    else this.severity = 5;

    // Calculate feeding penalties (V5 core p215-216)
    const animalBloodUseless = value >= 5;
    let slakePenalty = 0;
    let mustKillThreshold: number | null = null;

    if (value >= 2 && value <= 4) slakePenalty = -1;
    else if (value >= 5 && value <= 6) {
      slakePenalty = -1;
      mustKillThreshold = 2;
    } else if (value === 7) {
      slakePenalty = -2;
      mustKillThreshold = 2;
    } else if (value >= 8 && value <= 9) {
      slakePenalty = -2;
      mustKillThreshold = 3;
    } else if (value === 10) {
      slakePenalty = -3;
      mustKillThreshold = 3;
    }

    this.feedingPenalty = {
      animalBloodUseless,
      slakePenalty,
      mustKillThreshold,
    };
  }

  /**
   * Create a BloodPotency5th value object
   *
   * @param value - Blood potency rating (0-10)
   * @returns Immutable BloodPotency5th with all calculated values
   *
   * @example
   * ```typescript
   * const bp = BloodPotency5th.create(3);
   * console.log(bp.surgeDice); // 3
   * console.log(bp.mendAmount); // 3
   * console.log(bp.powerBonus); // 1
   * ```
   */
  public static create(value: number): BloodPotency5th {
    return new BloodPotency5th(value);
  }
}

/**
 * Humanity tracker value object (immutable)
 * TODO: Implement based on PLAN-humanity-tracker-5th.md
 */
export class HumanityTracker5th {
  public readonly humanity: number;
  public readonly stains: number;

  private constructor(humanity: number, stains: number) {
    if (humanity < 0 || humanity > 10) {
      throw new Error("Humanity must be between 0 and 10");
    }
    if (stains < 0 || stains > 10) {
      throw new Error("Stains must be between 0 and 10");
    }
    this.humanity = humanity;
    this.stains = stains;
  }

  /**
   * Create a new HumanityTracker5th
   */
  public static create(
    humanity: number,
    stains: number = 0
  ): HumanityTracker5th {
    return new HumanityTracker5th(humanity, stains);
  }

  /**
   * Reconstruct from JSON
   */
  public static fromJSON(data: {
    humanity: number;
    stains: number;
  }): HumanityTracker5th {
    return new HumanityTracker5th(data.humanity, data.stains);
  }

  /**
   * Add stains
   */
  public addStain(amount: number): HumanityTracker5th {
    const newStains = Math.min(10, this.stains + amount);
    return new HumanityTracker5th(this.humanity, newStains);
  }

  /**
   * Clear all stains
   */
  public clearStains(): HumanityTracker5th {
    return new HumanityTracker5th(this.humanity, 0);
  }

  /**
   * Check if stains >= humanity (remorse roll required)
   */
  public hasStainOverflow(): boolean {
    return this.stains >= this.humanity;
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): { humanity: number; stains: number } {
    return {
      humanity: this.humanity,
      stains: this.stains,
    };
  }
}

/**
 * Vampire 5th Edition character entity
 *
 * @remarks
 * Extends Character5th with vampire-specific mechanics:
 * - Clan with bane and compulsions
 * - Generation and blood potency
 * - Hunger system (0-5)
 * - Humanity and stains
 * - Disciplines and powers (TODO: implement)
 * - Predator type
 * - Blood resonance
 *
 * @example
 * ```typescript
 * const vampire = new Vampire5th({
 *   name: 'Dracula',
 *   userId: '123456789',
 *   id: '1',
 *   clan: { key: 'tzimisce', name: 'Tzimisce', ... },
 *   generation: 4,
 *   hunger: 2
 * });
 *
 * vampire.increaseHunger(1);
 * console.log(vampire.hunger); // 3
 * ```
 */
export class Vampire5th extends Character5th {
  // ==========================================
  // CLAN & LINEAGE
  // ==========================================

  /** Vampire clan (fully resolved from repository) */
  public clan: ClanDefinition5th;

  /** Name of vampire's sire */
  public sire?: string;

  /** Generation (1-18, or null for thin-bloods) */
  public generation: number | null;

  // ==========================================
  // PREDATOR TYPE
  // ==========================================

  /** Predator type (fully resolved from repository) */
  public predatorType: PredatorTypeDefinition5th;

  // ==========================================
  // HUMANITY & BEAST
  // ==========================================

  /** Humanity tracker (immutable VO) */
  public humanity: HumanityTracker5th;

  /** Current hunger level (0-5) */
  public hunger: number;

  // ==========================================
  // BLOOD POTENCY
  // ==========================================

  /** Blood potency (immutable VO with calculated values) */
  public bloodPotency: BloodPotency5th;

  // ==========================================
  // DISCIPLINES
  // ==========================================

  // TODO: Implement disciplines system
  // public disciplines: Map<string, CharacterDiscipline5th>;

  // ==========================================
  // FLAVOR & METADATA
  // ==========================================

  /** Current blood resonance */
  public resonance?: BloodResonance5th;

  /** Date of death/embrace */
  public dateOfDeath?: string;

  /** Apparent age */
  public apparentAge?: string;

  /**
   * Creates a new Vampire5th instance.
   *
   * @param data - Character initialization data
   */
  constructor(data: {
    // Base Character fields
    name: string;
    userId: Snowflake;
    id: Snowflake;
    guildId?: Snowflake | null;
    isSheet?: boolean;
    experience?: Experience;
    status?: SheetStatus;
    color?: string;
    thumbnail?: string | null;
    createdAt?: Date;
    lastUpdated?: Date;

    // Character5th fields
    health?: DamageTracker5th;
    willpower?: DamageTracker5th;
    attributes?: Partial<Character5th["attributes"]>;
    skills?: Partial<Character5th["skills"]>;

    // Vampire5th fields
    clan?: ClanDefinition5th;
    sire?: string;
    generation?: number | null;
    predatorType?: PredatorTypeDefinition5th;
    humanity?: HumanityTracker5th;
    hunger?: number;
    bloodPotency?: BloodPotency5th;
    resonance?: BloodResonance5th;
    // disciplines?: Map<string, CharacterDiscipline5th>;
    dateOfDeath?: string;
    apparentAge?: string;
  }) {
    // Pass Character5th fields to super
    super({
      name: data.name,
      userId: data.userId,
      splat: "vampire5th" as Splats,
      id: data.id,
      guildId: data.guildId,
      isSheet: data.isSheet,
      experience: data.experience,
      status: data.status,
      color: data.color,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated,
      health: data.health,
      willpower: data.willpower,
      attributes: data.attributes,
      skills: data.skills,
    });

    // Initialize vampire-specific fields
    // Note: clan and predatorType should be provided (resolved by repository)
    // Defaults shown here are fallbacks only
    this.clan =
      data.clan ??
      ({
        key: "caitiff",
        name: "Caitiff",
        inClanDisciplines: [],
        bane: { key: "none", name: "None", description: "No clan bane" },
        compulsion: "None",
      } as ClanDefinition5th);

    this.sire = data.sire;
    this.generation = data.generation ?? 13;

    this.predatorType =
      data.predatorType ??
      ({
        key: "alleycat",
        name: "Alleycat",
      } as PredatorTypeDefinition5th);

    this.humanity = data.humanity ?? HumanityTracker5th.create(7);
    this.hunger = data.hunger ?? 1;
    this.bloodPotency = data.bloodPotency ?? BloodPotency5th.create(0);
    this.resonance = data.resonance;
    // this.disciplines = data.disciplines ?? new Map();
    this.dateOfDeath = data.dateOfDeath;
    this.apparentAge = data.apparentAge;
  }

  // ==========================================
  // HUMANITY SYSTEM
  // ==========================================

  /**
   * Add stains to humanity
   */
  public addStain(amount: number = 1): void {
    this.humanity = this.humanity.addStain(amount);
  }

  /**
   * Clear all stains
   */
  public clearStains(): void {
    this.humanity = this.humanity.clearStains();
  }

  /**
   * Get current humanity value
   */
  public getHumanity(): number {
    return this.humanity.humanity;
  }

  /**
   * Get current stains
   */
  public getStains(): number {
    return this.humanity.stains;
  }

  /**
   * Check if stains >= humanity (remorse roll required)
   */
  public hasStainOverflow(): boolean {
    return this.humanity.hasStainOverflow();
  }

  /**
   * Perform remorse roll
   * TODO: Implement full remorse roll mechanics
   */
  public remorseRoll(successes: number): {
    success: boolean;
    humanityLost: number;
    newHumanity: number;
  } {
    throw new Error("Not implemented: remorseRoll");
  }

  /**
   * Set humanity value
   * TODO: Implement with proper VO update
   */
  public setHumanity(value: number): void {
    throw new Error("Not implemented: setHumanity");
  }

  // ==========================================
  // HUNGER SYSTEM
  // ==========================================

  /**
   * Increase hunger (from failed rouse checks, time)
   * Caps at 5
   */
  public increaseHunger(amount: number = 1): void {
    this.hunger = Math.min(5, this.hunger + amount);
  }

  /**
   * Decrease hunger (from feeding)
   * Accounts for blood potency feeding penalties
   */
  public slakeHunger(amount: number, resonanceMatch?: boolean): void {
    let actualAmount = amount;

    // Apply feeding penalty from blood potency
    actualAmount += this.bloodPotency.feedingPenalty.slakePenalty;

    // Resonance bonus (if provided and matches)
    if (resonanceMatch && this.resonance) {
      actualAmount += 1;
    }

    // Apply hunger reduction (minimum 1, cannot go below)
    this.hunger = Math.max(1, this.hunger - Math.max(0, actualAmount));

    // Handle must-kill threshold
    const threshold = this.bloodPotency.feedingPenalty.mustKillThreshold;
    if (threshold !== null && this.hunger < threshold) {
      // If hunger would drop below threshold without killing, set to threshold
      // (Caller should check if target was killed and call slakeHunger again if needed)
      this.hunger = threshold;
    }
  }

  /**
   * Check if can rouse blood (hunger < 5)
   */
  public canRouseBlood(): boolean {
    return this.hunger < 5;
  }

  /**
   * Check if at maximum hunger (5)
   */
  public isHungryBeast(): boolean {
    return this.hunger >= 5;
  }

  /**
   * Get current hunger
   */
  public getHunger(): number {
    return this.hunger;
  }

  // ==========================================
  // BLOOD POTENCY SYSTEM
  // ==========================================

  /**
   * Get blood potency value object with all calculated values
   */
  public getBloodPotency(): BloodPotency5th {
    return this.bloodPotency;
  }

  /**
   * Set blood potency (recalculates all derived values)
   */
  public setBloodPotency(value: number): void {
    this.bloodPotency = BloodPotency5th.create(value);
  }

  /**
   * Mend superficial health damage
   * Heals amount = bloodPotency.mendAmount
   * Caller must handle rouse check before calling
   */
  public mendDamage(): void {
    const mendAmount = this.bloodPotency.mendAmount;
    // Heal superficial damage
    this.health = this.health.healSuperficial(mendAmount);
  }

  /**
   * Check if can use blood surge
   */
  public canUseBloodSurge(): boolean {
    return this.canRouseBlood();
  }

  // ==========================================
  // DISCIPLINE MANAGEMENT
  // ==========================================
  // TODO: Implement discipline system

  /**
   * Add a discipline to the character
   * @throws Error - Not implemented
   */
  public addDiscipline(): void {
    throw new Error("Not implemented: addDiscipline - See PLAN-disciplines.md");
  }

  /**
   * Remove a discipline from the character
   * @throws Error - Not implemented
   */
  public removeDiscipline(): void {
    throw new Error(
      "Not implemented: removeDiscipline - See PLAN-disciplines.md"
    );
  }

  /**
   * Learn a discipline power
   * @throws Error - Not implemented
   */
  public learnPower(): void {
    throw new Error("Not implemented: learnPower - See PLAN-disciplines.md");
  }

  /**
   * Forget a discipline power
   * @throws Error - Not implemented
   */
  public forgetPower(): void {
    throw new Error("Not implemented: forgetPower - See PLAN-disciplines.md");
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get character version
   * @returns "vampire5th"
   */
  public override getVersion(): string {
    return "vampire5th";
  }

  /**
   * Validate character data
   * Checks vampire-specific constraints
   */
  public override validate(): { isValid: boolean; errors: string[] } {
    const baseValidation = super.validate();
    const errors = [...baseValidation.errors];

    // Hunger validation
    if (this.hunger < 0 || this.hunger > 5) {
      errors.push("Hunger must be between 0 and 5");
    }

    // Blood potency validation
    if (this.bloodPotency.value < 0 || this.bloodPotency.value > 10) {
      errors.push("Blood Potency must be between 0 and 10");
    }

    // Generation validation (null is valid for thin-bloods)
    if (
      this.generation !== null &&
      (this.generation < 1 || this.generation > 18)
    ) {
      errors.push("Generation must be between 1 and 18, or null");
    }

    // Humanity is self-validating via HumanityTracker5th VO

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Serialize to JSON for database
   * Note: Converts resolved definitions back to references
   * TODO: Implement full serialization
   */
  public toJSON(): Record<string, unknown> {
    throw new Error(
      "Not implemented: toJSON - Full serialization not yet implemented"
    );
  }

  /**
   * Factory method to reconstruct from database
   * TODO: Implement fromData factory
   */
  public static fromData(): Vampire5th {
    throw new Error(
      "Not implemented: fromData - Factory method not yet implemented"
    );
  }
}
