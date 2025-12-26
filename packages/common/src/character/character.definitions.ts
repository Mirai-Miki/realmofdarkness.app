/**
 * Character validation rules and constants.
 * Single source of truth for all character-related business rules.
 *
 * @remarks
 * These constants are used by both Zod schemas (input validation)
 * and Domain entities (business logic validation).
 *
 * @packageDocumentation
 */
import type { Snowflake } from "../primitives";

import { z } from "zod";
import { SnowflakeSchema } from "primitives";

// ============================================================================
// Character Constraints
// ============================================================================

/**
 * Character-related business rule constraints.
 */
export const CharacterConstraints = {
  Name: {
    MinLength: 1,
    MaxLength: 50,
    Regex: /^(?!~).*$/, // Cannot start ~ as it's reserved for system use
  },
  Experience: {
    Min: 0,
    Max: 5000,
  },
  ExperienceSpend: {
    DescriptionMinLength: 1,
    DescriptionMaxLength: 200,
    CostMin: 0,
    CostMax: 200,
  },
  DateOfBirth: { MinLength: 0, MaxLength: 20 },
  Age: { MinLength: 0, MaxLength: 20 },
  History: { MinLength: 0, MaxLength: 5000 },
  AppearanceDescription: { MinLength: 0, MaxLength: 1000 },
  Notes: { MinLength: 0, MaxLength: 5000 },
  Notes2: { MinLength: 0, MaxLength: 5000 },
} as const;

// ============================================================================
// Core Identity Fields
// ============================================================================

/**
 * Character name with business rule validation
 */
export const NameField = z
  .string()
  .min(CharacterConstraints.Name.MinLength)
  .max(CharacterConstraints.Name.MaxLength)
  .regex(CharacterConstraints.Name.Regex, {
    message: `Character name cannot start with '~' as it is reserved for system use`,
  });

/**
 * Whether this character is the active sheet for the user
 */
export const IsSheetField = z.boolean();

/**
 * Storyteller lock flag (prevents player edits)
 */
export const StorytellerLockField = z.boolean();

/**
 * Character sheet status.
 * Represents the lifecycle state of a character sheet.
 */
export const SheetStatus = {
  Draft: "Draft",
  Review: "Review",
  Active: "Active",
  Dead: "Dead",
  Archive: "Archive",
} as const;
export const SheetStatusField = z.enum(SheetStatus);
export type SheetStatus = z.infer<typeof SheetStatusField>;

/**
 * Character splats (types).
 * Defines all supported character types across V5, V20, and Chronicles of Darkness.
 */
export const Splat = {
  // 5th Edition
  Vampire5th: "vampire5th",
  Hunter5th: "hunter5th",
  Werewolf5th: "werewolf5th",
  Human5th: "human5th",
  Ghoul5th: "ghoul5th",

  // 20th Anniversary Edition
  Vampire20th: "vampire20th",
  Werewolf20th: "werewolf20th",
  Changeling20th: "changeling20th",
  Mage20th: "mage20th",
  Demon20th: "demon20th",
  Wraith20th: "wraith20th",
  Human20th: "human20th",
  Ghoul20th: "ghoul20th",
} as const;
export const SplatField = z.enum(Splat);
export type Splat = z.infer<typeof SplatField>;

// ============================================================================
// Experience Fields
// ============================================================================

/**
 * Current unspent experience points
 */
export const ExperienceCurrentField = z
  .int()
  .min(CharacterConstraints.Experience.Min)
  .max(CharacterConstraints.Experience.Max);

/**
 * Total experience points earned
 */
export const ExperienceTotalField = z
  .int()
  .min(CharacterConstraints.Experience.Min)
  .max(CharacterConstraints.Experience.Max);
/**
 * Experience tracker object with validation
 */
export const ExperienceTrackerField = z
  .object({
    current: ExperienceCurrentField,
    total: ExperienceTotalField,
  })
  .refine((data) => data.current <= data.total, {
    message: "Current experience cannot exceed total experience",
    path: ["current"],
  });

/**
 * Single experience spend entry
 */
export const ExperienceSpendData = z.object({
  description: z
    .string()
    .max(CharacterConstraints.ExperienceSpend.DescriptionMaxLength),
  cost: z
    .int()
    .min(CharacterConstraints.ExperienceSpend.CostMin)
    .max(CharacterConstraints.ExperienceSpend.CostMax),
});

/**
 * Collection of experience spends keyed by snowflake ID
 */
export const ExperienceSpendsField = z.array(ExperienceSpendData);

// ============================================================================
// Character Profile Fields
// ============================================================================

/**
 * Date of birth (freeform text)
 */
export const DateOfBirthField = z
  .string()
  .min(CharacterConstraints.DateOfBirth.MinLength)
  .max(CharacterConstraints.DateOfBirth.MaxLength);

/**
 * Character age (freeform text)
 */
export const AgeField = z
  .string()
  .min(CharacterConstraints.Age.MinLength)
  .max(CharacterConstraints.Age.MaxLength);

/**
 * Character history/background
 */
export const HistoryField = z
  .string()
  .min(CharacterConstraints.History.MinLength)
  .max(CharacterConstraints.History.MaxLength);

/**
 * Appearance description
 */
export const AppearanceDescriptionField = z
  .string()
  .min(CharacterConstraints.AppearanceDescription.MinLength)
  .max(CharacterConstraints.AppearanceDescription.MaxLength);

/**
 * Notes field 1
 */
export const NotesField = z
  .string()
  .min(CharacterConstraints.Notes.MinLength)
  .max(CharacterConstraints.Notes.MaxLength);

/**
 * Notes field 2
 */
export const Notes2Field = z
  .string()
  .min(CharacterConstraints.Notes2.MinLength)
  .max(CharacterConstraints.Notes2.MaxLength);

// ============================================================================
// Base Character DTO Schema
// ============================================================================

export const ExperienceFieldSchema = z
  .object({
    current: z
      .int()
      .min(CharacterConstraints.Experience.Min)
      .max(CharacterConstraints.Experience.Max),
    total: z
      .int()
      .min(CharacterConstraints.Experience.Min)
      .max(CharacterConstraints.Experience.Max),
  })
  .refine((data) => data.current <= data.total, {
    message: "Current experience cannot exceed total experience",
    path: ["current"],
  });
export type ExperienceField = z.infer<typeof ExperienceFieldSchema>;

export const BaseCharacterDtoSchema = z.object({
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema.nullable(),
  name: NameField,
  status: SheetStatusField,
  isSheet: IsSheetField,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BaseCharacterDto = z.infer<typeof BaseCharacterDtoSchema>;

// ============================================================================
// Entity Interfaces
// ============================================================================

/**
 * Base character entity interface.
 * Represents common data and behavior across all character types.
 */
export interface ICharacter {
  // Getters for identity (read-only)
  get id(): Snowflake;
  get userId(): Snowflake;
  get splat(): Splat;
  get createdAt(): Date;
  get lastUpdated(): Date;

  // Getters/setters for mutable properties
  get name(): string;
  set name(value: string);

  get guildId(): Snowflake | null;
  set guildId(value: Snowflake | null);

  get isSheet(): boolean;
  set isSheet(value: boolean);

  get status(): SheetStatus;
  set status(value: SheetStatus);

  get color(): string;
  set color(value: string);

  get thumbnail(): string | null;
  set thumbnail(value: string | null);

  // Experience (value object with immutable updates)
  get experience(): IExperience;

  // Methods
  /**
   * Get a plain object representation suitable for persistence.
   */
  toDto(): BaseCharacterDto;

  /**
   * Validate the character is in a valid state.
   */
  validate(): IValidationResult;

  /**
   * Check if character can afford an experience cost.
   */
  canAffordExperience(cost: number): boolean;

  /**
   * Spend experience points.
   * Replaces the experience value object with a new instance.
   */
  spendExperience(cost: number): void;

  /**
   * Award experience points.
   * Replaces the experience value object with a new instance.
   */
  awardExperience(amount: number): void;

  /**
   * Set total experience (for character creation/loading).
   */
  setExperienceTotal(total: number): void;

  /**
   * Set current unspent experience.
   */
  setExperienceCurrent(current: number): void;
}

/**
 * Experience value object interface.
 * Immutable - all operations return new instances.
 */
export interface IExperience extends ExperienceField {
  readonly current: number;
  readonly total: number;

  canAfford(cost: number): boolean;
  spend(cost: number): IExperience;
  award(amount: number): IExperience;
  setTotal(total: number): IExperience;
  setCurrent(current: number): IExperience;
}

/**
 * Validation result interface.
 */
export interface IValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}
