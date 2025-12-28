import type { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { snowflake } from "../schema.types";
import { UsernameConstraints, DiscordCdnUrlMaxLength } from "@realm/common";
import { supporters } from "./supporters";

export const users = pgTable("users", {
  id: snowflake().primaryKey(), // Discord Snowflake
  username: varchar({ length: UsernameConstraints.MaxLength })
    .notNull()
    .unique(),
  displayName: varchar({ length: UsernameConstraints.MaxLength })
    .notNull()
    .default(""),
  avatarUrl: varchar({ length: DiscordCdnUrlMaxLength }).notNull().default(""),
  admin: boolean().notNull().default(false), // RoD admin

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  // One-to-one relation with supporters
  // All users should have a supporter record (defaults to Base tier)
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
export const selectUserSchema = createSelectSchema(users);

/**
 * Zod schema for inserting new user records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertUserSchema = createInsertSchema(users);
