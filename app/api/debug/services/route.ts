import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    // SECURITY: Debug endpoints must be protected
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "Debug endpoints disabled in production" },
        { status: 403 }
      );
    }

    // Require admin authentication even in development
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get ALL services directly from DB
    const allServices = await db.select().from(services);

    return Response.json({
      count: allServices.length,
      services: allServices.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
      })),
      fullData: allServices,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
