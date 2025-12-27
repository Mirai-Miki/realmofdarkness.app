import type { InferSelectModel } from "drizzle-orm";

import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { snowflake } from "../schema_types";
import { UsernameConstraints, DiscordCdnUrlMaxLength } from "@realm/common";
import { supporters } from "./supporters";

export const users = pgTable("users", {
  id: snowflake().primaryKey(), // Discord Snowflake
  username: varchar({ length: UsernameConstraints.MaxLength })
    .notNull()
    .unique(),
  displayName: varchar({ length: UsernameConstraints.MaxLength })
    .notNull()
    .default(""),
  email: varchar({ length: 100 }),
  avatarUrl: varchar({ length: DiscordCdnUrlMaxLength }).notNull().default(""),
  registered: boolean().notNull().default(false), // If the user has ever logged in
  admin: boolean().notNull().default(false), // RoD admin

  createdAt: timestamp().defaultNow().notNull(),
  // when the model was last saved
  updatedAt: timestamp().defaultNow().notNull(),
  // when the user last logged in or used the bot
  lastActive: timestamp().defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  // One-to-one relation with supporters
  // All users should have a supporter record (defaults to Base tier)
  supporter: one(supporters, {
    fields: [users.id],
    references: [supporters.userId],
  }),
}));

// Type exports for use in other parts of the application
export type UserDb = InferSelectModel<typeof users>;
