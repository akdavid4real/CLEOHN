import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "2odo1U9EjyOq8MoXQMV22";

    console.log("=== DEBUG: Fetching service ===");
    console.log("ID:", id);
    console.log("ID type:", typeof id);
    console.log("ID length:", id.length);

    // Try the exact same query as getServiceById
    const result = await db.select().from(services).where(eq(services.id, id)).get();

    console.log("Result:", result);
    console.log("Result type:", typeof result);
    console.log("Result is null?:", result === null);
    console.log("Result is undefined?:", result === undefined);

    return Response.json({
      searchId: id,
      found: !!result,
      result: result || null,
      resultType: typeof result,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
