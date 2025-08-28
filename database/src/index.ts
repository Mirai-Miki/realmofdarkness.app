import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// Schema imports
import * as users from "./schema/users.js";
import * as members from "./schema/members.js";
import * as guilds from "./schema/guilds.js";
import * as initiative from "./schema/initiative.js";
import * as stats from "./schema/stats.js";
import * as characters from "./schema/characters.js";

export * from "./types/index.js";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema: {
    ...users,
    ...members,
    ...guilds,
    ...initiative,
    ...stats,
    ...characters,
  },
});
