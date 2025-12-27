import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
config({ path: resolve(__dirname, "../../../.env") });

// Schema imports - import only tables, relations, and enums for Drizzle schema
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

// Export schema tables and types
export { users, usersRelations, type UserDb } from "./schema/users";
export {
  supporters,
  supportersRelations,
  type SupporterDb,
} from "./schema/supporters";
export { members, membersRelations, type MemberDb } from "./schema/members";
export { guilds, guildsRelations, type GuildDb } from "./schema/guilds";
export {
  characters,
  charactersRelations,
  type CharacterDb,
} from "./schema/characters";
export {
  initiativeTrackers,
  type InitiativeTrackerDb,
} from "./schema/initiative";
export { commandStats, type CommandStatDb } from "./schema/stats";

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

// Export the database type for use in repositories
export type Database = typeof db;
