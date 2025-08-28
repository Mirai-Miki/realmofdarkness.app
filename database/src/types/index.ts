import type { Splats } from "shared";
import type { CharacterDb } from "../schema/characters.js";

/**
 * Placeholder types for character data - replace with actual types from shared package
 */
type Vampire5thData = Record<string, unknown>;
type Hunter5thData = Record<string, unknown>;
type Werewolf5thData = Record<string, unknown>;
type Human5thData = Record<string, unknown>;
type Ghoul5thData = Record<string, unknown>;
type Vampire20thData = Record<string, unknown>;
type Werewolf20thData = Record<string, unknown>;
type Changeling20thData = Record<string, unknown>;
type Mage20thData = Record<string, unknown>;
type Demon20thData = Record<string, unknown>;
type Wraith20thData = Record<string, unknown>;
type Human20thData = Record<string, unknown>;
type Ghoul20thData = Record<string, unknown>;

/**
 * Type-safe mapping from splat to data type
 */
export type SplatDataMap = {
  [Splats.Vampire5th]: Vampire5thData;
  [Splats.Hunter5th]: Hunter5thData;
  [Splats.Werewolf5th]: Werewolf5thData;
  [Splats.Human5th]: Human5thData;
  [Splats.Ghoul5th]: Ghoul5thData;
  [Splats.Vampire20th]: Vampire20thData;
  [Splats.Werewolf20th]: Werewolf20thData;
  [Splats.Changeling20th]: Changeling20thData;
  [Splats.Mage20th]: Mage20thData;
  [Splats.Demon20th]: Demon20thData;
  [Splats.Wraith20th]: Wraith20thData;
  [Splats.Human20th]: Human20thData;
  [Splats.Ghoul20th]: Ghoul20thData;
};

// TODO: Import these types once they're created in shared package
// import type {
//   Vampire5thData,
//   Hunter5thData,
//   // ... other character data types
// } from "shared";

/**
 * Union type for all possible character data
 */
export type CharacterJsonbData = SplatDataMap[keyof SplatDataMap];

/**
 * Type-safe character record with properly typed data field based on splat
 */
export type TypedCharacterRecord<T extends Splats> = Omit<
  CharacterDb,
  "data"
> & {
  data: SplatDataMap[T];
};

/**
 * Helper type to extract character data type from splat at compile time
 */
export type CharacterDataForSplat<T extends Splats> = SplatDataMap[T];

/**
 * Type guard to check if a character record matches a specific splat
 */
export function isCharacterOfSplat<T extends Splats>(
  character: CharacterDb,
  splat: T
): character is TypedCharacterRecord<T> {
  return character.splat === splat;
}

/**
 * Type-safe way to access character data based on splat
 */
export function getTypedCharacterData<T extends Splats>(
  character: CharacterDb,
  expectedSplat: T
): SplatDataMap[T] {
  if (character.splat !== expectedSplat) {
    throw new Error(
      `Expected character splat ${expectedSplat}, got ${character.splat}`
    );
  }
  return character.data as SplatDataMap[T];
}
