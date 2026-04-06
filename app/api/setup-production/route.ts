import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { action, secret } = await request.json();

    if (secret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "seed-admin") {
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, "admin@cleohn.com"))
        .limit(1);

      if (existingAdmin.length > 0) {
        return NextResponse.json({ message: "Admin already exists" });
      }

      const hashedPassword = await hash("Admin123!");
      await db.insert(users).values({
        id: nanoid(),
        email: "admin@cleohn.com",
        passwordHash: hashedPassword,
        role: "admin",
      });

      return NextResponse.json({ message: "Admin user created successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
