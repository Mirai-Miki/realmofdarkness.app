import type { IBloodTracker, BloodTrackerData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Vampire 20th Anniversary blood pool tracker value object.
 * Tracks current and maximum blood points.
 *
 * @remarks
 * Immutable - all operations return new instances.
 *
 * Blood Pool represents:
 * - Current: Blood points available to spend
 * - Total: Maximum blood capacity (determined by generation)
 *
 * Blood is spent to:
 * - Heal wounds
 * - Increase physical attributes
 * - Power disciplines
 * - Stay awake during the day
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class BloodTracker implements IBloodTracker {
  readonly current: number;
  readonly total: number;

  constructor(data: BloodTrackerData) {
    // Trust the data - already validated at boundary
    this.current = data.current;
    this.total = data.total;
  }

  /**
   * Spend blood points from the pool.
   *
   * Returns a new BloodTracker instance with reduced current blood.
   * Total blood capacity remains unchanged.
   *
   * @param amount - Number of blood points to spend (must be >= 0)
   * @returns New BloodTracker with current reduced by amount
   * @throws {RealmError} If amount is negative or exceeds current blood
   *
   * @example
   * ```typescript
   * const blood = new BloodTracker({ current: 10, total: 15 });
   * const newBlood = blood.spend(3); // { current: 7, total: 15 }
   * ```
   */
  spend(amount: number): IBloodTracker {
    if (amount < 0) {
      throw new RealmError("Attempted to spend negative blood", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.current) {
      throw new RealmError("Attempted to spend more blood than available", {
        fields: {
          amount: amount.toString(),
          current: this.current.toString(),
        },
      });
    }

    return new BloodTracker({
      current: this.current - amount,
      total: this.total,
    });
  }

  /**
   * Restore blood points by feeding.
   *
   * Returns a new BloodTracker instance with increased current blood.
   * Current blood cannot exceed total capacity.
   *
   * @param amount - Number of blood points to restore (must be >= 0)
   * @returns New BloodTracker with current increased by amount (capped at total)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const blood = new BloodTracker({ current: 5, total: 15 });
   * const fed = blood.slake(8); // { current: 13, total: 15 }
   * const overfed = blood.slake(20); // { current: 15, total: 15 } - capped
   * ```
   */
  slake(amount: number): IBloodTracker {
    if (amount < 0) {
      throw new RealmError("Attempted to slake negative blood", {
        fields: { amount: amount.toString() },
      });
    }

    return new BloodTracker({
      current: Math.min(this.total, this.current + amount),
      total: this.total,
    });
  }

  /**
   * Set current blood pool to a specific value.
   *
   * Returns a new BloodTracker instance with updated current blood.
   *
   * @param amount - New current blood value (0 <= amount <= total)
   * @returns New BloodTracker with updated current
   * @throws {RealmError} If amount is negative or exceeds total
   *
   * @example
   * ```typescript
   * const blood = new BloodTracker({ current: 5, total: 15 });
   * const updated = blood.setCurrent(10); // { current: 10, total: 15 }
   * ```
   */
  setCurrent(amount: number): IBloodTracker {
    if (amount < 0) {
      throw new RealmError("Attempted to set negative current blood", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.total) {
      throw new RealmError("Attempted to set current blood exceeding total", {
        fields: { amount: amount.toString(), total: this.total.toString() },
      });
    }

    return new BloodTracker({
      current: amount,
      total: this.total,
    });
  }

  /**
   * Set the maximum blood pool capacity.
   *
   * Returns a new BloodTracker instance with updated total.
   * If new total is less than current, current is capped to new total.
   *
   * @param amount - New blood pool capacity (1-50)
   * @returns New BloodTracker with updated total
   * @throws {RealmError} If amount is outside valid range (1-50)
   *
   * @example
   * ```typescript
   * const blood = new BloodTracker({ current: 10, total: 15 });
   * const increased = blood.setMax(20); // { current: 10, total: 20 }
   * const decreased = blood.setMax(8); // { current: 8, total: 8 } - current capped
   * ```
   */
  setMax(amount: number): IBloodTracker {
    if (amount < 1 || amount > 50) {
      throw new RealmError("Blood pool total must be between 1 and 50", {
        fields: { amount: amount.toString() },
      });
    }

    return new BloodTracker({
      current: Math.min(this.current, amount),
      total: amount,
    });
  }
}
