import {
  RealmError,
  SupporterLevel,
  SupporterLevelSchema,
  BoostsSchema,
  type SupporterData,
} from "@realm/common";

/**
 * Character sheet limits per supporter tier.
 * These are business rules that determine feature access.
 */
export const SUPPORTER_SHEET_LIMITS: Record<SupporterLevel, number> = {
  [SupporterLevel.Base]: 2,
  [SupporterLevel.Mortal]: 4,
  [SupporterLevel.Fledgling]: 8,
  [SupporterLevel.Neonate]: 30,
  [SupporterLevel.Ancilla]: 60,
  [SupporterLevel.Elder]: 150,
  [SupporterLevel.Methuselah]: 300,
  [SupporterLevel.Antediluvian]: 500,
} as const;

/**
 * Tracker limits per supporter tier.
 * These are business rules that determine feature access.
 */
export const SUPPORTER_TRACKER_LIMITS: Record<SupporterLevel, number> = {
  [SupporterLevel.Base]: 50,
  [SupporterLevel.Mortal]: 75,
  [SupporterLevel.Fledgling]: 100,
  [SupporterLevel.Neonate]: 150,
  [SupporterLevel.Ancilla]: 200,
  [SupporterLevel.Elder]: 300,
  [SupporterLevel.Methuselah]: 500,
  [SupporterLevel.Antediluvian]: 1000,
} as const;

/**
 * Numeric level values for supporter tiers.
 * Used for comparison and ordering.
 */
export const SUPPORTER_LEVEL_VALUES: Record<SupporterLevel, number> = {
  [SupporterLevel.Base]: 0,
  [SupporterLevel.Mortal]: 1,
  [SupporterLevel.Fledgling]: 2,
  [SupporterLevel.Neonate]: 3,
  [SupporterLevel.Ancilla]: 4,
  [SupporterLevel.Elder]: 5,
  [SupporterLevel.Methuselah]: 6,
  [SupporterLevel.Antediluvian]: 7,
} as const;

/**
 * Domain entity representing a Supporter subscription.
 *
 * Handles subscription level, boost allocation, and billing concerns.
 * This is separate from User to maintain single responsibility.
 *
 * This entity wraps SupporterData with business logic and validation.
 *
 * @example
 * ```typescript
 * const supporter = new Supporter({
 *   userId: "123456789012345678",
 *   supporterLevel: SupporterLevel.Neonate,
 *   boostsUsed: 2,
 *   startedAt: new Date(),
 *   expiresAt: undefined,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * const maxSheets = supporter.getSheetLimit();
 * const data = supporter.toData();
 * ```
 */
export class Supporter {
  private _data: SupporterData;

  constructor(data: SupporterData) {
    this._data = { ...data };
  }
  // Getters - access Data properties
  public get userId(): string {
    return this._data.userId;
  }

  public get level(): SupporterLevel {
    return this._data.level;
  }

  public get boosts(): number {
    return this._data.boosts;
  }

  public get firstSupported(): Date | null {
    return this._data.firstSupported;
  }

  // Business methods

  /**
   * Check if the user is an active supporter (not Base tier).
   */
  public isActive(): boolean {
    return this._data.level !== SupporterLevel.Base;
  }

  /**
   * Get the supporter's tier level.
   */
  public getLevel(): SupporterLevel {
    return this._data.level;
  }

  /**
   * Check if the supporter has used any boosts.
   */
  public hasUsedBoosts(): boolean {
    return this._data.boosts > 0;
  }

  /**
   * Get the number of boosts currently used.
   */
  public getBoostsUsed(): number {
    return this._data.boosts;
  }

  /**
   * Update the supporter level (e.g., upgrade/downgrade subscription).
   *
   * @param newLevel - New supporter tier
   * @throws {RealmError} If the new level is invalid according to SupporterLevelSchema
   */
  public updateLevel(newLevel: SupporterLevel): void {
    const result = SupporterLevelSchema.safeParse(newLevel);
    if (!result.success) {
      throw new RealmError("Invalid supporter level", { cause: result.error });
    }
    this._data.level = result.data;
  }

  /**
   * Allocate a server boost.
   * @throws {RealmError} If the resulting boost count exceeds schema limits
   */
  public allocateBoost(): void {
    const nextBoosts = this._data.boosts + 1;
    const result = BoostsSchema.safeParse(nextBoosts);
    if (!result.success) {
      throw new RealmError("Invalid boost count", { cause: result.error });
    }
    this._data.boosts = result.data;
  }

  /**
   * Deallocate a server boost.
   * @throws {RealmError} If there are no boosts to remove or the resulting count is invalid
   */
  public deallocateBoost(): void {
    const nextBoosts = this._data.boosts - 1;
    const result = BoostsSchema.safeParse(nextBoosts);
    if (!result.success) {
      throw new RealmError("Invalid boost count", { cause: result.error });
    }
    this._data.boosts = result.data;
  }

  /**
   * Check if the supporter has been supporting for a certain period.
   *
   * @param months - Number of months
   * @returns True if supporter has been active for at least this long
   */
  public hasSupportedForMonths(months: number): boolean {
    if (!this._data.firstSupported) return false;

    const now = new Date();
    const monthsDiff =
      (now.getTime() - this._data.firstSupported.getTime()) /
      (1000 * 60 * 60 * 24 * 30);

    return monthsDiff >= months;
  }

  /**
   * Get the character sheet limit for this supporter tier.
   */
  public getSheetLimit(): number {
    return SUPPORTER_SHEET_LIMITS[this._data.level];
  }

  /**
   * Get the tracker limit for this supporter tier.
   */
  public getTrackerLimit(): number {
    return SUPPORTER_TRACKER_LIMITS[this._data.level];
  }

  /**
   * Get the numeric level value for this supporter tier.
   * Useful for comparisons.
   */
  public getLevelValue(): number {
    return SUPPORTER_LEVEL_VALUES[this._data.level];
  }

  /**
   * Check if this supporter meets or exceeds a required tier.
   *
   * @param required - The required supporter tier
   * @returns True if this supporter's tier is >= required tier
   */
  public meetsRequirement(required: SupporterLevel): boolean {
    return this.getLevelValue() >= SUPPORTER_LEVEL_VALUES[required];
  }

  /**
   * Extract the Data from this entity.
   * Returns a copy to prevent external mutation.
   */
  public toData(): SupporterData {
    return { ...this._data };
  }
}

/**
 * Configuration object for a supporter tier.
 * Contains all limits and metadata for a tier.
 */
export interface SupporterTierConfig {
  readonly level: number;
  readonly name: SupporterLevel;
  readonly sheetLimit: number;
  readonly trackerLimit: number;
}

/**
 * Supporter tier configuration helper.
 * Provides convenient access to tier configurations and comparison logic.
 *
 * This composes the business rule constants into tier configuration objects
 * for easier consumption by application/presentation layers.
 */
export class SupporterTier {
  /** Base supporter tier (free tier). */
  public static readonly Base: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Base],
    name: SupporterLevel.Base,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Base],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Base],
  } as const;

  /** Mortal supporter tier. */
  public static readonly Mortal: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Mortal],
    name: SupporterLevel.Mortal,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Mortal],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Mortal],
  } as const;

  /** Fledgling supporter tier. */
  public static readonly Fledgling: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Fledgling],
    name: SupporterLevel.Fledgling,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Fledgling],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Fledgling],
  } as const;

  /** Neonate supporter tier. */
  public static readonly Neonate: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Neonate],
    name: SupporterLevel.Neonate,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Neonate],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Neonate],
  } as const;

  /** Ancilla supporter tier. */
  public static readonly Ancilla: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Ancilla],
    name: SupporterLevel.Ancilla,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Ancilla],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Ancilla],
  } as const;

  /** Elder supporter tier. */
  public static readonly Elder: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Elder],
    name: SupporterLevel.Elder,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Elder],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Elder],
  } as const;

  /** Methuselah supporter tier. */
  public static readonly Methuselah: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Methuselah],
    name: SupporterLevel.Methuselah,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Methuselah],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Methuselah],
  } as const;

  /** Antediluvian supporter tier (highest tier). */
  public static readonly Antediluvian: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterLevel.Antediluvian],
    name: SupporterLevel.Antediluvian,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterLevel.Antediluvian],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterLevel.Antediluvian],
  } as const;

  /**
   * Get a supporter tier configuration by numeric level.
   *
   * @param level - The numeric level to look up (0-7).
   * @returns The matching SupporterTierConfig.
   * @throws Error if the level is invalid.
   */
  public static getByLevel(level: number): SupporterTierConfig {
    switch (level) {
      case 0:
        return this.Base;
      case 1:
        return this.Mortal;
      case 2:
        return this.Fledgling;
      case 3:
        return this.Neonate;
      case 4:
        return this.Ancilla;
      case 5:
        return this.Elder;
      case 6:
        return this.Methuselah;
      case 7:
        return this.Antediluvian;
      default:
        throw new RealmError(`Invalid supporter level: ${level}`);
    }
  }

  /**
   * Get a supporter tier configuration by name.
   *
   * @param name - The SupporterLevel to look up.
   * @returns The matching SupporterTierConfig.
   * @throws Error if the name is invalid.
   */
  public static getByName(name: SupporterLevel): SupporterTierConfig {
    switch (name) {
      case SupporterLevel.Base:
        return this.Base;
      case SupporterLevel.Mortal:
        return this.Mortal;
      case SupporterLevel.Fledgling:
        return this.Fledgling;
      case SupporterLevel.Neonate:
        return this.Neonate;
      case SupporterLevel.Ancilla:
        return this.Ancilla;
      case SupporterLevel.Elder:
        return this.Elder;
      case SupporterLevel.Methuselah:
        return this.Methuselah;
      case SupporterLevel.Antediluvian:
        return this.Antediluvian;
      default:
        throw new RealmError(`Invalid supporter name`);
    }
  }

  /**
   * Check if the current supporter tier meets the required tier.
   *
   * @param requirement - The required supporter tier.
   * @param current - The current supporter tier.
   * @returns True if the current tier meets or exceeds the requirement.
   */
  public static meetsRequirement(
    requirement: SupporterTierConfig,
    current: SupporterTierConfig
  ): boolean {
    return current.level >= requirement.level;
  }

  /**
   * Get all supporter tier configurations as an array.
   *
   * @returns Array of all SupporterTierConfig objects, ordered by level.
   */
  public static getAllTiers(): readonly SupporterTierConfig[] {
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
