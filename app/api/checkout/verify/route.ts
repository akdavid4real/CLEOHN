import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, paymentTransactions } from "@/lib/db/schema";
import { verifyPayment } from "@/lib/paystack/verify";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(
        new URL("/checkout/cancel?error=missing_reference", request.url)
      );
    }

    // Verify payment with Paystack
    const verificationResponse = await verifyPayment(reference);

    if (!verificationResponse.status) {
      return NextResponse.redirect(
        new URL("/checkout/cancel?error=verification_failed", request.url)
      );
    }

    const paymentData = verificationResponse.data;

    // Find order by order number (reference)
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, reference))
      .limit(1);

    if (!order) {
      return NextResponse.redirect(
        new URL("/checkout/cancel?error=order_not_found", request.url)
      );
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
      return NextResponse.redirect(
        new URL(`/checkout/success?order=${order.orderNumber}`, request.url)
      );
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

      return NextResponse.redirect(
        new URL("/checkout/cancel?error=payment_failed", request.url)
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      new URL("/checkout/cancel?error=verification_error", request.url)
    );
  }
}
