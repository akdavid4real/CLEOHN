import { config } from "dotenv";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products, productCategories } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const sampleProducts = [
  {
    categorySlug: "printing-services",
    products: [
      {
        name: "Business Cards (100 pcs)",
        description: "Professional business cards printed on premium cardstock",
        price: 5000,
        compareAtPrice: 7000,
        stock: 100,
        featured: true,
      },
      {
        name: "Letterhead Design & Print (50 pcs)",
        description: "Custom letterhead design and printing for your business",
        price: 8000,
        compareAtPrice: 10000,
        stock: 50,
      },
      {
        name: "Flyers & Brochures (100 pcs)",
        description: "High-quality marketing materials for your business",
        price: 12000,
        stock: 75,
      },
    ],
  },
  {
    categorySlug: "books-publications",
    products: [
      {
        name: "Business Registration Guide",
        description: "Complete guide to registering your business in Nigeria",
        price: 3500,
        stock: 50,
      },
      {
        name: "Tax Compliance Handbook",
        description: "Essential guide for Nigerian business tax compliance",
        price: 4000,
        stock: 30,
      },
    ],
  },
  {
    categorySlug: "clothing-apparel",
    products: [
      {
        name: "Corporate Polo Shirt",
        description: "Branded polo shirt for corporate events",
        price: 6000,
        compareAtPrice: 8000,
        stock: 100,
      },
      {
        name: "Custom T-Shirt",
        description: "Customized t-shirt with your company logo",
        price: 4500,
        stock: 150,
      },
    ],
  },
  {
    categorySlug: "office-supplies",
    products: [
      {
        name: "Receipt Booklet (50 pages)",
        description: "Professional receipt booklet for your business",
        price: 2500,
        stock: 200,
      },
      {
        name: "Company Stamp",
        description: "Official company rubber stamp",
        price: 3000,
        stock: 50,
      },
    ],
  },
];

async function seedProducts() {
  try {
    console.log("🚀 Starting product seeding...\n");

    // Get all categories
    const categories = await db.select().from(productCategories);
    
    if (categories.length === 0) {
      console.error("❌ No categories found. Please seed categories first.");
      process.exit(1);
    }

    console.log(`✅ Found ${categories.length} categories\n`);

    let totalProducts = 0;

    for (const categoryData of sampleProducts) {
      const category = categories.find(c => c.slug === categoryData.categorySlug);
      
      if (!category) {
        console.log(`⚠️  Category ${categoryData.categorySlug} not found, skipping...`);
        continue;
      }

      console.log(`📦 Seeding products for: ${category.name}`);

      for (const product of categoryData.products) {
        const productId = nanoid();
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        await db.insert(products).values({
          id: productId,
          categoryId: category.id,
          name: product.name,
          slug: slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice || null,
          sku: sku,
          stock: product.stock,
          featured: product.featured || false,
          isActive: true,
          order: 0,
        });

        console.log(`  ✓ ${product.name} (₦${product.price.toLocaleString()})`);
        totalProducts++;
      }

      console.log("");
    }

    console.log(`✅ Successfully seeded ${totalProducts} products!`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
