import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  GuildNameConstraints,
  DiscordCdnUrlMaxLength,
  SnowflakeSchema,
} from "@realm/common";
import { snowflake } from "../schema.types";
import { chronicles } from "./chronicles";

/**
 * Discord Guild table - represents a Discord server linked to a Chronicle.
 */
export const discordGuilds = pgTable("discord_guilds", {
  /** Discord Guild Snowflake ID */
  discordId: snowflake().primaryKey(),

  /** Foreign key to Chronicle */
  chronicleId: snowflake()
    .notNull()
    .references(() => chronicles.id, { onDelete: "cascade" }),

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

export const discordGuildsRelations = relations(discordGuilds, ({ one }) => ({
  chronicle: one(chronicles, {
    fields: [discordGuilds.chronicleId],
    references: [chronicles.id],
  }),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type DiscordGuildDb = InferSelectModel<typeof discordGuilds>;

export const selectDiscordGuildSchema = createSelectSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type SelectDiscordGuildData = z.infer<typeof selectDiscordGuildSchema>;

export const insertDiscordGuildSchema = createInsertSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type InsertDiscordGuildData = z.infer<typeof insertDiscordGuildSchema>;

export const updateDiscordGuildSchema = createUpdateSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type UpdateDiscordGuildData = z.infer<typeof updateDiscordGuildSchema>;
