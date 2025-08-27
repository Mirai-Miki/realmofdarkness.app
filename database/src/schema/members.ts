import type { InferSelectModel } from "drizzle-orm";

import {
  pgTable,
  bigint,
  varchar,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { guilds } from "./guilds.js";

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
    guildId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),

    /** Foreign key to User */
    userId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    admin: boolean().notNull().default(false),
    storyteller: boolean().notNull().default(false),

    nickname: varchar({ length: 100 }).notNull().default(""),
    avatarUrl: varchar({ length: 500 }).notNull().default(""),

    /** Foreign key to the member's default character in this guild */
    defaultCharacterId: bigint({ mode: "bigint" }), // Will reference characters table when available

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.guildId, table.userId] })]
);

export type MemberDb = InferSelectModel<typeof members>;
