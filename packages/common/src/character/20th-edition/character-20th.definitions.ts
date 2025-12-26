import type { ICharacter } from "../character.definitions.js";

import { z } from "zod";
import { BaseCharacterDtoSchema } from "../character.definitions";

// ===========================================================================
// 20th Edition Character Constraints & Schema
// ===========================================================================

export const Wod20CharacterConstraints = {
  AttributesSkillValues: { Min: 0, Max: 5 },
  Specialties: { MinLength: 0, MaxLength: 100 },
  Health: { Min: 7, Max: 15 },
  Willpower: { Min: 1, Max: 10 },
} as const;

export const Wod20AttributeSkillFieldSchema = z.object({
  rating: z
    .int()
    .min(Wod20CharacterConstraints.AttributesSkillValues.Min)
    .max(Wod20CharacterConstraints.AttributesSkillValues.Max),
  specialties: z
    .array(
      z
        .string()
        .min(Wod20CharacterConstraints.Specialties.MinLength)
        .max(Wod20CharacterConstraints.Specialties.MaxLength)
    )
    .default([])
    .readonly(),
});
export type Wod20AttributeSkillField = z.infer<
  typeof Wod20AttributeSkillFieldSchema
>;

export const Wod20AttributesSchema = z.object({
  strength: Wod20AttributeSkillFieldSchema,
  dexterity: Wod20AttributeSkillFieldSchema,
  stamina: Wod20AttributeSkillFieldSchema,
  charisma: Wod20AttributeSkillFieldSchema,
  manipulation: Wod20AttributeSkillFieldSchema,
  appearance: Wod20AttributeSkillFieldSchema,
  perception: Wod20AttributeSkillFieldSchema,
  intelligence: Wod20AttributeSkillFieldSchema,
  wits: Wod20AttributeSkillFieldSchema,
});
export type Wod20Attributes = z.infer<typeof Wod20AttributesSchema>;

export const Wod20SkillsSchema = z.object({
  // Talents
  alertness: Wod20AttributeSkillFieldSchema,
  athletics: Wod20AttributeSkillFieldSchema,
  awareness: Wod20AttributeSkillFieldSchema,
  brawl: Wod20AttributeSkillFieldSchema,
  empathy: Wod20AttributeSkillFieldSchema,
  expression: Wod20AttributeSkillFieldSchema,
  intimidation: Wod20AttributeSkillFieldSchema,
  leadership: Wod20AttributeSkillFieldSchema,
  streetwise: Wod20AttributeSkillFieldSchema,
  subterfuge: Wod20AttributeSkillFieldSchema,
  // Skills
  animalKen: Wod20AttributeSkillFieldSchema,
  crafts: Wod20AttributeSkillFieldSchema,
  drive: Wod20AttributeSkillFieldSchema,
  etiquette: Wod20AttributeSkillFieldSchema,
  firearms: Wod20AttributeSkillFieldSchema,
  larceny: Wod20AttributeSkillFieldSchema,
  melee: Wod20AttributeSkillFieldSchema,
  performance: Wod20AttributeSkillFieldSchema,
  stealth: Wod20AttributeSkillFieldSchema,
  survival: Wod20AttributeSkillFieldSchema,
  // Knowledges
  academics: Wod20AttributeSkillFieldSchema,
  computer: Wod20AttributeSkillFieldSchema,
  finance: Wod20AttributeSkillFieldSchema,
  investigation: Wod20AttributeSkillFieldSchema,
  law: Wod20AttributeSkillFieldSchema,
  medicine: Wod20AttributeSkillFieldSchema,
  occult: Wod20AttributeSkillFieldSchema,
  politics: Wod20AttributeSkillFieldSchema,
  science: Wod20AttributeSkillFieldSchema,
  technology: Wod20AttributeSkillFieldSchema,
});
export type Wod20Skills = z.infer<typeof Wod20SkillsSchema>;

export const HealthTracker20thFieldSchema = z
  .object({
    total: z
      .int()
      .min(Wod20CharacterConstraints.Health.Min)
      .max(Wod20CharacterConstraints.Health.Max),
    bashing: z.int().min(0).default(0),
    lethal: z.int().min(0).default(0),
    aggravated: z.int().min(0).default(0),
  })
  .refine(
    (data) => data.bashing + data.lethal + data.aggravated <= data.total,
    {
      message: "Damage cannot exceed Total Health",
    }
  );
export type HealthTracker20thField = z.infer<
  typeof HealthTracker20thFieldSchema
>;

export const Character20thSchema = BaseCharacterDtoSchema.extend({
  attributes: Wod20AttributeSkillFieldSchema,
});
export type Character20thDto = z.infer<typeof Character20thSchema>;

// ===========================================================================
// 20th Edition Character Entity Interfaces
// ===========================================================================

/**
 * Base character interface for 20th Anniversary game systems.
 */
export interface ICharacter20th extends ICharacter {
  // 20th Anniversary specific mechanics
  get willpower(): IWillpowerTracker20th;
  get health(): IHealthTracker20th;
  get attributes(): Wod20Attributes;
  get skills(): Wod20Skills;

  toDto(): Character20thDto;
}

/**
 * 20th Anniversary Attribute Value object
 */
export interface IAttributeSkill20th extends Wod20AttributeSkillField {
  readonly rating: number;
  readonly specialties: readonly string[];

  hasSpecialty(specialty: string): boolean;
  addSpecialty(specialty: string): IAttributeSkill20th;
  removeSpecialty(specialty: string): IAttributeSkill20th;
  setRating(rating: number): IAttributeSkill20th;
  increaseRating(): IAttributeSkill20th;
  decreaseRating(): IAttributeSkill20th;
}

/**
 * Health tracker interface for 20th Anniversary.
 */
export interface IHealthTracker20th extends HealthTracker20thField {
  readonly total: number;
  readonly bashing: number;
  readonly lethal: number;
  readonly aggravated: number;

  // Methods
  takeDamage(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th;
  heal(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th;
  setCurrent(damage: {
    bashing?: number;
    lethal?: number;
    aggravated?: number;
  }): IHealthTracker20th;
  setTotal(value: number): IHealthTracker20th;
  addTotal(amount: number): IHealthTracker20th;
  removeTotal(amount: number): IHealthTracker20th;
}

/**
 * Willpower tracker interface for 20th Anniversary.
 */
export interface IWillpowerTracker20th {
  readonly total: number;
  readonly current: number;

  // Methods
  spend(amount: number): IWillpowerTracker20th;
  restore(amount: number): IWillpowerTracker20th;
  setCurrent(value: number): IWillpowerTracker20th;
  setTotal(value: number): IWillpowerTracker20th;
  addTotal(amount: number): IWillpowerTracker20th;
  removeTotal(amount: number): IWillpowerTracker20th;
}
