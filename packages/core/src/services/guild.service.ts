import type { ILogger, Snowflake, IGuildRepository } from "@realm/common";
import {
  RealmError,
  UserError,
  CreateGuildInputSchema,
  UpdateGuildInputSchema,
  type CreateGuildInput,
  type UpdateGuildInput,
} from "@realm/common";
import { Guild } from "../entities/guild.entity";

/**
 * Pure application service for guild operations.
 *
 * Handles all guild-related business logic including creation,
 * updates, retrieval, and deletion.
 *
 * **Important**: This is a pure service. It does NOT call other services.
 * For coordination across multiple services (e.g., creating a guild and
 * syncing members), use an action in the `actions/` folder.
 *
 * **Date Handling**: This service does NOT manage date fields (createdAt, updatedAt).
 * The repository is responsible for setting timestamps based on data changes.
 *
 * @example
 * ```typescript
 * const guildService = new GuildService(logger, guildRepository);
 * const guild = await guildService.create({
 *   id: "123456789012345678",
 *   name: "My Server",
 *   iconUrl: "https://cdn.discordapp.com/...",
 * });
 * ```
 */
export class GuildService {
  constructor(
    private readonly logger: ILogger,
    private readonly guildRepository: IGuildRepository
  ) {}

  /**
   * Get a guild by ID.
   *
   * @param guildId - Discord guild snowflake ID
   * @returns Guild entity
   * @throws {RealmError} If guild not found or retrieval fails
   */
  async getById(guildId: Snowflake): Promise<Guild> {
    this.logger.debug("Retrieving guild by ID", {
      fields: { guildId },
    });

    try {
      const dto = await this.guildRepository.findById(guildId);
      if (!dto) {
        throw new RealmError("Guild not found", {
          fields: { guildId },
        });
      }

      const guild = new Guild(dto);

      this.logger.debug("Guild retrieved successfully", {
        fields: { guildId, name: guild.name },
      });

      return guild;
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to retrieve guild by ID", {
        fields: { guildId },
        cause: error,
      });
    }
  }

  /**
   * Create a new guild.
   *
   * Validates input, creates entity, and persists via repository.
   *
   * @param input - Guild creation input data
   * @returns Created guild entity
   * @throws {UserError} If input validation fails
   * @throws {RealmError} If creation fails due to system error
   */
  async create(input: CreateGuildInput): Promise<Guild> {
    this.logger.info(`Creating guild: ${input.name}`, {
      fields: { guildId: input.id, name: input.name },
    });

    try {
      // Validate input DTO
      const validatedInput = CreateGuildInputSchema.parse(input);

      // Repository will add date fields
      const createdDto = await this.guildRepository.create({
        ...validatedInput,
        createdAt: new Date(), // Repository may override
        lastUpdated: new Date(), // Repository may override
      });

      // Hydrate DTO back to entity
      const created = new Guild(createdDto);

      this.logger.debug(`Guild created successfully: ${created.name}`, {
        fields: { guildId: created.id },
      });

      return created;
    } catch (error) {
      if (error instanceof UserError || error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to create guild: ${input.name}`, {
        fields: { guildId: input.id },
        cause: error,
      });
    }
  }

  /**
   * Update an existing guild.
   *
   * Retrieves the guild, applies updates, and persists changes.
   *
   * @param guildId - Discord guild snowflake ID
   * @param input - Partial guild update data
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  async update(guildId: Snowflake, input: UpdateGuildInput): Promise<Guild> {
    this.logger.info(`Updating guild`, {
      fields: { guildId },
    });

    try {
      // Validate input DTO
      const validatedInput = UpdateGuildInputSchema.parse(input);

      // Get existing guild
      const dto = await this.guildRepository.findById(guildId);
      if (!dto) {
        throw new RealmError("Guild not found", {
          fields: { guildId },
        });
      }

      // Hydrate entity and apply changes
      const guild = new Guild(dto);

      if (validatedInput.name !== undefined) {
        guild.updateName(validatedInput.name);
      }
      if (validatedInput.iconUrl !== undefined) {
        guild.updateIconUrl(validatedInput.iconUrl);
      }
      if (validatedInput.storytellerRoleIds !== undefined) {
        // Clear and re-add all roles
        for (const roleId of guild.storytellerRoles) {
          guild.removeStorytellerRole(roleId);
        }
        for (const roleId of validatedInput.storytellerRoleIds) {
          guild.addStorytellerRole(roleId);
        }
      }

      // Persist changes (repository handles updatedAt)
      const updatedDto = await this.guildRepository.update(guild.toDto());

      // Hydrate DTO back to entity
      const updated = new Guild(updatedDto);

      this.logger.debug(`Guild updated successfully: ${updated.name}`, {
        fields: { guildId: updated.id },
      });

      return updated;
    } catch (error) {
      if (error instanceof UserError || error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to update guild`, {
        fields: { guildId },
        cause: error,
      });
    }
  }

  /**
   * Add a storyteller role to a guild.
   *
   * @param guildId - Discord guild snowflake ID
   * @param roleId - Discord role snowflake ID
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  async addStorytellerRole(
    guildId: Snowflake,
    roleId: Snowflake
  ): Promise<Guild> {
    this.logger.info(`Adding storyteller role to guild`, {
      fields: { guildId, roleId },
    });

    const dto = await this.guildRepository.findById(guildId);
    if (!dto) {
      throw new RealmError("Guild not found", {
        fields: { guildId },
      });
    }

    const guild = new Guild(dto);
    guild.addStorytellerRole(roleId);

    const updatedDto = await this.guildRepository.update(guild.toDto());
    return new Guild(updatedDto);
  }

  /**
   * Remove a storyteller role from a guild.
   *
   * @param guildId - Discord guild snowflake ID
   * @param roleId - Discord role snowflake ID
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  async removeStorytellerRole(
    guildId: Snowflake,
    roleId: Snowflake
  ): Promise<Guild> {
    this.logger.info(`Removing storyteller role from guild`, {
      fields: { guildId, roleId },
    });

    const dto = await this.guildRepository.findById(guildId);
    if (!dto) {
      throw new RealmError("Guild not found", {
        fields: { guildId },
      });
    }

    const guild = new Guild(dto);
    guild.removeStorytellerRole(roleId);

    const updatedDto = await this.guildRepository.update(guild.toDto());
    return new Guild(updatedDto);
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
      if (error instanceof RealmError) {
        throw error;
      }
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
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError("Failed to check guild existence", {
        fields: { guildId },
        cause: error,
      });
    }
  }
}
