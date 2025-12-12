import type { ILogger, IUserRepository, Snowflake } from "@realm/common";
import { User } from "../entities/user.entity.js";

/**
 * Application service for user operations.
 *
 * Handles user lifecycle, profile updates, and query operations.
 */
export class UserService {
  private readonly logger: ILogger;

  constructor(
    logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {
    this.logger = logger;
  }

  /**
   * Create a new user.
   *
   * @param user - User entity to create
   * @returns Created user entity
   */
  async create(user: User): Promise<User> {
    this.logger.info(`Creating user: ${user.username}`, {
      fields: { userId: user.id },
    });

    // Extract DTO and persist
    const dto = user.toDto();
    const createdDto = await this.userRepository.create(dto);

    // Hydrate back to entity
    return new User(createdDto);
  }

  /**
   * Update an existing user.
   *
   * @param user - User entity to update
   * @returns Updated user entity
   */
  async update(user: User): Promise<User> {
    this.logger.debug(`Updating user: ${user.username}`, {
      fields: { userId: user.id },
    });

    // Extract DTO and persist
    const dto = user.toDto();
    const updatedDto = await this.userRepository.update(dto);

    // Hydrate back to entity
    return new User(updatedDto);
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
