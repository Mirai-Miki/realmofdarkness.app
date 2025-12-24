import type { InferSelectModel } from "drizzle-orm";

import {
  pgTable,
  pgEnum,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { Splat, CharacterConstraints } from "@realm/common";
import { users } from "./users.js";
import { guilds } from "./guilds.js";
import { members } from "./members.js";
import { snowflake } from "../schema_types.js";

// Placeholder for CharacterJsonbData
export interface CharacterJsonbData {
  [key: string]: unknown;
}

/**
 * Character Splat types Enum
 */
const splatValues = Object.values(Splat) as [string, ...string[]];
const characterSplats = pgEnum("character_splats", splatValues);

/**
 * Base Character table - contains all common character data
 *
 * This is the main character table that all character types inherit from.
 * Uses single-table inheritance with the 'splat' field to determine the specific type.
 */
export const characters = pgTable(
  "characters",
  {
    id: snowflake().primaryKey(),
    name: varchar({ length: CharacterConstraints.Name.MaxLength }).notNull(),

    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    guildId: snowflake().references(() => guilds.id, {
      onDelete: "set null",
    }),

    splat: characterSplats().notNull().default(Splat.Vampire5th),
    isSheet: boolean().notNull().default(false),
    data: jsonb().$type<CharacterJsonbData>().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.name, table.userId),
    uniqueIndex("characters_name_user_idx").on(table.name, table.userId),
    uniqueIndex("characters_guild_idx").on(table.guildId),
    uniqueIndex("characters_user_guild_idx").on(table.userId, table.guildId),
  ]
);

// Define relations
export const charactersRelations = relations(characters, ({ one }) => ({
  // Many-to-one relations
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  guild: one(guilds, {
    fields: [characters.guildId],
    references: [guilds.id],
  }),
  // Inferred relation: member is the user-guild relationship
  // Only exists when character has a guild
  member: one(members, {
    fields: [characters.userId, characters.guildId],
    references: [members.userId, members.guildId],
  }),
}));

export type CharacterDb = InferSelectModel<typeof characters>;
