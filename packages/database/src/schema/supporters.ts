import { pgTable, pgEnum, timestamp, integer } from "drizzle-orm/pg-core";
import { SupporterName } from "@realm/core";
import { snowflake } from "../schema_types";
import { users } from "./users.js";

import type { InferSelectModel } from "drizzle-orm";

export const supporterLevel = pgEnum("supporter_level", [
  SupporterName.Base,
  SupporterName.Mortal,
  SupporterName.Fledgling,
  SupporterName.Neonate,
  SupporterName.Ancilla,
  SupporterName.Elder,
  SupporterName.Methuselah,
  SupporterName.Antediluvian,
]);

/**
 * Supporter subscription and boost tracking.
 * One-to-one relationship with users table (only exists for supporters).
 */
export const supporters = pgTable("supporters", {
  /** Foreign key to User - primary key */
  userId: snowflake()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  /** Supporter tier level */
  level: supporterLevel().notNull().default(SupporterName.Base),

  /** Total boosts available to this supporter */
  totalBoosts: integer().notNull().default(0),

  /** When the user first became a supporter */
  firstSupported: timestamp(),

  /** When the user last had an active subscription */
  lastSupported: timestamp(),

  createdAt: timestamp().defaultNow().notNull(),
  lastUpdated: timestamp().defaultNow().notNull(),
});

// Type exports for use in other parts of the application
export type SupporterDb = InferSelectModel<typeof supporters>;
