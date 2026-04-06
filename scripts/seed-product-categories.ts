import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { productCategories } from "@/lib/db/schema";
import { nanoid } from "nanoid";

async function main() {
  try {
    console.log("Seeding product categories for e-commerce shop...");

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

    // Check existing categories
    const existing = await db.select().from(productCategories);
    console.log("Existing categories:", existing.length);

    if (existing.length === 0) {
      // Create default e-commerce product categories
      const categories = [
        {
          id: nanoid(),
          name: "Books & Publications",
          slug: "books-publications",
          description: "Business books, guides, and educational materials",
          order: 1,
        },
        {
          id: nanoid(),
          name: "Printing Services",
          slug: "printing-services", 
          description: "Document printing, business cards, letterheads",
          order: 2,
        },
        {
          id: nanoid(),
          name: "Office Supplies",
          slug: "office-supplies",
          description: "Stationery, forms, and office essentials",
          order: 3,
        },
        {
          id: nanoid(),
          name: "Digital Products",
          slug: "digital-products",
          description: "Templates, software, digital downloads",
          order: 4,
        },
      ];

      await db.insert(productCategories).values(categories);
      console.log(`✅ Created ${categories.length} product categories`);
      
      categories.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log("✅ Product categories already exist");
      existing.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug})`);
      });
    }

  } catch (error) {
    console.error("Error seeding product categories:", error);
    process.exit(1);
  }
}

main();