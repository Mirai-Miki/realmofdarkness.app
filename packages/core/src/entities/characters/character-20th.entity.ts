import type { Splats, SheetStatus, Snowflake } from "@realm/common";

import { Character } from "./character.entity.js";
import {
  DamageTracker20th,
  WillpowerTracker20th,
  Experience,
} from "../../value-objects/index.js";

/**
 * Base character entity for all 20th Anniversary Edition game systems.
 * This is the intermediate class for V20, Werewolf20th, Mage20th, etc.
 *
 * @remarks
 * Character20th adds 20th edition specific mechanics:
 * - Willpower with total/current tracking (Value Object)
 * - Health with bashing/lethal/aggravated damage (Value Object)
 * - Classic World of Darkness damage system
 *
 * Inheritance: Character → Character20th → Vampire20th/Werewolf20th/etc
 *
 * @example
 * ```typescript
 * // Not instantiated directly - use specific character types
 * const vampire = new Vampire20th({
 *   name: 'Dracula',
 *   userId: '123456789',
 *   splat: Splats.Vampire20th,
 *   health: new DamageTracker20th(7, 0, 0, 0),
 *   willpower: new WillpowerTracker20th(5, 5)
 * });
 * ```
 */
export abstract class Character20th extends Character {
  /**
   * Willpower tracker with total and current values (immutable Value Object)
   */
  public willpower: WillpowerTracker20th;

  /**
   * Health tracker with bashing, lethal, and aggravated damage (immutable Value Object)
   */
  public health: DamageTracker20th;

  /**
   * Creates a new Character20th instance.
   *
   * @param data - Character initialization data
   * @param data.name - Character name
   * @param data.userId - Discord user ID (Snowflake)
   * @param data.splat - Character type/splat
   * @param data.health - Health tracker (default: total 7, no damage)
   * @param data.willpower - Willpower tracker (default: total 2, current 2)
   * Additional base Character fields are also accepted
   */
  protected constructor(data: {
    name: string;
    userId: Snowflake;
    splat: Splats;
    id: Snowflake;
    guildId?: Snowflake | null;
    isSheet?: boolean;
    expTotal?: number;
    expCurrent?: number;
    status?: SheetStatus;
    color?: string;
    thumbnail?: string | null;
    createdAt?: Date;
    lastUpdated?: Date;
    health?:
      | DamageTracker20th
      | { total: number; bashing: number; lethal: number; aggravated: number };
    willpower?: WillpowerTracker20th | { total: number; current: number };
  }) {
    // Only pass Character-specific fields to super()
    super({
      name: data.name,
      userId: data.userId,
      splat: data.splat,
      id: data.id,
      guildId: data.guildId,
      isSheet: data.isSheet,
      experience:
        data.expTotal !== undefined || data.expCurrent !== undefined
          ? new Experience(data.expTotal ?? 0, data.expCurrent ?? 0)
          : Experience.zero(),
      status: data.status,
      color: data.color,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated,
    });

    // Initialize willpower (accept Value Object or plain object)
    if (data.willpower instanceof WillpowerTracker20th) {
      this.willpower = data.willpower;
    } else if (data.willpower) {
      this.willpower = new WillpowerTracker20th(
        data.willpower.total,
        data.willpower.current
      );
    } else {
      this.willpower = new WillpowerTracker20th(2, 2); // Default
    }

    // Initialize health (accept Value Object or plain object)
    if (data.health instanceof DamageTracker20th) {
      this.health = data.health;
    } else if (data.health) {
      this.health = new DamageTracker20th(
        data.health.total,
        data.health.bashing,
        data.health.lethal,
        data.health.aggravated
      );
    } else {
      this.health = new DamageTracker20th(7, 0, 0, 0); // Default
    }
  }

  // ==========================================
  // WILLPOWER METHODS (using Value Object)
  // ==========================================

  /**
   * Sets total willpower.
   *
   * @param total - New total willpower
   */
  public setWillpowerTotal(total: number): void {
    this.willpower = this.willpower.setTotal(total);
  }

  /**
   * Sets current willpower.
   *
   * @param current - New current willpower
   */
  public setWillpowerCurrent(current: number): void {
    this.willpower = this.willpower.setCurrent(current);
  }

  /**
   * Spends willpower points.
   *
   * @param amount - Amount of willpower to spend
   */
  public spendWillpower(amount: number): void {
    this.willpower = this.willpower.spend(amount);
  }

  /**
   * Recovers willpower points.
   *
   * @param amount - Amount of willpower to recover
   */
  public recoverWillpower(amount: number): void {
    this.willpower = this.willpower.recover(amount);
  }

  /**
   * Recovers to full willpower.
   */
  public recoverAllWillpower(): void {
    this.willpower = this.willpower.recoverAll();
  }

  /**
   * Checks if character is at full willpower.
   *
   * @returns True if current equals total
   */
  public isWillpowerFull(): boolean {
    return this.willpower.isFull;
  }

  /**
   * Checks if willpower is empty.
   *
   * @returns True if current is zero
   */
  public isWillpowerEmpty(): boolean {
    return this.willpower.isEmpty;
  }

  // ==========================================
  // HEALTH METHODS (using Value Object)
  // ==========================================

  /**
   * Sets total health.
   *
   * @param total - New total health
   */
  public setHealthTotal(total: number): void {
    this.health = this.health.setTotal(total);
  }

  /**
   * Takes bashing damage.
   *
   * @param amount - Amount of bashing damage to take
   */
  public takeBashingDamage(amount: number): void {
    this.health = this.health.takeBashing(amount);
  }

  /**
   * Takes lethal damage.
   *
   * @param amount - Amount of lethal damage to take
   */
  public takeLethalDamage(amount: number): void {
    this.health = this.health.takeLethal(amount);
  }

  /**
   * Takes aggravated damage.
   *
   * @param amount - Amount of aggravated damage to take
   */
  public takeAggravatedDamage(amount: number): void {
    this.health = this.health.takeAggravated(amount);
  }

  /**
   * Heals bashing damage.
   *
   * @param amount - Amount of bashing damage to heal
   */
  public healBashingDamage(amount: number): void {
    this.health = this.health.healBashing(amount);
  }

  /**
   * Heals lethal damage.
   *
   * @param amount - Amount of lethal damage to heal
   */
  public healLethalDamage(amount: number): void {
    this.health = this.health.healLethal(amount);
  }

  /**
   * Heals aggravated damage.
   *
   * @param amount - Amount of aggravated damage to heal
   */
  public healAggravatedDamage(amount: number): void {
    this.health = this.health.healAggravated(amount);
  }

  /**
   * Gets current health (total - all damage).
   *
   * @returns Current health value
   */
  public getCurrentHealth(): number {
    return this.health.current;
  }

  /**
   * Checks if character is at full health.
   *
   * @returns True if no health damage
   */
  public isHealthFull(): boolean {
    return this.health.isEmpty;
  }

  /**
   * Checks if character is incapacitated (no health remaining).
   *
   * @returns True if health is fully damaged
   */
  public isIncapacitated(): boolean {
    return this.health.isFull;
  }

  // ==========================================
  // CHARACTER OVERRIDES
  // ==========================================

  /**
   * Gets the game system version.
   *
   * @returns "20th"
   */
  public getVersion(): string {
    return "20th";
  }

  /**
   * Validates the character data.
   * Includes base validation plus 20th edition specific checks.
   *
   * @returns Object containing validation status and any error messages
   */
  public override validate(): { isValid: boolean; errors: string[] } {
    const baseValidation = super.validate();
    // Note: Value Objects self-validate, so no need to check trackers
    return baseValidation;
  }

  /**
   * Serializes the character to a plain object for storage.
   * Includes base character data plus 20th edition specifics.
   *
   * @returns Plain object representation of character data
   */
  public serialize(): Record<string, unknown> {
    return {
      // Base character data would be included by subclasses
      willpower: this.willpower.toJSON(),
      health: this.health.toJSON(),
    };
  }
}
