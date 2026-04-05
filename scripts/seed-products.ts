import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { productCategories, products, productImages } from "../lib/db/schema";
import { nanoid } from "nanoid";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

// Sample product data for Nigerian CAC/business services shop
const categoriesData = [
  {
    name: "Business Documents",
    slug: "business-documents",
    description: "Official CAC certificates, business cards, and corporate documents",
    order: 1,
  },
  {
    name: "Office Supplies",
    slug: "office-supplies",
    description: "Letterheads, envelopes, and business stationery",
    order: 2,
  },
  {
    name: "Branding Materials",
    slug: "branding-materials",
    description: "Banners, signage, and promotional items",
    order: 3,
  },
  {
    name: "Digital Products",
    slug: "digital-products",
    description: "Logo designs, website templates, and digital assets",
    order: 4,
  },
];

const productsData = [
  // Business Documents
  {
    category: "business-documents",
    name: "Framed CAC Certificate",
    slug: "framed-cac-certificate",
    description: "Premium quality framed Certificate of Incorporation (30x40cm) with gold trim. Perfect for displaying in your office or boardroom.",
    price: 25000,
    compareAtPrice: 35000,
    sku: "CAC-FRAME-001",
    stock: 50,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800", alt: "Framed CAC Certificate", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800", alt: "Certificate Close-up" },
    ],
  },
  {
    category: "business-documents",
    name: "Business Name Certificate (Hardcopy)",
    slug: "business-name-certificate",
    description: "Official hardcopy of your Business Name Registration Certificate. Delivered nationwide.",
    price: 15000,
    sku: "BN-CERT-001",
    stock: 100,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", alt: "Business Certificate", isPrimary: true },
    ],
  },
  {
    category: "business-documents",
    name: "Company ID Cards (Set of 5)",
    slug: "company-id-cards",
    description: "Professional PVC ID cards with your company logo and employee details. Includes lanyards.",
    price: 12000,
    compareAtPrice: 15000,
    sku: "ID-CARD-005",
    stock: 75,
    images: [
      { url: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=800", alt: "Company ID Cards", isPrimary: true },
    ],
  },
  {
    category: "business-documents",
    name: "Company Iron Seal",
    slug: "company-iron-seal",
    description: "Official company seal/stamp with your business name and RC number. Essential for formal documents.",
    price: 8000,
    sku: "SEAL-001",
    stock: 40,
    images: [
      { url: "https://images.unsplash.com/photo-1586281380614-07cf3e3b5a28?w=800", alt: "Company Seal", isPrimary: true },
    ],
  },

  // Office Supplies
  {
    category: "office-supplies",
    name: "Customized Letterheads (100 sheets)",
    slug: "letterheads-100",
    description: "High-quality A4 letterheads with your company logo, address, and contact details. Premium 100gsm paper.",
    price: 8000,
    compareAtPrice: 10000,
    sku: "LH-100-001",
    stock: 200,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800", alt: "Letterhead Stack", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1586281380349-f04139c6d62f?w=800", alt: "Letterhead Design" },
    ],
  },
  {
    category: "office-supplies",
    name: "Business Cards (100 pieces)",
    slug: "business-cards-100",
    description: "Premium business cards on 300gsm art card with full color print. Include logo, name, title, and contacts.",
    price: 5000,
    sku: "BC-100-001",
    stock: 150,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800", alt: "Business Cards", isPrimary: true },
    ],
  },
  {
    category: "office-supplies",
    name: "Branded Envelopes (50 pieces)",
    slug: "envelopes-50",
    description: "Custom printed C5 envelopes with your company logo and address. Professional finishing.",
    price: 6000,
    sku: "ENV-050-001",
    stock: 100,
    images: [
      { url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800", alt: "Branded Envelopes", isPrimary: true },
    ],
  },
  {
    category: "office-supplies",
    name: "Receipt Booklets (5 booklets)",
    slug: "receipt-booklets",
    description: "Customized receipt booklets, 50 leaves per booklet. Includes company name, logo, and serial numbers.",
    price: 10000,
    sku: "REC-005-001",
    stock: 80,
    images: [
      { url: "https://images.unsplash.com/photo-1554224311-beee4ece3c5d?w=800", alt: "Receipt Booklets", isPrimary: true },
    ],
  },
  {
    category: "office-supplies",
    name: "Sales Record Book",
    slug: "sales-record-book",
    description: "Professional hardcover sales record book with 200 pages. Pre-printed columns for tracking daily sales.",
    price: 4000,
    sku: "SRB-001",
    stock: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800", alt: "Sales Record Book", isPrimary: true },
    ],
  },

  // Branding Materials
  {
    category: "branding-materials",
    name: "Roll-Up Banner Stand",
    slug: "rollup-banner",
    description: "Premium 85cm x 200cm roll-up banner with high-resolution print. Includes carrying case and stand.",
    price: 18000,
    compareAtPrice: 25000,
    sku: "BANNER-RU-001",
    stock: 30,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800", alt: "Roll-Up Banner", isPrimary: true },
    ],
  },
  {
    category: "branding-materials",
    name: "CEO Desk Name Plate",
    slug: "ceo-desk-nameplate",
    description: "Elegant wooden desk name plate with engraved name and title. Gold-finished metal plate.",
    price: 7500,
    sku: "DNP-CEO-001",
    stock: 50,
    images: [
      { url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800", alt: "CEO Name Plate", isPrimary: true },
    ],
  },
  {
    category: "branding-materials",
    name: "Branded Polo Shirts (Set of 5)",
    slug: "polo-shirts-5",
    description: "High-quality cotton polo shirts with embroidered company logo. Available in multiple colors and sizes.",
    price: 15000,
    sku: "POLO-005-001",
    stock: 40,
    images: [
      { url: "https://images.unsplash.com/photo-1628329068804-1b3dfa23c656?w=800", alt: "Branded Polo Shirts", isPrimary: true },
    ],
  },
  {
    category: "branding-materials",
    name: "Promotional Tote Bags (10 pieces)",
    slug: "tote-bags-10",
    description: "Eco-friendly canvas tote bags with your company logo. Perfect for events and giveaways.",
    price: 8000,
    sku: "TOTE-010-001",
    stock: 100,
    images: [
      { url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800", alt: "Promotional Tote Bags", isPrimary: true },
    ],
  },

  // Digital Products
  {
    category: "digital-products",
    name: "Professional Logo Design",
    slug: "logo-design",
    description: "Custom professional logo design with 3 concepts, unlimited revisions, and all source files included.",
    price: 35000,
    compareAtPrice: 50000,
    sku: "LOGO-DES-001",
    stock: 9999, // Digital product - unlimited
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800", alt: "Logo Design Service", isPrimary: true },
    ],
  },
  {
    category: "digital-products",
    name: "Business Website Template",
    slug: "website-template",
    description: "Modern, responsive business website template. Includes 5 pages, contact forms, and mobile optimization.",
    price: 45000,
    compareAtPrice: 60000,
    sku: "WEB-TMP-001",
    stock: 9999,
    featured: true,
    images: [
      { url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800", alt: "Website Template", isPrimary: true },
    ],
  },
  {
    category: "digital-products",
    name: "Social Media Graphics Package",
    slug: "social-media-graphics",
    description: "10 professionally designed social media templates for Instagram, Facebook, and LinkedIn.",
    price: 12000,
    sku: "SMG-PKG-010",
    stock: 9999,
    images: [
      { url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800", alt: "Social Media Graphics", isPrimary: true },
    ],
  },
  {
    category: "digital-products",
    name: "Brochure Design (Bi-Fold)",
    slug: "brochure-design",
    description: "Professional bi-fold brochure design for your business. Print-ready files in PDF and editable AI format.",
    price: 20000,
    sku: "BROCH-BF-001",
    stock: 9999,
    images: [
      { url: "https://images.unsplash.com/photo-1586281380426-154544878f9d?w=800", alt: "Brochure Design", isPrimary: true },
    ],
  },
];

async function seedProducts() {
  try {
    console.log("🚀 Seeding product catalog...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing product data...");
    await db.delete(productImages);
    await db.delete(products);
    await db.delete(productCategories);
    console.log("✅ Cleared\n");

    // Seed categories
    console.log("📁 Creating product categories...");
    const categoryMap = new Map<string, string>();
    for (const cat of categoriesData) {
      const id = nanoid();
      await db.insert(productCategories).values({
        id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      categoryMap.set(cat.slug, id);
      console.log(`  ✅ ${cat.name}`);
    }
    console.log("");

    // Seed products
    console.log("📦 Creating products with images...");
    let productCount = 0;
    let imageCount = 0;

    for (const prod of productsData) {
      const productId = nanoid();
      const categoryId = categoryMap.get(prod.category);

      if (!categoryId) {
        console.log(`  ⚠️  Category not found for ${prod.name}`);
        continue;
      }

      await db.insert(products).values({
        id: productId,
        categoryId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice || null,
        sku: prod.sku,
        stock: prod.stock,
        featured: prod.featured || false,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add images
      for (let i = 0; i < prod.images.length; i++) {
        const img = prod.images[i];
        await db.insert(productImages).values({
          id: nanoid(),
          productId,
          imageUrl: img.url,
          altText: img.alt,
          isPrimary: img.isPrimary || i === 0,
          order: i,
        });
        imageCount++;
      }

      productCount++;
      const price = prod.compareAtPrice
        ? `₦${prod.price.toLocaleString()} (was ₦${prod.compareAtPrice.toLocaleString()})`
        : `₦${prod.price.toLocaleString()}`;
      console.log(`  ✅ ${prod.name} - ${price}`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categoriesData.length}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Images: ${imageCount}`);
    console.log(`   - Featured Products: ${productsData.filter(p => p.featured).length}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

seedProducts();
