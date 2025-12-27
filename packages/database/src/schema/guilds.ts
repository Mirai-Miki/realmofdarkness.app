import type { InferSelectModel } from "drizzle-orm";

import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { GuildNameConstraints, DiscordCdnUrlMaxLength } from "@realm/common";
import { snowflake } from "../schema_types";
import { members } from "./members";

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
  name: varchar({
    length: GuildNameConstraints.MaxLength,
  }).notNull(),
  iconUrl: varchar({ length: DiscordCdnUrlMaxLength }).notNull().default(""),
  storytellerRoleIds: snowflake().array().notNull().default([]),

  createdAt: timestamp().defaultNow().notNull(),
  lastUpdated: timestamp().defaultNow().notNull(),
});

// Define relations
export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(members),
}));

// Type exports for use in other parts of the application
export type GuildDb = InferSelectModel<typeof guilds>;
