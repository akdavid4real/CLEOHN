import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, unset all primary images for this product
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, id));

    // Then set the selected image as primary
    await db
      .update(productImages)
      .set({ isPrimary: true })
      .where(eq(productImages.id, imageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting primary image:", error);
    return NextResponse.json(
      { error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}