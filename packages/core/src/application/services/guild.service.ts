import { logger } from "@realm/logger";
import { RealmError } from "@realm/errors";
import type { IGuildRepository } from "../../ports/guild.repository.interface";
import type { Guild } from "../../domain/entities/guild.entity";
import type { Snowflake } from "../../types";

/**
 * Application service for guild operations.
 *
 * Handles all guild-related business logic including creation,
 * updates, retrieval, and deletion.
 *
 * @example
 * ```typescript
 * const guildService = new GuildService(guildRepository);
 * await guildService.delete("123456789012345678");
 * ```
 */
export class GuildService {
  constructor(private readonly guildRepository: IGuildRepository) {}

  /**
   * Find a guild by ID.
   *
   * @param guildId - Discord guild snowflake ID
   * @returns Guild if found, null otherwise
   * @throws {RealmError} If retrieval fails due to system error
   */
  async findById(guildId: Snowflake): Promise<Guild | null> {
    logger.debug("Finding guild by ID", {
      fields: { guildId },
    });

    try {
      return await this.guildRepository.findById(guildId);
    } catch (error) {
      throw new RealmError("Failed to find guild", {
        fields: { guildId },
        cause: error,
      });
    }
  }

  /**
   * Create a new guild.
   *
   * @param guild - Guild entity to create
   * @returns Created guild
   * @throws {RealmError} If creation fails due to system error
   */
  async create(guild: Guild): Promise<Guild> {
    logger.info(`Creating guild: ${guild.name}`, {
      fields: { guildId: guild.id, name: guild.name },
    });

    try {
      const created = await this.guildRepository.create(guild);

      logger.debug(`Guild created successfully: ${created.name}`, {
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
   * @returns Updated guild
   * @throws {RealmError} If update fails due to system error
   */
  async update(guild: Guild): Promise<Guild> {
    logger.info(`Updating guild: ${guild.name}`, {
      fields: { guildId: guild.id, name: guild.name },
    });

    try {
      const updated = await this.guildRepository.update(guild);

      logger.debug(`Guild updated successfully: ${updated.name}`, {
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
    logger.info(`Deleting guild`, {
      fields: { guildId },
    });

    try {
      // Simply delete - repository.delete is idempotent
      await this.guildRepository.delete(guildId);

      logger.debug(`Guild deleted successfully`, {
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
    logger.debug("Checking if guild exists", {
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
