import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";

// Create database connection
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addFeaturedColumns() {
  try {
    console.log("Adding featured columns to service_packages table...\n");

    // Check if columns already exist
    const tableInfo = await client.execute("PRAGMA table_info(service_packages)");
    const columns = tableInfo.rows.map((row: any) => row.name);

    // Add display_order column
    if (!columns.includes("display_order")) {
      await client.execute(`
        ALTER TABLE service_packages ADD COLUMN display_order INTEGER DEFAULT 0
      `);
      console.log("✅ Added display_order column");
    } else {
      console.log("⚠️  display_order column already exists");
    }

    // Add is_popular column
    if (!columns.includes("is_popular")) {
      await client.execute(`
        ALTER TABLE service_packages ADD COLUMN is_popular INTEGER DEFAULT 0
      `);
      console.log("✅ Added is_popular column");
    } else {
      console.log("⚠️  is_popular column already exists");
    }

    // Add pricing_description column
    if (!columns.includes("pricing_description")) {
      await client.execute(`
        ALTER TABLE service_packages ADD COLUMN pricing_description TEXT
      `);
      console.log("✅ Added pricing_description column");
    } else {
      console.log("⚠️  pricing_description column already exists");
    }

    console.log("\n✅ All columns added successfully!");
  } catch (error) {
    console.error("❌ Error adding columns:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

addFeaturedColumns();
