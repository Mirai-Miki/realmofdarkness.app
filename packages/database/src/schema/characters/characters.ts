import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";

import {
  pgTable,
  pgEnum,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  Splat,
  CharacterConstraints,
  CharacterStatus,
  SplatSchema,
  CharacterStatusSchema,
  SnowflakeSchema,
} from "@realm/common";
import { users } from "../users";
import { chronicles } from "../chronicles";
import { chronicleMembers } from "../chronicle-members";
import { snowflake } from "../../schema.types";
import { vampire5th } from "./vampire-5th";

/**
 * Character Splat types Enum
 */
const splatValues = Object.values(Splat) as [string, ...string[]];
export const characterSplats = pgEnum("character_splats", splatValues);

/**
 * Character Status Enum
 */
const statusValues = Object.values(CharacterStatus) as [string, ...string[]];
export const characterStatus = pgEnum("character_status", statusValues);

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

    chronicleId: snowflake().references(() => chronicles.id, {
      onDelete: "set null",
    }),

    splat: characterSplats().$type<Splat>().notNull().default(Splat.Vampire5th),
    status: characterStatus()
      .$type<CharacterStatus>()
      .notNull()
      .default(CharacterStatus.Draft),

    createdAt: timestamp().defaultNow().notNull(),
    lastUpdated: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("characters_user_id_idx").on(table.userId),
    index("characters_chronicle_id_idx").on(table.chronicleId),
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
  // One-to-one splat relations
  vampire5th: one(vampire5th),
}));

export type CharacterDb = InferSelectModel<typeof characters>;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for selecting/reading character records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectCharacterSchema = createSelectSchema(characters, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema.nullable(),
  splat: SplatSchema,
  status: CharacterStatusSchema,
});

/**
 * Zod schema for inserting new character records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertCharacterSchema = createInsertSchema(characters, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema.nullable(),
  splat: SplatSchema,
  status: CharacterStatusSchema,
});

/**
 * Zod schema for updating character records in the database.
 * Matches the structure required by UPDATE queries.
 */
export const updateCharacterSchema = createUpdateSchema(characters, {
  id: SnowflakeSchema,
  userId: SnowflakeSchema,
  chronicleId: SnowflakeSchema.nullable(),
  splat: SplatSchema,
  status: CharacterStatusSchema,
});

// ============================================================================
// TypeScript Types (Inferred from Zod Schemas)
// ============================================================================

export type SelectCharacterData = z.infer<typeof selectCharacterSchema>;
export type InsertCharacterData = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacterData = z.infer<typeof updateCharacterSchema>;
