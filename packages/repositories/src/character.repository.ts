import type { CharacterDb, CharacterJsonbData } from "@realm/database";
import type {
  ICharacterRepository,
  CharacterData,
  Snowflake,
} from "@realm/common";

import { eq } from "drizzle-orm";
import {
  db,
  characters,
  insertCharacterSchema,
  updateCharacterSchema,
} from "@realm/database";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { hasDataChanged } from "./repository.utilities";

/**
 * Split character data into columns and JSONB data.
 *
 * @param input - The full character data including splat-specific fields
 * @returns Object separating database columns from the JSONB payload
 */
function splitData(input: CharacterData): {
  columns: {
    id: Snowflake;
    name: string;
    userId: Snowflake;
    guildId: Snowflake | null;
    splat: CharacterData["splat"];
    createdAt: Date;
    lastUpdated: Date;
  };
  jsonData: CharacterJsonbData;
} {
  const {
    id,
    name,
    userId,
    guildId,
    splat,
    createdAt,
    updatedAt,
    status,
    ...rest
  } = input;

  return {
    columns: {
      id,
      name,
      userId,
      guildId,
      splat,
      createdAt,
      lastUpdated: updatedAt,
    },
    jsonData: { status, ...rest } as CharacterJsonbData,
  };
}

/**
 * Merge columns and JSONB data into CharacterData.
 *
 * @param db - The raw character record from the database
 * @returns Reconstructed CharacterData DTO
 */
function mergeData(db: CharacterDb): CharacterData {
  const { data, lastUpdated, ...columns } = db;
  return {
    ...columns,
    updatedAt: lastUpdated,
    ...(data as Record<string, unknown>),
  } as unknown as CharacterData;
}

/**
 * Repository implementation for Character entity using Drizzle ORM.
 *
 * Handles database operations for various character types using a Single Table Inheritance
 * pattern with a JSONB column for splat-specific data.
 *
 * @example
 * ```typescript
 * const repo = new CharacterRepository();
 * const char = await repo.findById("123");
 * ```
 */
export class CharacterRepository implements ICharacterRepository {
  /**
   * Check if character data has actually changed by comparing relevant fields.
   *
   * @param current - Current character data
   * @param incoming - Incoming character data
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: CharacterData, incoming: CharacterData): boolean {
    // Simple deep equality check or JSON string comparison might be needed for the 'data' part
    // Using helper for now
    return hasDataChanged<CharacterData, CharacterData>(current, incoming);
  }

  /**
   * Find a character by its Snowflake ID.
   *
   * @param id - The unique ID of the character
   * @returns The character data if found, null otherwise
   * @throws {RealmError} If the database query fails
   */
  public async findById(id: Snowflake): Promise<CharacterData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(id);

      const result = await db
        .select()
        .from(characters)
        .where(eq(characters.id, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return mergeData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find character by ID", {
        cause: error,
        fields: { characterId: id },
      });
    }
  }

  /**
   * Find all characters owned by a specific user.
   *
   * @param userId - The ID of the user
   * @returns Array of characters belonging to the user
   * @throws {RealmError} If the database query fails
   */
  public async findByUser(userId: Snowflake): Promise<CharacterData[]> {
    try {
      const validatedId = SnowflakeSchema.parse(userId);

      const result = await db
        .select()
        .from(characters)
        .where(eq(characters.userId, validatedId));

      return result.map(mergeData);
    } catch (error) {
      throw new RealmError("Failed to find characters by User ID", {
        cause: error,
        fields: { userId },
      });
    }
  }

  /**
   * Create a new character record.
   *
   * @param input - Character data to create
   * @returns The created character data
   * @throws {RealmError} If creation fails
   */
  public async create(input: CharacterData): Promise<CharacterData> {
    try {
      const { columns, jsonData } = splitData(input);

      const dbRecord = {
        ...columns,
        data: jsonData,
      };

      // Validate with insert schema
      const validatedData = insertCharacterSchema.parse(dbRecord);

      const [result] = await db
        .insert(characters)
        .values(validatedData)
        .returning();

      return mergeData(result);
    } catch (error) {
      throw new RealmError("Failed to create character", {
        cause: error,
        fields: { characterId: input.id },
      });
    }
  }

  /**
   * Update an existing character.
   * Only performs database update if data has actually changed.
   *
   * @param input - Character data to update
   * @returns The updated character data
   * @throws {RealmError} If update fails or character doesn't exist
   */
  public async update(input: CharacterData): Promise<CharacterData>;

  /**
   * Update an existing character.
   *
   * @param input - Character data to update
   * @param options - Update options
   * @param options.ignoreNotFound - If true, returns null instead of throwing when not found
   * @returns The updated character data, or null if not found (and ignored)
   */
  public async update(
    input: CharacterData,
    options: { ignoreNotFound: true }
  ): Promise<CharacterData | null>;

  public async update(
    input: CharacterData,
    options?: { ignoreNotFound: boolean }
  ): Promise<CharacterData | null> {
    try {
      const validatedId = SnowflakeSchema.parse(input.id);

      // Fetch current to check existence and changes
      const currentResult = await db
        .select()
        .from(characters)
        .where(eq(characters.id, validatedId))
        .limit(1);

      if (currentResult.length === 0) {
        if (!options?.ignoreNotFound) {
          throw new RealmError("Character not found for update", {
            fields: { characterId: input.id },
          });
        }
        return null;
      }

      const currentCharacter = mergeData(currentResult[0]);

      if (!this.hasChanges(currentCharacter, input)) {
        return currentCharacter;
      }

      const { columns, jsonData } = splitData(input);
      // Update lastUpdated
      if (!columns.lastUpdated) {
        columns.lastUpdated = new Date();
      }

      const updateData = {
        ...columns,
        data: jsonData,
      };

      // Validate with update schema
      const validatedData = updateCharacterSchema.parse(updateData);

      const [result] = await db
        .update(characters)
        .set(validatedData)
        .where(eq(characters.id, validatedId))
        .returning();

      return mergeData(result);
    } catch (error) {
      if (error instanceof RealmError) throw error;
      throw new RealmError("Failed to update character", {
        cause: error,
        fields: { characterId: input.id },
      });
    }
  }

  /**
   * Upsert a character (create if not exists, update if exists).
   *
   * @param input - Character data to upsert
   * @returns The upserted character data
   * @throws {RealmError} If upsert operation fails
   */
  public async upsert(input: CharacterData): Promise<CharacterData> {
    try {
      const exists = await this.exists(input.id);
      if (exists) {
        return await this.update(input);
      } else {
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert character", {
        cause: error,
        fields: { characterId: input.id },
      });
    }
  }

  /**
   * Delete a character by ID.
   *
   * @param id - The unique ID of the character to delete
   * @throws {RealmError} If deletion fails
   */
  public async delete(id: Snowflake): Promise<void> {
    try {
      const validatedId = SnowflakeSchema.parse(id);
      await db.delete(characters).where(eq(characters.id, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete character", {
        cause: error,
        fields: { characterId: id },
      });
    }
  }

  /**
   * Check if a character exists by ID.
   *
   * @param id - The unique ID of the character
   * @returns True if character exists, false otherwise
   */
  public async exists(id: Snowflake): Promise<boolean> {
    try {
      const validatedId = SnowflakeSchema.parse(id);
      const result = await db
        .select({ id: characters.id })
        .from(characters)
        .where(eq(characters.id, validatedId))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check character existence", {
        cause: error,
        fields: { characterId: id },
      });
    }
  }
}
