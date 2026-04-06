import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
