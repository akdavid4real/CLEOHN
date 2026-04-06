import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { servicePackages, serviceItems, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const packages = await db
      .select({
        id: servicePackages.id,
        name: servicePackages.name,
        price: servicePackages.price,
        featured: servicePackages.featured,
        processingTime: servicePackages.processingTime,
        serviceItem: {
          title: serviceItems.title,
          service: {
            name: services.name,
          },
        },
      })
      .from(servicePackages)
      .innerJoin(serviceItems, eq(servicePackages.serviceItemId, serviceItems.id))
      .innerJoin(services, eq(serviceItems.serviceId, services.id))
      .orderBy(services.name, serviceItems.title, servicePackages.name);

    return Response.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return new Response("Internal server error", { status: 500 });
  }
}