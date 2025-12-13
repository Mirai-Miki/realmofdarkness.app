import type { z } from "zod";
import { BaseCharacterDataSchema } from "../character.definitions";

export const V20_RULES = {
  attributes: { min: 0, max: 5 },
  abilities: { min: 0, max: 5 },
  disciplines: { min: 0, max: 5 },
  virtues: { min: 0, max: 5 },
  health: { min: 0, max: 15 },
  willpower: { min: 0, max: 10 },
  humanity: { min: 0, max: 10 },
  bloodPool: { min: 0, max: 50 },
  generation: { min: 3, max: 15 },
} as const;

export const Character20thSchema = BaseCharacterDataSchema.extend({});
export type Character20thDto = z.infer<typeof Character20thSchema>;
