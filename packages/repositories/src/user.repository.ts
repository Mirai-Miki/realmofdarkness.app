import type { UserDb, UpdateUserData, InsertUserData } from "@realm/database";
import type {
  IUserRepository,
  Snowflake,
  UserData,
  UserRepositoryInput,
} from "@realm/common";

import { eq, inArray } from "drizzle-orm";
import { db, users, insertUserSchema, updateUserSchema } from "@realm/database";
import { UsernameSchema, RealmError, SnowflakeSchema } from "@realm/common";
import { hasDataChanged } from "./repository.utilities";

/**
 * Convert database record to UserData.
 */
function toUserData(db: UserDb): UserData {
  return {
    id: db.id,
    username: db.username,
    displayName: db.displayName,
    avatarUrl: db.avatarUrl,
    admin: db.admin,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
}

/**
 * Repository implementation for User entity using Drizzle ORM.
 *
 * Handles all database operations for users including CRUD operations
 * and queries. Returns User Data that can be hydrated into domain entities.
 *
 * @example
 * ```typescript
 * const repo = new UserRepository();
 * const userData = await repo.findById("123456789012345678");
 * ```
 */
export class UserRepository implements IUserRepository {
  /**
   * Check if user database record has actually changed by comparing relevant fields.
   *
   * @param current - Current user record from database
   * @param incoming - New user data to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: UserDb, incoming: UpdateUserData): boolean {
    return hasDataChanged<UserDb, UpdateUserData>(current, incoming);
  }

  private async performUpdate(
    input: UserRepositoryInput,
    currentUser: UserDb
  ): Promise<UserData> {
    try {
      // Build update object with proper typing
      const updateData: UpdateUserData = {
        id: input.id,
        username:
          input.username !== undefined ? input.username : currentUser.username,
        displayName:
          input.displayName !== undefined
            ? input.displayName
            : currentUser.displayName,
        avatarUrl:
          input.avatarUrl !== undefined
            ? input.avatarUrl
            : currentUser.avatarUrl,
        admin: input.admin !== undefined ? input.admin : currentUser.admin,
        updatedAt: new Date(),
      };

      // Check if anything actually changed
      if (!this.hasChanges(currentUser, updateData)) {
        // No changes detected - return current data without updating
        return toUserData(currentUser);
      }

      // Validate with update schema
      const validatedData = updateUserSchema.parse(updateData);

      const [result] = await db
        .update(users)
        .set(validatedData)
        .where(eq(users.id, input.id))
        .returning();

      return toUserData(result);
    } catch (error) {
      throw new RealmError("Failed to update user", {
        cause: error,
        fields: { userId: input.id },
      });
    }
  }

  /**
   * Find a user by their Discord snowflake ID.
   *
   * @param id - Discord user snowflake ID
   * @returns User Data if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  public async findById(id: Snowflake): Promise<UserData | null> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toUserData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find user by ID", {
        cause: error,
        fields: { userId: id },
      });
    }
  }

  /**
   * Find multiple users by their Discord snowflake IDs.
   *
   * @param ids - Array of Discord user snowflake IDs
   * @returns Array of User Data found
   * @throws {RealmError} If database query fails
   */
  public async findManyByIds(ids: Snowflake[]): Promise<UserData[]> {
    if (ids.length === 0) return [];

    try {
      // Validate all snowflakes
      const validatedIds = ids.map((id) => SnowflakeSchema.parse(id));

      const results = await db
        .select()
        .from(users)
        .where(inArray(users.id, validatedIds));

      return results.map((r) => toUserData(r));
    } catch (error) {
      throw new RealmError("Failed to find users by IDs", {
        cause: error,
        fields: { count: ids.length.toString() },
      });
    }
  }

  /**
   * Find a user by their Discord username.
   *
   * @param username - Discord username (unique)
   * @returns User Data if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  public async findByUsername(username: string): Promise<UserData | null> {
    try {
      UsernameSchema.parse(username);

      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return toUserData(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find user by username", {
        cause: error,
        fields: { username },
      });
    }
  }

  /**
   * Create a new user.
   *
   * @param input - User creation input (without timestamps)
   * @throws {RealmError} If creation fails or user already exists
   * @returns Created user Data
   */
  public async create(input: UserRepositoryInput): Promise<UserData> {
    try {
      const dbRecord: InsertUserData = {
        id: input.id,
        username: input.username,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        admin: input.admin,
      };

      // Validate with insert schema
      const validatedData = insertUserSchema.parse(dbRecord);

      const [result] = await db.insert(users).values(validatedData).returning();

      // TODO Add any one to one relations such as supporter or analytics here

      return toUserData(result);
    } catch (error) {
      throw new RealmError("Failed to create user", {
        cause: error,
        fields: { userId: input.id, username: input.username },
      });
    }
  }

  /**
   * Update an existing user.
   * Only performs database update if data has actually changed.
   *
   * @param input - User update input data
   * @returns Updated user Data (or current data if no changes)
   */
  public async update(input: UserRepositoryInput): Promise<UserData> {
    try {
      const validatedId = SnowflakeSchema.parse(input.id);

      // Fetch current user to check for changes
      const currentResult = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedId))
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("User not found for update", {
          fields: { userId: input.id },
        });
      }

      return await this.performUpdate(input, currentResult[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error; // Re-throw known RealmErrors
      }
      throw new RealmError("Failed to update user", {
        cause: error,
        fields: { userId: input.id },
      });
    }
  }

  /**
   * Upsert a user.
   * If user exists: updates provided fields only if data has changed.
   * If user doesn't exist: creates new user.
   *
   * @param input - User data to upsert
   * @returns Upserted user Data
   */
  public async upsert(input: UserRepositoryInput): Promise<UserData> {
    try {
      // Check if user exists
      const existingResult = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (existingResult.length > 0) {
        // User exists - update it
        return await this.performUpdate(input, existingResult[0]);
      } else {
        // User doesn't exist - insert it
        return await this.create(input);
      }
    } catch (error) {
      throw new RealmError("Failed to upsert user", {
        cause: error,
        fields: { userId: input.id, username: input.username },
      });
    }
  }

  /**
   * Delete a user and all associated data (cascade).
   *
   * @param id - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   */
  public async delete(id: Snowflake): Promise<void> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      await db.delete(users).where(eq(users.id, validatedId));
    } catch (error) {
      throw new RealmError("Failed to delete user", {
        cause: error,
        fields: { userId: id },
      });
    }
  }

  /**
   * Check if a user exists by ID.
   *
   * @param id - Discord user snowflake ID
   * @returns True if user exists, false otherwise
   * @throws {RealmError} If query fails
   */
  public async exists(id: Snowflake): Promise<boolean> {
    try {
      // Validate snowflake format
      const validatedId = SnowflakeSchema.parse(id);

      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, validatedId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new RealmError("Failed to check if user exists", {
        cause: error,
        fields: { userId: id },
      });
    }
  }

  /**
   * Count total number of users.
   *
   * @returns Total user count
   * @throws {RealmError} If query fails
   */
  public async count(): Promise<number> {
    try {
      const result = await db.select({ count: users.id }).from(users);

      return result.length;
    } catch (error) {
      throw new RealmError("Failed to count users", {
        cause: error,
      });
    }
  }
}
