import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { users } from "./users";
import { chronicles } from "./chronicles";
import { snowflake } from "../schema.types";
import {
  UsernameConstraints,
  DiscordCdnUrlMaxLength,
  SnowflakeSchema,
} from "@realm/common";

/**
 * Chronicle Member table - represents a user's membership in a specific chronicle
 */
export const chronicleMembers = pgTable(
  "chronicle_members",
  {
    /** Foreign key to Chronicle */
    chronicleId: snowflake()
      .notNull()
      .references(() => chronicles.id, { onDelete: "cascade" }),

    /** Foreign key to User */
    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** Is this user boosting this chronicle? */
    boosted: integer().notNull().default(0),

    nickname: varchar({ length: UsernameConstraints.MaxLength })
      .notNull()
      .default(""),
    avatarUrl: varchar({ length: DiscordCdnUrlMaxLength })
      .notNull()
      .default(""),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.chronicleId, table.userId] })]
);

// ============================================================================
// Relations
// ============================================================================

export const chronicleMembersRelations = relations(
  chronicleMembers,
  ({ one }) => ({
    user: one(users, {
      fields: [chronicleMembers.userId],
      references: [users.id],
    }),
    chronicle: one(chronicles, {
      fields: [chronicleMembers.chronicleId],
      references: [chronicles.id],
    }),
  })
);

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type ChronicleMemberDb = InferSelectModel<typeof chronicleMembers>;

export const selectChronicleMemberSchema = createSelectSchema(
  chronicleMembers,
  {
    chronicleId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);
export type SelectChronicleMemberData = z.infer<
  typeof selectChronicleMemberSchema
>;

export const insertChronicleMemberSchema = createInsertSchema(
  chronicleMembers,
  {
    chronicleId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);
export type InsertChronicleMemberData = z.infer<
  typeof insertChronicleMemberSchema
>;

export const updateChronicleMemberSchema = createUpdateSchema(
  chronicleMembers,
  {
    chronicleId: SnowflakeSchema,
    userId: SnowflakeSchema,
  }
);
export type UpdateChronicleMemberData = z.infer<
  typeof updateChronicleMemberSchema
>;
