import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { serviceItems, servicePackages } from "@/lib/db/schema";
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

    // Fetch items and all packages in parallel
    const [items, allPackages] = await Promise.all([
      db
        .select()
        .from(serviceItems)
        .where(eq(serviceItems.serviceId, id))
        .orderBy(serviceItems.order),
      db
        .select()
        .from(servicePackages)
        .innerJoin(serviceItems, eq(servicePackages.serviceItemId, serviceItems.id))
        .where(eq(serviceItems.serviceId, id)),
    ]);

    // Index packages by serviceItemId
    const packagesByItem = new Map<string, typeof allPackages>();
    for (const row of allPackages) {
      const itemId = row.service_packages.serviceItemId;
      const list = packagesByItem.get(itemId) || [];
      list.push(row);
      packagesByItem.set(itemId, list);
    }

    // Attach counts to items
    const itemsWithCounts = items.map((item) => {
      const packages = packagesByItem.get(item.id) || [];
      const featuredCount = packages.filter(
        (p) => p.service_packages.featured
      ).length;

      return {
        ...item,
        packageCount: packages.length,
        featuredCount,
      };
    });

    return NextResponse.json(itemsWithCounts);
  } catch (error) {
    console.error("Error fetching service items:", error);
    return NextResponse.json(
      { error: "Failed to fetch service items" },
      { status: 500 }
    );
  }
}
