import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

// Load environment variables from root .env
config({ path: resolve(__dirname, "../../../.env") });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
