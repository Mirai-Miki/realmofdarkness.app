/**
 * User Entity DTO
 *
 * Pure data shape for Discord user entities.
 * No behavior - just the data contract.
 */

import type { Snowflake } from "../primitives";

/**
 * User entity DTO.
 *
 * Represents the raw data structure of a Discord user.
 * Domain `User` class wraps this with validation and business logic.
 */
export interface UserDto {
  id: Snowflake;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  lastActive: Date;
}
