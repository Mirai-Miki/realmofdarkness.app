import type {
  IWillpowerTracker20th,
  WillpowerTracker20thData,
} from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * 20th Anniversary willpower tracker value object.
 * Tracks current and total willpower.
 *
 * @remarks
 * Immutable - all operations return new instances.
 *
 * Willpower represents mental fortitude and is spent to:
 * - Resist mind control
 * - Resist frenzy
 * - Gain automatic successes
 * - Push through fear
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class WillpowerTracker20th implements IWillpowerTracker20th {
  readonly total: number;
  readonly current: number;

  constructor(data: WillpowerTracker20thData) {
    // Trust the data - already validated at boundary
    this.total = data.total;
    this.current = data.current;
  }

  /**
   * Spend willpower points.
   *
   * Returns a new tracker with reduced current willpower.
   * Total willpower remains unchanged.
   *
   * @param amount - Number of willpower points to spend (must be >= 0)
   * @returns New tracker with current reduced by amount
   * @throws {RealmError} If amount is negative or exceeds current willpower
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 8, current: 6 });
   * const spent = wp.spend(2); // { total: 8, current: 4 }
   * ```
   */
  public spend(amount: number): IWillpowerTracker20th {
    if (amount < 0) {
      throw new RealmError("Attempted to spend negative willpower", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.current) {
      throw new RealmError("Attempted to spend more willpower than available", {
        fields: {
          amount: amount.toString(),
          current: this.current.toString(),
        },
      });
    }

    return new WillpowerTracker20th({
      total: this.total,
      current: this.current - amount,
    });
  }

  /**
   * Restore willpower points.
   *
   * Returns a new tracker with increased current willpower.
   * Current cannot exceed total.
   *
   * @param amount - Number of willpower points to restore (must be >= 0)
   * @returns New tracker with current increased by amount (capped at total)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 8, current: 3 });
   * const rested = wp.restore(3); // { total: 8, current: 6 }
   * const full = wp.restore(10); // { total: 8, current: 8 } - capped
   * ```
   */
  public restore(amount: number): IWillpowerTracker20th {
    if (amount < 0) {
      throw new RealmError("Attempted to restore negative willpower", {
        fields: { amount: amount.toString() },
      });
    }

    return new WillpowerTracker20th({
      total: this.total,
      current: Math.min(this.total, this.current + amount),
    });
  }

  /**
   * Set current willpower to a specific value.
   *
   * Returns a new tracker with updated current willpower.
   *
   * @param value - New current willpower value (0 <= value <= total)
   * @returns New tracker with updated current
   * @throws {RealmError} If value is negative or exceeds total
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 8, current: 3 });
   * const set = wp.setCurrent(5); // { total: 8, current: 5 }
   * ```
   */
  public setCurrent(value: number): IWillpowerTracker20th {
    if (value < 0) {
      throw new RealmError("Attempted to set negative current willpower", {
        fields: { value: value.toString() },
      });
    }

    if (value > this.total) {
      throw new RealmError(
        "Attempted to set current willpower exceeding total",
        {
          fields: { value: value.toString(), total: this.total.toString() },
        }
      );
    }

    return new WillpowerTracker20th({
      total: this.total,
      current: value,
    });
  }

  /**
   * Set total willpower rating.
   *
   * Returns a new tracker with updated total.
   * If new total is less than current, current is capped.
   *
   * @param value - New total willpower rating (1-10)
   * @returns New tracker with updated total
   * @throws {RealmError} If value is outside valid range (1-10)
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 6, current: 4 });
   * const increased = wp.setTotal(8); // { total: 8, current: 4 }
   * const decreased = wp.setTotal(3); // { total: 3, current: 3 } - current capped
   * ```
   */
  public setTotal(value: number): IWillpowerTracker20th {
    if (value < 1 || value > 10) {
      throw new RealmError("Willpower total must be between 1 and 10", {
        fields: { value: value.toString() },
      });
    }

    return new WillpowerTracker20th({
      total: value,
      current: Math.min(this.current, value),
    });
  }

  /**
   * Increase total willpower rating.
   *
   * Returns a new tracker with total increased by amount.
   *
   * @param amount - Amount to add to total (result must be 1-10)
   * @returns New tracker with increased total
   * @throws {RealmError} If resulting total is outside valid range
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 6, current: 4 });
   * const improved = wp.addTotal(2); // { total: 8, current: 4 }
   * ```
   */
  public addTotal(amount: number): IWillpowerTracker20th {
    return this.setTotal(this.total + amount);
  }

  /**
   * Decrease total willpower rating.
   *
   * Returns a new tracker with total decreased by amount.
   * If new total is less than current, current is capped.
   *
   * @param amount - Amount to remove from total (result must be 1-10)
   * @returns New tracker with decreased total
   * @throws {RealmError} If resulting total is outside valid range
   *
   * @example
   * ```typescript
   * const wp = new WillpowerTracker20th({ total: 8, current: 6 });
   * const damaged = wp.removeTotal(2); // { total: 6, current: 6 }
   * ```
   */
  public removeTotal(amount: number): IWillpowerTracker20th {
    return this.setTotal(this.total - amount);
  }
}
