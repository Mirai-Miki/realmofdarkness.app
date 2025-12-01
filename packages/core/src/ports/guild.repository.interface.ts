import type { Guild } from "../domain/entities/guild.entity";
import type { Snowflake } from "types";

/**
 * Repository interface for Guild entity persistence.
 *
 * Defines the contract for Guild data access operations.
 * Implementations handle the actual database interactions.
 */
export interface IGuildRepository {
  /**
   * Find a guild by Discord guild ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns Guild if found, null otherwise
   */
  findById(id: Snowflake): Promise<Guild | null>;

  /**
   * Create a new guild.
   *
   * @param guild - Guild entity to create
   * @returns Created guild
   */
  create(guild: Guild): Promise<Guild>;

  /**
   * Update an existing guild.
   *
   * @param guild - Guild entity to update
   * @returns Updated guild
   */
  update(guild: Guild): Promise<Guild>;

  /**
   * Delete a guild by ID.
   *
   * @param id - Discord guild snowflake ID
   */
  delete(id: Snowflake): Promise<void>;

  /**
   * Check if a guild exists by ID.
   *
   * @param id - Discord guild snowflake ID
   * @returns True if guild exists
   */
  exists(id: Snowflake): Promise<boolean>;
}
