import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { guilds } from "./guilds";
import { snowflake } from "../schema.types";

/**
 * InitiativeTracker table - stores initiative tracking data for V20 sessions
 *
 * This table tracks initiative order and combat state for V20 (Vampire: The Masquerade 20th Anniversary)
 * sessions. The primary key is the Discord Channel ID where the tracker is being used.
 */
export const initiativeTrackers = pgTable("initiative_trackers", {
  /** Discord Channel Snowflake ID where the tracker is active */
  id: snowflake().primaryKey(),

  /** Foreign key to the Guild this tracker belongs to */
  guildId: snowflake()
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),

  /** JSONB data containing the initiative order and combat state */
  data: jsonb().notNull(),

  /** When the tracker was last updated */
  lastUpdated: timestamp().defaultNow().notNull(),
});

// Type exports for use in other parts of the application
export type InitiativeTrackerDb = InferSelectModel<typeof initiativeTrackers>;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for selecting/reading initiative tracker records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectInitiativeTrackerSchema =
  createSelectSchema(initiativeTrackers);

/**
 * Zod schema for inserting new initiative tracker records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertInitiativeTrackerSchema =
  createInsertSchema(initiativeTrackers);
