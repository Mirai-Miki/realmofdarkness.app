import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { snowflake } from "../schema.types";
import { CommandNameMaxLength } from "@realm/common";

/**
 * CommandStats table - tracks usage statistics for bot commands
 *
 * This table stores how many times each user has used each command with each bot,
 * helping with analytics and usage tracking.
 */
export const commandStats = pgTable(
  "command_stats",
  {
    /** Auto-generated primary key */
    id: snowflake().primaryKey(),

    /** Foreign key to User who used the command */
    userId: snowflake()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    botId: snowflake().notNull(),

    /** Name of the command that was used */
    command: varchar({ length: CommandNameMaxLength }).notNull(),

    /** Number of times this command has been used by this user with this bot */
    used: integer().notNull().default(1),

    /** When the command was last used */
    lastUsed: timestamp().defaultNow().notNull(),
  },
  (table) => [
    // Ensure uniqueness per user, command, and bot combination
    unique().on(table.userId, table.command, table.botId),
  ]
);

// Type exports for use in other parts of the application
export type CommandStatDb = InferSelectModel<typeof commandStats>;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for selecting/reading command stat records from the database.
 * Matches the exact structure returned by SELECT queries.
 */
export const selectCommandStatSchema = createSelectSchema(commandStats);

/**
 * Zod schema for inserting new command stat records into the database.
 * Matches the structure required by INSERT queries.
 */
export const insertCommandStatSchema = createInsertSchema(commandStats);
