import type { IDamageTracker5th, DamageTracker5thData } from "@realm/common";
import { DamageTracker5thDataSchema, UserError } from "@realm/common";

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
 */
export class DamageTracker5th implements IDamageTracker5th {
  readonly total: number;
  readonly superficial: number;
  readonly aggravated: number;

  constructor(data: DamageTracker5thData) {
    // Validate with Zod schema
    const validated = DamageTracker5thDataSchema.parse(data);

    this.total = validated.total;
    this.superficial = validated.superficial ?? 0;
    this.aggravated = validated.aggravated ?? 0;
  }

  totalDamage(): number {
    return this.superficial + this.aggravated;
  }

  isImpaired(): boolean {
    return this.totalDamage() === this.total;
  }

  isUndamaged(): boolean {
    return this.totalDamage() === 0;
  }

  isIncapacitated(): boolean {
    return this.aggravated === this.total;
  }

  takeSuperficial(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new UserError("Cannot take negative damage", {
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

  takeAggravated(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new UserError("Cannot take negative damage", {
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

  healSuperficial(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new UserError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    return new DamageTracker5th({
      total: this.total,
      superficial: Math.max(0, this.superficial - amount),
      aggravated: this.aggravated,
    });
  }

  healAggravated(amount: number): IDamageTracker5th {
    if (amount < 0) {
      throw new UserError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    return new DamageTracker5th({
      total: this.total,
      superficial: this.superficial,
      aggravated: Math.max(0, this.aggravated - amount),
    });
  }

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

  setTotal(total: number): IDamageTracker5th {
    if (total < 0) {
      throw new UserError("Total boxes cannot be negative", {
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
