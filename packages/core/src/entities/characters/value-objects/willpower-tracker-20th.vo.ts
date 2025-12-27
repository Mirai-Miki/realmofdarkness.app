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

  spend(amount: number): IWillpowerTracker20th {
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

  restore(amount: number): IWillpowerTracker20th {
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

  setCurrent(value: number): IWillpowerTracker20th {
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

  setTotal(value: number): IWillpowerTracker20th {
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

  addTotal(amount: number): IWillpowerTracker20th {
    return this.setTotal(this.total + amount);
  }

  removeTotal(amount: number): IWillpowerTracker20th {
    return this.setTotal(this.total - amount);
  }
}
