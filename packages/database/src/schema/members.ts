import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { guilds } from "./guilds.js";
import { snowflake } from "../schema_types";

import type { InferSelectModel } from "drizzle-orm";

/**
 * Member table - represents a user's membership in a specific guild
 *
 * This is not a Discord Guild Member, but rather a member who actively
 * uses the bot in this guild. We only track users who interact with the bot.
 */
export const members = pgTable(
  "members",
  {
    /** Foreign key to Guild */
    guildId: snowflake()
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),

    /** Foreign key to User */
    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    admin: boolean().notNull().default(false),
    storyteller: boolean().notNull().default(false),

    /** Is this user boosting this guild? */
    boosted: integer().notNull().default(0),

    nickname: varchar({ length: 100 }).notNull().default(""),
    avatarUrl: varchar({ length: 500 }).notNull().default(""),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.guildId, table.userId] })]
);

// Type exports for use in other parts of the application
export type MemberDb = InferSelectModel<typeof members>;
