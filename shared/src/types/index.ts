export * from "./supporter.js";
export * from "./character.js";
export * from "./logger.js";
export * from "./http_status.js";

/**
 * Type alias for snowflake IDs to improve type safety
 */
export type SnowflakeId = string;

export const enum Environment {
  Development = "development",
  Preproduction = "preproduction",
  Production = "production",
}
