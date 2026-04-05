import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function fixReviewTitle() {
  try {
    console.log("🔧 Making review title column nullable...\n");

    // SQLite doesn't support ALTER COLUMN, so we need to:
    // 1. Create new table with nullable title
    // 2. Copy data
    // 3. Drop old table
    // 4. Rename new table

    await client.execute(`
      CREATE TABLE product_reviews_new (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        rating INTEGER NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        approved INTEGER DEFAULT 0,
        helpful INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created new table with nullable title");

    // Copy existing data (if any)
    await client.execute(`
      INSERT INTO product_reviews_new
      SELECT * FROM product_reviews
    `);
    console.log("✅ Copied existing reviews");

    // Drop old table
    await client.execute(`DROP TABLE product_reviews`);
    console.log("✅ Dropped old table");

    // Rename new table
    await client.execute(`ALTER TABLE product_reviews_new RENAME TO product_reviews`);
    console.log("✅ Renamed table");

    console.log("\n✅ Migration complete! Review title is now optional.");
  } catch (error: any) {
    if (error.message?.includes("no such table: product_reviews")) {
      console.log("⚠️  product_reviews table doesn't exist yet. Skipping migration.");
    } else {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }
  } finally {
    client.close();
  }
}

fixReviewTitle();
