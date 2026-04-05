import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";

export async function GET() {
  try {
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
