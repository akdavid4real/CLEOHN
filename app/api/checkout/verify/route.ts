import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions, orderItems, products } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack/verify";
import { and, eq, ne, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Utility function to validate and sanitize redirect URLs
function createSafeRedirectUrl(path: string, baseUrl: string, params?: Record<string, string>): string {
  try {
    const url = new URL(path, baseUrl);
    // Only allow same origin redirects
    if (url.origin !== new URL(baseUrl).origin) {
      throw new Error('Invalid redirect origin');
    }

    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Sanitize parameter values
        const sanitizedValue = encodeURIComponent(value.replace(/[<>"'&]/g, ''));
        url.searchParams.set(key, sanitizedValue);
      });
    }

    return url.toString();
  } catch {
    // Fallback to safe default
    return new URL('/checkout/cancel', baseUrl).toString();
  }
}

export async function GET(request: NextRequest) {
  // Build redirects from the current request origin so production payments
  // never fall back to the development localhost URL.
  const baseUrl = request.nextUrl.origin;

  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'missing_reference' });
      return NextResponse.redirect(cancelUrl);
    }

    // Find order by order number (reference). Some Paystack setups return the
    // transaction reference rather than our order number, so fall back to
    // matching the recorded transaction if the direct lookup misses.
    let [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      const [tx] = await db
        .select({ orderId: paymentTransactions.orderId })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.paystackReference, reference))
        .limit(1);

      if (tx) {
        [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.id, tx.orderId))
          .limit(1);
      }
    }

    // Already paid: nothing left to do, send the customer to success.
    if (order && order.paymentStatus === "paid") {
      return NextResponse.redirect(
        createSafeRedirectUrl('/checkout/success', baseUrl, { order: order.orderNumber })
      );
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (!verificationResponse.status) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'verification_failed' });
      return NextResponse.redirect(cancelUrl);
    }

    const paymentData = verificationResponse.data;

    if (!order) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'order_not_found' });
      return NextResponse.redirect(cancelUrl);
    }

    // Check if transaction already exists to prevent duplicates
    const [existingTransaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.paystackReference, paymentData.reference))
      .limit(1);

    // Verify payment amount matches order total (convert from kobo to naira)
    const paidAmount = paymentData.amount / 100;
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error(`Payment amount mismatch: expected ${order.total}, got ${paidAmount}`);
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'amount_mismatch' });
      return NextResponse.redirect(cancelUrl);
    }

    // Check if payment was successful
    if (paymentData.status === "success") {
      // Update order status only if not already paid
      if (order.paymentStatus !== "paid") {
        // Guard the write so a concurrent webhook cannot double-decrement stock.
        const updated = await db
          .update(orders)
          .set({
            status: "processing",
            paymentStatus: "paid",
          })
          .where(and(eq(orders.id, order.id), ne(orders.paymentStatus, "paid")))
          .returning({ id: orders.id });

        if (updated.length > 0) {
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
        }
      }

      // Record payment transaction only if it doesn't exist
      if (!existingTransaction) {
        await db
          .insert(paymentTransactions)
          .values({
            id: nanoid(),
            orderId: order.id,
            paystackReference: paymentData.reference,
            amount: paymentData.amount / 100, // Convert from kobo to naira
            status: "success",
            channel: paymentData.channel,
            currency: paymentData.currency,
            paidAt: paymentData.paid_at ? new Date(paymentData.paid_at) : new Date(),
            metadata: JSON.stringify(paymentData.metadata || {}),
          })
          .onConflictDoNothing();
      }

      // Redirect to success page
      const successUrl = createSafeRedirectUrl('/checkout/success', baseUrl, { order: order.orderNumber });
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed or abandoned. Only mark the order as failed if it is
      // still genuinely unpaid — never overwrite a successful payment.
      if (order.paymentStatus === "pending") {
        await db
          .update(orders)
          .set({
            status: "cancelled",
            paymentStatus: "failed",
          })
          .where(and(eq(orders.id, order.id), eq(orders.paymentStatus, "pending")));
      }

      // Record failed transaction only if it doesn't exist
      if (!existingTransaction) {
        await db
          .insert(paymentTransactions)
          .values({
            id: nanoid(),
            orderId: order.id,
            paystackReference: paymentData.reference,
            amount: paymentData.amount / 100,
            status: "failed",
            channel: paymentData.channel,
            currency: paymentData.currency,
            metadata: JSON.stringify(paymentData.metadata || {}),
          })
          .onConflictDoNothing();
      }

      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'payment_failed' });
      return NextResponse.redirect(cancelUrl);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'verification_error' });
    return NextResponse.redirect(cancelUrl);
  }
}
