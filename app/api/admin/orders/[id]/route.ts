import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { orders, orderItems, paymentTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    // Get payment transactions
    const transactions = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.orderId, id));

    return NextResponse.json({
      order: {
        ...order,
        items,
        transactions,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
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
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate status against allowed values
    let validatedData;
    try {
      validatedData = updateOrderStatusSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid status",
            details: error.errors.map(e => e.message)
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Update order status with validated value
    await db
      .update(orders)
      .set({ status: validatedData.status })
      .where(eq(orders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
