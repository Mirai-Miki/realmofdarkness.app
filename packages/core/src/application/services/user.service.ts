import { logger } from "@realm/logger";
import type { IUserRepository } from "../../ports/user.repository.interface.js";
import type { User } from "../../domain/entities/user.entity.js";
import type { Snowflake } from "../../types/index.js";

/**
 * Application service for user operations.
 *
 * Handles user lifecycle, profile updates, and query operations.
 */
export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Find a user by ID.
   *
   * @param userId - Discord user snowflake ID
   * @returns User if found, null otherwise
   */
  async findById(userId: Snowflake): Promise<User | null> {
    logger.debug("Finding user by ID", { fields: { userId } });
    return this.userRepository.findById(userId);
  }

  /**
   * Find multiple users by their IDs.
   *
   * @param userIds - Array of Discord user snowflake IDs
   * @returns Array of found Users
   */
  async findManyByIds(userIds: Snowflake[]): Promise<User[]> {
    logger.debug("Finding multiple users by IDs", {
      fields: { count: userIds.length.toString() },
    });
    return this.userRepository.findManyByIds(userIds);
  }

  /**
   * Create a new user.
   *
   * @param user - User entity to create
   * @returns Created user
   */
  async create(user: User): Promise<User> {
    logger.info(`Creating user: ${user.username}`, {
      fields: { userId: user.id },
    });
    return this.userRepository.create(user);
  }

  /**
   * Update an existing user.
   *
   * @param user - User entity to update
   * @returns Updated user
   */
  async update(user: User): Promise<User> {
    logger.debug(`Updating user: ${user.username}`, {
      fields: { userId: user.id },
    });
    return this.userRepository.update(user);
  }

  /**
   * Check if a user exists.
   *
   * @param userId - Discord user snowflake ID
   */
  async exists(userId: Snowflake): Promise<boolean> {
    return this.userRepository.exists(userId);
  }
}
