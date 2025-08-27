/**
 * Enum for supporter tier names with explicit string values.
 */
export enum SupporterName {
  Base = "Base",
  Mortal = "Mortal",
  Fledgling = "Fledgling",
  Neonate = "Neonate",
  Ancilla = "Ancilla",
  Elder = "Elder",
  Methuselah = "Methuselah",
  Antediluvian = "Antediluvian",
}

/**
 * Enum for supporter levels (numeric progression).
 */
export enum SupporterLevelValue {
  Base = 0,
  Mortal = 1,
  Fledgling = 2,
  Neonate = 3,
  Ancilla = 4,
  Elder = 5,
  Methuselah = 6,
  Antediluvian = 7,
}

/**
 * Enum for character sheet limits per supporter tier.
 */
export enum SupporterSheetLimit {
  Base = 2,
  Mortal = 4,
  Fledgling = 8,
  Neonate = 30,
  Ancilla = 60,
  Elder = 150,
  Methuselah = 300,
  Antediluvian = 500,
}

/**
 * Enum for tracker limits per supporter tier.
 */
export enum SupporterTrackerLimit {
  Base = 50,
  Mortal = 75,
  Fledgling = 100,
  Neonate = 150,
  Ancilla = 200,
  Elder = 300,
  Methuselah = 500,
  Antediluvian = 1000,
}

/**
 * Shape of a supporter tier at runtime.
 */
export interface SupporterLevel {
  readonly level: SupporterLevelValue;
  readonly name: SupporterName;
  readonly sheetLimit: SupporterSheetLimit;
  readonly trackerLimit: SupporterTrackerLimit;
}

/**
 * Supporter tier configuration class with enum-based constant values.
 *
 * Each static property composes values from the individual enums,
 * providing type safety and clear separation of concerns.
 */
export class Supporter {
  /** Base supporter tier (free tier). */
  public static readonly Base: SupporterLevel = {
    level: SupporterLevelValue.Base,
    name: SupporterName.Base,
    sheetLimit: SupporterSheetLimit.Base,
    trackerLimit: SupporterTrackerLimit.Base,
  } as const;

  /** Mortal supporter tier. */
  public static readonly Mortal: SupporterLevel = {
    level: SupporterLevelValue.Mortal,
    name: SupporterName.Mortal,
    sheetLimit: SupporterSheetLimit.Mortal,
    trackerLimit: SupporterTrackerLimit.Mortal,
  } as const;

  /** Fledgling supporter tier. */
  public static readonly Fledgling: SupporterLevel = {
    level: SupporterLevelValue.Fledgling,
    name: SupporterName.Fledgling,
    sheetLimit: SupporterSheetLimit.Fledgling,
    trackerLimit: SupporterTrackerLimit.Fledgling,
  } as const;

  /** Neonate supporter tier. */
  public static readonly Neonate: SupporterLevel = {
    level: SupporterLevelValue.Neonate,
    name: SupporterName.Neonate,
    sheetLimit: SupporterSheetLimit.Neonate,
    trackerLimit: SupporterTrackerLimit.Neonate,
  } as const;

  /** Ancilla supporter tier. */
  public static readonly Ancilla: SupporterLevel = {
    level: SupporterLevelValue.Ancilla,
    name: SupporterName.Ancilla,
    sheetLimit: SupporterSheetLimit.Ancilla,
    trackerLimit: SupporterTrackerLimit.Ancilla,
  } as const;

  /** Elder supporter tier. */
  public static readonly Elder: SupporterLevel = {
    level: SupporterLevelValue.Elder,
    name: SupporterName.Elder,
    sheetLimit: SupporterSheetLimit.Elder,
    trackerLimit: SupporterTrackerLimit.Elder,
  } as const;

  /** Methuselah supporter tier. */
  public static readonly Methuselah: SupporterLevel = {
    level: SupporterLevelValue.Methuselah,
    name: SupporterName.Methuselah,
    sheetLimit: SupporterSheetLimit.Methuselah,
    trackerLimit: SupporterTrackerLimit.Methuselah,
  } as const;

  /** Antediluvian supporter tier (highest tier). */
  public static readonly Antediluvian: SupporterLevel = {
    level: SupporterLevelValue.Antediluvian,
    name: SupporterName.Antediluvian,
    sheetLimit: SupporterSheetLimit.Antediluvian,
    trackerLimit: SupporterTrackerLimit.Antediluvian,
  } as const;

  /**
   * Get a supporter tier by numeric level.
   *
   * @param level - The numeric level to look up (0-7).
   * @returns The matching SupporterLevel configuration.
   * @throws Error if the level is invalid.
   */
  public static getByLevel(level: SupporterLevelValue): SupporterLevel {
    switch (level) {
      case SupporterLevelValue.Base:
        return this.Base;
      case SupporterLevelValue.Mortal:
        return this.Mortal;
      case SupporterLevelValue.Fledgling:
        return this.Fledgling;
      case SupporterLevelValue.Neonate:
        return this.Neonate;
      case SupporterLevelValue.Ancilla:
        return this.Ancilla;
      case SupporterLevelValue.Elder:
        return this.Elder;
      case SupporterLevelValue.Methuselah:
        return this.Methuselah;
      case SupporterLevelValue.Antediluvian:
        return this.Antediluvian;
      default:
        // Should never hit this
        throw new Error(`Invalid supporter level`);
    }
  }

  /**
   * Get a supporter tier by name.
   *
   * @param name - The SupporterName to look up.
   * @returns The matching SupporterLevel configuration.
   * @throws Error if the name is invalid.
   */
  public static getByName(name: SupporterName): SupporterLevel {
    switch (name) {
      case SupporterName.Base:
        return this.Base;
      case SupporterName.Mortal:
        return this.Mortal;
      case SupporterName.Fledgling:
        return this.Fledgling;
      case SupporterName.Neonate:
        return this.Neonate;
      case SupporterName.Ancilla:
        return this.Ancilla;
      case SupporterName.Elder:
        return this.Elder;
      case SupporterName.Methuselah:
        return this.Methuselah;
      case SupporterName.Antediluvian:
        return this.Antediluvian;
      default:
        // Should never hit this
        throw new Error(`Invalid supporter name`);
    }
  }

  /**
   * Check if the current supporter level meets the required level.
   *
   * @param requirement - The required supporter level.
   * @param current - The current supporter level.
   * @returns True if the current level meets or exceeds the requirement, false otherwise.
   */
  public static meetsRequirement(
    requirement: SupporterLevel = this.Mortal,
    current: SupporterLevel
  ): boolean {
    return current.level >= requirement.level;
  }

  /**
   * Get all supporter tiers as an array.
   *
   * @returns Array of all SupporterLevel configurations, ordered by level.
   */
  public static getAllTiers(): readonly SupporterLevel[] {
    return [
      this.Base,
      this.Mortal,
      this.Fledgling,
      this.Neonate,
      this.Ancilla,
      this.Elder,
      this.Methuselah,
      this.Antediluvian,
    ] as const;
  }
}
