import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { productReviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { reviewModerationSchema } from "@/lib/validations/review";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reviewModerationSchema.parse(body);

    // Update review approval status
    await db
      .update(productReviews)
      .set({
        approved: validatedData.approved,
      })
      .where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid status", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete review
    await db.delete(productReviews).where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
