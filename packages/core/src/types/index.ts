export * from "./supporter.types";
export * from "./character.types";

/**
 * Type alias for snowflake IDs to improve type safety
 */
export type Snowflake = string;

export const enum Environment {
  Development = "development",
  Preproduction = "preproduction",
  Production = "production",
}
