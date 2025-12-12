import type { ILogger, Snowflake, IGuildRepository } from "@realm/common";
import { Guild } from "../entities/guild.entity";

import { RealmError } from "@realm/common";

/**
 * Application service for guild operations.
 *
 * Handles all guild-related business logic including creation,
 * updates, retrieval, and deletion.
 *
 * @example
 * ```typescript
 * const guildService = new GuildService(logger, guildRepository);
 * await guildService.delete("123456789012345678");
 * ```
 */
export class GuildService {
  private readonly logger: ILogger;

  constructor(
    logger: ILogger,
    private readonly guildRepository: IGuildRepository
  ) {
    this.logger = logger;
  }

  /**
   * Create a new guild.
   *
   * @param guild - Guild entity to create
   * @returns Created guild entity
   * @throws {RealmError} If creation fails due to system error
   */
  async create(guild: Guild): Promise<Guild> {
    this.logger.info(`Creating guild: ${guild.name}`, {
      fields: { guildId: guild.id, name: guild.name },
    });

    try {
      // Extract DTO from entity and persist
      const dto = guild.toDto();
      const createdDto = await this.guildRepository.create(dto);

      // Hydrate DTO back to entity
      const created = new Guild(createdDto);

      this.logger.debug(`Guild created successfully: ${created.name}`, {
        fields: { guildId: created.id },
      });

      return created;
    } catch (error) {
      throw new RealmError(`Failed to create guild: ${guild.name}`, {
        fields: { guildId: guild.id },
        cause: error,
      });
    }
  }

  /**
   * Update an existing guild.
   *
   * @param guild - Guild entity to update
   * @returns Updated guild entity
   * @throws {RealmError} If update fails due to system error
   */
  async update(guild: Guild): Promise<Guild> {
    this.logger.info(`Updating guild: ${guild.name}`, {
      fields: { guildId: guild.id, name: guild.name },
    });

    try {
      // Extract DTO from entity and persist
      const dto = guild.toDto();
      const updatedDto = await this.guildRepository.update(dto);

      // Hydrate DTO back to entity
      const updated = new Guild(updatedDto);

      this.logger.debug(`Guild updated successfully: ${updated.name}`, {
        fields: { guildId: updated.id },
      });

      return updated;
    } catch (error) {
      throw new RealmError(`Failed to update guild: ${guild.name}`, {
        fields: { guildId: guild.id },
        cause: error,
      });
    }
  }

  /**
   * Delete a guild.
   * Idempotent - succeeds even if guild doesn't exist.
   *
   * @param guildId - Discord guild snowflake ID to delete
   * @throws {RealmError} If deletion fails due to system error
   *
   * @example
   * ```typescript
   * await guildService.delete("123456789012345678");
   * // Guild is deleted (or didn't exist)
   * ```
   */
  async delete(guildId: Snowflake): Promise<void> {
    this.logger.info(`Deleting guild`, {
      fields: { guildId },
    });

    try {
      // Simply delete - repository.delete is idempotent
      await this.guildRepository.delete(guildId);

      this.logger.debug(`Guild deleted successfully`, {
        fields: { guildId },
      });
    } catch (error) {
      throw new RealmError(`Failed to delete guild`, {
        fields: { guildId },
        cause: error,
      });
    }
  }

  /**
   * Check if a guild exists.
   *
   * @param guildId - Discord guild snowflake ID
   * @returns True if guild exists
   * @throws {RealmError} If check fails due to system error
   */
  async exists(guildId: Snowflake): Promise<boolean> {
    this.logger.debug("Checking if guild exists", {
      fields: { guildId },
    });

    try {
      return await this.guildRepository.exists(guildId);
    } catch (error) {
      throw new RealmError("Failed to check guild existence", {
        fields: { guildId },
        cause: error,
      });
    }
  }
}
