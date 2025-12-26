import type { Vampire20thData, IBloodTracker } from "@realm/common";
import type { IVampire20th } from "@realm/common";
import { Splat, Vampire20thDataSchema } from "@realm/common";

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
 */
export class Vampire20th extends Character20th implements IVampire20th {
  private _bloodPool: IBloodTracker;

  constructor(data: Vampire20thData) {
    // Validate with Zod schema
    const validated = Vampire20thDataSchema.parse(data);
    super(validated);

    // Initialize from actual Data
    this._bloodPool = new BloodTracker(validated.bloodPool);
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

  spendBlood(amount: number): void {
    this._bloodPool = this._bloodPool.spend(amount);
  }

  slakeBlood(amount: number): void {
    this._bloodPool = this._bloodPool.slake(amount);
  }

  setCurrentBlood(amount: number): void {
    this._bloodPool = this._bloodPool.setCurrent(amount);
  }

  setBloodPool(current: number, total: number): void {
    this._bloodPool = new BloodTracker({ current, total });
  }

  // ============================================================================
  // Presentation
  // ============================================================================

  override get color(): string {
    // Vampire dark red
    return "#8B0000";
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
