import type { Snowflake } from "../primitives/index.js";
import type { GuildDto } from "./guild.dto.js";

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
   * @returns Guild state if found, null otherwise
   */
  findById(id: Snowflake): Promise<GuildDto | null>;

  /**
   * Create a new guild.
   *
   * @param guild - Guild DTO to create
   * @returns Created guild DTO
   */
  create(guild: GuildDto): Promise<GuildDto>;

  /**
   * Update an existing guild.
   *
   * @param guild - Guild DTO to update
   * @returns Updated guild DTO
   */
  update(guild: GuildDto): Promise<GuildDto>;

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
