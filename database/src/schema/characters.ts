import type { CharacterJsonbData } from "../types/index.js";
import type { InferSelectModel } from "drizzle-orm";

import {
  pgTable,
  pgEnum,
  varchar,
  boolean,
  timestamp,
  serial,
  jsonb,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { guilds } from "./guilds.js";
import { members } from "./members.js";
import { snowflake } from "../schema_types.js";
import { Splats } from "shared/types/index.js";

/**
 * Character Splat types Enum
 */
export const characterSplats = pgEnum("character_splats", [
  Splats.Vampire5th,
  Splats.Hunter5th,
  Splats.Werewolf5th,
  Splats.Human5th,
  Splats.Ghoul5th,
  Splats.Vampire20th,
  Splats.Werewolf20th,
  Splats.Changeling20th,
  Splats.Mage20th,
  Splats.Demon20th,
  Splats.Wraith20th,
  Splats.Human20th,
  Splats.Ghoul20th,
]);

/**
 * Base Character table - contains all common character data
 *
 * This is the main character table that all character types inherit from.
 * Uses single-table inheritance with the 'splat' field to determine the specific type.
 */
export const characters = pgTable(
  "characters",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }).notNull(),

    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    guildId: snowflake().references(() => guilds.id, {
      onDelete: "set null",
    }),

    splat: characterSplats().notNull().default(Splats.Vampire5th),
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
