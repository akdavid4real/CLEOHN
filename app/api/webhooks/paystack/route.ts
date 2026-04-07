import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions, orderItems, products } from "@/lib/db/schema";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
} from "@/lib/paystack/webhook";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Utility function to sanitize log inputs
function sanitizeForLog(input: string): string {
  return input.replace(/[\r\n\t]/g, '').substring(0, 100);
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(event: any) {
  const { reference, amount, channel, currency, paid_at, metadata } = event.data;

  try {
    // Check if transaction already exists FIRST to prevent duplicates
    const [existingTransaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.paystackReference, reference))
      .limit(1);

    if (existingTransaction) {
      console.log(`Transaction already recorded for reference: ${sanitizeForLog(reference)}`);
      return;
    }

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

    // Update order status - set to processing after successful payment
    await db
      .update(orders)
      .set({
        status: "processing",
        paymentStatus: "paid",
      })
      .where(eq(orders.id, order.id));

    // Record payment transaction
    await db.insert(paymentTransactions).values({
      id: nanoid(),
      orderId: order.id,
      paystackReference: reference,
      amount: amount / 100, // Convert from kobo to naira
      status: "success",
      channel: channel,
      currency: currency,
      paidAt: new Date(paid_at),
      metadata: JSON.stringify(metadata || {}),
    });

    // CRITICAL: Decrement stock for products in this order
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      if (item.productId) {
        // Decrement product stock
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }
    }

    console.log(`Order ${sanitizeForLog(reference)} marked as paid and stock updated`);
  } catch (error) {
    console.error("Error handling charge success:", error);
    throw error;
  }
}

async function handleChargeFailed(event: any) {
  const { reference, amount, channel, currency, metadata } = event.data;

  try {
    // Check if transaction already exists to prevent duplicates
    const [existingTransaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.paystackReference, reference))
      .limit(1);

    if (existingTransaction) {
      console.log(`Failed transaction already recorded for reference: ${sanitizeForLog(reference)}`);
      return;
    }

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

    // Update order status
    await db
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
      })
      .where(eq(orders.id, order.id));

    // Record failed transaction
    await db.insert(paymentTransactions).values({
      id: nanoid(),
      orderId: order.id,
      paystackReference: reference,
      amount: amount / 100,
      status: "failed",
      channel: channel,
      currency: currency,
      metadata: JSON.stringify(metadata || {}),
    });

    console.log(`Order ${sanitizeForLog(reference)} marked as failed`);
  } catch (error) {
    console.error("Error handling charge failed:", error);
    throw error;
  }
}
