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
    if (search) {
      query = query.where(
        like(orders.orderNumber, `%${search}%`)
      ) as any;
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
