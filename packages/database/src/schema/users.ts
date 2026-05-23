import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { snowflake } from "../schema.types";
import { UsernameConstraints, SnowflakeSchema } from "@realm/common";
import { supporters } from "./supporters";

export const users = pgTable(
  "users",
  {
    id: snowflake().primaryKey(), // RoD Snowflake

    /** Optional linked Discord account snowflake. */
    discordId: snowflake(),

    displayName: varchar({ length: UsernameConstraints.MaxLength })
      .notNull()
      .default("Undefined"),
    avatarUrl: varchar({ length: 500 }).notNull().default(""),
    admin: boolean().notNull().default(false), // RoD admin

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    // One Discord account maps to at most one RoD user.
    // Postgres allows multiple NULLs in a UNIQUE index.
    uniqueIndex("users_discord_id_unique").on(table.discordId),
  ]
);

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  // One-to-one relation with supporters
  supporter: one(supporters, {
    fields: [users.id],
    references: [supporters.userId],
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
  discordId: SnowflakeSchema.nullable(),
});

/**
 * Zod schema for inserting new user records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertUserSchema = createInsertSchema(users, {
  id: SnowflakeSchema,
  discordId: SnowflakeSchema.nullable().optional(),
});

/**
 * Zod schema for updating existing user records in the database.
 * All fields are optional except the id.
 */
export const updateUserSchema = createUpdateSchema(users, {
  id: SnowflakeSchema,
  discordId: SnowflakeSchema.nullable().optional(),
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type SelectUserData = z.infer<typeof selectUserSchema>;
export type InsertUserData = z.infer<typeof insertUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
