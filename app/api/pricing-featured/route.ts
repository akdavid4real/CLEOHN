import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { servicePackages, packageFeatures, serviceItems, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface FeaturedPackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  category: string;
  features: string[];
  popular: boolean;
  processingTime: string;
}

export async function GET() {
  try {
    // Get all featured packages ordered by displayOrder
    const featuredPackages = await db
      .select()
      .from(servicePackages)
      .where(eq(servicePackages.featured, true))
      .orderBy(servicePackages.displayOrder);

    // Build response with full details from service items
    const packagesWithDetails: FeaturedPackage[] = await Promise.all(
      featuredPackages.map(async (pkg) => {
        // Get service item details
        const [item] = await db
          .select()
          .from(serviceItems)
          .where(eq(serviceItems.id, pkg.serviceItemId))
          .limit(1);

        if (!item) {
          throw new Error(`Service item not found for package ${pkg.id}`);
        }

        // Get category
        const [category] = await db
          .select()
          .from(services)
          .where(eq(services.id, item.serviceId))
          .limit(1);

        // Get features/deliverables
        const features = await db
          .select()
          .from(packageFeatures)
          .where(eq(packageFeatures.packageId, pkg.id))
          .orderBy(packageFeatures.order);

        return {
          id: pkg.id,
          title: item.title,
          subtitle: pkg.name,
          price: pkg.price,
          description: pkg.pricingDescription || `${pkg.processingTime || 'Quick delivery'}`,
          category: category?.name || '',
          features: features.map((f) => f.feature),
          popular: pkg.isPopular || false,
          processingTime: pkg.processingTime || '',
        };
      })
    );

    return NextResponse.json({ packages: packagesWithDetails });
  } catch (error) {
    console.error("Error fetching featured packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing packages" },
      { status: 500 }
    );
  }
}
