import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { servicePackages, serviceItems } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";

// Create database connection
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

// Featured packages configuration (based on current pricing page)
const featuredPackagesConfig = [
  {
    serviceTitle: "Business Name Registration",
    packageName: "VIP Package",
    displayOrder: 1,
    isPopular: true, // BEST VALUE
    pricingDescription: "Full branding kit, hardcopy, and nationwide delivery. 3-7 working days.",
  },
  {
    serviceTitle: "Business Name Registration",
    packageName: "Standard Package",
    displayOrder: 2,
    isPopular: false,
    pricingDescription: "Certificate, TIN, and status report. Soft copies delivered in 1-5 working days.",
  },
  {
    serviceTitle: "Limited Liability Company (LLC)",
    packageName: "Standard Package",
    displayOrder: 3,
    isPopular: false,
    pricingDescription: "Complete incorporation with essential documents. 10-21 working days.",
  },
  {
    serviceTitle: "Limited Liability Company (LLC)",
    packageName: "VIP Package",
    displayOrder: 4,
    isPopular: false,
    pricingDescription: "SCUML, trademark, cards, iron seal, and more. 10-21 working days.",
  },
  {
    serviceTitle: "Limited Liability Company (LLC)",
    packageName: "Premium Exclusive Package",
    displayOrder: 5,
    isPopular: false,
    pricingDescription: "All-inclusive: website, logo, banner, cards, and more. 6-8 weeks.",
  },
  {
    serviceTitle: "Incorporated Trustee (NGO/CHURCH)",
    packageName: "Standard Package",
    displayOrder: 6,
    isPopular: false,
    pricingDescription: "Complete NGO registration with constitution and certificates. 6-9 weeks.",
  },
  // Additional featured packages for pricing page
  {
    serviceTitle: "Trademark Registration",
    packageName: "Trademark",
    displayOrder: 7,
    isPopular: false,
    pricingDescription: "Protect your brand identity with trademark registration. 21-28 working days.",
  },
];

async function seedFeaturedPackages() {
  try {
    console.log("🚀 Marking packages as featured for pricing page...\n");

    let successCount = 0;
    let notFoundCount = 0;

    for (const config of featuredPackagesConfig) {
      // Find the service item by title
      const [serviceItem] = await db
        .select()
        .from(serviceItems)
        .where(like(serviceItems.title, `%${config.serviceTitle}%`))
        .limit(1);

      if (!serviceItem) {
        console.log(`⚠️  Service not found: ${config.serviceTitle}`);
        notFoundCount++;
        continue;
      }

      // Find the package
      const [pkg] = await db
        .select()
        .from(servicePackages)
        .where(
          and(
            eq(servicePackages.serviceItemId, serviceItem.id),
            eq(servicePackages.name, config.packageName)
          )
        )
        .limit(1);

      if (!pkg) {
        console.log(`⚠️  Package not found: ${config.serviceTitle} - ${config.packageName}`);
        notFoundCount++;
        continue;
      }

      // Update package to be featured
      await db
        .update(servicePackages)
        .set({
          featured: true,
          displayOrder: config.displayOrder,
          isPopular: config.isPopular,
          pricingDescription: config.pricingDescription,
        })
        .where(eq(servicePackages.id, pkg.id));

      const badge = config.isPopular ? "⭐ BEST VALUE" : "";
      console.log(
        `✅ Featured: ${config.serviceTitle} - ${config.packageName} ${badge}`
      );
      successCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Marked as featured: ${successCount}`);
    console.log(`   ⚠️  Not found: ${notFoundCount}`);
    console.log(`\n✅ Featured packages seeded successfully!`);
  } catch (error) {
    console.error("❌ Error seeding featured packages:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

seedFeaturedPackages();
