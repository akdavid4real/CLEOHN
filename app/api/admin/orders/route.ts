import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { desc, eq, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = db.select().from(orders);

    // Filter by status
    if (status) {
      query = query.where(eq(orders.status, status)) as any;
    }

    // Search by order number or customer name/email
    // SECURITY: Sanitize search input to prevent SQL injection
    if (search) {
      // Remove SQL wildcards and special characters that could be used for injection
      const sanitizedSearch = search
        .replace(/[%_\\]/g, '\\$&') // Escape SQL LIKE wildcards
        .replace(/[^\w\s@.-]/g, ''); // Only allow alphanumeric, spaces, @, ., -

      if (sanitizedSearch.length > 0) {
        query = query.where(
          like(orders.orderNumber, `%${sanitizedSearch}%`)
        ) as any;
      }
    }

    const orderList = await query.orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: orderList });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
