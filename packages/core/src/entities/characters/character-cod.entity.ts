import type { Splats, SheetStatus, Snowflake } from "@realm/common";

import { Character } from "./character.entity.js";
import { Experience } from "../../value-objects/index.js";

/**
 * Base character entity for Chronicles of Darkness game systems.
 * This is the intermediate class for CoD 2nd edition characters.
 *
 * @remarks
 * **IMPLEMENTATION STATUS: NOT YET IMPLEMENTED**
 *
 * Chronicles of Darkness is a new game system that has not been designed yet.
 * This class serves as a placeholder for future implementation.
 *
 * Inheritance: Character → CharacterCoD → specific CoD character types
 *
 * @throws {Error} When attempting to instantiate or use any methods
 *
 * @example
 * ```typescript
 * // Will throw "Not Implemented" error
 * const char = new SomeCoDACharacterType({
 *   name: 'Test',
 *   userId: 123n,
 *   splat: Splats.SomeCoDType
 * });
 * ```
 */
export abstract class CharacterCoD extends Character {
  /**
   * Creates a new CharacterCoD instance.
   *
   * @throws {Error} Always throws "Not Implemented" error
   */
  protected constructor(data: {
    name: string;
    userId: Snowflake;
    splat: Splats;
    id: Snowflake;
    guildId?: Snowflake | null;
    isSheet?: boolean;
    expTotal?: number;
    expCurrent?: number;
    status?: SheetStatus;
    color?: string;
    thumbnail?: string | null;
    createdAt?: Date;
    lastUpdated?: Date;
  }) {
    // Only pass Character-specific fields to super()
    super({
      name: data.name,
      userId: data.userId,
      splat: data.splat,
      id: data.id,
      guildId: data.guildId,
      isSheet: data.isSheet,
      experience:
        data.expTotal !== undefined || data.expCurrent !== undefined
          ? new Experience(data.expTotal ?? 0, data.expCurrent ?? 0)
          : Experience.zero(),
      status: data.status,
      color: data.color,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated,
    });
    throw new Error(
      "Chronicles of Darkness character implementation is not yet available. " +
        "This game system is planned for a future release."
    );
  }

  /**
   * Gets the game system version.
   *
   * @returns "cod"
   * @throws {Error} Always throws "Not Implemented" error
   */
  public getVersion(): string {
    throw new Error(
      "Chronicles of Darkness character implementation is not yet available."
    );
  }

  /**
   * Serializes the character to a plain object for storage.
   *
   * @throws {Error} Always throws "Not Implemented" error
   */
  public serialize(): Record<string, unknown> {
    throw new Error(
      "Chronicles of Darkness character implementation is not yet available."
    );
  }
}
