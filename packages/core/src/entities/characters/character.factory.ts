import { Splat } from "@realm/common";
import type { CharacterData } from "@realm/common";
import { Vampire5th } from "./vampire-5th.entity";
import { Vampire20th } from "./vampire-20th.entity";

/**
 * Union of all concrete character entity types.
 */
export type CharacterEntity = Vampire5th | Vampire20th;

/**
 * Factory for creating Character entities from data DTOs.
 * Automatically hydrates the correct entity class based on the splat type.
 */
export class CharacterFactory {
  /**
   * Create a domain entity from character data.
   *
   * @param data - The character data DTO
   * @returns The hydrated character entity
   * @throws {Error} If the splat type is not supported
   */
  public static create(data: CharacterData): CharacterEntity {
    switch (data.splat) {
      case Splat.Vampire5th:
        return new Vampire5th(data);
      case Splat.Vampire20th:
        return new Vampire20th(data);
    }
  }
}
