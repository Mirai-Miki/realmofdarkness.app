import { z } from "zod";
import { CoreDataSchema } from "./base-validations";

// Attribute/Skill validation schemas for 20th Anniversary (0-10 range)
export const Attribute20thSchema = z.object({
  value: z.number().int().min(0).max(10),
  specialties: z.array(z.string()),
});

export const Skill20thSchema = z.object({
  value: z.number().int().min(0).max(10),
  specialties: z.array(z.string()),
});

// 20th Anniversary Health tracking schema (different from 5th edition)
export const Health20thSchema = z
  .object({
    total: z.number().int().min(7).max(20),
    bashing: z.number().int().min(0).max(20),
    lethal: z.number().int().min(0).max(20),
    aggravated: z.number().int().min(0).max(20),
  })
  .refine((data) => data.bashing + data.lethal + data.aggravated > data.total, {
    message: "Total damage cannot exceed health total",
  });

export const Willpower20thSchema = z
  .object({
    total: z.number().int().min(1).max(20),
    current: z.number().int().min(0).max(20),
  })
  .refine((data) => data.current > data.total, {
    message: "Current willpower cannot exceed total willpower",
  });

// 20th Anniversary Attributes schema
export const Attributes20thSchema = z.object({
  // Physical
  strength: Attribute20thSchema,
  dexterity: Attribute20thSchema,
  stamina: Attribute20thSchema,
  // Social
  charisma: Attribute20thSchema,
  manipulation: Attribute20thSchema,
  appearance: Attribute20thSchema,
  // Mental
  perception: Attribute20thSchema,
  intelligence: Attribute20thSchema,
  wits: Attribute20thSchema,
});

// 20th Anniversary Skills schema (comprehensive)
export const Skills20thSchema = z.object({
  // Talents
  alertness: Skill20thSchema,
  athletics: Skill20thSchema,
  awareness: Skill20thSchema,
  brawl: Skill20thSchema,
  empathy: Skill20thSchema,
  expression: Skill20thSchema,
  intimidation: Skill20thSchema,
  leadership: Skill20thSchema,
  streetwise: Skill20thSchema,
  subterfuge: Skill20thSchema,
  // Skills
  animal_ken: Skill20thSchema,
  crafts: Skill20thSchema,
  drive: Skill20thSchema,
  etiquette: Skill20thSchema,
  firearms: Skill20thSchema,
  larceny: Skill20thSchema,
  melee: Skill20thSchema,
  performance: Skill20thSchema,
  stealth: Skill20thSchema,
  survival: Skill20thSchema,
  // Knowledges
  academics: Skill20thSchema,
  computer: Skill20thSchema,
  finance: Skill20thSchema,
  investigation: Skill20thSchema,
  law: Skill20thSchema,
  medicine: Skill20thSchema,
  occult: Skill20thSchema,
  politics: Skill20thSchema,
  science: Skill20thSchema,
  technology: Skill20thSchema,
});

// Core data schemas
export const Core20thDataSchema = CoreDataSchema.extend({
  willpower: Willpower20thSchema,
  health: Health20thSchema,
  attributes: Attributes20thSchema,
  skills: Skills20thSchema,
});
