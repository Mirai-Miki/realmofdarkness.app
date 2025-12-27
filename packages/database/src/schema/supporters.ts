import type { InferSelectModel } from "drizzle-orm";

import { pgTable, pgEnum, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { SupporterLevel } from "@realm/common";
import { snowflake } from "../schema_types";
import { users } from "./users";

const supporterLevelValues = Object.values(SupporterLevel) as [
  string,
  ...string[],
];
export const supporterLevel = pgEnum("supporter_level", supporterLevelValues);

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
  level: supporterLevel().notNull().default(SupporterLevel.Base),

  /** Total boosts available to this supporter */
  boosts: integer().notNull().default(0),

  /** When the user first became a supporter */
  firstSupported: timestamp(),
});

// Define relations
export const supportersRelations = relations(supporters, ({ one }) => ({
  user: one(users, {
    fields: [supporters.userId],
    references: [users.id],
  }),
}));

// Type exports for use in other parts of the application
export type SupporterDb = InferSelectModel<typeof supporters>;
