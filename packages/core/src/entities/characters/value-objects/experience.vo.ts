import type { IExperience, ExperienceData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Experience value object.
 * Immutable - all operations return new instances.
 *
 * @remarks
 * This is a value object, meaning it's defined by its values rather than
 * an identity. Two Experience objects with the same current/total are
 * considered equal.
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class Experience implements IExperience {
  readonly current: number;
  readonly total: number;

  constructor(data: ExperienceData) {
    this.current = data.current;
    this.total = data.total;
  }

  /**
   * Check if character has enough unspent experience to afford a purchase.
   *
   * @param cost - Experience cost of the purchase
   * @returns True if current experience >= cost
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * if (xp.canAfford(5)) {
   *   // Can purchase trait costing 5 XP
   * }
   * ```
   */
  canAfford(cost: number): boolean {
    return this.current >= cost;
  }

  /**
   * Spend unspent experience points.
   *
   * Returns a new Experience instance with reduced current XP.
   * Total XP remains unchanged.
   *
   * @param cost - Amount of experience to spend
   * @returns New Experience instance with current reduced by cost
   * @throws {RealmError} If cost exceeds current experience (internal logic error)
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * const newXp = xp.spend(5); // { current: 5, total: 50 }
   * ```
   */
  spend(cost: number): IExperience {
    if (!this.canAfford(cost)) {
      // This should never happen if caller checks canAfford first
      throw new RealmError(
        "Attempted to spend more experience than available",
        {
          fields: {
            cost: cost.toString(),
            current: this.current.toString(),
          },
        }
      );
    }

    return new Experience({
      current: this.current - cost,
      total: this.total,
    });
  }

  /**
   * Award new experience points to character.
   *
   * Returns a new Experience instance with both current and total increased.
   * This represents the character earning XP from gameplay.
   *
   * @param amount - Amount of experience to award (must be >= 0)
   * @returns New Experience instance with current and total increased by amount
   * @throws {RealmError} If amount is negative (internal logic error)
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * const newXp = xp.award(5); // { current: 15, total: 55 }
   * ```
   */
  award(amount: number): IExperience {
    if (amount < 0) {
      throw new RealmError("Attempted to award negative experience", {
        fields: { amount: amount.toString() },
      });
    }

    return new Experience({
      current: this.current + amount,
      total: this.total + amount,
    });
  }

  /**
   * Set the total experience for a character.
   *
   * Returns a new Experience instance with updated total.
   * If new total is less than current, current is capped to new total.
   *
   * @param total - New total experience value (must be >= 0)
   * @returns New Experience instance with updated total
   * @throws {RealmError} If total is negative (internal logic error)
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * const newXp = xp.setTotal(100); // { current: 10, total: 100 }
   * const cappedXp = xp.setTotal(5); // { current: 5, total: 5 } - current capped
   * ```
   */
  setTotal(total: number): IExperience {
    if (total < 0) {
      throw new RealmError("Attempted to set negative total experience", {
        fields: { total: total.toString() },
      });
    }

    return new Experience({
      current: Math.min(this.current, total),
      total,
    });
  }

  /**
   * Set the current (unspent) experience for a character.
   *
   * Returns a new Experience instance with updated current XP.
   * Total experience remains unchanged.
   *
   * @param current - New current experience value (must be 0 <= current <= total)
   * @returns New Experience instance with updated current
   * @throws {RealmError} If current is negative or exceeds total (internal logic error)
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * const newXp = xp.setCurrent(20); // { current: 20, total: 50 }
   * ```
   */
  setCurrent(current: number): IExperience {
    if (current < 0 || current > this.total) {
      throw new RealmError(
        "Attempted to set current experience to invalid value",
        {
          fields: {
            current: current.toString(),
            total: this.total.toString(),
          },
        }
      );
    }

    return new Experience({
      current,
      total: this.total,
    });
  }

  /**
   * Convert value object to plain data object for persistence.
   *
   * @returns Plain ExperienceData object
   *
   * @example
   * ```typescript
   * const xp = new Experience({ current: 10, total: 50 });
   * const data = xp.toData(); // { current: 10, total: 50 }
   * ```
   */
  toData(): ExperienceData {
    return {
      current: this.current,
      total: this.total,
    };
  }
}
