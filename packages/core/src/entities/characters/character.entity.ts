import type {
  BaseCharacterData,
  ICharacter,
  IExperience,
  Snowflake,
  Splat,
  SheetStatus,
} from "@realm/common";

import { UserError, NameSchema, BaseCharacterDataSchema } from "@realm/common";
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
 */
export abstract class Character implements ICharacter {
  protected data: BaseCharacterData;
  protected _experience: IExperience;

  constructor(data: BaseCharacterData) {
    // Validate Data with Zod schema
    const validated = BaseCharacterDataSchema.parse(data);
    this.data = validated;

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
    // Use Zod for validation
    const validated = NameSchema.parse(value);
    this.data.name = validated;
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
      throw new UserError(
        `Insufficient experience. Need ${cost}, have ${this._experience.current}`,
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
