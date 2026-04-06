import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { initializePayment } from "@/lib/paystack/initialize";
import { validateEmail, validatePhone, validateAmount, sanitizeString, sanitizeMetadata } from "@/lib/paystack/validation";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/paystack/rate-limit";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total } = body;

    // Rate limiting by email
    const rateLimitResult = checkRateLimit(customer?.email || 'anonymous', 3, 300000); // 3 requests per 5 minutes
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please try again later." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Validate required fields
    if (!customer?.email || !customer?.name || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { error: "Missing required customer information" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(customer.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!validatePhone(customer.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate amount
    if (!validateAmount(total)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Sanitize customer data
    const sanitizedCustomer = {
      name: sanitizeString(customer.name, 100),
      email: customer.email.toLowerCase().trim(),
      phone: sanitizeString(customer.phone, 20),
      address: sanitizeString(customer.address, 500),
      notes: customer.notes ? sanitizeString(customer.notes, 1000) : null,
    };

    // Create order reference
    const orderReference = `ORD-${nanoid(12)}`;

    // Create order in database
    const [order] = await db
      .insert(orders)
      .values({
        id: nanoid(),
        orderNumber: orderReference,
        customerName: sanitizedCustomer.name,
        customerEmail: sanitizedCustomer.email,
        customerPhone: sanitizedCustomer.phone,
        customerAddress: sanitizedCustomer.address,
        notes: sanitizedCustomer.notes,
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
      email: sanitizedCustomer.email,
      amount: total * 100, // Convert to kobo
      reference: orderReference,
      metadata: sanitizeMetadata({
        orderId: order.id,
        orderNumber: orderReference,
        customerName: sanitizedCustomer.name,
        customerPhone: sanitizedCustomer.phone,
      }),
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
