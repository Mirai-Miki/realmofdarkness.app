/**
 * Zod validation schemas for character data
 * These provide validation at API boundaries while keeping your TypeScript interfaces clean
 */

import { z } from "zod";
import { Splats, SheetStatus } from "types";
import { DiscordUrlSchema, HexColorSchema, SnowflakeSchema } from "../misc";

export const NameSchema = z
  .string()
  .min(1)
  .max(50)
  .refine((name) => !name.startsWith("~"), {
    message: "Character name cannot start with '~'",
  });

export const SplatsSchema = z.enum(
  Object.values(Splats) as [string, ...string[]]
);

export const SheetStatusSchema = z.enum(
  Object.values(SheetStatus) as [string, ...string[]]
);

export const AvatarSchema = DiscordUrlSchema;

export const ExperienceSchema = z
  .object({
    current: z.int().min(0).max(5000),
    total: z.int().min(0).max(5000),
  })
  .refine((data) => data.current <= data.total, {
    message: "Current experience cannot exceed total experience",
    path: ["current"],
  });

export const ExperienceSpendSchema = z.object({
  id: SnowflakeSchema,
  description: z.string().min(0).max(100),
  cost: z.int().min(0).max(200),
});

export const ExperienceSpendsSchema = z.record(
  SnowflakeSchema,
  ExperienceSpendSchema
);

// Core character data schemas
export const CoreDataSchema = z.object({
  avatar: AvatarSchema,
  embedColor: HexColorSchema,
  experience: ExperienceSchema,
  expSpends: ExperienceSpendsSchema,
  storytellerLock: z.boolean(),
  dataOfBirth: z.string().min(0).max(20),
  age: z.string().min(0).max(20),
  history: z.string().min(0).max(5000),
  appearanceDescription: z.string().min(0).max(1000),
  notes: z.string().min(0).max(5000),
  notes2: z.string().min(0).max(5000),
});

export type ExperienceData = z.infer<typeof ExperienceSchema>;
export type ExperienceSpendData = z.infer<typeof ExperienceSpendSchema>;
export type ExperienceSpendsData = z.infer<typeof ExperienceSpendsSchema>;
export type CoreCharacterData = z.infer<typeof CoreDataSchema>;
