import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

async function main() {
  try {
    console.log("Migrating database to make SKU optional...");

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

    // SQLite doesn't support ALTER COLUMN directly, so we need to:
    // 1. Create a new table with the correct schema
    // 2. Copy data from old table
    // 3. Drop old table
    // 4. Rename new table

    console.log("Creating new products table with optional SKU...");
    
    await db.run(`
      CREATE TABLE products_new (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        compare_at_price REAL,
        sku TEXT UNIQUE,
        stock INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        "order" INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Copying data from old table...");
    
    await db.run(`
      INSERT INTO products_new 
      SELECT * FROM products
    `);

    console.log("Dropping old table...");
    await db.run(`DROP TABLE products`);

    console.log("Renaming new table...");
    await db.run(`ALTER TABLE products_new RENAME TO products`);

    console.log("✅ Migration completed successfully!");
    console.log("SKU is now optional and nullable in the products table.");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();