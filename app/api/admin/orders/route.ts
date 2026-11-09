import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { and, desc, eq, like, or } from "drizzle-orm";

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

    const filters = [];

    // Filter by status
    if (status) {
      filters.push(eq(orders.status, status as "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"));
    }

    // Search by order number or customer name/email
    // SECURITY: Sanitize search input to prevent SQL injection
    if (search) {
      // Remove SQL wildcards and special characters that could be used for injection
      const sanitizedSearch = search
        .replace(/[%_\\]/g, '\\$&') // Escape SQL LIKE wildcards
        .replace(/[^\w\s@.-]/g, ''); // Only allow alphanumeric, spaces, @, ., -

      if (sanitizedSearch.length > 0) {
        const pattern = `%${sanitizedSearch}%`;
        filters.push(or(
          like(orders.orderNumber, pattern),
          like(orders.customerName, pattern),
          like(orders.customerEmail, pattern),
        ));
      }
    }

    const orderList = await db
      .select()
      .from(orders)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: orderList });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
