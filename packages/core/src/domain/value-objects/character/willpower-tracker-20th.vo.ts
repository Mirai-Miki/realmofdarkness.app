import { RealmError } from "@realm/errors";

/**
 * Value Object representing a willpower tracker for 20th edition characters.
 * Tracks total and current willpower (spent/recovered).
 *
 * @remarks
 * This is an immutable value object - all modifications return a new instance.
 * Willpower is a consumable resource that can be spent and recovered.
 *
 * @example
 * ```typescript
 * const willpower = new WillpowerTracker20th(5, 5); // 5 total, all available
 * const spent = willpower.spend(2); // Spend 2 willpower
 * console.log(spent.current); // 3
 * const recovered = spent.recover(1); // Recover 1
 * console.log(recovered.current); // 4
 * ```
 */
export class WillpowerTracker20th {
  /**
   * Creates a new WillpowerTracker20th instance.
   *
   * @param total - Total willpower (1-10)
   * @param current - Current willpower (0 to total)
   * @throws {ClientError} If values are invalid
   */
  constructor(
    public readonly total: number,
    public readonly current: number
  ) {
    this.validate();
  }

  /**
   * Validates tracker values.
   *
   * @throws {ClientError} If values are invalid
   * @private
   */
  private validate(): void {
    if (this.total < 0) {
      throw new RealmError("Tracker total cannot be negative", {
        fields: { total: this.total.toString() },
      });
    }

    if (this.current < 0) {
      throw new RealmError("Current willpower cannot be negative", {
        fields: { current: this.current.toString() },
      });
    }

    if (this.current > this.total) {
      throw new RealmError("Current willpower cannot exceed total", {
        fields: {
          total: this.total.toString(),
          current: this.current.toString(),
        },
      });
    }
  }

  /**
   * Checks if willpower is full.
   *
   * @returns True if current equals total
   */
  public get isFull(): boolean {
    return this.current === this.total;
  }

  /**
   * Checks if willpower is empty.
   *
   * @returns True if current is zero
   */
  public get isEmpty(): boolean {
    return this.current === 0;
  }

  /**
   * Creates a new tracker with modified total.
   * Adjusts current if it exceeds new total.
   *
   * @param newTotal - New total willpower (1-10)
   * @returns New tracker instance
   */
  public setTotal(newTotal: number): WillpowerTracker20th {
    if (newTotal < 0) {
      throw new RealmError("Tracker total cannot be negative", {
        fields: { newTotal: newTotal.toString() },
      });
    }

    const newCurrent = Math.min(this.current, newTotal);
    return new WillpowerTracker20th(newTotal, newCurrent);
  }

  /**
   * Sets current willpower directly.
   *
   * @param newCurrent - New current willpower (0 to total)
   * @returns New tracker instance
   */
  public setCurrent(newCurrent: number): WillpowerTracker20th {
    if (newCurrent < 0) {
      throw new RealmError("Current willpower cannot be negative", {
        fields: { newCurrent: newCurrent.toString() },
      });
    }

    if (newCurrent > this.total) {
      throw new RealmError("Current willpower cannot exceed total", {
        fields: {
          total: this.total.toString(),
          newCurrent: newCurrent.toString(),
        },
      });
    }

    return new WillpowerTracker20th(this.total, newCurrent);
  }

  /**
   * Spends willpower points.
   *
   * @param amount - Amount of willpower to spend
   * @returns New tracker instance
   * @throws {ClientError} If insufficient willpower
   */
  public spend(amount: number): WillpowerTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot spend negative willpower", {
        fields: { amount: amount.toString() },
      });
    }

    if (this.current < amount) {
      throw new RealmError(
        `Insufficient willpower. Required: ${amount}, Available: ${this.current}`,
        {
          fields: {
            required: amount.toString(),
            available: this.current.toString(),
          },
        }
      );
    }

    return new WillpowerTracker20th(this.total, this.current - amount);
  }

  /**
   * Recovers willpower points.
   *
   * @param amount - Amount of willpower to recover
   * @returns New tracker instance
   */
  public recover(amount: number): WillpowerTracker20th {
    if (amount < 0) {
      throw new RealmError("Cannot recover negative willpower", {
        fields: { amount: amount.toString() },
      });
    }

    const newCurrent = Math.min(this.total, this.current + amount);
    return new WillpowerTracker20th(this.total, newCurrent);
  }

  /**
   * Recovers to full willpower.
   *
   * @returns New tracker instance with full willpower
   */
  public recoverAll(): WillpowerTracker20th {
    return new WillpowerTracker20th(this.total, this.total);
  }

  /**
   * Serializes to plain object for storage.
   *
   * @returns Plain object representation
   */
  public toJSON(): { total: number; current: number } {
    return {
      total: this.total,
      current: this.current,
    };
  }

  /**
   * Creates a WillpowerTracker20th from a plain object.
   *
   * @param data - Plain object with tracker data
   * @returns New tracker instance
   */
  public static fromJSON(data: {
    total: number;
    current: number;
  }): WillpowerTracker20th {
    return new WillpowerTracker20th(data.total, data.current);
  }
}
