import type {
  BaseCharacterData,
  ICharacter,
  IExperience,
  Snowflake,
  Splat,
  SheetStatus,
} from "@realm/common";

import { RealmError } from "@realm/common";
import { Experience } from "./value-objects/experience.vo";

/**
 * Base Character entity.
 * Pure domain model with business logic for all character types.
 *
 * @remarks
 * This is a rich domain entity that wraps Data and provides
 * business logic methods. It contains NO database code, NO framework code.
 *
 * All character-specific behavior is implemented in subclasses (Character5th,
 * Character20th, Vampire5th, etc.).
 *
 * This entity trusts that data passed to constructor is already validated at
 * boundaries (API/Bot edge, Repository edge). It only prevents internal
 * mutations that would violate business rules.
 */
export abstract class Character implements ICharacter {
  protected data: BaseCharacterData;
  protected _experience: IExperience;

  constructor(data: BaseCharacterData) {
    // Trust the data - already validated at boundary
    this.data = data;

    // Initialize experience value object
    this._experience = new Experience({
      current: 0,
      total: 0,
    });
  }

  // ============================================================================
  // Identity Getters (Read-Only)
  // ============================================================================

  get id(): Snowflake {
    return this.data.id;
  }

  get userId(): Snowflake {
    return this.data.userId;
  }

  abstract get splat(): Splat;

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get lastUpdated(): Date {
    return this.data.updatedAt;
  }

  // ============================================================================
  // Mutable Properties
  // ============================================================================

  get name(): string {
    return this.data.name;
  }

  set name(value: string) {
    this.data.name = value;
  }

  get guildId(): Snowflake | null {
    return this.data.guildId;
  }

  set guildId(value: Snowflake | null) {
    this.data.guildId = value;
  }

  get isSheet(): boolean {
    return this.data.isSheet;
  }

  set isSheet(value: boolean) {
    this.data.isSheet = value;
  }

  get status(): SheetStatus {
    return this.data.status;
  }

  set status(value: SheetStatus) {
    this.data.status = value;
  }

  get color(): string {
    // Default color - subclasses can override
    return "#000000";
  }

  set color(_value: string) {
    // Base implementation does nothing - subclasses can override
  }

  get thumbnail(): string | null {
    // Default no thumbnail - subclasses can override
    return null;
  }

  set thumbnail(_value: string | null) {
    // Base implementation does nothing - subclasses can override
  }

  // ============================================================================
  // Experience (Value Object)
  // ============================================================================

  get experience(): IExperience {
    return this._experience;
  }

  canAffordExperience(cost: number): boolean {
    return this._experience.canAfford(cost);
  }

  spendExperience(cost: number): void {
    if (!this.canAffordExperience(cost)) {
      throw new RealmError(
        "Attempted to spend more experience than available",
        {
          fields: {
            cost: cost.toString(),
            current: this._experience.current.toString(),
          },
        }
      );
    }
    this._experience = this._experience.spend(cost);
  }

  awardExperience(amount: number): void {
    this._experience = this._experience.award(amount);
  }

  setExperienceTotal(total: number): void {
    this._experience = this._experience.setTotal(total);
  }

  setExperienceCurrent(current: number): void {
    this._experience = this._experience.setCurrent(current);
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  toData(): BaseCharacterData {
    return {
      ...this.data,
    };
  }
}
