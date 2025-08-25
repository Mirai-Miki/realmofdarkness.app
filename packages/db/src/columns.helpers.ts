import { timestamp } from "drizzle-orm/pg-core";

const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
};

export { timestamps };
