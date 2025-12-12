/**
 * Supporter Entity DTO
 *
 * Pure data shape for supporter subscription entities.
 * No behavior - just the data contract.
 */

import type { Snowflake } from "../primitives/index.js";
import type { SupporterName } from "../character/index.js";

/**
 * Supporter entity DTO.
 *
 * Represents the raw data structure of a supporter subscription.
 * Domain `Supporter` class wraps this with tier benefits and boost allocation logic.
 */
export interface SupporterDto {
  userId: Snowflake;
  supporterName: SupporterName;
  customerId?: string;
  subscriptionId?: string;
  boostsUsed: number;
  startedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
