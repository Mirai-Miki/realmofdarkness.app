import type { ICharacter } from "../character.definitions.js";

import { z } from "zod";
import { BaseCharacterDtoSchema } from "../character.definitions";

// ============================================================================
// 5th Edition Character Constraints & Schema
// ============================================================================

export const Character5thConstraints = {
  Attribute: { Min: 1, Max: 5 },
  Skill: { Min: 0, Max: 5 },
  Specialty: { MinLength: 1, MaxLength: 100 },
  DamageTotal: { Min: 0, Max: 20 },
} as const;

export const Skill5thFieldSchema = z.object({
  rating: z
    .int()
    .min(Character5thConstraints.Skill.Min)
    .max(Character5thConstraints.Skill.Max),
  specialties: z
    .array(
      z
        .string()
        .min(Character5thConstraints.Specialty.MinLength)
        .max(Character5thConstraints.Specialty.MaxLength)
    )
    .default([])
    .readonly(),
});
export type Skill5thField = z.infer<typeof Skill5thFieldSchema>;

const Wod5AttributeSchema = z
  .int()
  .min(Character5thConstraints.Attribute.Min)
  .max(Character5thConstraints.Attribute.Max);

export const Wod5AttributesSchema = z.object({
  strength: Wod5AttributeSchema,
  dexterity: Wod5AttributeSchema,
  stamina: Wod5AttributeSchema,
  charisma: Wod5AttributeSchema,
  manipulation: Wod5AttributeSchema,
  composure: Wod5AttributeSchema,
  intelligence: Wod5AttributeSchema,
  wits: Wod5AttributeSchema,
  resolve: Wod5AttributeSchema,
});
export type Wod5Attributes = z.infer<typeof Wod5AttributesSchema>;

export const Wod5SkillsSchema = z.object({
  // Physical
  athletics: Skill5thFieldSchema,
  brawl: Skill5thFieldSchema,
  craft: Skill5thFieldSchema,
  drive: Skill5thFieldSchema,
  firearms: Skill5thFieldSchema,
  melee: Skill5thFieldSchema,
  larceny: Skill5thFieldSchema,
  stealth: Skill5thFieldSchema,
  survival: Skill5thFieldSchema,
  // Social
  animalKen: Skill5thFieldSchema,
  etiquette: Skill5thFieldSchema,
  insight: Skill5thFieldSchema,
  intimidation: Skill5thFieldSchema,
  leadership: Skill5thFieldSchema,
  performance: Skill5thFieldSchema,
  persuasion: Skill5thFieldSchema,
  streetwise: Skill5thFieldSchema,
  subterfuge: Skill5thFieldSchema,
  // Mental
  academics: Skill5thFieldSchema,
  awareness: Skill5thFieldSchema,
  finance: Skill5thFieldSchema,
  investigation: Skill5thFieldSchema,
  medicine: Skill5thFieldSchema,
  occult: Skill5thFieldSchema,
  politics: Skill5thFieldSchema,
  science: Skill5thFieldSchema,
  technology: Skill5thFieldSchema,
});
export type Wod5Skills = z.infer<typeof Wod5SkillsSchema>;

export const DamageTracker5thFieldSchema = z
  .object({
    total: z
      .int()
      .min(Character5thConstraints.DamageTotal.Min)
      .max(Character5thConstraints.DamageTotal.Max),
    superficial: z.int().min(0).default(0),
    aggravated: z.int().min(0).default(0),
  })
  .refine((data) => data.superficial + data.aggravated <= data.total, {
    message: "Damage cannot exceed total tracker boxes",
  });
export type DamageTracker5thField = z.infer<typeof DamageTracker5thFieldSchema>;

export const Character5thSchema = BaseCharacterDtoSchema.extend({});
export type Character5thDto = z.infer<typeof Character5thSchema>;

// ============================================================================
// 5th Edition Character Entity Interfaces
// ============================================================================

/**
 * Base character interface for all 5th Edition game systems.
 */
export interface ICharacter5th extends ICharacter {
  // 5th Edition specific mechanics (value objects - immutable)
  get willpower(): IDamageTracker5th;
  get health(): IDamageTracker5th;

  // Attributes
  get attributes(): Wod5Attributes;

  // Skills (value objects)
  get skills(): Wod5Skills;

  toDto(): Character5thDto;
}

/**
 * Damage tracker interface for 5th Edition games.
 * Immutable value object - all operations return new instances.
 */
export interface IDamageTracker5th extends DamageTracker5thField {
  readonly total: number;
  readonly superficial: number;
  readonly aggravated: number;

  totalDamage(): number; // superficial + aggravated
  isImpaired(): boolean; // Every box has damage
  isUndamaged(): boolean; // No damage taken
  isIncapacitated(): boolean; // aggravated == total

  takeSuperficial(amount: number): IDamageTracker5th;
  takeAggravated(amount: number): IDamageTracker5th;
  healSuperficial(amount: number): IDamageTracker5th;
  healAggravated(amount: number): IDamageTracker5th;
  setDamage(damage: {
    superficial?: number;
    aggravated?: number;
  }): IDamageTracker5th;
  setTotal(total: number): IDamageTracker5th;
}

/**
 * Skill value object interface for 5th Edition.
 * Immutable - all operations return new instances.
 */
export interface ISkill5th extends Skill5thField {
  readonly rating: number;
  readonly specialties: readonly string[];

  hasSpecialty(specialty: string): boolean;
  addSpecialty(specialty: string): ISkill5th;
  removeSpecialty(specialty: string): ISkill5th;
  setRating(rating: number): ISkill5th;
  increaseRating(): ISkill5th;
  decreaseRating(): ISkill5th;
}
