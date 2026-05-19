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
import { chronicles } from "./chronicles";
import { chronicleMembers } from "./chronicle-members";
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
  | "chronicleId"
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
// TODO: This JSONB implementation is likely to be refactored into a more structured table for each
// splat system. JSONB is not ideal for the complex queries and micro-patches required on character
// data. When this refactoring occurs, the character repository will need to handle optimized queries
// and stitch the relational data back together to form the unified domain entities.
export const characters = pgTable(
  "characters",
  {
    id: snowflake().primaryKey(),
    name: varchar({ length: CharacterConstraints.Name.MaxLength }).notNull(),

    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    chronicleId: snowflake().references(() => chronicles.id, {
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
    uniqueIndex("characters_chronicle_idx").on(table.chronicleId),
    uniqueIndex("characters_user_chronicle_idx").on(
      table.userId,
      table.chronicleId
    ),
  ]
);

// Define relations
export const charactersRelations = relations(characters, ({ one }) => ({
  // Many-to-one relations
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  chronicle: one(chronicles, {
    fields: [characters.chronicleId],
    references: [chronicles.id],
  }),
  // Inferred relation: member is the user-chronicle relationship
  // Only exists when character has a chronicle
  member: one(chronicleMembers, {
    fields: [characters.userId, characters.chronicleId],
    references: [chronicleMembers.userId, chronicleMembers.chronicleId],
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
