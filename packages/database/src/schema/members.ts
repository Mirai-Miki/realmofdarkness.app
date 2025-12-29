import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import {
  pgTable,
  varchar,
  boolean,
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
import { guilds } from "./guilds";
import { snowflake } from "../schema.types";
import {
  UsernameConstraints,
  DiscordCdnUrlMaxLength,
  SnowflakeSchema,
} from "@realm/common";

/**
 * Member table - represents a user's membership in a specific guild
 *
 * This is not a Discord Guild Member, but rather a member who actively
 * uses the bot in this guild. We only track users who interact with the bot.
 */
export const members = pgTable(
  "members",
  {
    /** Foreign key to Guild */
    guildId: snowflake()
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),

    /** Foreign key to User */
    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    admin: boolean().notNull().default(false),
    roleIds: snowflake().array().notNull().default([]),

    /** Is this user boosting this guild? */
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
  (table) => [primaryKey({ columns: [table.guildId, table.userId] })]
);

// ============================================================================
// Relations
// ============================================================================

export const membersRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  guild: one(guilds, {
    fields: [members.guildId],
    references: [guilds.id],
  }),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================

export type MemberDb = InferSelectModel<typeof members>;

/**
 * Zod schema for selecting/reading member records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectMemberSchema = createSelectSchema(members, {
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
  roleIds: SnowflakeSchema.array(),
});

/**
 * Zod schema for inserting new member records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertMemberSchema = createInsertSchema(members, {
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
  roleIds: SnowflakeSchema.array(),
});

/**
 * Zod schema for updating existing member records in the database.
 * All fields are optional except the composite key (guildId, userId).
 */
export const updateMemberSchema = createUpdateSchema(members, {
  guildId: SnowflakeSchema,
  userId: SnowflakeSchema,
  roleIds: SnowflakeSchema.array(),
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type SelectMemberData = z.infer<typeof selectMemberSchema>;
export type InsertMemberData = z.infer<typeof insertMemberSchema>;
export type UpdateMemberData = z.infer<typeof updateMemberSchema>;
