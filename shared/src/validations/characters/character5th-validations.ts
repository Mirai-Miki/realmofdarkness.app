import { z } from "zod";
import { CoreDataSchema } from "./base-validations";
import { SnowflakeSchema } from "../misc";

export const Attribute5thSchema = z.object({
  value: z.int().min(1).max(5),
});

export const Skill5thSchema = z.object({
  value: z.int().min(0).max(5),
  specialties: z.array(z.string().min(1).max(50)),
});

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
    total: z.int().min(1).max(20),
    superficial: z.int().min(0).max(20),
    aggravated: z.int().min(0).max(20),
  })
  .refine((data) => data.superficial + data.aggravated > data.total, {
    message: "Damage cannot exceed total health",
  });

export const Humanity5thSchema = z
  .object({
    current: z.int().min(0).max(10),
    stains: z.int().min(0).max(10),
  })
  .refine((data) => data.stains > 10 - data.current, {
    message: "Stains cannot exceed available humanity slots",
  });

export const AdvantageTypes = z.enum([
  "Merit",
  "Background",
  "Flaw",
  "Haven",
  "Loresheet",
]);

// Advantage schemas
export const AdvantageSchema = z.object({
  id: SnowflakeSchema,
  name: z.string().min(0).max(50),
  type: AdvantageTypes,
  description: z.string().min(0).max(1000),
  rating: z.int().min(0).max(5),
  flaw: z.boolean(),
  modifier: z.int().min(-10).max(10),
});

export const AdvantagesSchema = z.record(SnowflakeSchema, AdvantageSchema);

export const HavenDetailsSchema = z.object({
  id: SnowflakeSchema,
  name: z.string().min(0).max(50),
  location: z.string().min(0).max(100),
  description: z.string().min(0).max(1000),
  advantages: AdvantagesSchema,
});

export const HavensSchema = z.record(SnowflakeSchema, HavenDetailsSchema);

export const Core5thDataSchema = CoreDataSchema.extend({
  willpower: DamageTracker5thSchema,
  health: DamageTracker5thSchema,
  attributes: Attributes5thSchema,
  skills: Skills5thSchema,
  ambition: z.string().min(0).max(200),
  desire: z.string().min(0).max(200),
  convictions: z.string().min(0).max(1000),
  touchstones: z.string().min(0).max(1000),
  tenets: z.string().min(0).max(100),
  havens: HavensSchema,
  advantages: AdvantagesSchema,
});

export type DamageTracker5thData = z.infer<typeof DamageTracker5thSchema>;
export type Humanity5thData = z.infer<typeof Humanity5thSchema>;
export type Skill5thData = z.infer<typeof Skill5thSchema>;
export type Attribute5thData = z.infer<typeof Attribute5thSchema>;
export type Attributes5thData = z.infer<typeof Attributes5thSchema>;
export type Skills5thData = z.infer<typeof Skills5thSchema>;
export type Haven5thData = z.infer<typeof HavenDetailsSchema>;
export type Havens5thData = z.infer<typeof HavensSchema>;
export type Advantage5thData = z.infer<typeof AdvantageSchema>;
export type Advantages5thData = z.infer<typeof AdvantagesSchema>;
