import type { InferSelectModel } from "drizzle-orm";

import { pgTable, bigint, timestamp, jsonb } from "drizzle-orm/pg-core";
import { guilds } from "./guilds.js";

/**
 * InitiativeTracker table - stores initiative tracking data for V20 sessions
 *
 * This table tracks initiative order and combat state for V20 (Vampire: The Masquerade 20th Anniversary)
 * sessions. The primary key is the Discord Channel ID where the tracker is being used.
 */
export const initiativeTrackers = pgTable("initiative_trackers", {
  /** Discord Channel Snowflake ID where the tracker is active */
  id: bigint({ mode: "bigint" }).primaryKey(),

  /** Foreign key to the Guild this tracker belongs to */
  guildId: bigint({ mode: "bigint" })
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),

  /** JSONB data containing the initiative order and combat state */
  data: jsonb().notNull(),

  /** When the tracker was last updated */
  lastUpdated: timestamp().defaultNow().notNull(),
});

// Type exports for use in other parts of the application
export type InitiativeTrackerDb = InferSelectModel<typeof initiativeTrackers>;
