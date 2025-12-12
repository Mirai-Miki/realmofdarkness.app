import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// Schema imports
import * as users from "./schema/users.js";
import * as members from "./schema/members.js";
import * as guilds from "./schema/guilds.js";
import * as initiative from "./schema/initiative.js";
import * as stats from "./schema/stats.js";
import * as characters from "./schema/characters.js";
import * as supporters from "./schema/supporters.js";

// Export schema tables
export { users, type UserDb } from "./schema/users.js";
export {
  supporters,
  supporterLevel,
  type SupporterDb,
} from "./schema/supporters.js";
export { members, type MemberDb } from "./schema/members.js";
export { guilds, type GuildDb } from "./schema/guilds.js";
export {
  characters,
  characterSplats,
  type CharacterDb,
} from "./schema/characters.js";
export {
  initiativeTrackers,
  type InitiativeTrackerDb,
} from "./schema/initiative.js";
export { commandStats, type CommandStatDb } from "./schema/stats.js";

/**
 * Drizzle database instance singleton.
 *
 * Configured with:
 * - PostgreSQL connection from DATABASE_URL environment variable
 * - Snake case naming convention for database columns
 * - All schema tables included for type safety
 *
 * @example
 * ```typescript
 * import { db } from "database";
 *
 * const users = await db.select().from(users.users);
 * ```
 */
let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return drizzle({
    connection: process.env.DATABASE_URL,
    casing: "snake_case",
    schema: {
      ...users,
      ...members,
      ...guilds,
      ...initiative,
      ...stats,
      ...characters,
      ...supporters,
    },
  });
}

/**
 * Gets the singleton database instance.
 * Creates the connection on first access.
 */
export const db = (() => {
  if (!_db) {
    _db = createDatabase();
  }
  return _db;
})();

// Export the database type for use in repositories
export type Database = typeof db;
