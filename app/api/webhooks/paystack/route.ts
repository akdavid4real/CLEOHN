import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions, orderItems, products } from "@/lib/db/schema";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
} from "@/lib/paystack/webhook";
import { and, eq, ne, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Paystack retries webhooks, so handlers must be idempotent and must never
// downgrade an order that has already been marked as paid.

// Utility function to sanitize log inputs
function sanitizeForLog(input: string): string {
  return String(input ?? '').replace(/[\r\n\t]/g, '').substring(0, 100);
}

/**
 * Decrement stock for an order exactly once, guarded by the order's payment
 * status so concurrent verify + webhook deliveries cannot double-decrement.
 * Returns true when this call performed the transition.
 */
async function markOrderPaidAndDecrementStock(orderId: string): Promise<boolean> {
  const updated = await db
    .update(orders)
    .set({
      status: "processing",
      paymentStatus: "paid",
    })
    .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, "paid")))
    .returning({ id: orders.id });

  if (updated.length === 0) {
    return false;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

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

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const payload = await request.text();

    // Get Paystack signature from headers
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature);

    if (!isValid) {
      console.error("Invalid Paystack signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event = parseWebhookEvent(payload);

    console.log("Paystack webhook event:", sanitizeForLog(event.event));

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event);
        break;

      case "charge.failed":
        await handleChargeFailed(event);
        break;

      default:
        console.log(`Unhandled webhook event: ${sanitizeForLog(event.event)}`);
    }

    // Always acknowledge once the event has been processed so Paystack stops
    // retrying.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Returning 500 asks Paystack to retry, which is what we want on transient
    // database failures.
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(event: any) {
  const { reference, amount, channel, currency, paid_at, metadata } = event.data;

  try {
    // Find order by reference
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      console.error(`Order not found for reference: ${sanitizeForLog(reference)}`);
      return;
    }

    // Verify payment amount matches order total
    const paidAmount = amount / 100;
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error(`Payment amount mismatch for ${sanitizeForLog(reference)}: expected ${order.total}, got ${paidAmount}`);
      return;
    }

    // Update order status - set to processing after successful payment.
    // IMPORTANT: this must not depend on whether a transaction row already
    // exists. Previously a pre-existing transaction (e.g. one recorded by the
    // verify endpoint, or a replayed webhook) caused an early return that left
    // the order stuck on payment_status = 'pending'.
    const transitioned = await markOrderPaidAndDecrementStock(order.id);

    // Record payment transaction (idempotent on the unique reference).
    await db
      .insert(paymentTransactions)
      .values({
        id: nanoid(),
        orderId: order.id,
        paystackReference: reference,
        amount: amount / 100, // Convert from kobo to naira
        status: "success",
        channel: channel,
        currency: currency,
        paidAt: paid_at ? new Date(paid_at) : new Date(),
        metadata: JSON.stringify(metadata || {}),
      })
      .onConflictDoNothing();

    console.log(
      transitioned
        ? `Order ${sanitizeForLog(reference)} marked as paid and stock updated`
        : `Order ${sanitizeForLog(reference)} was already marked as paid`
    );
  } catch (error) {
    console.error("Error handling charge success:", error);
    throw error;
  }
}

async function handleChargeFailed(event: any) {
  const { reference, amount, channel, currency, metadata } = event.data;

  try {
    // Find order by reference
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      console.error(`Order not found for reference: ${sanitizeForLog(reference)}`);
      return;
    }

    // Never downgrade an order that has already been paid. Paystack can send
    // a late charge.failed for an earlier attempt on the same order.
    if (order.paymentStatus === "paid") {
      console.log(`Ignoring charge.failed for already-paid order ${sanitizeForLog(reference)}`);
      return;
    }

    // Update order status - only from pending, so a failed attempt does not
    // clobber a refund or a manual correction.
    await db
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
      })
      .where(and(eq(orders.id, order.id), eq(orders.paymentStatus, "pending")));

    // Record failed transaction (idempotent).
    await db
      .insert(paymentTransactions)
      .values({
        id: nanoid(),
        orderId: order.id,
        paystackReference: reference,
        amount: amount / 100,
        status: "failed",
        channel: channel,
        currency: currency,
        metadata: JSON.stringify(metadata || {}),
      })
      .onConflictDoNothing();

    console.log(`Order ${sanitizeForLog(reference)} marked as failed`);
  } catch (error) {
    console.error("Error handling charge failed:", error);
    throw error;
  }
}
