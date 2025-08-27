import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
 */
export const snowflake = customType<{ data: string }>({
  dataType() {
    return "bigint";
  },
  toDriver(value) {
    return BigInt(value);
  },
  fromDriver(value) {
    return String(value);
  },
});
