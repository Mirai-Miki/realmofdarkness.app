export * from "./supporter.types";
export * from "./character.types";
export * from "./http-status.types";

/**
 * Type alias for snowflake IDs to improve type safety
 */
export type Snowflake = string;

export const enum Environment {
  Development = "development",
  Preproduction = "preproduction",
  Production = "production",
}
