import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { Snowflake } from "@realm/common";

/**
 * Custom type for hex color values (#RRGGBB format)
 */
export const hexColor = customType<{ data: string }>({
  dataType() {
    return "varchar(7)";
  },
});

export const hexColorCheck = sql`CHECK (value ~ '^#[0-9A-Fa-f]{6}$')`;

/**
 * Custom type for Discord snowflake IDs
 * Returns branded Snowflake type for type safety
 */
export const snowflake = customType<{ data: Snowflake }>({
  dataType() {
    return "bigint";
  },
  toDriver(value: Snowflake) {
    return BigInt(value);
  },
  fromDriver(value: unknown): Snowflake {
    return String(value);
  },
});
