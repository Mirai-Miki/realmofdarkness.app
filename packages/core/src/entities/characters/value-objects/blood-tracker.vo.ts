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
