import { z } from "zod";

import { Vampire5thDataSchema } from "./5th-edition/v5.definitions";
import { Vampire20thDataSchema } from "./20th-edition/v20.definitions";

// ============================================================================
// Character Data Union
// ============================================================================

/**
 * Union of all concrete character data types.
 * This is a discriminated union based on the 'splat' field.
 */
export const CharacterDataSchema = z.discriminatedUnion("splat", [
  Vampire5thDataSchema,
  Vampire20thDataSchema,
]);

export type CharacterData = z.infer<typeof CharacterDataSchema>;

/**
 * Input Data for creating & updating a character.
 */
export type CharacterRepositoryInput = CharacterData;
