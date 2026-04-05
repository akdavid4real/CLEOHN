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
    const updateData: Record<string, any> = {};

    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.delivery !== undefined) updateData.delivery = body.delivery;
    if (body.infoPoints !== undefined) updateData.infoPoints = body.infoPoints;
    if (body.types !== undefined) updateData.types = body.types;
    if (body.phases !== undefined) updateData.phases = body.phases;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;

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
