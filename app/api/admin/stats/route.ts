import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { orders, products, productReviews } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total orders
    const [totalOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const totalOrders = Number(totalOrdersResult?.count || 0);

    // Get revenue (sum of paid orders)
    const [revenueResult] = await db
      .select({ sum: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const revenue = Number(revenueResult?.sum || 0);

    // Get pending orders count
    const [pendingOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "pending"));
    const pendingOrders = Number(pendingOrdersResult?.count || 0);

    // Get paid orders count
    const [paidOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const paidOrders = Number(paidOrdersResult?.count || 0);

    // Get total products
    const [totalProductsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    const totalProducts = Number(totalProductsResult?.count || 0);

    // Get unique customers (based on email)
    const [uniqueCustomersResult] = await db
      .select({ count: sql<number>`count(DISTINCT ${orders.customerEmail})` })
      .from(orders);
    const uniqueCustomers = Number(uniqueCustomersResult?.count || 0);

    // Get pending reviews count (unapproved reviews)
    const [pendingReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productReviews)
      .where(eq(productReviews.approved, false));
    const pendingReviews = Number(pendingReviewsResult?.count || 0);

    // Get recent orders (last 10)
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        total: orders.total,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(10);

    return NextResponse.json({
      stats: {
        totalOrders,
        revenue,
        pendingOrders,
        paidOrders,
        totalProducts,
        uniqueCustomers,
        pendingReviews,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
