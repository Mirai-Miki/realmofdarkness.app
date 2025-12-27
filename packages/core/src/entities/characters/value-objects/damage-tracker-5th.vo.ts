import type { IDamageTracker5th, DamageTracker5thData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * 5th Edition damage tracker value object.
 * Tracks superficial and aggravated damage.
 *
 * @remarks
 * Immutable - all operations return new instances.
 *
 * 5th Edition Damage Rules:
 * - Total boxes represent maximum damage capacity
 * - Superficial damage fills from left to right
 * - Aggravated damage fills from right to left
 * - When superficial + aggravated = total, character is impaired
 * - When aggravated = total, character is incapacitated
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class DamageTracker5th implements IDamageTracker5th {
  readonly total: number;
  readonly superficial: number;
  readonly aggravated: number;

  constructor(data: DamageTracker5thData) {
    // Trust the data - already validated at boundary
    this.total = data.total;
    this.superficial = data.superficial ?? 0;
    this.aggravated = data.aggravated ?? 0;
  }

  /**
   * Calculate total damage taken (superficial + aggravated).
   *
   * @returns Sum of superficial and aggravated damage
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 3, aggravated: 2 });
   * tracker.totalDamage(); // Returns 5
   * ```
   */
  totalDamage(): number {
    return this.superficial + this.aggravated;
  }

  /**
   * Check if character is impaired (all damage boxes filled).
   *
   * In V5, when total damage equals total boxes, the character is impaired.
   *
   * @returns True if total damage equals total boxes
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 5, superficial: 3, aggravated: 2 });
   * tracker.isImpaired(); // Returns true (3 + 2 = 5)
   * ```
   */
  isImpaired(): boolean {
    return this.totalDamage() === this.total;
  }

  /**
   * Check if character has taken no damage.
   *
   * @returns True if both superficial and aggravated damage are 0
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 0, aggravated: 0 });
   * tracker.isUndamaged(); // Returns true
   * ```
   */
  isUndamaged(): boolean {
    return this.totalDamage() === 0;
  }

  /**
   * Check if character is incapacitated (all boxes filled with aggravated).
   *
   * In V5, when aggravated damage equals total boxes, character is incapacitated.
   *
   * @returns True if aggravated damage equals total boxes
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 5, superficial: 0, aggravated: 5 });
   * tracker.isIncapacitated(); // Returns true
   * ```
   */
  isIncapacitated(): boolean {
    return this.aggravated === this.total;
  }

  /**
   * Take superficial damage.
   *
   * Returns a new tracker with increased superficial damage.
   * Superficial damage cannot exceed available boxes (total - aggravated).
   *
   * @param amount - Amount of superficial damage to take (must be >= 0)
   * @returns New tracker with increased superficial damage
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 2, aggravated: 1 });
   * const damaged = tracker.takeSuperficial(3); // { superficial: 5, aggravated: 1 }
   * ```
   */
  takeSuperficial(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Attempted to take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const newSuperficial = Math.min(
      this.total - this.aggravated,
      this.superficial + amount
    );

    return new DamageTracker5th({
      total: this.total,
      superficial: newSuperficial,
      aggravated: this.aggravated,
    });
  }

  /**
   * Take aggravated damage.
   *
   * Returns a new tracker with increased aggravated damage.
   * Aggravated damage pushes out superficial damage if needed.
   *
   * @param amount - Amount of aggravated damage to take (must be >= 0)
   * @returns New tracker with increased aggravated damage
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 5, superficial: 3, aggravated: 0 });
   * const agg = tracker.takeAggravated(2); // { superficial: 3, aggravated: 2 }
   * const more = agg.takeAggravated(2); // { superficial: 1, aggravated: 4 } - pushes out superficial
   * ```
   */
  takeAggravated(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Attempted to take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const newAggravated = Math.min(this.total, this.aggravated + amount);

    // Aggravated damage pushes out superficial
    const maxSuperficial = this.total - newAggravated;
    const newSuperficial = Math.min(this.superficial, maxSuperficial);

    return new DamageTracker5th({
      total: this.total,
      superficial: newSuperficial,
      aggravated: newAggravated,
    });
  }

  /**
   * Heal superficial damage.
   *
   * Returns a new tracker with reduced superficial damage.
   *
   * @param amount - Amount of superficial damage to heal (must be >= 0)
   * @returns New tracker with reduced superficial damage (minimum 0)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 5, aggravated: 2 });
   * const healed = tracker.healSuperficial(3); // { superficial: 2, aggravated: 2 }
   * ```
   */
  healSuperficial(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Attempted to heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    return new DamageTracker5th({
      total: this.total,
      superficial: Math.max(0, this.superficial - amount),
      aggravated: this.aggravated,
    });
  }

  /**
   * Heal aggravated damage.
   *
   * Returns a new tracker with reduced aggravated damage.
   *
   * @param amount - Amount of aggravated damage to heal (must be >= 0)
   * @returns New tracker with reduced aggravated damage (minimum 0)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 3, aggravated: 4 });
   * const healed = tracker.healAggravated(2); // { superficial: 3, aggravated: 2 }
   * ```
   */
  healAggravated(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Attempted to heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    return new DamageTracker5th({
      total: this.total,
      superficial: this.superficial,
      aggravated: Math.max(0, this.aggravated - amount),
    });
  }

  /**
   * Set damage values directly.
   *
   * Returns a new tracker with updated damage values.
   * Omitted values remain unchanged.
   *
   * @param damage - Object with optional superficial and/or aggravated damage
   * @returns New tracker with updated damage
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 3, aggravated: 2 });
   * const updated = tracker.setDamage({ superficial: 5 }); // { superficial: 5, aggravated: 2 }
   * const both = tracker.setDamage({ superficial: 1, aggravated: 3 }); // { superficial: 1, aggravated: 3 }
   * ```
   */
  setDamage(damage: {
    superficial?: number;
    aggravated?: number;
  }): IDamageTracker5th {
    return new DamageTracker5th({
      total: this.total,
      superficial: damage.superficial ?? this.superficial,
      aggravated: damage.aggravated ?? this.aggravated,
    });
  }

  /**
   * Set the total number of damage boxes.
   *
   * Returns a new tracker with updated total.
   * If new total is less than current damage, damage is capped.
   *
   * @param total - New total damage capacity (must be >= 0)
   * @returns New tracker with updated total
   * @throws {RealmError} If total is negative
   *
   * @example
   * ```typescript
   * const tracker = new DamageTracker5th({ total: 10, superficial: 8, aggravated: 0 });
   * const smaller = tracker.setTotal(5); // { total: 5, superficial: 5, aggravated: 0 } - damage capped
   * ```
   */
  setTotal(total: number): IDamageTracker5th {
    if (total < 0) {
      throw new RealmError("Internal error: total boxes cannot be negative", {
        fields: { total: total.toString() },
      });
    }

    // Adjust damage if new total is smaller
    const newSuperficial = Math.min(this.superficial, total);
    const newAggravated = Math.min(this.aggravated, total);

    return new DamageTracker5th({
      total,
      superficial: newSuperficial,
      aggravated: newAggravated,
    });
  }
}
