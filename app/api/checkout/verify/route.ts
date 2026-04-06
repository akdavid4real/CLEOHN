import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack/verify";
import { eq } from "drizzle-orm";
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    if (!reference) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'missing_reference' });
      return NextResponse.redirect(cancelUrl);
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (!verificationResponse.status) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'verification_failed' });
      return NextResponse.redirect(cancelUrl);
    }

    const paymentData = verificationResponse.data;

    // Find order by order number (reference)
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'order_not_found' });
      return NextResponse.redirect(cancelUrl);
    }

    // Check if payment was successful
    if (paymentData.status === "success") {
      // Update order status
      await db
        .update(orders)
        .set({
          status: "paid",
          paymentStatus: "paid",
        })
        .where(eq(orders.id, order.id));

      // Record payment transaction
      await db.insert(paymentTransactions).values({
        id: nanoid(),
        orderId: order.id,
        paystackReference: paymentData.reference,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        status: "success",
        channel: paymentData.channel,
        currency: paymentData.currency,
        paidAt: new Date(paymentData.paid_at),
        metadata: paymentData.metadata,
      });

      // Redirect to success page
      const successUrl = createSafeRedirectUrl('/checkout/success', baseUrl, { order: order.orderNumber });
      return NextResponse.redirect(successUrl);
    } else {
      // Payment failed or abandoned
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
        paystackReference: paymentData.reference,
        amount: paymentData.amount / 100,
        status: "failed",
        channel: paymentData.channel,
        currency: paymentData.currency,
        metadata: paymentData.metadata,
      });

      const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'payment_failed' });
      return NextResponse.redirect(cancelUrl);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const cancelUrl = createSafeRedirectUrl('/checkout/cancel', baseUrl, { error: 'verification_error' });
    return NextResponse.redirect(cancelUrl);
  }
}
