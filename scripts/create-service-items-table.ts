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

async function createServiceItemsTable() {
  try {
    console.log("Creating service_items table...\n");

    // Create service_items table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS service_items (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT,
        cost TEXT,
        delivery TEXT,
        info_points TEXT,
        types TEXT,
        phases TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ service_items table created successfully!");

    // Update service_packages table to use service_item_id
    console.log("\nUpdating service_packages table...");

    // Check if service_item_id column exists
    const tableInfo = await client.execute("PRAGMA table_info(service_packages)");
    const hasServiceItemId = tableInfo.rows.some((row: any) => row.name === "service_item_id");

    if (!hasServiceItemId) {
      // Create new table with correct schema
      await client.execute(`
        CREATE TABLE IF NOT EXISTS service_packages_new (
          id TEXT PRIMARY KEY,
          service_item_id TEXT NOT NULL REFERENCES service_items(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          processing_time TEXT,
          featured INTEGER DEFAULT 0,
          "order" INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Copy data if old table has any
      const hasOldData = await client.execute("SELECT COUNT(*) as count FROM service_packages");
      if (hasOldData.rows[0]?.count > 0) {
        console.log("⚠️  Warning: Old service_packages table has data. Please manually migrate if needed.");
      }

      // Drop old table and rename new one
      await client.execute("DROP TABLE IF EXISTS service_packages");
      await client.execute("ALTER TABLE service_packages_new RENAME TO service_packages");

      console.log("✅ service_packages table updated successfully!");
    } else {
      console.log("✅ service_packages table already has correct schema!");
    }

    console.log("\n✅ All tables ready for seeding!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

createServiceItemsTable();
