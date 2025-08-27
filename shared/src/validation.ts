/**
 * Zod validation schemas for character data
 * These provide validation at API boundaries while keeping your TypeScript interfaces clean
 */

import { z } from "zod";

// Base validation schemas
export const SplatsSchema = z.enum([
  "vampire5th",
  "hunter5th",
  "werewolf5th",
  "human5th",
  "ghoul5th",
  "vampire20th",
  "werewolf20th",
  "changeling20th",
  "mage20th",
  "demon20th",
  "wraith20th",
  "human20th",
  "ghoul20th",
]);

export const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const ExperienceSchema = z
  .object({
    current: z.number().int().min(0).max(2000),
    total: z.number().int().min(0).max(2000),
  })
  .refine((data) => data.current <= data.total, {
    message: "Current experience cannot exceed total experience",
    path: ["current"], // This tells Zod which field the error is associated with
  });

export const ExperienceSpendSchema = z.object({
  name: z.string().min(1),
  cost: z.number().int(),
});

export const ExperienceSpendsSchema = z.array(ExperienceSpendSchema);

// Attribute/Skill validation schemas for 20th Anniversary (0-10 range)
export const Attribute20thSchema = z.object({
  value: z.number().int().min(0).max(10),
  specialties: z.array(z.string()).optional(),
});

export const Skill20thSchema = z.object({
  value: z.number().int().min(0).max(10),
  specialties: z.array(z.string()).optional(),
});

// Attribute/Skill validation schemas for 5th Edition (1-5 range for attributes, 0-5 for skills)
export const Attribute5thSchema = z.object({
  value: z.number().int().min(1).max(5),
});

export const Skill5thSchema = z.object({
  value: z.number().int().min(0).max(5),
  specialties: z.array(z.string()).optional(),
});

// 5th Edition Attributes schema
export const Attributes5thSchema = z.object({
  // Physical
  strength: Attribute5thSchema,
  dexterity: Attribute5thSchema,
  stamina: Attribute5thSchema,
  // Social
  charisma: Attribute5thSchema,
  manipulation: Attribute5thSchema,
  composure: Attribute5thSchema,
  // Mental
  intelligence: Attribute5thSchema,
  wits: Attribute5thSchema,
  resolve: Attribute5thSchema,
});

// 5th Edition Skills schema
export const Skills5thSchema = z.object({
  // Physical
  athletics: Skill5thSchema,
  brawl: Skill5thSchema,
  craft: Skill5thSchema,
  drive: Skill5thSchema,
  firearms: Skill5thSchema,
  larceny: Skill5thSchema,
  melee: Skill5thSchema,
  stealth: Skill5thSchema,
  survival: Skill5thSchema,
  // Social
  animal_ken: Skill5thSchema,
  etiquette: Skill5thSchema,
  insight: Skill5thSchema,
  intimidation: Skill5thSchema,
  leadership: Skill5thSchema,
  performance: Skill5thSchema,
  persuasion: Skill5thSchema,
  streetwise: Skill5thSchema,
  subterfuge: Skill5thSchema,
  // Mental
  academics: Skill5thSchema,
  awareness: Skill5thSchema,
  finance: Skill5thSchema,
  investigation: Skill5thSchema,
  medicine: Skill5thSchema,
  occult: Skill5thSchema,
  politics: Skill5thSchema,
  science: Skill5thSchema,
  technology: Skill5thSchema,
});

// Damage/Health tracking schemas
export const DamageTracker5thSchema = z
  .object({
    total: z.number().int().min(2).max(20),
    superficial: z.number().int().min(0),
    aggravated: z.number().int().min(0),
  })
  .refine((data) => data.superficial + data.aggravated <= data.total, {
    message: "Damage cannot exceed total health",
  });

export const Humanity5thSchema = z
  .object({
    current: z.number().int().min(0).max(10),
    stains: z.number().int().min(0).max(10),
  })
  .refine((data) => data.stains <= 10 - data.current, {
    message: "Stains cannot exceed available humanity slots",
  });

// Advantage schemas
export const AdvantageSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Merit", "Background", "Flaw", "Haven", "Loresheet"]),
  description: z.string(),
  level: z.number().int().min(0).max(5),
  flaw: z.boolean(),
});

export const AdvantagesSchema = z.record(z.string(), AdvantageSchema);

export const HavenDetailsSchema = z.object({
  name: z.string(),
  location: z.string(),
  description: z.string(),
});

// Discipline and Power schemas for complex nested updates
export const DisciplinePowerSchema = z.object({
  power_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  level: z.number().int().min(1).max(5),
  cost: z.string().optional(),
  dice_pool: z.string().optional(),
});

export const DisciplineSchema = z.object({
  discipline_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  level: z.number().int().min(0).max(5),
  powers: z.record(z.string(), DisciplinePowerSchema),
});

export const DisciplinesSchema = z.record(z.string(), DisciplineSchema);

// Core character data schemas
export const CoreDataSchema = z.object({
  avatar: z.string(),
  embedColor: HexColorSchema,
  experiance: ExperienceSchema,
  expSpends: ExperienceSpendsSchema,
  storytellerLock: z.boolean(),
  dataOfBirth: z.string(),
  age: z.string(),
  history: z.string(),
  appearanceDescription: z.string(),
  notes: z.string(),
  notes2: z.string(),
});

export const Core5thDataSchema = CoreDataSchema.extend({
  willpower: DamageTracker5thSchema,
  health: DamageTracker5thSchema,
  attributes: Attributes5thSchema,
  skills: Skills5thSchema,
  ambition: z.string(),
  desire: z.string(),
  convictions: z.string(),
  touchstones: z.string(),
  tenets: z.string(),
  havens: z.array(HavenDetailsSchema),
  advantages: AdvantagesSchema,
});

export const Vampire5thDataSchema = Core5thDataSchema.extend({
  humanity: Humanity5thSchema,
  hunger: z.number().int().min(0).max(5),
  bloodPotency: z.number().int().min(0).max(5),
  predatorType: z.string().nullable(),
  clan: z.string().nullable(),
  sire: z.string().nullable(),
  generation: z.number().int().nullable(),
  huntingRoll: z.string().nullable(),
  data_of_death: z.string().nullable(),
  apparent_age: z.string().nullable(),
  disciplines: DisciplinesSchema,
});

// Partial update schemas for complex nested updates
export const PartialDisciplinePowerSchema =
  DisciplinePowerSchema.partial().extend({
    power_id: z.string(), // ID is always required for identification
  });

export const PartialDisciplineSchema = DisciplineSchema.partial().extend({
  discipline_id: z.string(), // ID is always required for identification
  powers: z
    .record(z.string(), PartialDisciplinePowerSchema.nullable())
    .optional(),
});

export const PartialDisciplinesUpdateSchema = z.record(
  z.string(),
  PartialDisciplineSchema.nullable()
);

// Partial character update schema
export const PartialCharacterUpdateSchema = z.object({
  characterId: z.string(),
  splat: SplatsSchema,
  // Individual field updates - all optional
  hunger: z.number().int().min(0).max(5).optional(),
  bloodPotency: z.number().int().min(0).max(5).optional(),
  humanity: Humanity5thSchema.optional(),
  // Complex nested updates
  disciplines: PartialDisciplinesUpdateSchema.optional(),
  // Add other fields as needed
});

// Discriminated union for all character data types
export const CharacterDataSchema = z.discriminatedUnion("splat", [
  z.object({
    splat: z.literal("vampire5th"),
    data: Vampire5thDataSchema,
  }),
  // Add more splats as needed
]);

/**
 * Validation functions for different trust boundaries
 */
export const validateCharacterData = (
  data: unknown
): {
  success: boolean;
  data?: z.infer<typeof CharacterDataSchema>;
  error?: string;
} => {
  try {
    const result = CharacterDataSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

export const validateVampire5thData = (
  data: unknown
): {
  success: boolean;
  data?: z.infer<typeof Vampire5thDataSchema>;
  error?: string;
} => {
  try {
    const result = Vampire5thDataSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

export const validatePartialCharacterUpdate = (
  data: unknown
): {
  success: boolean;
  data?: z.infer<typeof PartialCharacterUpdateSchema>;
  error?: string;
} => {
  try {
    const result = PartialCharacterUpdateSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

export const validateDisciplinesUpdate = (
  data: unknown
): {
  success: boolean;
  data?: z.infer<typeof PartialDisciplinesUpdateSchema>;
  error?: string;
} => {
  try {
    const result = PartialDisciplinesUpdateSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown validation error" };
  }
};

// Export inferred types for TypeScript integration
export type SplatsType = z.infer<typeof SplatsSchema>;
export type HexColorType = z.infer<typeof HexColorSchema>;
export type ExperienceType = z.infer<typeof ExperienceSchema>;
export type DisciplineType = z.infer<typeof DisciplineSchema>;
export type DisciplinePowerType = z.infer<typeof DisciplinePowerSchema>;
export type Vampire5thDataType = z.infer<typeof Vampire5thDataSchema>;
export type CharacterDataType = z.infer<typeof CharacterDataSchema>;
export type PartialCharacterUpdateType = z.infer<
  typeof PartialCharacterUpdateSchema
>;
export type PartialDisciplinesUpdateType = z.infer<
  typeof PartialDisciplinesUpdateSchema
>;
