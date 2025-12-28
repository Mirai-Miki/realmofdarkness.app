import type { ILogger, Snowflake, IGuildRepository } from "@realm/common";
import {
  RealmError,
  type CreateGuildInput,
  type UpdateGuildInput,
  type UpsertGuildInput,
  type AddStorytellerRoleInput,
  type RemoveStorytellerRoleInput,
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
  public async getById(guildId: Snowflake): Promise<Guild> {
    this.logger.debug("Retrieving guild by ID", {
      fields: { guildId },
    });

    try {
      const data = await this.guildRepository.findById(guildId);
      if (!data) {
        throw new RealmError("Guild not found", {
          fields: { guildId },
        });
      }

      const guild = new Guild(data);

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
   * Input data should already be validated at the API/Bot edge.
   *
   * @param input - Guild creation input data (already validated)
   * @returns Created guild entity
   * @throws {RealmError} If creation fails due to system error
   */
  public async create(input: CreateGuildInput): Promise<Guild> {
    this.logger.info(`Creating guild: ${input.name}`, {
      fields: { guildId: input.id, name: input.name },
    });

    try {
      // Trust input - already validated at API/Bot edge
      // Repository will add createdAt and lastUpdated timestamps
      const createdDto = await this.guildRepository.create(input);

      // Hydrate DTO to entity
      const created = new Guild(createdDto);

      this.logger.debug(`Guild created successfully: ${created.name}`, {
        fields: { guildId: created.id },
      });

      return created;
    } catch (error) {
      if (error instanceof RealmError) {
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
   * @param input - Complete guild update data including guild ID
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  public async update(input: UpdateGuildInput): Promise<Guild> {
    this.logger.info(`Updating guild`, {
      fields: { guildId: input.id },
    });

    try {
      // Trust input - already validated at API/Bot edge

      // Get existing guild
      const data = await this.guildRepository.findById(input.id);
      if (!data) {
        throw new RealmError("Guild not found", {
          fields: { guildId: input.id },
        });
      }

      // Hydrate entity and apply changes
      const guild = new Guild(data);

      if (input.name !== undefined) {
        guild.updateName(input.name);
      }
      if (input.iconUrl !== undefined) {
        guild.updateIconUrl(input.iconUrl);
      }
      if (input.storytellerRoleIds !== undefined) {
        // Clear and re-add all roles
        for (const roleId of guild.storytellerRoles) {
          guild.removeStorytellerRole(roleId);
        }
        for (const roleId of input.storytellerRoleIds) {
          guild.addStorytellerRole(roleId);
        }
      }

      // Persist changes (repository handles updatedAt)
      const updatedData = await this.guildRepository.update(guild.toData());
      const updated = new Guild(updatedData);

      this.logger.debug(`Guild updated successfully: ${updated.name}`, {
        fields: { guildId: updated.id },
      });

      return updated;
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to update guild`, {
        fields: { guildId: input.id },
        cause: error,
      });
    }
  }

  /**
   * Upsert a guild (create if new, update if exists).
   * - If guild exists: Updates provided fields (name, iconUrl, storytellerRoleIds if provided)
   * - If guild doesn't exist: Creates new guild with provided data
   *
   * This is the preferred method for syncing guilds from Discord.
   *
   * @param input - Guild data (id, name, iconUrl required; storytellerRoleIds optional, already validated)
   * @returns Upserted guild entity
   * @throws {RealmError} If upsert fails
   */
  public async upsert(input: UpsertGuildInput): Promise<Guild> {
    this.logger.info(`Upserting guild: ${input.name}`, {
      fields: { guildId: input.id },
    });

    try {
      // Trust input - already validated at API/Bot edge

      // Repository handles upsert logic
      const upsertedDto = await this.guildRepository.upsert(input);

      // Hydrate DTO back to entity
      const upserted = new Guild(upsertedDto);

      this.logger.debug(`Guild upserted successfully: ${upserted.name}`, {
        fields: { guildId: upserted.id },
      });

      return upserted;
    } catch (error) {
      if (error instanceof RealmError) {
        throw error;
      }
      throw new RealmError(`Failed to upsert guild: ${input.name}`, {
        fields: { guildId: input.id },
        cause: error,
      });
    }
  }

  /**
   * Add a storyteller role to a guild.
   *
   * @param input - Complete input with guild ID and role ID
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  public async addStorytellerRole(
    input: AddStorytellerRoleInput
  ): Promise<Guild> {
    this.logger.info(`Adding storyteller role to guild`, {
      fields: { guildId: input.guildId, roleId: input.roleId },
    });

    // Trust input - already validated at API/Bot edge

    const data = await this.guildRepository.findById(input.guildId);
    if (!data) {
      throw new RealmError("Guild not found", {
        fields: { guildId: input.guildId },
      });
    }

    const guild = new Guild(data);
    guild.addStorytellerRole(input.roleId);

    const updatedDto = await this.guildRepository.update(guild.toData());
    return new Guild(updatedDto);
  }

  /**
   * Remove a storyteller role from a guild.
   *
   * @param input - Complete input with guild ID and role ID
   * @returns Updated guild entity
   * @throws {RealmError} If guild not found or update fails
   */
  public async removeStorytellerRole(
    input: RemoveStorytellerRoleInput
  ): Promise<Guild> {
    this.logger.info(`Removing storyteller role from guild`, {
      fields: { guildId: input.guildId, roleId: input.roleId },
    });

    // Trust input - already validated at API/Bot edge

    const data = await this.guildRepository.findById(input.guildId);
    if (!data) {
      throw new RealmError("Guild not found", {
        fields: { guildId: input.guildId },
      });
    }

    const guild = new Guild(data);
    guild.removeStorytellerRole(input.roleId);

    const updatedDto = await this.guildRepository.update(guild.toData());
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
  public async delete(guildId: Snowflake): Promise<void> {
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
  public async exists(guildId: Snowflake): Promise<boolean> {
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
