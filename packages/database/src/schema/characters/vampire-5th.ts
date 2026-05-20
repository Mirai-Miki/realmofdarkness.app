import type { InferSelectModel } from "drizzle-orm";
import { pgTable, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { characters } from "./characters";
import { snowflake } from "../../schema.types";
import { SnowflakeSchema } from "@realm/common";

/**
 * Vampire 5th Edition Character table
 *
 * Implements Class Table Inheritance for Vampire 5th characters.
 */
export const vampire5th = pgTable("vampire_5th", {
  characterId: snowflake()
    .primaryKey()
    .references(() => characters.id, { onDelete: "cascade" }),

  hunger: integer().notNull().default(1),
});

// Define relations
export const vampire5thRelations = relations(vampire5th, ({ one }) => ({
  // Inverse relation back to base character
  character: one(characters, {
    fields: [vampire5th.characterId],
    references: [characters.id],
  }),
}));

export type Vampire5thDb = InferSelectModel<typeof vampire5th>;

// ============================================================================
// Zod Schemas
// ============================================================================

export const selectVampire5thSchema = createSelectSchema(vampire5th, {
  characterId: SnowflakeSchema,
});
export const insertVampire5thSchema = createInsertSchema(vampire5th, {
  characterId: SnowflakeSchema,
});
export const updateVampire5thSchema = createUpdateSchema(vampire5th, {
  characterId: SnowflakeSchema,
});
