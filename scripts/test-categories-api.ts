import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { productCategories } from "@/lib/db/schema";

async function main() {
  try {
    console.log("Testing categories API...");

    const dbUrl = process.env.DATABASE_URL;
    const dbToken = process.env.DATABASE_AUTH_TOKEN;

    const client = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    const db = drizzle(client);

    // Check categories directly from database
    const categories = await db.select().from(productCategories);
    console.log("Categories from database:", categories);

    // Test API endpoint
    const response = await fetch("http://localhost:3000/api/admin/categories");
    console.log("API Response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("API Response data:", data);
    } else {
      console.log("API Error:", await response.text());
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

main();