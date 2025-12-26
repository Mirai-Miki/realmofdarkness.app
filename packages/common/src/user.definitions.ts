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
 * User email address (optional).
 */
export const EmailSchema = z.string().max(100).nullable();

/**
 * Avatar URL from Discord CDN.
 */
export const AvatarUrlSchema = z
  .string()
  .max(DiscordCdnUrlMaxLength)
  .optional();

/**
 * Whether user has completed registration.
 */
export const RegisteredSchema = z.boolean();

/**
 * Whether user is a Realm of Darkness admin.
 */
export const AdminSchema = z.boolean();

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
  username: UsernameSchema,
  displayName: DisplayNameSchema,
  email: z.string().max(100).nullable(),
  avatarUrl: AvatarUrlSchema,
  registered: z.boolean(),
  admin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActive: z.date(),
});
export type UserData = z.infer<typeof UserDataSchema>;

/**
 * Input DTO for creating a new user.
 *
 * Used by services to validate input before hydrating the User entity.
 * Does not include date fields as those are managed by the repository.
 */
export const CreateUserInputSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameSchema,
  displayName: DisplayNameSchema,
  email: EmailSchema.default(null),
  avatarUrl: AvatarUrlSchema,
  registered: RegisteredSchema.default(false),
  admin: AdminSchema.default(false),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

/**
 * Input DTO for updating user profile.
 *
 * Used when syncing user data from Discord.
 * Contains ALL required data including the user ID.
 */
export const UpdateUserInputSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameSchema.optional(),
  displayName: DisplayNameSchema.optional(),
  email: EmailSchema.optional(),
  avatarUrl: AvatarUrlSchema.optional(),
  registered: RegisteredSchema.optional(),
  admin: AdminSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

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
   * Find a user by their Discord username.
   *
   * @param username - Discord username (unique)
   * @returns User entity if found, null otherwise
   * @throws {RealmError} If database query fails
   */
  findByUsername(username: string): Promise<UserData | null>;

  /**
   * Find all users (paginated).
   *
   * @param limit - Maximum number of results (default: 100)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of User entities
   * @throws {RealmError} If database query fails
   */
  findAll(limit?: number, offset?: number): Promise<UserData[]>;

  /**
   * Create a new user.
   *
   * @param user - User state to create
   * @returns Created user state with updated metadata
   * @throws {RealmError} If user creation fails or user already exists
   */
  create(user: UserData): Promise<UserData>;

  /**
   * Update an existing user.
   *
   * @param user - User state to update
   * @returns Updated user state with refreshed metadata
   * @throws {RealmError} If update fails or user doesn't exist
   */
  update(user: UserData): Promise<UserData>;

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
