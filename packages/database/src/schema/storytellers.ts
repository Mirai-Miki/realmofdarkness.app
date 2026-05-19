import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import { pgTable, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { users } from "./users";
import { chronicles } from "./chronicles";
import { snowflake } from "../schema.types";
import { SnowflakeSchema } from "@realm/common";

/**
 * Storytellers table - tracks users who have storyteller permissions for a chronicle
 */
export const storytellers = pgTable(
  "storytellers",
  {
    /** Primary key snowflake ID */
    id: snowflake().primaryKey(),

    /** Foreign key to User */
    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** Foreign key to Chronicle */
    chronicleId: snowflake()
      .notNull()
      .references(() => chronicles.id, { onDelete: "cascade" }),

    /** Provider of the permission: "hoisted" for manual web, or a Discord Server ID */
    provider: varchar({ length: 255 }).notNull().default("hoisted"),

    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    // Super performant lookups for checking if a user is an ST in a chronicle
    index("storytellers_user_chronicle_idx").on(
      table.userId,
      table.chronicleId
    ),
  ]
);

// ============================================================================
// Relations
// ============================================================================

export const storytellersRelations = relations(storytellers, ({ one }) => ({
  user: one(users, {
    fields: [storytellers.userId],
    references: [users.id],
  }),
  chronicle: one(chronicles, {
    fields: [storytellers.chronicleId],
    references: [chronicles.id],
  }),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type StorytellerDb = InferSelectModel<typeof storytellers>;

export const selectStorytellerSchema = createSelectSchema(storytellers, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
});
export type SelectStorytellerData = z.infer<typeof selectStorytellerSchema>;

export const insertStorytellerSchema = createInsertSchema(storytellers, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
});
export type InsertStorytellerData = z.infer<typeof insertStorytellerSchema>;

export const updateStorytellerSchema = createUpdateSchema(storytellers, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema,
});
export type UpdateStorytellerData = z.infer<typeof updateStorytellerSchema>;
