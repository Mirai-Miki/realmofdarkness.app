import type { IHealthTracker20th, HealthTracker20thData } from "@realm/common";
import { RealmError } from "@realm/common";

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
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class HealthTracker20th implements IHealthTracker20th {
  readonly total: number;
  readonly bashing: number;
  readonly lethal: number;
  readonly aggravated: number;

  constructor(data: HealthTracker20thData) {
    // Trust the data - already validated at boundary
    this.total = data.total;
    this.bashing = data.bashing ?? 0;
    this.lethal = data.lethal ?? 0;
    this.aggravated = data.aggravated ?? 0;
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
      throw new RealmError("Attempted to take negative damage", {
        fields: {
          bashing: bashingDamage.toString(),
          lethal: lethalDamage.toString(),
          aggravated: aggravatedDamage.toString(),
        },
      });
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
      throw new RealmError("Attempted to heal negative damage", {
        fields: {
          bashing: bashingHeal.toString(),
          lethal: lethalHeal.toString(),
          aggravated: aggravatedHeal.toString(),
        },
      });
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
      throw new RealmError("Internal error: health total must be between 7 and 15", {
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
