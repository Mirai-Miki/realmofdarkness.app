import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { snowflake } from "../schema.types";
import {
  UsernameConstraints,
  SnowflakeSchema,
  DiscordCdnUrlMaxLength,
} from "@realm/common";
import { users } from "./users";

// ============================================================================
// Identities Tables
// ============================================================================

export const discordIdentities = pgTable("discord_identities", {
  // Store the raw Discord Snowflake with its native data constraint
  discordId: snowflake().primaryKey(),
  username: varchar({ length: UsernameConstraints.MaxLength }).notNull(),
  avatarUrl: varchar({ length: DiscordCdnUrlMaxLength }).notNull(),

  // Explicit, type-safe 1:1 bond to RoD user
  userId: snowflake()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp().defaultNow().notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const discordIdentitiesRelations = relations(
  discordIdentities,
  ({ one }) => ({
    user: one(users, {
      fields: [discordIdentities.userId],
      references: [users.id],
    }),
  })
);

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type DiscordIdentityDb = InferSelectModel<typeof discordIdentities>;

/**
 * Zod schema for selecting/reading discord identity records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectDiscordIdentitySchema = createSelectSchema(
  discordIdentities,
  {
    discordId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);

/**
 * Zod schema for inserting new discord identity records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertDiscordIdentitySchema = createInsertSchema(
  discordIdentities,
  {
    discordId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);

/**
 * Zod schema for updating existing discord identity records in the database.
 * All fields are optional except the id.
 */
export const updateDiscordIdentitySchema = createUpdateSchema(
  discordIdentities,
  {
    discordId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type SelectDiscordIdentityData = z.infer<
  typeof selectDiscordIdentitySchema
>;
export type InsertDiscordIdentityData = z.infer<
  typeof insertDiscordIdentitySchema
>;
export type UpdateDiscordIdentityData = z.infer<
  typeof updateDiscordIdentitySchema
>;
