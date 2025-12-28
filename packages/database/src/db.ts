import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, usersRelations } from "./schema/users";
import { members, membersRelations } from "./schema/members";
import { guilds, guildsRelations } from "./schema/guilds";
import { initiativeTrackers } from "./schema/initiative";
import { commandStats } from "./schema/stats";
import {
  characters,
  charactersRelations,
  characterSplats,
} from "./schema/characters";
import {
  supporters,
  supportersRelations,
  supporterLevel,
} from "./schema/supporters";

// Load environment variables from root .env file
config({ path: resolve(process.cwd(), "../../.env"), quiet: true });

/**
 * PostgreSQL connection pool
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle database instance singleton.
 *
 * Configured with:
 * - PostgreSQL connection pool from DATABASE_URL environment variable
 * - Snake case naming convention for database columns
 * - All schema tables included for type safety
 *
 * @example
 * ```typescript
 * import { db } from "@realm/database";
 *
 * const allUsers = await db.select().from(users);
 * ```
 */
export const db = drizzle(pool, {
  casing: "snake_case",
  schema: {
    users,
    usersRelations,
    members,
    membersRelations,
    guilds,
    guildsRelations,
    initiativeTrackers,
    commandStats,
    characters,
    charactersRelations,
    characterSplats,
    supporters,
    supportersRelations,
    supporterLevel,
  },
});

/**
 * Database type for use in repositories and services.
 * Provides full type safety for Drizzle queries.
 */
export type Database = typeof db;
