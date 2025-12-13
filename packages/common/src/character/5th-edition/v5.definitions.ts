import { z } from "zod";
import { Character5thSchema } from "../5th-edition/character-5th.definitions";
import { Splat } from "../character.definitions";

export const DATE_OF_DEATH = { min: 0, max: 20 } as const;
export const APPARENT_AGE = { min: 0, max: 50 } as const;
export const SIRE = { min: 0, max: 50 } as const;
export const HUNGER = { min: 0, max: 5 } as const;
export const BLOOD_POTENCY = { min: 0, max: 10 } as const;
export const GENERATION = { min: 1, max: 18 } as const;

export const Vampire5thDtoSchema = Character5thSchema.extend({
  splat: z.literal(Splat.Vampire5th),
});
export type Vampire5thDto = z.infer<typeof Vampire5thDtoSchema>;
