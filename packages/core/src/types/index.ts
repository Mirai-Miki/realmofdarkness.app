export * from "./supporter";
export * from "./character";
export * from "./logger";
export * from "./http-status";

/**
 * Type alias for snowflake IDs to improve type safety
 */
export type Snowflake = string;

export const enum Environment {
  Development = "development",
  Preproduction = "preproduction",
  Production = "production",
}
