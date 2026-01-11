import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { Splat, CharacterConstraints } from "@realm/common";
import { users } from "./users";
import { guilds } from "./guilds";
import { members } from "./members";
import { snowflake } from "../schema.types";

import type { Vampire5thData, Vampire20thData } from "@realm/common";

/**
 * Helper to extract the JSONB payload from a full Character Data type.
 * Omits fields that are stored as explicit columns in the database.
 */
type SplatPayload<T> = Omit<
  T,
  | "id"
  | "name"
  | "userId"
  | "guildId"
  | "splat"
  | "isSheet"
  | "createdAt"
  | "updatedAt"
>;

/**
 * Union of all possible character JSONB payloads.
 *
 * IMPORTANT: When adding new character types, you MUST add them here.
 * This ensures TypeScript will catch any schema changes in repository and database code.
 */
export type CharacterJsonbData =
  | SplatPayload<Vampire5thData>
  | SplatPayload<Vampire20thData>;

/**
 * Character Splat types Enum
 */
const splatValues = Object.values(Splat) as [string, ...string[]];
export const characterSplats = pgEnum("character_splats", splatValues);

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

    // JSONB column to store the rest of the character data (attributes, skills, disciplines, etc.)
    data: jsonb().$type<CharacterJsonbData>().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [
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

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for selecting/reading character records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectCharacterSchema = createSelectSchema(characters);

/**
 * Zod schema for inserting new character records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertCharacterSchema = createInsertSchema(characters);

/**
 * Zod schema for updating character records in the database.
 * Matches the structure required by UPDATE queries.
 */
export const updateCharacterSchema = createUpdateSchema(characters);
