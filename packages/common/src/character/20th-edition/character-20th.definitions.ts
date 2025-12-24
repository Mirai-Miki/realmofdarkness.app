import type { z } from "zod";
import { BaseCharacterDataSchema } from "../character.definitions";

export const Wod20CharacterConstraints = {
  Attributes: { Min: 0, Max: 5 },
  Abilities: { Min: 0, Max: 5 },
  Disciplines: { Min: 0, Max: 5 },
  Virtues: { Min: 0, Max: 5 },
  Health: { Min: 0, Max: 15 },
  Willpower: { Min: 0, Max: 10 },
  Humanity: { Min: 0, Max: 10 },
  BloodPool: { Min: 0, Max: 50 },
  Generation: { Min: 3, Max: 15 },
} as const;

export const Character20thSchema = BaseCharacterDataSchema.extend({});
export type Character20thDto = z.infer<typeof Character20thSchema>;
