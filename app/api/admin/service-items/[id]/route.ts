import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { serviceItems, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get service item
    const [item] = await db
      .select()
      .from(serviceItems)
      .where(eq(serviceItems.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Service item not found" }, { status: 404 });
    }

    // Get parent category
    const [category] = await db
      .select()
      .from(services)
      .where(eq(services.id, item.serviceId))
      .limit(1);

    return NextResponse.json({
      ...item,
      category: category || null,
    });
  } catch (error) {
    console.error("Error fetching service item:", error);
    return NextResponse.json(
      { error: "Failed to fetch service item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // SECURITY: Validate input with Zod schema
    const { updateServiceItemSchema } = await import("@/lib/validations/service");
    const { z } = await import("zod");

    let validatedData;
    try {
      validatedData = updateServiceItemSchema.parse(body);
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

    const updateData: Record<string, any> = {};
    if (validatedData.cost !== undefined) updateData.cost = validatedData.cost;
    if (validatedData.delivery !== undefined) updateData.delivery = validatedData.delivery;
    if (validatedData.infoPoints !== undefined) updateData.infoPoints = validatedData.infoPoints;
    if (validatedData.types !== undefined) updateData.types = validatedData.types;
    if (validatedData.phases !== undefined) updateData.phases = validatedData.phases;
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;

    await db
      .update(serviceItems)
      .set(updateData)
      .where(eq(serviceItems.id, id));

    // Return updated item
    const [updated] = await db
      .select()
      .from(serviceItems)
      .where(eq(serviceItems.id, id))
      .limit(1);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating service item:", error);
    return NextResponse.json(
      { error: "Failed to update service item" },
      { status: 500 }
    );
  }
}
