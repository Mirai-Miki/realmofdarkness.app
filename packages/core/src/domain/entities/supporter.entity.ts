import { RealmError } from "@realm/errors";
import { SupporterName } from "types";

/**
 * Character sheet limits per supporter tier.
 * These are business rules that determine feature access.
 */
export const SUPPORTER_SHEET_LIMITS: Record<SupporterName, number> = {
  [SupporterName.Base]: 2,
  [SupporterName.Mortal]: 4,
  [SupporterName.Fledgling]: 8,
  [SupporterName.Neonate]: 30,
  [SupporterName.Ancilla]: 60,
  [SupporterName.Elder]: 150,
  [SupporterName.Methuselah]: 300,
  [SupporterName.Antediluvian]: 500,
} as const;

/**
 * Tracker limits per supporter tier.
 * These are business rules that determine feature access.
 */
export const SUPPORTER_TRACKER_LIMITS: Record<SupporterName, number> = {
  [SupporterName.Base]: 50,
  [SupporterName.Mortal]: 75,
  [SupporterName.Fledgling]: 100,
  [SupporterName.Neonate]: 150,
  [SupporterName.Ancilla]: 200,
  [SupporterName.Elder]: 300,
  [SupporterName.Methuselah]: 500,
  [SupporterName.Antediluvian]: 1000,
} as const;

/**
 * Numeric level values for supporter tiers.
 * Used for comparison and ordering.
 */
export const SUPPORTER_LEVEL_VALUES: Record<SupporterName, number> = {
  [SupporterName.Base]: 0,
  [SupporterName.Mortal]: 1,
  [SupporterName.Fledgling]: 2,
  [SupporterName.Neonate]: 3,
  [SupporterName.Ancilla]: 4,
  [SupporterName.Elder]: 5,
  [SupporterName.Methuselah]: 6,
  [SupporterName.Antediluvian]: 7,
} as const;

export interface SupporterProps {
  userId: string;
  level: SupporterName;
  totalBoosts: number;
  firstSupported: Date | null;
  lastSupported: Date | null;
}

/**
 * Domain entity representing a Supporter subscription.
 *
 * Handles subscription level, boost allocation, and billing concerns.
 * This is separate from User to maintain single responsibility.
 *
 * @example
 * ```typescript
 * const supporter = new Supporter({
 *   userId: "123456789012345678",
 *   level: SupporterName.Patron,
 *   totalBoosts: 2,
 *   firstSupported: new Date(),
 *   lastSupported: new Date(),
 * });
 *
 * if (supporter.hasAvailableBoosts()) {
 *   // User can boost a server
 * }
 * ```
 */
export class Supporter {
  public readonly userId: string;
  public level: SupporterName;
  public totalBoosts: number;
  public firstSupported: Date | null;
  public lastSupported: Date | null;

  constructor(props: SupporterProps) {
    this.userId = props.userId;
    this.level = props.level;
    this.totalBoosts = props.totalBoosts;
    this.firstSupported = props.firstSupported;
    this.lastSupported = props.lastSupported;
  }

  /**
   * Check if the user is an active supporter (not Base tier).
   */
  public isActive(): boolean {
    return this.level !== SupporterName.Base;
  }

  /**
   * Get the supporter's tier level.
   */
  public getLevel(): SupporterName {
    return this.level;
  }

  /**
   * Check if the supporter has available boosts to allocate.
   */
  public hasAvailableBoosts(): boolean {
    return this.totalBoosts > 0;
  }

  /**
   * Get the number of available boosts.
   */
  public getAvailableBoosts(): number {
    return this.totalBoosts;
  }

  /**
   * Update the supporter level (e.g., upgrade/downgrade subscription).
   *
   * @param newLevel - New supporter tier
   * @param newBoostAllocation - Total boosts for the new tier
   */
  public updateLevel(
    newLevel: SupporterName,
    newBoostAllocation: number
  ): void {
    this.level = newLevel;
    this.totalBoosts = newBoostAllocation;
    this.lastSupported = new Date();
  }

  /**
   * Check if the supporter has been supporting for a certain period.
   *
   * @param months - Number of months
   * @returns True if supporter has been active for at least this long
   */
  public hasSupportedForMonths(months: number): boolean {
    if (!this.firstSupported) return false;

    const now = new Date();
    const monthsDiff =
      (now.getTime() - this.firstSupported.getTime()) /
      (1000 * 60 * 60 * 24 * 30);

    return monthsDiff >= months;
  }

  /**
   * Check if the subscription is expired (no support in last 35 days).
   * Assumes monthly billing with 5-day grace period.
   */
  public isExpired(): boolean {
    if (!this.lastSupported) return true;

    const now = new Date();
    const daysSinceLastSupport =
      (now.getTime() - this.lastSupported.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastSupport > 35;
  }

  /**
   * Get the character sheet limit for this supporter tier.
   */
  public getSheetLimit(): number {
    return SUPPORTER_SHEET_LIMITS[this.level];
  }

  /**
   * Get the tracker limit for this supporter tier.
   */
  public getTrackerLimit(): number {
    return SUPPORTER_TRACKER_LIMITS[this.level];
  }

  /**
   * Get the numeric level value for this supporter tier.
   * Useful for comparisons.
   */
  public getLevelValue(): number {
    return SUPPORTER_LEVEL_VALUES[this.level];
  }

  /**
   * Check if this supporter meets or exceeds a required tier.
   *
   * @param required - The required supporter tier
   * @returns True if this supporter's tier is >= required tier
   */
  public meetsRequirement(required: SupporterName): boolean {
    return this.getLevelValue() >= SUPPORTER_LEVEL_VALUES[required];
  }
}

/**
 * Configuration object for a supporter tier.
 * Contains all limits and metadata for a tier.
 */
export interface SupporterTierConfig {
  readonly level: number;
  readonly name: SupporterName;
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
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Base],
    name: SupporterName.Base,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Base],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Base],
  } as const;

  /** Mortal supporter tier. */
  public static readonly Mortal: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Mortal],
    name: SupporterName.Mortal,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Mortal],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Mortal],
  } as const;

  /** Fledgling supporter tier. */
  public static readonly Fledgling: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Fledgling],
    name: SupporterName.Fledgling,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Fledgling],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Fledgling],
  } as const;

  /** Neonate supporter tier. */
  public static readonly Neonate: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Neonate],
    name: SupporterName.Neonate,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Neonate],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Neonate],
  } as const;

  /** Ancilla supporter tier. */
  public static readonly Ancilla: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Ancilla],
    name: SupporterName.Ancilla,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Ancilla],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Ancilla],
  } as const;

  /** Elder supporter tier. */
  public static readonly Elder: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Elder],
    name: SupporterName.Elder,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Elder],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Elder],
  } as const;

  /** Methuselah supporter tier. */
  public static readonly Methuselah: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Methuselah],
    name: SupporterName.Methuselah,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Methuselah],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Methuselah],
  } as const;

  /** Antediluvian supporter tier (highest tier). */
  public static readonly Antediluvian: SupporterTierConfig = {
    level: SUPPORTER_LEVEL_VALUES[SupporterName.Antediluvian],
    name: SupporterName.Antediluvian,
    sheetLimit: SUPPORTER_SHEET_LIMITS[SupporterName.Antediluvian],
    trackerLimit: SUPPORTER_TRACKER_LIMITS[SupporterName.Antediluvian],
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
   * @param name - The SupporterName to look up.
   * @returns The matching SupporterTierConfig.
   * @throws Error if the name is invalid.
   */
  public static getByName(name: SupporterName): SupporterTierConfig {
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
