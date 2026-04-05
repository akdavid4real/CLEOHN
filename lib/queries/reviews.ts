import { db } from "@/lib/db/client";
import { productReviews, products } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getProductReviews(productId: string) {
  return await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      customerName: productReviews.customerName,
      customerEmail: productReviews.customerEmail,
      rating: productReviews.rating,
      reviewText: productReviews.reviewText,
      status: productReviews.status,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.status, "approved")
      )
    )
    .orderBy(desc(productReviews.createdAt));
}

export async function getProductAverageRating(productId: string) {
  const reviews = await db
    .select({
      rating: productReviews.rating,
    })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.status, "approved")
      )
    );

  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    count: reviews.length,
  };
}

export async function getAllReviews() {
  return await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      productName: products.name,
      customerName: productReviews.customerName,
      customerEmail: productReviews.customerEmail,
      rating: productReviews.rating,
      reviewText: productReviews.reviewText,
      status: productReviews.status,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .orderBy(desc(productReviews.createdAt));
}

export async function getPendingReviews() {
  return await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      productName: products.name,
      customerName: productReviews.customerName,
      customerEmail: productReviews.customerEmail,
      rating: productReviews.rating,
      reviewText: productReviews.reviewText,
      status: productReviews.status,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .where(eq(productReviews.status, "pending"))
    .orderBy(desc(productReviews.createdAt));
}
