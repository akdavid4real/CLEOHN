import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions, orderItems, products } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack/verify";
import { and, eq, ne, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * POST /api/admin/orders/[id]/reconcile
 *
 * Re-checks Paystack for the order's payment and, when the charge really
 * succeeded, marks the order as paid. This repairs orders that were left on
 * payment_status = 'pending' because the browser callback / verify endpoint or
 * a webhook delivery never completed (closed tab, network drop, missed
 * webhook). Safe to call repeatedly.
 */
export async function POST(
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

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        reconciled: false,
        paymentStatus: order.paymentStatus,
        message: "Order is already marked as paid",
      });
    }

    const verification = await verifyPayment(order.orderNumber);
    const paymentData = verification?.data;

    if (!verification?.status || paymentData?.status !== "success") {
      return NextResponse.json({
        reconciled: false,
        paymentStatus: order.paymentStatus,
        gatewayStatus: paymentData?.status ?? "unknown",
        message: `Paystack reports this payment as "${
          paymentData?.status ?? "unknown"
        }". No successful payment to reconcile.`,
      });
    }

    // Never auto-approve a payment whose amount does not match the order.
    const paidAmount = paymentData.amount / 100;
    if (Math.abs(paidAmount - order.total) > 0.01) {
      return NextResponse.json(
        {
          error: `Amount mismatch: order total is ${order.total}, Paystack paid ${paidAmount}. Reconcile manually.`,
        },
        { status: 409 }
      );
    }

    // Guard the transition so concurrent webhooks cannot double-decrement
    // stock.
    const updated = await db
      .update(orders)
      .set({ status: "processing", paymentStatus: "paid" })
      .where(and(eq(orders.id, order.id), ne(orders.paymentStatus, "paid")))
      .returning({ id: orders.id });

    if (updated.length === 0) {
      return NextResponse.json({
        reconciled: false,
        paymentStatus: "paid",
        message: "Order was already marked as paid",
      });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      if (item.productId) {
        await db
          .update(products)
          .set({
            stock: sql`GREATEST(COALESCE(${products.stock}, 0) - ${item.quantity}, 0)`,
          })
          .where(eq(products.id, item.productId));
      }
    }

    await db
      .insert(paymentTransactions)
      .values({
        id: nanoid(),
        orderId: order.id,
        paystackReference: paymentData.reference || order.orderNumber,
        amount: paidAmount,
        status: "success",
        channel: paymentData.channel,
        currency: paymentData.currency,
        paidAt: paymentData.paid_at ? new Date(paymentData.paid_at) : new Date(),
        metadata: JSON.stringify(paymentData.metadata || {}),
      })
      .onConflictDoNothing();

    console.log(`Admin reconciled order ${order.orderNumber}: payment confirmed`);

    return NextResponse.json({
      reconciled: true,
      paymentStatus: "paid",
      message: "Payment confirmed with Paystack and order marked as paid",
    });
  } catch (error) {
    console.error("Error reconciling payment:", error);
    return NextResponse.json(
      { error: "Failed to reconcile payment" },
      { status: 500 }
    );
  }
}
