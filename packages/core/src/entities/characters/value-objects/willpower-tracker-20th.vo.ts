import type {
  IWillpowerTracker20th,
  WillpowerTracker20thData,
} from "@realm/common";
import { WillpowerTracker20thDataSchema, UserError } from "@realm/common";

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
 */
export class WillpowerTracker20th implements IWillpowerTracker20th {
  readonly total: number;
  readonly current: number;

  constructor(data: WillpowerTracker20thData) {
    // Validate with Zod schema
    const validated = WillpowerTracker20thDataSchema.parse(data);

    this.total = validated.total;
    this.current = validated.current;
  }

  spend(amount: number): IWillpowerTracker20th {
    if (amount < 0) {
      throw new UserError("Cannot spend negative willpower", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.current) {
      throw new UserError(
        `Insufficient willpower. Need ${amount}, have ${this.current}`,
        {
          fields: {
            amount: amount.toString(),
            current: this.current.toString(),
          },
        }
      );
    }

    return new WillpowerTracker20th({
      total: this.total,
      current: this.current - amount,
    });
  }

  restore(amount: number): IWillpowerTracker20th {
    if (amount < 0) {
      throw new UserError("Cannot restore negative willpower", {
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
      throw new UserError("Current willpower cannot be negative", {
        fields: { value: value.toString() },
      });
    }

    if (value > this.total) {
      throw new UserError("Current willpower cannot exceed total", {
        fields: { value: value.toString(), total: this.total.toString() },
      });
    }

    return new WillpowerTracker20th({
      total: this.total,
      current: value,
    });
  }

  setTotal(value: number): IWillpowerTracker20th {
    if (value < 1 || value > 10) {
      throw new UserError("Willpower total must be between 1 and 10", {
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
