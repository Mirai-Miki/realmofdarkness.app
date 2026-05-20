/**
 * User entity definitions.
 * Defines the User DTO, Zod schemas, and repository interface.
 *
 * @packageDocumentation
 */
import { z } from "zod";
import {
  SnowflakeSchema,
  UsernameConstraints,
  DiscordCdnUrlMaxLength,
} from "./primitives";
import type { Snowflake } from "./primitives";

// ============================================================================
// User Field Schemas
// ============================================================================

/**
 * Discord username.
 */
export const UsernameSchema = z
  .string()
  .min(UsernameConstraints.MinLength)
  .max(UsernameConstraints.MaxLength);

/**
 * Display name (can differ from username).
 */
export const DisplayNameSchema = z
  .string()
  .min(UsernameConstraints.MinLength)
  .max(UsernameConstraints.MaxLength);

/**
 * Avatar URL from Discord CDN.
 */
export const AvatarUrlSchema = z.string().max(DiscordCdnUrlMaxLength);

// ============================================================================
// User Data Schemas
// ============================================================================

/**
 * User entity Data schema.
 *
 * Represents the full data structure of a Discord user.
 * Domain `User` class wraps this with validation and business logic.
 */
export const UserDataSchema = z.object({
  id: SnowflakeSchema,
  displayName: DisplayNameSchema,
  avatarUrl: AvatarUrlSchema,
  admin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UserData = z.infer<typeof UserDataSchema>;

/**
 * Input DTO for creating & updating a user.
 *
 * Used by services to validate input before hydrating the User entity.
 * Does not include date fields as those are managed by the repository.
 */
export const UserRepositoryInputSchema = z.object({
  id: SnowflakeSchema,
  displayName: DisplayNameSchema,
  avatarUrl: AvatarUrlSchema,
  admin: z.boolean().default(false),
});
export type UserRepositoryInput = z.infer<typeof UserRepositoryInputSchema>;

// ============================================================================
// User Repository Interface
// ============================================================================

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
  findById(id: Snowflake): Promise<UserData | null>;

  /**
   * Find multiple users by their Discord snowflake IDs.
   *
   * @param ids - Array of Discord user snowflake IDs
   * @returns Array of User entities found
   * @throws {RealmError} If database query fails
   */
  findManyByIds(ids: Snowflake[]): Promise<UserData[]>;

  /**
   * Create a new user.
   *
   * @param user - User state to create
   * @returns Created user state with updated metadata
   * @throws {RealmError} If user creation fails or user already exists
   */
  create(user: UserRepositoryInput): Promise<UserData>;

  /**
   * Update an existing user.
   *
   * @param input - User update input (id required, other fields optional)
   * @param options - Update options
   * @param options.ignoreNotFound - If true, returns null instead of throwing when user doesn't exist
   * @returns Updated user state with refreshed metadata
   * @throws {RealmError} If update fails or user doesn't exist (unless options.ignoreNotFound is true)
   */
  update(input: UserRepositoryInput): Promise<UserData>;
  update(
    input: UserRepositoryInput,
    options: { ignoreNotFound: true }
  ): Promise<UserData | null>;

  /**
   * Upsert a user.
   * If user exists: updates provided fields only if data has changed.
   * If user doesn't exist: creates new user.
   *
   * @param input - User data to upsert
   * @returns Upserted user state
   * @throws {RealmError} If upsert fails
   */
  upsert(input: UserRepositoryInput): Promise<UserData>;

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
