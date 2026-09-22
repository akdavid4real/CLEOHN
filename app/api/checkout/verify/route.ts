import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions, orderItems, products } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack/verify";
import { eq, sql } from "drizzle-orm";
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
        const sanitizedValue = value.replace(/[<>"'&]/g, "");
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const responseMode = searchParams.get("response");
    const isJsonResponse = responseMode === "json";

    const resolveOutcome = (path: string, params?: Record<string, string>) => {
      const redirectUrl = createSafeRedirectUrl(path, baseUrl, params);

      if (isJsonResponse) {
        return NextResponse.json({
          ok: path === "/checkout/success",
          redirectUrl,
        });
      }

      return NextResponse.redirect(redirectUrl);
    };

    if (!reference) {
      return resolveOutcome("/checkout/cancel", { error: "missing_reference" });
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (!verificationResponse.status) {
      return resolveOutcome("/checkout/cancel", { error: "verification_failed" });
    }

    const paymentData = verificationResponse.data;

    // Find order by order number (reference)
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      return resolveOutcome("/checkout/cancel", { error: "order_not_found" });
    }

    // Check if transaction already exists to prevent duplicates
    const [existingTransaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.paystackReference, reference))
      .limit(1);

    // Verify payment amount matches order total (convert from kobo to naira)
    const paidAmount = paymentData.amount / 100;
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error(`Payment amount mismatch: expected ${order.total}, got ${paidAmount}`);
      return resolveOutcome("/checkout/cancel", { error: "amount_mismatch" });
    }

    // Check if payment was successful
    if (paymentData.status === "success") {
      // Update order status only if not already paid
      if (order.paymentStatus !== "paid") {
        await db
          .update(orders)
          .set({
            status: "processing",
            paymentStatus: "paid",
          })
          .where(eq(orders.id, order.id));

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

      // Record payment transaction only if it doesn't exist
      if (!existingTransaction) {
        await db.insert(paymentTransactions).values({
          id: nanoid(),
          orderId: order.id,
          paystackReference: paymentData.reference,
          amount: paymentData.amount / 100, // Convert from kobo to naira
          status: "success",
          channel: paymentData.channel,
          currency: paymentData.currency,
          paidAt: new Date(paymentData.paid_at),
          metadata: JSON.stringify(paymentData.metadata || {}),
        });
      }

      // Redirect to success page
      return resolveOutcome("/checkout/success", { order: order.orderNumber });
    } else {
      // Payment failed or abandoned
      if (order.paymentStatus !== "failed") {
        await db
          .update(orders)
          .set({
            status: "cancelled",
            paymentStatus: "failed",
          })
          .where(eq(orders.id, order.id));
      }

      // Record failed transaction only if it doesn't exist
      if (!existingTransaction) {
        await db.insert(paymentTransactions).values({
          id: nanoid(),
          orderId: order.id,
          paystackReference: paymentData.reference,
          amount: paymentData.amount / 100,
          status: "failed",
          channel: paymentData.channel,
          currency: paymentData.currency,
          metadata: JSON.stringify(paymentData.metadata || {}),
        });
      }

      return resolveOutcome("/checkout/cancel", { error: "payment_failed" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'verification_error' });

    if (request.nextUrl.searchParams.get("response") === "json") {
      return NextResponse.json({
        ok: false,
        redirectUrl: cancelUrl,
      });
    }

    return NextResponse.redirect(cancelUrl);
  }
}
