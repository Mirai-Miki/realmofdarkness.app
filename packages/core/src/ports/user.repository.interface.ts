import type { User } from "../domain/entities/user.entity.js";

type Snowflake = string;

/**
 * Repository interface for User entity persistence operations.
 *
 * This interface defines the contract that any User repository implementation
 * must follow. It abstracts the data access layer from the domain layer.
 *
 * @remarks
 * Implementations will handle actual data storage (PostgreSQL, REST API, etc.).
 * The domain layer depends on this interface, not on concrete implementations.
 *
 * @example
 * ```typescript
 * // In application service
 * class UserService {
 *   constructor(private userRepo: IUserRepository) {}
 *
 *   async getUser(id: string) {
 *     return await this.userRepo.findById(id);
 *   }
 * }
 * ```
 */
export interface IUserRepository {
  /**
   * Find a user by their Discord snowflake ID.
   *
   * @param id - Discord user snowflake ID
   * @returns User entity if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  findById(id: Snowflake): Promise<User | null>;

  /**
   * Find a user by their Discord username.
   *
   * @param username - Discord username (unique)
   * @returns User entity if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find all users (paginated).
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of User entities
   * @throws {RealmError} If database query fails
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Create a new user.
   *
   * @param user - User entity to create
   * @returns Created user entity with updated metadata
   * @throws {RealmError} If user creation fails or user already exists
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user.
   *
   * @param user - User entity to update
   * @returns Updated user entity with refreshed metadata
   * @throws {RealmError} If update fails or user doesn't exist
   */
  update(user: User): Promise<User>;

  /**
   * Update user's last active timestamp.
   *
   * @param id - Discord user snowflake ID
   * @throws {RealmError} If update fails
   */
  updateLastActive(id: Snowflake): Promise<void>;

  /**
   * Delete a user and all associated data (cascade).
   *
   * @param id - Discord user snowflake ID
   * @throws {RealmError} If deletion fails
   */
  delete(id: Snowflake): Promise<void>;

  /**
   * Check if a user exists by ID.
   *
   * @param id - Discord user snowflake ID
   * @returns True if user exists, false otherwise
   * @throws {RealmError} If query fails
   */
  exists(id: Snowflake): Promise<boolean>;

  /**
   * Count total number of users.
   *
   * @returns Total user count
   * @throws {RealmError} If query fails
   */
  count(): Promise<number>;
}
