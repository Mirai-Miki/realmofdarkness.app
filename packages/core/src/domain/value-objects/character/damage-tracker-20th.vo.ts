import { RealmError } from "@realm/errors";

/**
 * Value Object representing a damage tracker for 20th edition characters.
 * Tracks total boxes and bashing/lethal/aggravated damage.
 *
 * @remarks
 * This is an immutable value object - all modifications return a new instance.
 * Damage types (bashing, lethal, aggravated) are tracked independently.
 * When tracker is full, additional damage is simply capped at available space.
 *
 * @example
 * ```typescript
 * const tracker = new DamageTracker20th(7, 0, 0, 0); // 7 health, no damage
 * const damaged = tracker.takeBashing(3); // 3 bashing damage
 * const moreDamaged = damaged.takeLethal(2); // 2 lethal damage
 * console.log(moreDamaged.current); // 2 (7 - 3 - 2)
 * ```
 */
export class DamageTracker20th {
  /**
   * Creates a new DamageTracker20th instance.
   *
   * @param total - Total number of boxes (1-15)
   * @param bashing - Bashing damage (0 to total)
   * @param lethal - Lethal damage (0 to total)
   * @param aggravated - Aggravated damage (0 to total)
   * @throws {RealmError} If values are invalid
   */
  constructor(
    public readonly total: number,
    public readonly bashing: number,
    public readonly lethal: number,
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
    if (this.total < 7 || this.total > 15) {
      throw new RealmError("Tracker total must be between 7 and 15", {
        fields: { total: this.total.toString() },
      });
    }

    if (this.bashing < 0 || this.lethal < 0 || this.aggravated < 0) {
      throw new RealmError("Damage cannot be negative", {
        fields: {
          bashing: this.bashing.toString(),
          lethal: this.lethal.toString(),
          aggravated: this.aggravated.toString(),
        },
      });
    }

    if (this.bashing + this.lethal + this.aggravated > this.total) {
      throw new RealmError("Total damage cannot exceed tracker total", {
        fields: {
          total: this.total.toString(),
          bashing: this.bashing.toString(),
          lethal: this.lethal.toString(),
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
    return this.total - this.bashing - this.lethal - this.aggravated;
  }

  /**
   * Checks if tracker is at maximum (all boxes damaged).
   *
   * @returns True if no boxes remaining
   */
  public get isFull(): boolean {
    return this.current === 0;
  }

  /**
   * Checks if tracker has no damage.
   *
   * @returns True if no damage taken
   */
  public get isEmpty(): boolean {
    return this.bashing === 0 && this.lethal === 0 && this.aggravated === 0;
  }

  /**
   * Creates a new tracker with modified total.
   * Adjusts damage if it exceeds new total.
   *
   * @param newTotal - New total boxes (7-15)
   * @returns New tracker instance
   */
  public setTotal(newTotal: number): DamageTracker20th {
    if (newTotal < 7 || newTotal > 15) {
      throw new RealmError("Tracker total must be between 7 and 15", {
        fields: { newTotal: newTotal.toString() },
      });
    }

    const totalDamage = this.bashing + this.lethal + this.aggravated;
    if (totalDamage <= newTotal) {
      return new DamageTracker20th(
        newTotal,
        this.bashing,
        this.lethal,
        this.aggravated
      );
    }

    // Damage exceeds new total - prioritize keeping aggravated, then lethal, then bashing
    if (this.aggravated >= newTotal) {
      return new DamageTracker20th(newTotal, 0, 0, newTotal);
    }

    if (this.aggravated + this.lethal >= newTotal) {
      const remainingLethal = newTotal - this.aggravated;
      return new DamageTracker20th(
        newTotal,
        0,
        remainingLethal,
        this.aggravated
      );
    }

    const remainingBashing = newTotal - this.aggravated - this.lethal;
    return new DamageTracker20th(
      newTotal,
      remainingBashing,
      this.lethal,
      this.aggravated
    );
  }

  /**
   * Takes bashing damage.
   * If total damage would exceed tracker total, caps bashing at available space.
   *
   * @param amount - Amount of bashing damage to take
   * @returns New tracker instance with damage applied
   */
  public takeBashing(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const available = this.current;
    const actualBashing = Math.min(amount, available);

    return new DamageTracker20th(
      this.total,
      this.bashing + actualBashing,
      this.lethal,
      this.aggravated
    );
  }

  /**
   * Takes lethal damage.
   * If total damage would exceed tracker total, caps lethal at available space.
   *
   * @param amount - Amount of lethal damage to take
   * @returns New tracker instance with damage applied
   */
  public takeLethal(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const available = this.current;
    const actualLethal = Math.min(amount, available);

    return new DamageTracker20th(
      this.total,
      this.bashing,
      this.lethal + actualLethal,
      this.aggravated
    );
  }

  /**
   * Takes aggravated damage.
   * If total damage would exceed tracker total, caps aggravated at available space.
   *
   * @param amount - Amount of aggravated damage to take
   * @returns New tracker instance with damage applied
   */
  public takeAggravated(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot take negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const available = this.current;
    const actualAggravated = Math.min(amount, available);

    return new DamageTracker20th(
      this.total,
      this.bashing,
      this.lethal,
      this.aggravated + actualAggravated
    );
  }

  /**
   * Heals bashing damage.
   *
   * @param amount - Amount of bashing damage to heal
   * @returns New tracker instance with damage healed
   */
  public healBashing(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const healed = Math.min(amount, this.bashing);
    return new DamageTracker20th(
      this.total,
      this.bashing - healed,
      this.lethal,
      this.aggravated
    );
  }

  /**
   * Heals lethal damage.
   *
   * @param amount - Amount of lethal damage to heal
   * @returns New tracker instance with damage healed
   */
  public healLethal(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const healed = Math.min(amount, this.lethal);
    return new DamageTracker20th(
      this.total,
      this.bashing,
      this.lethal - healed,
      this.aggravated
    );
  }

  /**
   * Heals aggravated damage.
   *
   * @param amount - Amount of aggravated damage to heal
   * @returns New tracker instance with damage healed
   */
  public healAggravated(amount: number): DamageTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot heal negative damage", {
        fields: { amount: amount.toString() },
      });
    }

    const healed = Math.min(amount, this.aggravated);
    return new DamageTracker20th(
      this.total,
      this.bashing,
      this.lethal,
      this.aggravated - healed
    );
  }

  /**
   * Heals all damage.
   *
   * @returns New tracker instance with no damage
   */
  public healAll(): DamageTracker20th {
    return new DamageTracker20th(this.total, 0, 0, 0);
  }

  /**
   * Serializes to plain object for storage.
   *
   * @returns Plain object representation
   */
  public toJSON(): {
    total: number;
    bashing: number;
    lethal: number;
    aggravated: number;
  } {
    return {
      total: this.total,
      bashing: this.bashing,
      lethal: this.lethal,
      aggravated: this.aggravated,
    };
  }

  /**
   * Creates a DamageTracker20th from a plain object.
   *
   * @param data - Plain object with tracker data
   * @returns New tracker instance
   */
  public static fromJSON(data: {
    total: number;
    bashing: number;
    lethal: number;
    aggravated: number;
  }): DamageTracker20th {
    return new DamageTracker20th(
      data.total,
      data.bashing,
      data.lethal,
      data.aggravated
    );
  }
}
