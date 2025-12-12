/**
 * Member Entity DTO
 *
 * Pure data shape for guild membership entities.
 * No behavior - just the data contract.
 */

import type { Snowflake } from "../primitives/index.js";

/**
 * Member entity DTO.
 *
 * Represents the raw data structure of a user-guild membership.
 * Domain `Member` class wraps this with permission and XP tracking logic.
 *
 * Uses composite key: userId + guildId
 */
export interface MemberDto {
  userId: Snowflake;
  guildId: Snowflake;
  isStoryteller: boolean;
  experienceAwarded: number;
  joinedAt: Date;
  lastActive: Date;
}
