import { z } from "zod";
import {
  Core5thDataSchema,
  Humanity5thSchema,
} from "./character5th-validations";
import { SnowflakeSchema } from "../misc";

// Discipline and Power schemas for complex nested updates
export const DisciplinePowerSchema = z.object({
  id: SnowflakeSchema,
  name: z.string().min(0).max(50),
  level: z.int().min(1).max(5),
  amalgam: z.string().min(0).max(100),
  description: z.string().min(0).max(2000),
  system: z.string().min(0).max(2000),
  cost: z.string().min(0).max(100),
  dicePool: z.string().min(0).max(200),
  duration: z.string().min(0).max(100),
});

export const DisciplinePowersSchema = z.record(
  SnowflakeSchema,
  DisciplinePowerSchema
);

export const DisciplineSchema = z.object({
  id: SnowflakeSchema,
  name: z.string().min(0).max(50),
  description: z.string().min(0).max(4000),
  characteristics: z.string().min(0).max(3000),
  rating: z.int().min(0).max(5),
  powers: DisciplinePowersSchema,
});

export const DisciplinesSchema = z.record(SnowflakeSchema, DisciplineSchema);

// Partial update schemas for complex nested updates
export const PartialDisciplinePowerSchema =
  DisciplinePowerSchema.partial().extend({
    id: SnowflakeSchema, // ID is always required for identification
  });

export const PartialDisciplineSchema = DisciplineSchema.partial().extend({
  id: SnowflakeSchema, // ID is always required for identification
  powers: z
    .record(SnowflakeSchema, PartialDisciplinePowerSchema.nullable())
    .optional(),
});

export const PartialDisciplinesUpdateSchema = z.record(
  z.string(),
  PartialDisciplineSchema.nullable()
);

export const Vampire5thDataSchema = Core5thDataSchema.extend({
  humanity: Humanity5thSchema,
  hunger: z.int().min(0).max(5),
  bloodPotency: z.int().min(0).max(10),
  predatorType: z.string().min(0).max(100),
  clan: z.string().min(0).max(50),
  sire: z.string().min(0).max(50),
  generation: z.int().min(0).max(18),
  huntingRoll: z.string().min(0).max(100),
  dataOfDeath: z.string().min(0).max(20),
  apparentAge: z.string().min(0).max(50),
  disciplines: DisciplinesSchema,
});

export type DisciplinesData = z.infer<typeof DisciplinesSchema>;
