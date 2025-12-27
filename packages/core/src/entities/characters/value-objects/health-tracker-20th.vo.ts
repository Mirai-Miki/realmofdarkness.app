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

  /**
   * Take damage of one or more types.
   *
   * Returns a new tracker with increased damage.
   * Damage fills health boxes from left to right, with aggravated taking priority.
   *
   * @param damage - Object with optional bashing, lethal, and/or aggravated damage amounts
   * @returns New tracker with increased damage
   * @throws {RealmError} If any damage amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 7, bashing: 1, lethal: 0, aggravated: 0 });
   * const hurt = tracker.takeDamage({ bashing: 2, lethal: 1 }); // { bashing: 3, lethal: 1 }
   * ```
   */
  public takeDamage(damage: {
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

  /**
   * Heal damage of one or more types.
   *
   * Returns a new tracker with reduced damage.
   *
   * @param damage - Object with optional bashing, lethal, and/or aggravated heal amounts
   * @returns New tracker with reduced damage (minimum 0 for each type)
   * @throws {RealmError} If any heal amount is negative
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 7, bashing: 3, lethal: 2, aggravated: 1 });
   * const healed = tracker.heal({ bashing: 2, lethal: 1 }); // { bashing: 1, lethal: 1, aggravated: 1 }
   * ```
   */
  public heal(damage: {
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

  /**
   * Set damage values directly.
   *
   * Returns a new tracker with updated damage values.
   * Omitted values remain unchanged.
   *
   * @param damage - Object with optional bashing, lethal, and/or aggravated damage
   * @returns New tracker with updated damage
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 7, bashing: 1, lethal: 1, aggravated: 0 });
   * const updated = tracker.setCurrent({ bashing: 3 }); // { bashing: 3, lethal: 1, aggravated: 0 }
   * ```
   */
  public setCurrent(damage: {
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

  /**
   * Set the total health level.
   *
   * Returns a new tracker with updated total.
   * If new total is less than current damage, damage is capped.
   *
   * @param value - New total health level (must be 7-15)
   * @returns New tracker with updated total
   * @throws {RealmError} If value is outside valid range (7-15)
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 10, bashing: 5, lethal: 2, aggravated: 0 });
   * const smaller = tracker.setTotal(7); // Damage capped to fit in 7 boxes
   * ```
   */
  public setTotal(value: number): IHealthTracker20th {
    if (value < 7 || value > 15) {
      throw new RealmError(
        "Internal error: health total must be between 7 and 15",
        {
          fields: { total: value.toString() },
        }
      );
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

  /**
   * Increase total health level.
   *
   * Returns a new tracker with total increased by amount.
   *
   * @param amount - Amount to add to total (result must be 7-15)
   * @returns New tracker with increased total
   * @throws {RealmError} If resulting total is outside valid range
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 7, bashing: 0, lethal: 0, aggravated: 0 });
   * const fortitude = tracker.addTotal(2); // { total: 9 }
   * ```
   */
  public addTotal(amount: number): IHealthTracker20th {
    return this.setTotal(this.total + amount);
  }

  /**
   * Decrease total health level.
   *
   * Returns a new tracker with total decreased by amount.
   * Any damage exceeding new total is capped.
   *
   * @param amount - Amount to remove from total (result must be 7-15)
   * @returns New tracker with decreased total
   * @throws {RealmError} If resulting total is outside valid range
   *
   * @example
   * ```typescript
   * const tracker = new HealthTracker20th({ total: 10, bashing: 2, lethal: 0, aggravated: 0 });
   * const aged = tracker.removeTotal(3); // { total: 7 }
   * ```
   */
  public removeTotal(amount: number): IHealthTracker20th {
    return this.setTotal(this.total - amount);
  }
}
