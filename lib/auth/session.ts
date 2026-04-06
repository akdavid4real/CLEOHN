import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return null;
    }

    // Get session from database
    const sessionResult = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    const session = sessionResult[0];

    if (!session) {
      return null;
    }

    // Check if session expired
    const expiresAt = new Date(session.expiresAt * 1000);
    if (expiresAt < new Date()) {
      return null;
    }

    // Get user data
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as "admin" | "user",
      },
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return session.user;
});
