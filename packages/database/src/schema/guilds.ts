import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { snowflake } from "../schema_types";

import type { InferSelectModel } from "drizzle-orm";

/**
 * Guild table - represents a Discord Guild/Server that uses the bot
 * Renamed from Chronicle to align with Discord conventions
 *
 * A Guild is linked to a Discord Server and manages characters, members,
 * and bot functionality for that server. Each Discord Guild can only
 * have one Guild record.
 */
export const guilds = pgTable("guilds", {
  /** Discord Guild Snowflake ID */
  id: snowflake().primaryKey(),
  name: varchar({ length: 200 }).notNull(),
  iconUrl: varchar({ length: 500 }).notNull().default(""),
  trackerChannel: snowflake().notNull().default(""),

  createdAt: timestamp().defaultNow().notNull(),
  lastUpdated: timestamp().defaultNow().notNull(),
});

// Type exports for use in other parts of the application
export type GuildDb = InferSelectModel<typeof guilds>;
