/**
 * Guild Entity DTO
 *
 * Pure data shape for Discord guild entities.
 * No behavior - just the data contract.
 */

import type { Snowflake } from "../primitives/index.js";

/**
 * Guild entity DTO.
 *
 * Represents the raw data structure of a Discord guild configuration.
 * Domain `Guild` class wraps this with role management and settings logic.
 */
export interface GuildDto {
  id: Snowflake;
  name: string;
  iconUrl?: string;
  trackerChannel?: Snowflake;
  storytellerRoles: Snowflake[];
  createdAt: Date;
  updatedAt: Date;
}
