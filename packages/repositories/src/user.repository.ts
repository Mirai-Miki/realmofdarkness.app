import { eq, inArray } from "drizzle-orm";
import { db, users, insertUserSchema } from "@realm/database";
import type { UserDb } from "@realm/database";
import type {
  IUserRepository,
  Snowflake,
  UserData,
  CreateUserInput,
  UpsertUserInput,
} from "@realm/common";
import { UsernameSchema } from "@realm/common";
import { RealmError, SnowflakeSchema } from "@realm/common";
import { UserMapper } from "./mappers/user.mapper";

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
   * Excludes id and timestamps from comparison.
   *
   * @param current - Current user record from database
   * @param incoming - New user record to compare
   * @returns True if data has changed, false otherwise
   */
  private hasChanges(current: UserDb, incoming: Partial<UserDb>): boolean {
    const keysToCompare = Object.keys(incoming).filter(
      (key) => !["id", "createdAt", "updatedAt"].includes(key)
    ) as (keyof UserDb)[];

    for (const key of keysToCompare) {
      if (JSON.stringify(current[key]) !== JSON.stringify(incoming[key])) {
        return true;
      }
    }

    return false;
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

      return UserMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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

      return results.map((r) => UserMapper.toData(r));
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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

      return UserMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to find user by username", {
        cause: error,
        fields: { username },
      });
    }
  }

  /**
   * Create a new user.
   *
   * @param input - Create user input (without timestamps)
   * @throws {RealmError} If creation fails or user already exists
   * @returns Created user Data
   */
  public async create(input: CreateUserInput): Promise<UserData> {
    try {
      // Validate snowflake format first
      SnowflakeSchema.parse(input.id);

      const dbRecord = UserMapper.fromCreateInput(input);

      // Validate with Zod schema before inserting
      const validated = insertUserSchema.parse(dbRecord);

      const result = await db.insert(users).values(validated).returning();

      return UserMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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
   * @param user - User Data to update
   * @returns Updated user Data (or current data if no changes)
   */
  public async update(user: UserData): Promise<UserData> {
    try {
      // Validate snowflake format first
      SnowflakeSchema.parse(user.id);

      // Fetch current user to check for changes
      const currentResult = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (currentResult.length === 0) {
        throw new RealmError("User not found for update", {
          fields: { userId: user.id },
        });
      }

      const currentDb = currentResult[0];
      const incomingDb = UserMapper.fromData(user);

      // Check if anything actually changed
      if (!this.hasChanges(currentDb, incomingDb)) {
        // No changes detected - return current data without updating
        return UserMapper.toData(currentDb);
      }

      // Data has changed - proceed with update
      const validated = insertUserSchema.partial().parse({
        ...incomingDb,
        updatedAt: new Date(),
      });

      const result = await db
        .update(users)
        .set(validated)
        .where(eq(users.id, user.id))
        .returning();

      return UserMapper.toData(result[0]);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to update user", {
        cause: error,
        fields: { userId: user.id },
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
  public async upsert(input: UpsertUserInput): Promise<UserData> {
    try {
      // Validate snowflake format first
      const validatedId = SnowflakeSchema.parse(input.id);

      // Check if user exists
      const existingResult = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedId))
        .limit(1);

      if (existingResult.length > 0) {
        // User exists - check if data has changed
        const currentDb = existingResult[0];
        const incomingDb: Partial<UserDb> = {
          username: input.username,
          displayName: input.displayName,
          avatarUrl: input.avatarUrl || "",
        };

        if (input.admin !== undefined) {
          incomingDb.admin = input.admin;
        }

        if (!this.hasChanges(currentDb, incomingDb)) {
          // No changes - return existing data without updating
          return UserMapper.toData(currentDb);
        }
      }

      // Either user doesn't exist, or data has changed - proceed with upsert
      const now = new Date();

      // Build insert values
      const insertValues = insertUserSchema.parse({
        id: validatedId,
        username: input.username,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl || "",
        admin: input.admin || false,
        createdAt: now,
        updatedAt: now,
      });

      // Build conflict update set
      const conflictUpdate: Partial<typeof users.$inferInsert> = {
        username: input.username,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl || "",
        updatedAt: now,
      };

      if (input.admin !== undefined) {
        conflictUpdate.admin = input.admin;
      }

      const validatedUpdate = insertUserSchema.partial().parse(conflictUpdate);

      const [result] = await db
        .insert(users)
        .values(insertValues)
        .onConflictDoUpdate({
          target: users.id,
          set: validatedUpdate,
        })
        .returning();

      return UserMapper.toData(result);
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
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
