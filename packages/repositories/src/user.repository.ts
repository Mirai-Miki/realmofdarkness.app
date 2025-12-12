import { eq, inArray } from "drizzle-orm";
import { db, users } from "@realm/database";
import { RealmError } from "@realm/common";
import type {
  ILogger,
  Snowflake,
  IUserRepository,
  UserDto,
} from "@realm/common";
import { UserMapper } from "./mappers/user.mapper.js";

/**
 * Repository for User entity persistence operations.
 *
 * Handles CRUD operations for user identity and profile data.
 * For supporter/subscription data, use SupporterRepository.
 *
 * @example
 * ```typescript
 * const userRepo = new UserRepository();
 *
 * // Find user by Discord ID
 * const user = await userRepo.findById("123456789012345678");
 *
 * // Create new user
 * const newUser = new User({ ... });
 * await userRepo.create(newUser);
 * ```
 */
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Find a user by their Discord snowflake ID.
   *
   * @param id - Discord user snowflake ID
   * @returns User DTO if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  async findById(id: Snowflake): Promise<UserDto | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return UserMapper.toDto(result[0]);
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
   * @returns Array of User DTOs found
   * @throws {RealmError} If database query fails
   */
  async findManyByIds(ids: Snowflake[]): Promise<UserDto[]> {
    if (ids.length === 0) return [];

    try {
      const results = await db
        .select()
        .from(users)
        .where(inArray(users.id, ids));

      return results.map((r) => UserMapper.toDto(r));
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
   * @returns User entity if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return UserMapper.toDto(result[0]);
    } catch (error) {
      throw new RealmError("Failed to find user by username", {
        cause: error,
        fields: { username },
      });
    }
  }

  /**
   * Find all users (paginated).
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of User DTOs
   * @throws {RealmError} If database query fails
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<UserDto[]> {
    try {
      const results = await db.select().from(users).limit(limit).offset(offset);

      return results.map((db) => UserMapper.toDto(db));
    } catch (error) {
      throw new RealmError("Failed to find all users", {
        cause: error,
        fields: {
          limit: limit.toString(),
          offset: offset.toString(),
        },
      });
    }
  }

  /**
   * Create a new user.
   *
   * @param user - User DTO to create
   * @returns Created user DTO with updated metadata
   * @throws {RealmError} If user creation fails or user already exists
   */
  async create(user: UserDto): Promise<UserDto> {
    try {
      const dbRecord = UserMapper.fromDto(user);

      const result = await db.insert(users).values(dbRecord).returning();

      this.logger.info("User created", {
        fields: { userId: result[0].id },
      });

      return UserMapper.toDto(result[0]);
    } catch (error) {
      throw new RealmError("Failed to create user", {
        cause: error,
        fields: { userId: user.id, username: user.username },
      });
    }
  }

  /**
   * Update an existing user.
   *
   * @param user - User DTO to update
   * @returns Updated user DTO with refreshed metadata
   * @throws {RealmError} If update fails or user doesn't exist
   */
  async update(user: UserDto): Promise<UserDto> {
    try {
      const dbRecord = UserMapper.fromDto(user);

      const result = await db
        .update(users)
        .set({
          ...dbRecord,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      if (result.length === 0) {
        throw new RealmError("User not found for update", {
          fields: { userId: user.id },
        });
      }

      this.logger.info("User updated", {
        fields: { userId: result[0].id },
      });

      return UserMapper.toDto(result[0]);
    } catch (error) {
      throw new RealmError("Failed to update user", {
        cause: error,
        fields: { userId: user.id },
      });
    }
  }

  /**
   * Update user's last active timestamp.
   *
   * @param id - Discord user snowflake ID
   * @throws {RealmError} If update fails
   */
  async updateLastActive(id: Snowflake): Promise<void> {
    try {
      await db
        .update(users)
        .set({ lastActive: new Date() })
        .where(eq(users.id, id));

      this.logger.debug("User last active updated", {
        fields: { userId: id },
      });
    } catch (error) {
      throw new RealmError("Failed to update user last active", {
        cause: error,
        fields: { userId: id },
      });
    }
  }

  /**
   * Delete a user and all associated data (cascade).
   *
   * @param id - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   */
  async delete(id: Snowflake): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));

      this.logger.info("User deleted", {
        fields: { userId: id },
      });
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
  async exists(id: Snowflake): Promise<boolean> {
    try {
      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
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
  async count(): Promise<number> {
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


