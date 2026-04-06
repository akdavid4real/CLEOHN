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

    // First, let's check what products exist
    const existingProducts = await db.run("SELECT id, name, sku FROM products");
    console.log("Existing products:", existingProducts);

    // Create new table with optional SKU
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

    console.log("Copying data with SKU handling...");
    
    // Copy data, setting duplicate SKUs to NULL
    await db.run(`
      INSERT INTO products_new (
        id, category_id, name, slug, description, price, compare_at_price,
        sku, stock, rating, review_count, featured, is_active, "order",
        created_at, updated_at
      )
      SELECT 
        id, category_id, name, slug, description, price, compare_at_price,
        CASE 
          WHEN sku = '' THEN NULL
          ELSE sku
        END as sku,
        stock, rating, review_count, featured, is_active, "order",
        created_at, updated_at
      FROM products
    `);

    console.log("Dropping old table...");
    await db.run(`DROP TABLE products`);

    console.log("Renaming new table...");
    await db.run(`ALTER TABLE products_new RENAME TO products`);

    console.log("✅ Migration completed successfully!");
    console.log("SKU is now optional and nullable in the products table.");

  } catch (error) {
    console.error("Migration failed:", error);
    
    // Try to clean up if something went wrong
    try {
      await db.run(`DROP TABLE IF EXISTS products_new`);
      console.log("Cleaned up temporary table");
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }
    
    process.exit(1);
  }
}

main();