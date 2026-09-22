import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST, before any other imports
config({ path: path.join(process.cwd(), ".env.local") });

// Now import modules that depend on environment
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { randomBytes } from "node:crypto";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

// This Neon project uses the pooler hostname directly for the HTTPS SQL endpoint.
neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

async function main() {
  try {
    console.log("Creating admin user...");

    const adminEmail = process.argv[2] || "admin@cleohn.com";
    const suppliedPassword = process.argv[3] || process.env.ADMIN_PASSWORD;
    const adminPassword = suppliedPassword || randomBytes(18).toString("base64url");
    const passwordWasGenerated = !suppliedPassword;

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create database connection
    const sql = neon(dbUrl);
    const db = drizzle(sql);

    const hashedPassword = await hash(adminPassword);
    const adminId = nanoid();

    // Create the admin account on first run, or reset its password on later runs.
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      await db
        .update(users)
        .set({ passwordHash: hashedPassword, role: "admin" })
        .where(eq(users.id, existingAdmin[0].id));
      console.log(`✅ Password reset for ${adminEmail}`);
      if (passwordWasGenerated) console.log(`🔐 New password: ${adminPassword}`);
      return;
    }

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`📧 Email: ${adminEmail}`);
    if (passwordWasGenerated) console.log(`🔐 New password: ${adminPassword}`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

main();
