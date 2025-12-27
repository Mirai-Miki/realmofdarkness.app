import type { ILogger, IUserRepository, Snowflake } from "@realm/common";
import {
  RealmError,
  type CreateUserInput,
  type UpdateUserInput,
} from "@realm/common";
import { User } from "../entities/user.entity.js";

/**
 * Pure application service for user operations.
 *
 * Handles user lifecycle, profile updates, and query operations.
 *
 * **Important**: This is a pure service. It does NOT call other services.
 * For coordination across multiple services (e.g., creating a user and
 * setting up their supporter tier), use an action in the `actions/` folder.
 *
 * **Date Handling**: This service does NOT manage date fields (createdAt, lastActive).
 * The repository is responsible for setting timestamps based on data changes.
 */
export class UserService {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Get a user by ID.
   *
   * @param userId - Discord user snowflake ID
   * @returns User entity if found, null otherwise
   */
  async getById(userId: Snowflake): Promise<User | null> {
    this.logger.debug("Getting user by ID", {
      fields: { userId },
    });

    const dto = await this.userRepository.findById(userId);
    if (!dto) {
      return null;
    }

    return new User(dto);
  }

  /**
   * Create a new user.
   *
   * Creates entity and persists via repository.
   *
   * @param input - User creation input data (already validated at API/Bot edge)
   * @returns Created user entity
   * @throws {RealmError} If creation fails
   */
  async create(input: CreateUserInput): Promise<User> {
    this.logger.info(`Creating user: ${input.username}`, {
      fields: { userId: input.id },
    });

    try {
      // Trust input - already validated at boundary
      // NO Zod validation here

      // Repository will add date fields
      const createdDto = await this.userRepository.create({
        ...input,
        createdAt: new Date(), // Repository may override
        updatedAt: new Date(), // Repository may override
        lastActive: new Date(), // Repository may override
      });

      // Hydrate back to entity
      const user = new User(createdDto);

      this.logger.debug(`User created successfully: ${user.username}`, {
        fields: { userId: user.id },
      });

      return user;
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to create user: ${input.username}`, {
        cause: error,
        fields: { userId: input.id },
      });
    }
  }

  /**
   * Update a user's profile.
   *
   * Retrieves the user, applies updates, and persists changes.
   *
   * @param input - Complete user update data including user ID (already validated at API/Bot edge)
   * @returns Updated user entity
   * @throws {RealmError} If user not found or update fails
   */
  async update(input: UpdateUserInput): Promise<User> {
    this.logger.debug(`Updating user`, {
      fields: { userId: input.id },
    });

    try {
      // Trust input - already validated at boundary
      // NO Zod validation here

      // Get existing user
      const dto = await this.userRepository.findById(input.id);
      if (!dto) {
        throw new RealmError("User not found", {
          fields: { userId: input.id },
        });
      }

      // Hydrate entity and apply changes
      const user = new User(dto);

      if (input.username !== undefined) {
        user.updateUsername(input.username);
      }
      if (input.displayName !== undefined) {
        user.updateDisplayName(input.displayName);
      }
      if (input.avatarUrl !== undefined) {
        user.updateAvatarUrl(input.avatarUrl);
      }

      // Persist changes (repository handles lastActive)
      const updatedDto = await this.userRepository.update(user.toData());

      // Hydrate back to entity
      const updated = new User(updatedDto);

      this.logger.debug(`User updated successfully: ${updated.username}`, {
        fields: { userId: updated.id },
      });

      return updated;
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to update user`, {
        cause: error,
        fields: { userId: input.id },
      });
    }
  }

  /**
   * Check if a user exists.
   *
   * @param userId - Discord user snowflake ID
   */
  async exists(userId: Snowflake): Promise<boolean> {
    return this.userRepository.exists(userId);
  }

  /**
   * Update user's last active timestamp.
   *
   * @param userId - Discord user snowflake ID
   */
  async updateLastActive(userId: Snowflake): Promise<void> {
    this.logger.debug("Updating user last active", {
      fields: { userId },
    });

    await this.userRepository.updateLastActive(userId);
  }

  /**
   * Delete a user.
   *
   * @param userId - Discord user snowflake ID
   */
  async delete(userId: Snowflake): Promise<void> {
    this.logger.info("Deleting user", {
      fields: { userId },
    });

    await this.userRepository.delete(userId);

    this.logger.debug("User deleted", {
      fields: { userId },
    });
  }

  /**
   * Get a user by username.
   *
   * @param username - Discord username
   * @returns User entity if found, null otherwise
   */
  async getByUsername(username: string): Promise<User | null> {
    const dto = await this.userRepository.findByUsername(username);
    if (!dto) {
      return null;
    }
    return new User(dto);
  }

  /**
   * Get total user count.
   *
   * @returns Total number of users
   */
  async count(): Promise<number> {
    return this.userRepository.count();
  }
}
