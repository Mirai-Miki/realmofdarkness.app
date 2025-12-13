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

import { z } from "zod";
import { SnowflakeSchema } from "primitives";

export const CHARACTER_RULES = {
  name: {
    minLength: 1,
    maxLength: 50,
    regex: /^(?!~).*$/, // Cannot start ~ as it's reserved for system use
  },
  experience: {
    min: 0,
    max: 5000,
  },
  experienceSpend: {
    description: { minLength: 1, maxLength: 200 },
    costMin: 0,
    costMax: 200,
  },
  dateOfBirth: { minLength: 0, maxLength: 20 },
  age: { minLength: 0, maxLength: 20 },
  history: { minLength: 0, maxLength: 5000 },
  appearanceDescription: { minLength: 0, maxLength: 1000 },
  notes: { minLength: 0, maxLength: 5000 },
  notes2: { minLength: 0, maxLength: 5000 },
} as const;

// ============================================================================
// Core Identity Fields
// ============================================================================

/**
 * Character name with business rule validation
 */
export const NameField = z
  .string()
  .min(CHARACTER_RULES.name.minLength)
  .max(CHARACTER_RULES.name.maxLength)
  .regex(CHARACTER_RULES.name.regex, {
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
  .number()
  .int()
  .min(CHARACTER_RULES.experience.min)
  .max(CHARACTER_RULES.experience.max);

/**
 * Total experience points earned
 */
export const ExperienceTotalField = z
  .number()
  .int()
  .min(CHARACTER_RULES.experience.min)
  .max(CHARACTER_RULES.experience.max);
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
    .max(CHARACTER_RULES.experienceSpend.description.maxLength),
  cost: z
    .number()
    .int()
    .min(CHARACTER_RULES.experienceSpend.costMin)
    .max(CHARACTER_RULES.experienceSpend.costMax),
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
  .min(CHARACTER_RULES.dateOfBirth.minLength)
  .max(CHARACTER_RULES.dateOfBirth.maxLength);

/**
 * Character age (freeform text)
 */
export const AgeField = z
  .string()
  .min(CHARACTER_RULES.age.minLength)
  .max(CHARACTER_RULES.age.maxLength);

/**
 * Character history/background
 */
export const HistoryField = z
  .string()
  .min(CHARACTER_RULES.history.minLength)
  .max(CHARACTER_RULES.history.maxLength);

/**
 * Appearance description
 */
export const AppearanceDescriptionField = z
  .string()
  .min(CHARACTER_RULES.appearanceDescription.minLength)
  .max(CHARACTER_RULES.appearanceDescription.maxLength);

/**
 * Notes field 1
 */
export const NotesField = z
  .string()
  .min(CHARACTER_RULES.notes.minLength)
  .max(CHARACTER_RULES.notes.maxLength);

/**
 * Notes field 2
 */
export const Notes2Field = z
  .string()
  .min(CHARACTER_RULES.notes2.minLength)
  .max(CHARACTER_RULES.notes2.maxLength);

// ============================================================================
// Base Character Data Schema
// ============================================================================

export const BaseCharacterDataSchema = z.object({
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  guildId: SnowflakeSchema.nullable(),
  name: NameField,
  status: SheetStatusField,
  isSheet: IsSheetField,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BaseCharacterData = z.infer<typeof BaseCharacterDataSchema>;
