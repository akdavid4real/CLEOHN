import { db } from "@/lib/db/client";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!existingUser) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const validPassword = await verify(existingUser.passwordHash, password);

    if (!validPassword) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Create a simple session ID
    const sessionId = nanoid();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store in database
    await db.insert(sessions).values({
      id: sessionId,
      userId: existingUser.id,
      expiresAt: Math.floor(expiresAt.getTime() / 1000),
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return Response.json(
      { success: true, userId: existingUser.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
