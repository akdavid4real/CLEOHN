import { config } from "dotenv";
import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), ".env.local") });

async function pushDatabase() {
  try {
    console.log("Pushing database migrations to Turso...");

    const url = process.env.DATABASE_URL;
    const token = process.env.DATABASE_AUTH_TOKEN;

    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }

    const client = createClient({
      url,
      authToken: token,
    });

    const db = drizzle(client);
    const migrationsFolder = path.join(process.cwd(), "drizzle");

    await migrate(db, {
      migrationsFolder,
    });

    console.log("✅ Database migrations pushed successfully!");
  } catch (error) {
    console.error("Error pushing database:", error);
    process.exit(1);
  }
}

pushDatabase();
