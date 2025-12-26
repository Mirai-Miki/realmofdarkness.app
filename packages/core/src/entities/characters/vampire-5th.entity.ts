import type { Vampire5thData } from "@realm/common";
import type { IVampire5th } from "@realm/common";

import {
  Splat,
  Vampire5thDataSchema,
  HungerDataSchema,
  HungerAmountSchema,
} from "@realm/common";
import { Character5th } from "./character-5th.entity";

/**
 * Vampire 5th Edition character entity.
 * Implements V5-specific mechanics: Hunger, Blood Potency, Disciplines, etc.
 *
 * @remarks
 * This is a rich domain entity representing a Vampire: The Masquerade 5th Edition character.
 * It extends Character5th with vampire-specific behavior.
 *
 * Key V5 Vampire Mechanics:
 * - Hunger (0-5): Represents the Beast's need for blood
 * - Blood Potency: Determines feeding power and discipline strength
 * - Disciplines: Vampiric powers
 * - Clan: Vampire bloodline
 * - Generation: Distance from Caine
 */
export class Vampire5th extends Character5th implements IVampire5th {
  private _hunger: number;

  constructor(data: Vampire5thData) {
    // Validate with Zod schema
    const validated = Vampire5thDataSchema.parse(data);
    super(validated);

    // Initialize from actual Data
    this._hunger = validated.hunger;
  }

  // ============================================================================
  // Identity
  // ============================================================================

  override get splat(): typeof Splat.Vampire5th {
    return Splat.Vampire5th;
  }

  // ============================================================================
  // Hunger System
  // ============================================================================

  get hunger(): number {
    return this._hunger;
  }

  increaseHunger(amount: number = 1): number {
    // Validate with Zod
    HungerAmountSchema.parse(amount);

    this._hunger = Math.min(5, this._hunger + amount);
    return this._hunger;
  }

  decreaseHunger(amount: number = 1): number {
    // Validate with Zod
    HungerAmountSchema.parse(amount);

    // Vampires can never reach Hunger 0 (always at least 1)
    this._hunger = Math.max(1, this._hunger - amount);
    return this._hunger;
  }

  setHunger(value: number): number {
    // Validate with Zod
    const validated = HungerDataSchema.parse(value);

    this._hunger = validated;
    return this._hunger;
  }

  // ============================================================================
  // Presentation
  // ============================================================================

  override get color(): string {
    // Vampire red
    return "#8B0000";
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  override toData(): Vampire5thData {
    return {
      ...super.toData(),
      splat: this.splat,
      hunger: this._hunger,
    };
  }
}
