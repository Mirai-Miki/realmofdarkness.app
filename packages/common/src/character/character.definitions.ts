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
import { SnowflakeSchema } from "../primitives";

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
export const CharacterNameSchema = z
  .string()
  .min(CharacterConstraints.Name.MinLength)
  .max(CharacterConstraints.Name.MaxLength)
  .regex(CharacterConstraints.Name.Regex, {
    message: `Character name cannot start with '~' as it is reserved for system use`,
  });
export type CharacterName = z.infer<typeof CharacterNameSchema>;

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
export const SheetStatusSchema = z.enum(SheetStatus);
export type SheetStatus = z.infer<typeof SheetStatusSchema>;

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
export const SplatSchema = z.enum(Splat);
export type Splat = z.infer<typeof SplatSchema>;

// ============================================================================
// Experience Fields
// ============================================================================

/**
 * Current unspent experience points
 */
export const ExperienceCurrentSchema = z
  .int()
  .min(CharacterConstraints.Experience.Min)
  .max(CharacterConstraints.Experience.Max);

/**
 * Total experience points earned
 */
export const ExperienceTotalSchema = z
  .int()
  .min(CharacterConstraints.Experience.Min)
  .max(CharacterConstraints.Experience.Max);
/**
 * Experience tracker object with validation
 */
export const ExperienceTrackerSchema = z
  .object({
    current: ExperienceCurrentSchema,
    total: ExperienceTotalSchema,
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
export const ExperienceSpendsSchema = z.array(ExperienceSpendData);

// ============================================================================
// Character Profile Fields
// ============================================================================

/**
 * Date of birth (freeform text)
 */
export const DateOfBirthSchema = z
  .string()
  .min(CharacterConstraints.DateOfBirth.MinLength)
  .max(CharacterConstraints.DateOfBirth.MaxLength);

/**
 * Character age (freeform text)
 */
export const AgeSchema = z
  .string()
  .min(CharacterConstraints.Age.MinLength)
  .max(CharacterConstraints.Age.MaxLength);

/**
 * Character history/background
 */
export const HistorySchema = z
  .string()
  .min(CharacterConstraints.History.MinLength)
  .max(CharacterConstraints.History.MaxLength);

/**
 * Appearance description
 */
export const AppearanceDescriptionSchema = z
  .string()
  .min(CharacterConstraints.AppearanceDescription.MinLength)
  .max(CharacterConstraints.AppearanceDescription.MaxLength);

/**
 * Notes field 1
 */
export const NotesSchema = z
  .string()
  .min(CharacterConstraints.Notes.MinLength)
  .max(CharacterConstraints.Notes.MaxLength);

/**
 * Notes field 2
 */
export const Notes2Schema = z
  .string()
  .min(CharacterConstraints.Notes2.MinLength)
  .max(CharacterConstraints.Notes2.MaxLength);

// ============================================================================
// Base Character DTO Schema
// ============================================================================

export const ExperienceDataSchema = z
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
export type ExperienceData = z.infer<typeof ExperienceDataSchema>;

export const BaseCharacterDataSchema = z.object({
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema.nullable(),
  name: CharacterNameSchema,
  status: SheetStatusSchema,
  isSheet: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BaseCharacterData = z.infer<typeof BaseCharacterDataSchema>;

/**
 * Union of all possible character data types.
 * Currently defined as an intersection for flexibility until all splats are defined.
 */
export type CharacterData = BaseCharacterData & {
  splat: Splat;
  [key: string]: unknown;
};

/**
 * Input Data for creating & updating a character.
 */
export type CharacterRepositoryInput = CharacterData;

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
  get name(): CharacterName;
  set name(value: CharacterName);

  get guildId(): Snowflake | null;
  set guildId(value: Snowflake | null);

  get isSheet(): boolean;
  set isSheet(value: boolean);

  get status(): SheetStatus;
  set status(value: SheetStatus);

  // Experience (value object with immutable updates)
  get experience(): IExperience;

  // Methods
  /**
   * Get a plain object representation suitable for persistence.
   */
  toData(): BaseCharacterData;

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
export interface IExperience extends ExperienceData {
  readonly current: number;
  readonly total: number;

  canAfford(cost: number): boolean;
  spend(cost: number): IExperience;
  award(amount: number): IExperience;
  setTotal(total: number): IExperience;
  setCurrent(current: number): IExperience;
}

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * Repository interface for Character entity persistence.
 */
export interface ICharacterRepository {
  /**
   * Find a character by ID.
   */
  findById(id: Snowflake): Promise<CharacterData | null>;

  /**
   * Find all characters belonging to a user.
   */
  findByUser(userId: Snowflake): Promise<CharacterData[]>;

  /**
   * Create a new character.
   */
  create(input: CharacterData): Promise<CharacterData>;

  /**
   * Update an existing character.
   */
  update(input: CharacterData): Promise<CharacterData>;
  update(
    input: CharacterData,
    options: { ignoreNotFound: true }
  ): Promise<CharacterData | null>;

  /**
   * Upsert a character.
   */
  upsert(input: CharacterData): Promise<CharacterData>;

  /**
   * Delete a character by ID.
   */
  delete(id: Snowflake): Promise<void>;

  /**
   * Check if a character exists.
   */
  exists(id: Snowflake): Promise<boolean>;
}
