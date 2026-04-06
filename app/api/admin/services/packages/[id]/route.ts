import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { servicePackages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { featured } = body;

    if (typeof featured !== "boolean") {
      return Response.json(
        { error: "Featured must be a boolean" },
        { status: 400 }
      );
    }

    await db
      .update(servicePackages)
      .set({ featured })
      .where(eq(servicePackages.id, params.id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating package:", error);
    return new Response("Internal server error", { status: 500 });
  }
}