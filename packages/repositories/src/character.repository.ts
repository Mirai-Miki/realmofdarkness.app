import type {
  ICharacterRepository,
  CharacterData,
  Snowflake,
} from "@realm/common";

/**
 * Repository implementation for Character entity using Drizzle ORM.
 *
 * NOTE: Currently disabled due to schema refactoring from JSONB to relational models.
 */
export class CharacterRepository implements ICharacterRepository {
  public findById(id: Snowflake): Promise<CharacterData | null> {
    return Promise.reject(
      new Error(`Not implemented - schema refactoring in progress for ${id}`)
    );
  }

  public findByUser(userId: Snowflake): Promise<CharacterData[]> {
    return Promise.reject(
      new Error(
        `Not implemented - schema refactoring in progress for ${userId}`
      )
    );
  }

  public create(): Promise<CharacterData> {
    return Promise.reject(
      new Error(
        `Not implemented - schema refactoring in progress for character creation`
      )
    );
  }

  public update(input: CharacterData): Promise<CharacterData>;
  public update(
    input: CharacterData,
    options: { ignoreNotFound: true }
  ): Promise<CharacterData | null>;
  public update(
    input: CharacterData,
    options?: { ignoreNotFound: boolean }
  ): Promise<CharacterData | null> {
    return Promise.reject(
      new Error(
        `Not implemented - schema refactoring in progress for ${input.id} with options: ${!!options}`
      )
    );
  }

  public upsert(input: CharacterData): Promise<CharacterData> {
    return Promise.reject(
      new Error(
        `Not implemented - schema refactoring in progress for ${input.id}`
      )
    );
  }

  public delete(id: Snowflake): Promise<void> {
    return Promise.reject(
      new Error(`Not implemented - schema refactoring in progress for ${id}`)
    );
  }

  public exists(id: Snowflake): Promise<boolean> {
    return Promise.reject(
      new Error(`Not implemented - schema refactoring in progress for ${id}`)
    );
  }
}
