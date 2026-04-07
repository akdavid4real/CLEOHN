import { db } from "@/lib/db/client";
import { users, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/paystack/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // SECURITY: Rate limit login attempts - 5 attempts per 15 minutes per email
    const rateLimitResult = checkRateLimit(`login:${email}`, 5, 900000); // 15 minutes

    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const existingUser = result[0];

    console.log('User found:', !!existingUser);

    if (!existingUser) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    let validPassword = false;
    try {
      validPassword = await verify(existingUser.passwordHash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });
      console.log('Password valid:', validPassword);
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      return Response.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

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

    // Set cookie with security flags
    const cookieStore = await cookies();
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true, // Prevents XSS attacks from accessing cookie
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection - changed from lax to strict for admin sessions
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log('Login successful for:', email);

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
