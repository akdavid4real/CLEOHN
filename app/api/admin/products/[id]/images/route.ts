import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(
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

    // SECURITY: Validate image URL and input with Zod
    const { productImageSchema } = await import("@/lib/validations/service");
    const { z } = await import("zod");

    let validatedData;
    try {
      validatedData = productImageSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid input",
            details: error.errors.map(e => e.message)
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { imageUrl, isPrimary, order, altText } = validatedData;

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await db
        .update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, id));
    }

    // Insert new image (using validated data)
    const [newImage] = await db.insert(productImages).values({
      id: nanoid(),
      productId: id,
      imageUrl,
      altText: altText || null,
      isPrimary: isPrimary,
      order: order,
    }).returning();

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error uploading product image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // Await params even though not using id directly
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await db.delete(productImages).where(eq(productImages.id, imageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
