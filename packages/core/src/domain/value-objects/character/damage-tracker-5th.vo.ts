import { RealmError } from "@realm/errors";

/**
 * Value Object representing a damage tracker for 5th edition characters.
 * Tracks total boxes and superficial/aggravated damage.
 *
 * @remarks
 * This is an immutable value object - all modifications return a new instance.
 * Superficial damage is tracked separately from aggravated damage.
 * When superficial damage fills the track, it converts to aggravated.
 *
 * @example
 * ```typescript
 * const tracker = new DamageTracker5th(7, 0, 0); // 7 health, no damage
 * const damaged = tracker.takeSuperficial(3); // 3 superficial damage
 * const moreDamaged = damaged.takeAggravated(2); // 2 aggravated damage
 * console.log(moreDamaged.current); // 2 (7 - 3 - 2)
 * ```
 */
export class DamageTracker5th {
  /**
   * Creates a new DamageTracker5th instance.
   *
   * @param total - Total number of boxes (1-15)
   * @param superficial - Superficial damage (0 to total)
   * @param aggravated - Aggravated damage (0 to total)
   * @throws {RealmError} If values are invalid
   */
  constructor(
    public readonly total: number,
    public readonly superficial: number,
    public readonly aggravated: number
  ) {
    this.validate();
  }

  /**
   * Validates tracker values.
   *
   * @throws {RealmError} If values are invalid
   * @private
   */
  private validate(): void {
    if (this.total < 0) {
      throw new RealmError("Tracker total cannot be negative", {
        fields: { total: this.total.toString() },
      });
    }

    if (this.superficial < 0 || this.aggravated < 0) {
      throw new RealmError("Damage cannot be negative", {
        fields: {
          superficial: this.superficial.toString(),
          aggravated: this.aggravated.toString(),
        },
      });
    }

    if (this.superficial + this.aggravated > this.total) {
      throw new RealmError("Total damage cannot exceed tracker total", {
        fields: {
          total: this.total.toString(),
          superficial: this.superficial.toString(),
          aggravated: this.aggravated.toString(),
        },
      });
    }
  }

  /**
   * Gets the current remaining boxes.
   *
   * @returns Number of undamaged boxes
   */
  public get current(): number {
    return this.total - this.superficial - this.aggravated;
  }

  /**
   * Checks if tracker is at maximum (all boxes damaged).
   *
   * @returns True if no boxes remaining
   */
  public get isImpaired(): boolean {
    return this.current === 0;
  }

  /**
   * Checks if tracker has no damage.
   *
   * @returns True if no damage taken
   */
  public get isUndamaged(): boolean {
    return this.superficial === 0 && this.aggravated === 0;
  }

  /**
   * Creates a new tracker with modified total.
   * Adjusts damage if it exceeds new total.
   *
   * @param newTotal - New total boxes (1-15)
   * @returns New tracker instance
   */
  public setTotal(newTotal: number): DamageTracker5th {
    if (newTotal < 0) {
      throw new RealmError("Tracker total cannot be negative", {
        fields: { newTotal: newTotal.toString() },
      });
    }

    const totalDamage = this.superficial + this.aggravated;
    if (totalDamage <= newTotal) {
      return new DamageTracker5th(newTotal, this.superficial, this.aggravated);
    }

    // Damage exceeds new total - prioritize keeping aggravated
    if (this.aggravated >= newTotal) {
      return new DamageTracker5th(newTotal, 0, newTotal);
    }

    const remainingSuperficial = newTotal - this.aggravated;
    return new DamageTracker5th(
      newTotal,
      remainingSuperficial,
      this.aggravated
    );
  }

  /**
   * Takes superficial damage.
   * If tracker is full, overflow converts superficial to aggravated.
   *
   * @param amount - Amount of superficial damage to take
   * @returns New tracker instance with damage applied
   */
  public takeSuperficial(amount: number): DamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Cannot take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const available = this.current;
    const actualSuperficial = Math.min(amount, available);
    const newSuperficial = this.superficial + actualSuperficial;

    // If there's overflow and we have superficial damage, convert it to aggravated
    const overflow = amount - actualSuperficial;
    if (overflow > 0 && this.superficial > 0) {
      const converted = Math.min(overflow, this.superficial);
      return new DamageTracker5th(
        this.total,
        newSuperficial - converted,
        this.aggravated + converted
      );
    }

    return new DamageTracker5th(this.total, newSuperficial, this.aggravated);
  }

  /**
   * Takes aggravated damage.
   * Converts superficial damage to aggravated if needed.
   *
   * @param amount - Amount of aggravated damage to take
   * @returns New tracker instance with damage applied
   */
  public takeAggravated(amount: number): DamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Cannot take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const available = this.current;

    if (available >= amount) {
      // Enough space for all aggravated damage
      return new DamageTracker5th(
        this.total,
        this.superficial,
        this.aggravated + amount
      );
    }

    // Not enough space - convert superficial to aggravated
    const newAggravated = this.aggravated + available;
    const remaining = amount - available;
    const converted = Math.min(remaining, this.superficial);

    return new DamageTracker5th(
      this.total,
      this.superficial - converted,
      newAggravated + converted
    );
  }

  /**
   * Heals superficial damage.
   *
   * @param amount - Amount of superficial damage to heal
   * @returns New tracker instance with damage healed
   */
  public healSuperficial(amount: number): DamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const healed = Math.min(amount, this.superficial);
    return new DamageTracker5th(
      this.total,
      this.superficial - healed,
      this.aggravated
    );
  }

  /**
   * Heals aggravated damage.
   *
   * @param amount - Amount of aggravated damage to heal
   * @returns New tracker instance with damage healed
   */
  public healAggravated(amount: number): DamageTracker5th {
    if (amount < 0) {
      throw new RealmError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const healed = Math.min(amount, this.aggravated);
    return new DamageTracker5th(
      this.total,
      this.superficial,
      this.aggravated - healed
    );
  }

  /**
   * Heals all damage.
   *
   * @returns New tracker instance with no damage
   */
  public healAll(): DamageTracker5th {
    return new DamageTracker5th(this.total, 0, 0);
  }

  /**
   * Serializes to plain object for storage.
   *
   * @returns Plain object representation
   */
  public toJSON(): { total: number; superficial: number; aggravated: number } {
    return {
      total: this.total,
      superficial: this.superficial,
      aggravated: this.aggravated,
    };
  }

  /**
   * Creates a DamageTracker5th from a plain object.
   *
   * @param data - Plain object with tracker data
   * @returns New tracker instance
   */
  public static fromJSON(data: {
    total: number;
    superficial: number;
    aggravated: number;
  }): DamageTracker5th {
    return new DamageTracker5th(data.total, data.superficial, data.aggravated);
  }
}
