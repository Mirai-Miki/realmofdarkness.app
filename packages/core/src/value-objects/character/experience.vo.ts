import { RealmError } from "@realm/common";

/**
 * Value Object representing character experience points.
 * Tracks total earned experience and current unspent experience.
 *
 * @remarks
 * This is an immutable value object - all modifications return a new instance.
 * Experience can be awarded (increases both total and current) or spent (decreases current only).
 *
 * @example
 * ```typescript
 * const exp = new Experience(100, 50); // 100 total, 50 unspent
 * const awarded = exp.award(10); // Award 10 XP
 * console.log(awarded.total); // 110
 * console.log(awarded.current); // 60
 *
 * const spent = awarded.spend(25); // Spend 25 XP
 * console.log(spent.total); // 110 (unchanged)
 * console.log(spent.current); // 35
 * ```
 */
export class Experience {
  /**
   * Creates a new Experience instance.
   *
   * @param total - Total experience earned (cannot decrease)
   * @param current - Current unspent experience (0 to total)
   * @throws {RealmError} If values are invalid
   */
  constructor(
    public readonly total: number,
    public readonly current: number
  ) {
    this.validate();
  }

  /**
   * Creates a new Experience with zero points.
   *
   * @returns New Experience instance with 0 total and 0 current
   */
  public static zero(): Experience {
    return new Experience(0, 0);
  }

  /**
   * Creates a new Experience from a total amount (all unspent).
   *
   * @param total - Total experience to start with
   * @returns New Experience instance
   */
  public static fromTotal(total: number): Experience {
    return new Experience(total, total);
  }

  /**
   * Validates experience values.
   *
   * @throws {RealmError} If values are invalid
   * @private
   */
  private validate(): void {
    if (this.total < 0) {
      throw new RealmError("Total experience cannot be negative", {
        fields: { total: this.total.toString() },
      });
    }

    if (this.current < 0) {
      throw new RealmError("Current experience cannot be negative", {
        fields: { current: this.current.toString() },
      });
    }

    if (this.current > this.total) {
      throw new RealmError("Current experience cannot exceed total", {
        fields: {
          total: this.total.toString(),
          current: this.current.toString(),
        },
      });
    }
  }

  /**
   * Gets the amount of experience spent (total - current).
   *
   * @returns Amount of experience that has been spent
   */
  public get spent(): number {
    return this.total - this.current;
  }

  /**
   * Checks if all experience has been spent.
   *
   * @returns True if current is zero
   */
  public get isExhausted(): boolean {
    return this.current === 0;
  }

  /**
   * Checks if no experience has been spent.
   *
   * @returns True if current equals total
   */
  public get isUnspent(): boolean {
    return this.current === this.total;
  }

  /**
   * Checks if character can afford a given cost.
   *
   * @param cost - The experience cost to check
   * @returns True if current experience >= cost
   */
  public canAfford(cost: number): boolean {
    return this.current >= cost;
  }

  /**
   * Awards experience points (increases both total and current).
   *
   * @param amount - Amount of experience to award (must be positive)
   * @returns New Experience instance with awarded points
   * @throws {RealmError} If amount is negative
   */
  public award(amount: number): Experience {
    if (amount < 0) {
      throw new RealmError("Cannot award negative experience", {
        fields: { amount: amount.toString() },
      });
    }

    return new Experience(this.total + amount, this.current + amount);
  }

  /**
   * Spends experience points (decreases current only).
   *
   * @param cost - Amount of experience to spend (must be positive and <= current)
   * @returns New Experience instance with spent points
   * @throws {RealmError} If cost is invalid or insufficient experience
   */
  public spend(cost: number): Experience {
    if (cost < 0) {
      throw new RealmError("Cannot spend negative experience", {
        fields: { cost: cost.toString() },
      });
    }

    if (!this.canAfford(cost)) {
      throw new RealmError(
        `Insufficient experience. Required: ${cost}, Available: ${this.current}`,
        {
          fields: {
            cost: cost.toString(),
            available: this.current.toString(),
          },
        }
      );
    }

    return new Experience(this.total, this.current - cost);
  }

  /**
   * Sets the total experience (for character creation/loading).
   * Adjusts current if it would exceed new total.
   *
   * @param newTotal - The new total experience
   * @returns New Experience instance
   * @throws {RealmError} If newTotal is negative
   */
  public setTotal(newTotal: number): Experience {
    if (newTotal < 0) {
      throw new RealmError("Total experience cannot be negative", {
        fields: { newTotal: newTotal.toString() },
      });
    }

    const newCurrent = Math.min(this.current, newTotal);
    return new Experience(newTotal, newCurrent);
  }

  /**
   * Sets the current unspent experience.
   * Total remains unchanged.
   *
   * @param newCurrent - The new current experience
   * @returns New Experience instance
   * @throws {RealmError} If newCurrent is invalid
   */
  public setCurrent(newCurrent: number): Experience {
    if (newCurrent < 0) {
      throw new RealmError("Current experience cannot be negative", {
        fields: { newCurrent: newCurrent.toString() },
      });
    }

    if (newCurrent > this.total) {
      throw new RealmError("Current experience cannot exceed total", {
        fields: {
          total: this.total.toString(),
          newCurrent: newCurrent.toString(),
        },
      });
    }

    return new Experience(this.total, newCurrent);
  }

  /**
   * Serializes to plain object for storage.
   *
   * @returns Object with total and current
   */
  public toJSON(): { total: number; current: number } {
    return {
      total: this.total,
      current: this.current,
    };
  }

  /**
   * Creates Experience from serialized data.
   *
   * @param data - Serialized experience data
   * @returns New Experience instance
   */
  public static fromJSON(data: { total: number; current: number }): Experience {
    return new Experience(data.total, data.current);
  }

  /**
   * Checks equality with another Experience instance.
   *
   * @param other - Another Experience instance
   * @returns True if both total and current are equal
   */
  public equals(other: Experience): boolean {
    return this.total === other.total && this.current === other.current;
  }
}
