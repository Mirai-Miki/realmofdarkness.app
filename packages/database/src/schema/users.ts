import {
  pgTable,
  pgEnum,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { SupporterName } from "@realm/core";
import { snowflake } from "../schema_types";

export const supporterLevel = pgEnum("supporter_level", [
  SupporterName.Base,
  SupporterName.Mortal,
  SupporterName.Fledgling,
  SupporterName.Neonate,
  SupporterName.Ancilla,
  SupporterName.Elder,
  SupporterName.Methuselah,
  SupporterName.Antediluvian,
]);

export const users = pgTable("users", {
  id: snowflake().primaryKey(), // Discord Snowflake
  username: varchar({ length: 40 }).notNull().unique(),
  displayName: varchar({ length: 40 }).notNull().default(""),
  email: varchar({ length: 100 }),
  avatarUrl: varchar({ length: 200 }).notNull().default(""),
  registered: boolean().notNull().default(false), // If the user has logged in
  admin: boolean().notNull().default(false), // RoD admin
  supporter: supporterLevel().notNull().default(SupporterName.Base),

  createdAt: timestamp().defaultNow().notNull(),
  // when the model was last saved
  updatedAt: timestamp().defaultNow().notNull(),
  // when the user last logged in or used the bot
  lastActive: timestamp().defaultNow().notNull(),
});
