import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { orders, orderItems, products, servicePackages } from "@/lib/db/schema";
import { initializePayment } from "@/lib/paystack/initialize";
import { validateEmail, validatePhone, validateAmount, sanitizeString, sanitizeMetadata } from "@/lib/paystack/validation";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/paystack/rate-limit";
import { pickAttribution } from "@/lib/attribution";
import {
  createOrderNumberAllocator,
  MAX_SEQUENCE_ATTEMPTS,
} from "@/lib/orders/allocate-order-number";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total } = body;
    const attribution = pickAttribution(body.attribution);

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

    // CRITICAL: Validate prices against database to prevent price manipulation
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let actualPrice = 0;

      if (item.productId) {
        // Validate product price and stock
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `Product not found or unavailable: ${item.productName}` },
            { status: 400 }
          );
        }

        // CRITICAL: Validate stock availability
        const availableStock = product.stock ?? 0;
        if (availableStock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${item.productName}. Available: ${availableStock}, Requested: ${item.quantity}`
            },
            { status: 400 }
          );
        }

        actualPrice = product.price;
      } else if (item.packageId) {
        // Validate package price
        const [pkg] = await db
          .select()
          .from(servicePackages)
          .where(eq(servicePackages.id, item.packageId))
          .limit(1);

        if (!pkg) {
          return NextResponse.json(
            { error: `Package not found: ${item.productName}` },
            { status: 400 }
          );
        }

        actualPrice = pkg.price;
      } else {
        return NextResponse.json(
          { error: "Invalid item: must have productId or packageId" },
          { status: 400 }
        );
      }

      // Validate quantity
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json(
          { error: "Invalid quantity" },
          { status: 400 }
        );
      }

      calculatedTotal += actualPrice * item.quantity;

      validatedItems.push({
        ...item,
        pricePerUnit: actualPrice, // Use server-validated price
      });
    }

    // Verify the client's total matches the server-calculated total
    if (Math.abs(total - calculatedTotal) > 0.01) {
      console.error(`Price manipulation detected: client sent ${total}, server calculated ${calculatedTotal}`);
      return NextResponse.json(
        { error: "Price mismatch. Please refresh and try again." },
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

    // Create order with a readable order number (e.g. CLE-20261110-0001).
    // The same value is used as the Paystack reference. On the rare chance two
    // checkouts race for the same sequence, the unique constraint rejects the
    // insert and we retry with the next sequence.
    const orderId = nanoid();
    const allocator = createOrderNumberAllocator();
    let order: typeof orders.$inferSelect | undefined;

    for (let attempt = 0; attempt < MAX_SEQUENCE_ATTEMPTS; attempt++) {
      const orderReference = await allocator.next();

      try {
        const [inserted] = await db
          .insert(orders)
          .values({
            id: orderId,
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

        order = inserted;
        break;
      } catch (error: any) {
        // 23505 = unique_violation. Only retry when the collision is on the
        // order number; any other unique violation (e.g. a duplicate order id)
        // is a real error and must propagate.
        const constraint = String(
          error?.constraint ?? error?.cause?.constraint ?? ""
        );
        const isOrderNumberCollision =
          (error?.code ?? error?.cause?.code) === "23505" &&
          (constraint === "" || /order_number/i.test(constraint));

        if (!isOrderNumberCollision) throw error;

        console.warn(
          `Order number collision on attempt ${attempt + 1}, retrying with next sequence`
        );
      }
    }

    if (!order) {
      console.error("Failed to allocate a unique order number");
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // Create order items using validated data
    const orderItemsData = validatedItems.map((item: any) => ({
      id: nanoid(),
      orderId: order.id,
      productId: item.productId || null,
      packageId: item.packageId || null,
      productName: item.productName,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit, // Server-validated price
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Initialize Paystack payment
    const paymentResponse = await initializePayment({
      email: sanitizedCustomer.email,
      amount: total * 100, // Convert to kobo
      reference: order.orderNumber,
      // Paystack must return to the host that initiated checkout. Using the
      // request origin also works for custom domains and preview deployments.
      callbackUrl: `${request.nextUrl.origin}/api/checkout/verify`,
      metadata: sanitizeMetadata({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: sanitizedCustomer.name,
        customerPhone: sanitizedCustomer.phone,
        ...attribution,
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
      orderNumber: order.orderNumber,
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
