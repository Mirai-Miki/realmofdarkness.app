import type { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import {
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
  SnowflakeSchema,
} from "@realm/common";
import { snowflake } from "../schema.types";
import { members } from "./members";

/**
 * Guild table - represents a Discord Guild/Server that uses the bot
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

// ============================================================================
// Relations
// ============================================================================

export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(members),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type GuildDb = InferSelectModel<typeof guilds>;

/**
 * Zod schema for selecting/reading guild records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectGuildSchema = createSelectSchema(guilds, {
  id: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type SelectGuildData = z.infer<typeof selectGuildSchema>;

/**
 * Zod schema for inserting new guild records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertGuildSchema = createInsertSchema(guilds, {
  id: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type InsertGuildData = z.infer<typeof insertGuildSchema>;

/**
 * Zod schema for updating existing guild records in the database.
 * All fields are optional except the id.
 */
export const updateGuildSchema = createUpdateSchema(guilds, {
  id: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type UpdateGuildData = z.infer<typeof updateGuildSchema>;
