import type { z } from "zod";
import { BaseCharacterDataSchema } from "../character.definitions";

export const ATTRIBUTE_5TH = { min: 0, max: 5 } as const;
export const SKILL_5TH = { min: 0, max: 5 } as const;
export const SPECIALTY_5TH = { min: 1, max: 100 } as const;
export const DAMAGE_5TH = { min: 1, max: 20 } as const;
export const HUMANITY = { min: 0, max: 10 } as const;

export const Character5thSchema = BaseCharacterDataSchema.extend({});
export type Character5thDto = z.infer<typeof Character5thSchema>;
