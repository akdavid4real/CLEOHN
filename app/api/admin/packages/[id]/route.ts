import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { servicePackages, packageFeatures, serviceItems, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pkg] = await db
      .select()
      .from(servicePackages)
      .where(eq(servicePackages.id, id))
      .limit(1);

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Get deliverables
    const features = await db
      .select()
      .from(packageFeatures)
      .where(eq(packageFeatures.packageId, id))
      .orderBy(packageFeatures.order);

    // Get parent service item and category
    const [item] = await db
      .select()
      .from(serviceItems)
      .where(eq(serviceItems.id, pkg.serviceItemId))
      .limit(1);

    let category = null;
    if (item) {
      const [cat] = await db
        .select()
        .from(services)
        .where(eq(services.id, item.serviceId))
        .limit(1);
      category = cat || null;
    }

    return NextResponse.json({
      ...pkg,
      features,
      serviceItem: item || null,
      category,
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (typeof body.featured === "boolean") updateData.featured = body.featured;
    if (typeof body.isPopular === "boolean") updateData.isPopular = body.isPopular;
    if (typeof body.displayOrder === "number") updateData.displayOrder = body.displayOrder;
    if (body.pricingDescription !== undefined) updateData.pricingDescription = body.pricingDescription;
    if (body.name !== undefined) updateData.name = body.name;
    if (typeof body.price === "number") updateData.price = body.price;
    if (body.processingTime !== undefined) updateData.processingTime = body.processingTime;

    await db
      .update(servicePackages)
      .set(updateData)
      .where(eq(servicePackages.id, id));

    // Handle deliverables update if provided
    if (Array.isArray(body.features)) {
      // Delete existing features
      await db
        .delete(packageFeatures)
        .where(eq(packageFeatures.packageId, id));

      // Insert new features
      if (body.features.length > 0) {
        const { nanoid } = await import("nanoid");
        await db.insert(packageFeatures).values(
          body.features.map((feature: string, idx: number) => ({
            id: nanoid(),
            packageId: id,
            feature,
            order: idx,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}
