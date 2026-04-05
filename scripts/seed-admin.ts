import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST, before any other imports
config({ path: path.join(process.cwd(), ".env.local") });

// Now import modules that depend on environment
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { nanoid } from "nanoid";

async function main() {
  try {
    console.log("Creating admin user...");

    const adminEmail = process.argv[2] || "admin@cleohn.com";
    const adminPassword = process.argv[3] || "Admin123!";

    const dbUrl = process.env.DATABASE_URL;
    const dbToken = process.env.DATABASE_AUTH_TOKEN;

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create database connection
    const client = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    const db = drizzle(client);

    const hashedPassword = await hash(adminPassword);
    const adminId = nanoid();

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where((u: any) => u.email === adminEmail)
      .get();

    if (existingAdmin) {
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
