import type { IHealthTracker20th, HealthTracker20thData } from "@realm/common";
import { HealthTracker20thDataSchema, UserError } from "@realm/common";

/**
 * 20th Anniversary health tracker value object.
 * Tracks bashing, lethal, and aggravated damage.
 *
 * @remarks
 * Immutable - all operations return new instances.
 *
 * 20th Anniversary Damage Rules:
 * - Bashing damage: Non-lethal (fists, blunt trauma)
 * - Lethal damage: Mortal wounds (swords, bullets)
 * - Aggravated damage: Supernatural harm (fire, sunlight, vampire claws)
 * - Damage fills left to right, aggravated converts lethal to aggravated
 */
export class HealthTracker20th implements IHealthTracker20th {
  readonly total: number;
  readonly bashing: number;
  readonly lethal: number;
  readonly aggravated: number;

  constructor(data: HealthTracker20thData) {
    // Validate with Zod schema
    const validated = HealthTracker20thDataSchema.parse(data);

    this.total = validated.total;
    this.bashing = validated.bashing ?? 0;
    this.lethal = validated.lethal ?? 0;
    this.aggravated = validated.aggravated ?? 0;
  }

  takeDamage(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th {
    const bashingDamage = damage.bashing ?? 0;
    const lethalDamage = damage.lethal ?? 0;
    const aggravatedDamage = damage.aggravated ?? 0;

    if (bashingDamage < 0 || lethalDamage < 0 || aggravatedDamage < 0) {
      throw new UserError("Cannot take negative damage");
    }

    const newBashing = Math.min(
      this.total -
        (this.lethal + lethalDamage) -
        (this.aggravated + aggravatedDamage),
      this.bashing + bashingDamage
    );

    const newLethal = Math.min(
      this.total - (this.aggravated + aggravatedDamage),
      this.lethal + lethalDamage
    );

    const newAggravated = Math.min(
      this.total,
      this.aggravated + aggravatedDamage
    );

    return new HealthTracker20th({
      total: this.total,
      bashing: Math.max(0, newBashing),
      lethal: Math.max(0, newLethal),
      aggravated: newAggravated,
    });
  }

  heal(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th {
    const bashingHeal = damage.bashing ?? 0;
    const lethalHeal = damage.lethal ?? 0;
    const aggravatedHeal = damage.aggravated ?? 0;

    if (bashingHeal < 0 || lethalHeal < 0 || aggravatedHeal < 0) {
      throw new UserError("Cannot heal negative damage");
    }

    return new HealthTracker20th({
      total: this.total,
      bashing: Math.max(0, this.bashing - bashingHeal),
      lethal: Math.max(0, this.lethal - lethalHeal),
      aggravated: Math.max(0, this.aggravated - aggravatedHeal),
    });
  }

  setCurrent(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th {
    return new HealthTracker20th({
      total: this.total,
      bashing: damage.bashing ?? this.bashing,
      lethal: damage.lethal ?? this.lethal,
      aggravated: damage.aggravated ?? this.aggravated,
    });
  }

  setTotal(value: number): IHealthTracker20th {
    if (value < 7 || value > 15) {
      throw new UserError("Health total must be between 7 and 15", {
        fields: { total: value.toString() },
      });
    }

    // Adjust damage if new total is smaller
    const maxDamage = value;
    const newAggravated = Math.min(this.aggravated, maxDamage);
    const newLethal = Math.min(this.lethal, maxDamage - newAggravated);
    const newBashing = Math.min(
      this.bashing,
      maxDamage - newAggravated - newLethal
    );

    return new HealthTracker20th({
      total: value,
      bashing: newBashing,
      lethal: newLethal,
      aggravated: newAggravated,
    });
  }

  addTotal(amount: number): IHealthTracker20th {
    return this.setTotal(this.total + amount);
  }

  removeTotal(amount: number): IHealthTracker20th {
    return this.setTotal(this.total - amount);
  }
}
