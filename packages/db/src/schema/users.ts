import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint({ mode: "bigint" }).primaryKey(), // Discord Snowflake
  username: varchar({ length: 40 }).notNull().unique(),
  email: varchar({ length: 100 }).notNull().default(""),
  avatarUrl: varchar({ length: 200 }).notNull().default(""),
  registered: boolean().notNull().default(false), // If the user has logged in
  admin: boolean().notNull().default(false), // RoD admin
  supporter: integer().notNull().default(0), // Supporter level

  createdAt: timestamp().defaultNow().notNull(),
  // when the model was last saved
  updatedAt: timestamp().defaultNow().notNull(),
  // when the user last logged in or used the bot
  lastActive: timestamp().defaultNow().notNull(),
});
