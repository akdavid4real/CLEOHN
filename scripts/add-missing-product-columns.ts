import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addMissingColumns() {
  try {
    console.log("🔧 Adding missing columns to products and orders tables...\n");

    // Add compareAtPrice to products
    try {
      await client.execute(
        `ALTER TABLE products ADD COLUMN compare_at_price REAL`
      );
      console.log("✅ Added compare_at_price to products");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  compare_at_price already exists");
      } else throw e;
    }

    // Add isActive to products
    try {
      await client.execute(
        `ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`
      );
      console.log("✅ Added is_active to products");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  is_active already exists");
      } else throw e;
    }

    // Add paymentStatus to orders
    try {
      await client.execute(
        `ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'`
      );
      console.log("✅ Added payment_status to orders");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  payment_status already exists");
      } else throw e;
    }

    console.log("\n✅ Schema migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

addMissingColumns();
