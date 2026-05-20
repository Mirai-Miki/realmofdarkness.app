import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
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

  name: varchar({
    length: GuildNameConstraints.MaxLength,
  }).notNull(),
  iconUrl: varchar({ length: DiscordCdnUrlMaxLength }).notNull().default(""),
  storytellerRoleIds: snowflake().array().notNull().default([]),

  createdAt: timestamp().defaultNow().notNull(),
  lastUpdated: timestamp().defaultNow().notNull(),
});

// ============================================================================
// Join Table: Discord Guild Chronicles (Many-to-Many)
// ============================================================================

export const discordGuildChronicles = pgTable(
  "discord_guild_chronicles",
  {
    discordId: snowflake()
      .notNull()
      .references(() => discordGuilds.discordId, { onDelete: "cascade" }),
    chronicleId: snowflake()
      .notNull()
      .references(() => chronicles.id, { onDelete: "cascade" }),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.discordId, table.chronicleId] })]
);

// ============================================================================
// Relations
// ============================================================================

export const discordGuildsRelations = relations(discordGuilds, ({ many }) => ({
  chronicles: many(discordGuildChronicles),
}));

export const discordGuildChroniclesRelations = relations(
  discordGuildChronicles,
  ({ one }) => ({
    guild: one(discordGuilds, {
      fields: [discordGuildChronicles.discordId],
      references: [discordGuilds.discordId],
    }),
    chronicle: one(chronicles, {
      fields: [discordGuildChronicles.chronicleId],
      references: [chronicles.id],
    }),
  })
);

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type DiscordGuildDb = InferSelectModel<typeof discordGuilds>;

export const selectDiscordGuildSchema = createSelectSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type SelectDiscordGuildData = z.infer<typeof selectDiscordGuildSchema>;

export const insertDiscordGuildSchema = createInsertSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type InsertDiscordGuildData = z.infer<typeof insertDiscordGuildSchema>;

export const updateDiscordGuildSchema = createUpdateSchema(discordGuilds, {
  discordId: SnowflakeSchema,
  storytellerRoleIds: SnowflakeSchema.array(),
});
export type UpdateDiscordGuildData = z.infer<typeof updateDiscordGuildSchema>;

// --- Join Table Types & Schemas ---

export type DiscordGuildChronicleDb = InferSelectModel<
  typeof discordGuildChronicles
>;

export const selectDiscordGuildChronicleSchema = createSelectSchema(
  discordGuildChronicles,
  {
    discordId: SnowflakeSchema,
    chronicleId: SnowflakeSchema,
  }
);
export type SelectDiscordGuildChronicleData = z.infer<
  typeof selectDiscordGuildChronicleSchema
>;

export const insertDiscordGuildChronicleSchema = createInsertSchema(
  discordGuildChronicles,
  {
    discordId: SnowflakeSchema,
    chronicleId: SnowflakeSchema,
  }
);
export type InsertDiscordGuildChronicleData = z.infer<
  typeof insertDiscordGuildChronicleSchema
>;

export const updateDiscordGuildChronicleSchema = createUpdateSchema(
  discordGuildChronicles,
  {
    discordId: SnowflakeSchema,
    chronicleId: SnowflakeSchema,
  }
);
export type UpdateDiscordGuildChronicleData = z.infer<
  typeof updateDiscordGuildChronicleSchema
>;
