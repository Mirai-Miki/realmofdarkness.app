import type { IMoralityTracker, MoralityData } from "@realm/common";
import { RealmError } from "@realm/common";

/**
 * Vampire 20th Anniversary morality tracker value object.
 * Tracks morality rating and path name (Humanity or Path of Enlightenment).
 *
 * @remarks
 * Immutable - all operations return new instances.
 *
 * Morality represents:
 * - Value: Current morality rating (0-10)
 * - Name: Path name (e.g., "Humanity", "Path of Blood", "Path of Bones")
 *
 * Morality determines:
 * - How many dice you roll to resist frenzy
 * - Your connection to humanity or a particular philosophy
 * - When you risk losing yourself to the Beast
 *
 * This VO trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class MoralityTracker implements IMoralityTracker {
  readonly value: number;
  readonly name: string;

  constructor(data: MoralityData) {
    // Trust the data - already validated at boundary
    this.value = data.value;
    this.name = data.name;
  }

  /**
   * Getter for backward compatibility with old interface.
   * @deprecated Use .value instead
   */
  get current(): number {
    return this.value;
  }

  /**
   * Getter for backward compatibility with old interface.
   * @deprecated Morality maximum is always 10
   */
  get total(): number {
    return 10;
  }

  /**
   * Lose morality points (drop rating).
   *
   * Returns a new MoralityTracker instance with reduced morality.
   * Morality cannot drop below 0.
   *
   * @param amount - Number of morality points to lose (must be >= 0)
   * @returns New MoralityTracker with value reduced by amount (minimum 0)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const morality = new MoralityTracker({ value: 7, name: "Humanity" });
   * const newMorality = morality.lose(2); // { value: 5, name: "Humanity" }
   * ```
   */
  public lose(amount: number): IMoralityTracker {
    if (amount < 0) {
      throw new RealmError("Attempted to lose negative morality", {
        fields: { amount: amount.toString() },
      });
    }

    return new MoralityTracker({
      value: Math.max(0, this.value - amount),
      name: this.name,
    });
  }

  /**
   * Gain morality points (increase rating).
   *
   * Returns a new MoralityTracker instance with increased morality.
   * Morality cannot exceed 10.
   *
   * @param amount - Number of morality points to gain (must be >= 0)
   * @returns New MoralityTracker with value increased by amount (maximum 10)
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * const morality = new MoralityTracker({ value: 5, name: "Humanity" });
   * const newMorality = morality.gain(1); // { value: 6, name: "Humanity" }
   * ```
   */
  public gain(amount: number): IMoralityTracker {
    if (amount < 0) {
      throw new RealmError("Attempted to gain negative morality", {
        fields: { amount: amount.toString() },
      });
    }

    return new MoralityTracker({
      value: Math.min(10, this.value + amount),
      name: this.name,
    });
  }

  /**
   * Set morality rating to a specific value.
   *
   * @param amount - New morality value (0 <= amount <= 10)
   * @returns New MoralityTracker with updated value
   * @throws {RealmError} If amount is invalid
   *
   * @example
   * ```typescript
   * const morality = new MoralityTracker({ value: 7, name: "Humanity" });
   * const newMorality = morality.setValue(5); // { value: 5, name: "Humanity" }
   * ```
   */
  public setValue(amount: number): IMoralityTracker {
    if (amount < 0 || amount > 10) {
      throw new RealmError("Invalid morality value", {
        fields: {
          amount: amount.toString(),
          min: "0",
          max: "10",
        },
      });
    }

    return new MoralityTracker({
      value: amount,
      name: this.name,
    });
  }

  /**
   * Set morality path name.
   *
   * @param name - New path name (e.g., "Humanity", "Path of Blood")
   * @returns New MoralityTracker with updated name
   * @throws {RealmError} If name is empty
   *
   * @example
   * ```typescript
   * const morality = new MoralityTracker({ value: 7, name: "Humanity" });
   * const newMorality = morality.setName("Path of Blood");
   * // { value: 7, name: "Path of Blood" }
   * ```
   */
  public setName(name: string): IMoralityTracker {
    if (!name || name.trim().length === 0) {
      throw new RealmError("Morality path name cannot be empty");
    }

    return new MoralityTracker({
      value: this.value,
      name: name.trim(),
    });
  }
}
