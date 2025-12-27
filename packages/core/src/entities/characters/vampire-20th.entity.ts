import type { Vampire20thData, IBloodTracker } from "@realm/common";
import type { IVampire20th } from "@realm/common";
import { Splat } from "@realm/common";

import { Character20th } from "./character-20th.entity";
import { BloodTracker } from "./value-objects/blood-tracker.vo";

/**
 * Vampire 20th Anniversary character entity.
 * Implements V20-specific mechanics: Blood Pool, Disciplines, etc.
 *
 * @remarks
 * This is a rich domain entity representing a Vampire: The Masquerade 20th Anniversary character.
 * It extends Character20th with vampire-specific behavior.
 *
 * Key V20 Vampire Mechanics:
 * - Blood Pool: Current/Total blood points
 * - Generation: Determines blood pool max and discipline caps
 * - Disciplines: Vampiric powers
 * - Clan: Vampire bloodline
 * - Humanity/Path rating
 *
 * This entity trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export class Vampire20th extends Character20th implements IVampire20th {
  private _bloodPool: IBloodTracker;

  constructor(data: Vampire20thData) {
    // Trust the data - already validated at boundary
    super(data);

    // Initialize from actual Data
    this._bloodPool = new BloodTracker(data.bloodPool);
  }

  // ============================================================================
  // Identity
  // ============================================================================

  override get splat(): typeof Splat.Vampire20th {
    return Splat.Vampire20th;
  }

  // ============================================================================
  // Blood Pool System
  // ============================================================================

  get bloodPool(): IBloodTracker {
    return this._bloodPool;
  }

  /**
   * Spend blood points from the pool.
   *
   * Reduces current blood pool by the specified amount.
   *
   * @param amount - Number of blood points to spend
   * @throws {RealmError} If amount is negative or exceeds current blood
   *
   * @example
   * ```typescript
   * vampire.spendBlood(3); // Spend 3 blood points
   * ```
   */
  public spendBlood(amount: number): void {
    this._bloodPool = this._bloodPool.spend(amount);
  }

  /**
   * Restore blood points by feeding.
   *
   * Increases current blood pool by the specified amount (capped at maximum).
   *
   * @param amount - Number of blood points to restore
   * @throws {RealmError} If amount is negative
   *
   * @example
   * ```typescript
   * vampire.slakeBlood(5); // Restore 5 blood points from feeding
   * ```
   */
  public slakeBlood(amount: number): void {
    this._bloodPool = this._bloodPool.slake(amount);
  }

  /**
   * Set current blood pool to a specific value.
   *
   * @param amount - New current blood value (0 <= amount <= max blood pool)
   * @throws {RealmError} If amount is negative or exceeds maximum
   *
   * @example
   * ```typescript
   * vampire.setCurrentBlood(10); // Set current blood to 10
   * ```
   */
  public setCurrentBlood(amount: number): void {
    this._bloodPool = this._bloodPool.setCurrent(amount);
  }

  /**
   * Set both current and maximum blood pool values.
   *
   * Useful for character creation or generation changes.
   *
   * @param current - New current blood value
   * @param total - New maximum blood pool value
   * @throws {RealmError} If values are invalid
   *
   * @example
   * ```typescript
   * vampire.setBloodPool(10, 15); // Set current to 10, max to 15
   * ```
   */
  public setBloodPool(current: number, total: number): void {
    this._bloodPool = new BloodTracker({ current, total });
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  override toData(): Vampire20thData {
    return {
      ...super.toData(),
      splat: this.splat,
      bloodPool: {
        current: this._bloodPool.current,
        total: this._bloodPool.total,
      },
    };
  }
}
