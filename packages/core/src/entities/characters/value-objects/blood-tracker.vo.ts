import type { IBloodTracker, BloodTrackerData } from "@realm/common";
import { BloodTrackerDataSchema, UserError } from "@realm/common";

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
 */
export class BloodTracker implements IBloodTracker {
  readonly current: number;
  readonly total: number;

  constructor(data: BloodTrackerData) {
    // Validate with Zod schema
    const validated = BloodTrackerDataSchema.parse(data);

    this.current = validated.current;
    this.total = validated.total;
  }

  spend(amount: number): IBloodTracker {
    if (amount < 0) {
      throw new UserError("Cannot spend negative blood", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.current) {
      throw new UserError(
        `Insufficient blood. Need ${amount}, have ${this.current}`,
        {
          fields: {
            amount: amount.toString(),
            current: this.current.toString(),
          },
        }
      );
    }

    return new BloodTracker({
      current: this.current - amount,
      total: this.total,
    });
  }

  slake(amount: number): IBloodTracker {
    if (amount < 0) {
      throw new UserError("Cannot slake negative blood", {
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
      throw new UserError("Current blood cannot be negative", {
        fields: { amount: amount.toString() },
      });
    }

    if (amount > this.total) {
      throw new UserError("Current blood cannot exceed total", {
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
      throw new UserError("Blood pool total must be between 1 and 50", {
        fields: { amount: amount.toString() },
      });
    }

    return new BloodTracker({
      current: Math.min(this.current, amount),
      total: amount,
    });
  }
}
