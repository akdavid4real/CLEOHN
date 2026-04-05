import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { servicePackages, packageFeatures, serviceItems } from "@/lib/db/schema";
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

    // Get all packages for this service item
    const packages = await db
      .select()
      .from(servicePackages)
      .where(eq(servicePackages.serviceItemId, id))
      .orderBy(servicePackages.order);

    // Get feature count for each package
    const packagesWithFeatures = await Promise.all(
      packages.map(async (pkg) => {
        const features = await db
          .select()
          .from(packageFeatures)
          .where(eq(packageFeatures.packageId, pkg.id));

        return {
          ...pkg,
          featureCount: features.length,
        };
      })
    );

    return NextResponse.json(packagesWithFeatures);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
