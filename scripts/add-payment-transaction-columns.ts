import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addPaymentColumns() {
  try {
    console.log("🔧 Adding payment transaction columns...\n");

    // Add channel
    try {
      await client.execute(
        `ALTER TABLE payment_transactions ADD COLUMN channel TEXT`
      );
      console.log("✅ Added channel to payment_transactions");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  channel already exists");
      } else throw e;
    }

    // Add currency
    try {
      await client.execute(
        `ALTER TABLE payment_transactions ADD COLUMN currency TEXT DEFAULT 'NGN'`
      );
      console.log("✅ Added currency to payment_transactions");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  currency already exists");
      } else throw e;
    }

    // Add paidAt
    try {
      await client.execute(
        `ALTER TABLE payment_transactions ADD COLUMN paid_at TEXT`
      );
      console.log("✅ Added paid_at to payment_transactions");
    } catch (e: any) {
      if (e.message?.includes("duplicate column")) {
        console.log("⚠️  paid_at already exists");
      } else throw e;
    }

    console.log("\n✅ Payment transaction schema complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

addPaymentColumns();
