import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

async function main() {
  try {
    console.log("Cleaning up and migrating database...");

    const dbUrl = process.env.DATABASE_URL;
    const dbToken = process.env.DATABASE_AUTH_TOKEN;

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const client = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    const db = drizzle(client);

    // Clean up any existing temp table
    console.log("Cleaning up any existing temp table...");
    try {
      await db.run(`DROP TABLE IF EXISTS products_new`);
    } catch (e) {
      console.log("No temp table to clean up");
    }

    // For now, let's just update the validation to make SKU required but allow empty strings
    // This is a simpler approach that doesn't require database migration
    console.log("✅ Cleanup completed!");
    console.log("Will handle SKU validation in the application layer instead.");

  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

main();