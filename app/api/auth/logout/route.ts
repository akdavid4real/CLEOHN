import { getSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }

    // Clear cookie
    const cookieStore = await cookies();
    cookieStore.delete("sessionId");

    return Response.json(
      { success: true },
      {
        status: 302,
        headers: {
          Location: "/login",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
