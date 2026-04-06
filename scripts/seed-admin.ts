import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST, before any other imports
config({ path: path.join(process.cwd(), ".env.local") });

// Now import modules that depend on environment
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Creating admin user...");

    const adminEmail = process.argv[2] || "admin@cleohn.com";
    const adminPassword = process.argv[3] || "Admin123!";

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create database connection
    const sql = neon(dbUrl);
    const db = drizzle(sql);

    const hashedPassword = await hash(adminPassword);
    const adminId = nanoid();

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log(`✅ Admin user ${adminEmail} already exists`);
      process.exit(0);
    }

    await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log(`\n⚠️  Make sure to change the password after first login!`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

main();
