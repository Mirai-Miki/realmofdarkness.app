import type { InferSelectModel } from "drizzle-orm";
import { pgTable, bigint, varchar, timestamp } from "drizzle-orm/pg-core";

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
  id: bigint({ mode: "bigint" }).primaryKey(),
  name: varchar({ length: 200 }).notNull(),
  iconUrl: varchar({ length: 500 }).notNull().default(""),
  trackerChannel: varchar({ length: 20 }).notNull().default(""),

  createdAt: timestamp().defaultNow().notNull(),
  lastUpdated: timestamp().defaultNow().notNull(),
});

/**
 * StorytellerRole table - tracks Discord roles that grant Storyteller permissions
 *
 * These roles allow users to have storyteller privileges in the guild.
 * Primary key is the Discord Role Snowflake ID.
 */
export const storytellerRoles = pgTable("storyteller_roles", {
  /** Discord Role Snowflake ID */
  id: bigint({ mode: "bigint" }).primaryKey(),

  /** Foreign key to the Guild this role belongs to */
  guildId: bigint({ mode: "bigint" })
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
});

// Type exports for use in other parts of the application
export type GuildDb = InferSelectModel<typeof guilds>;
export type StorytellerRoleDb = InferSelectModel<typeof storytellerRoles>;
