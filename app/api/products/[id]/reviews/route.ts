import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { productReviews } from "@/lib/db/schema";
import { reviewSchema } from "@/lib/validations/review";
import {
  getProductReviews,
  getProductAverageRating,
} from "@/lib/queries/reviews";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;

    const [reviews, stats] = await Promise.all([
      getProductReviews(productId),
      getProductAverageRating(productId),
    ]);

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = reviewSchema.parse({
      ...body,
      productId: id,
    });

    // Create review (pending approval)
    const [review] = await db
      .insert(productReviews)
      .values({
        id: nanoid(),
        productId: validatedData.productId,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        rating: validatedData.rating,
        content: validatedData.reviewText, // Map reviewText -> content
        title: null, // Optional, not collected in form
        approved: false, // Requires admin approval
        helpful: 0,
      })
      .returning();

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid review data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
