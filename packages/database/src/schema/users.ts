import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { snowflake } from "../schema.types";
import { UsernameConstraints, SnowflakeSchema } from "@realm/common";
import { supporters } from "./supporters";
import { discordIdentities } from "./discord-identities";

export const users = pgTable("users", {
  id: snowflake().primaryKey(), // RoD Snowflake
  displayName: varchar({ length: UsernameConstraints.MaxLength })
    .notNull()
    .default("Undefined"),
  avatarUrl: varchar({ length: 500 }).notNull().default(""),
  admin: boolean().notNull().default(false), // RoD admin

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  // One-to-one relation with supporters
  supporter: one(supporters, {
    fields: [users.id],
    references: [supporters.userId],
  }),

  // One-to-one relation with discord identities
  discordIdentity: one(discordIdentities, {
    fields: [users.id],
    references: [discordIdentities.userId],
  }),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type UserDb = InferSelectModel<typeof users>;

/**
 * Zod schema for selecting/reading user records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectUserSchema = createSelectSchema(users, {
  id: SnowflakeSchema,
});

/**
 * Zod schema for inserting new user records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertUserSchema = createInsertSchema(users, {
  id: SnowflakeSchema,
});

/**
 * Zod schema for updating existing user records in the database.
 * All fields are optional except the id.
 */
export const updateUserSchema = createUpdateSchema(users, {
  id: SnowflakeSchema,
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type SelectUserData = z.infer<typeof selectUserSchema>;
export type InsertUserData = z.infer<typeof insertUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
