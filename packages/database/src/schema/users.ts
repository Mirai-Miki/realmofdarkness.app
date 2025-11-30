import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { snowflake } from "../schema_types";

import type { InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: snowflake().primaryKey(), // Discord Snowflake
  username: varchar({ length: 40 }).notNull().unique(),
  displayName: varchar({ length: 40 }).notNull().default(""),
  email: varchar({ length: 100 }),
  avatarUrl: varchar({ length: 200 }).notNull().default(""),
  registered: boolean().notNull().default(false), // If the user has ever logged in
  admin: boolean().notNull().default(false), // RoD admin

  createdAt: timestamp().defaultNow().notNull(),
  // when the model was last saved
  updatedAt: timestamp().defaultNow().notNull(),
  // when the user last logged in or used the bot
  lastActive: timestamp().defaultNow().notNull(),
});

// Type exports for use in other parts of the application
export type UserDb = InferSelectModel<typeof users>;
