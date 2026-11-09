import { db } from "@/lib/db/client";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ error: "Debug endpoints disabled in production" }, { status: 403 });
    }

    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "2odo1U9EjyOq8MoXQMV22";

    console.log("=== DEBUG: Fetching service ===");
    console.log("ID:", id);
    console.log("ID type:", typeof id);
    console.log("ID length:", id.length);

    // Try the exact same query as getServiceById
    const [result] = await db.select().from(services).where(eq(services.id, id)).limit(1);

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
