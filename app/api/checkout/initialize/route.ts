import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { initializePayment } from "@/lib/paystack/initialize";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total } = body;

    // Validate required fields
    if (!customer?.email || !customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { error: "Missing required customer information" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Create order reference
    const orderReference = `ORD-${nanoid(12)}`;

    // Create order in database
    const [order] = await db
      .insert(orders)
      .values({
        id: nanoid(),
        orderNumber: orderReference,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        notes: customer.notes || null,
        subtotal: total,
        tax: 0,
        shippingCost: 0,
        total: total,
        status: "pending",
        paymentStatus: "pending",
      })
      .returning();

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      id: nanoid(),
      orderId: order.id,
      productId: item.productId || null,
      packageId: item.packageId || null,
      productName: item.productName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      subtotal: item.quantity * item.pricePerUnit,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Initialize Paystack payment
    const paymentResponse = await initializePayment({
      email: customer.email,
      amount: total * 100, // Convert to kobo
      reference: orderReference,
      metadata: {
        orderId: order.id,
        orderNumber: orderReference,
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    });

    if (!paymentResponse.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: orderReference,
      authorizationUrl: paymentResponse.data.authorization_url,
      reference: paymentResponse.data.reference,
    });
  } catch (error) {
    console.error("Checkout initialization error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
