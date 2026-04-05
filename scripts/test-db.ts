import { config } from "dotenv";
import path from "path";
import { createClient } from "@libsql/client";

config({ path: path.join(process.cwd(), ".env.local") });

async function testConnection() {
  try {
    const url = process.env.DATABASE_URL;
    const token = process.env.DATABASE_AUTH_TOKEN;

    console.log("Testing connection...");
    console.log("URL:", url);
    console.log("Token (first 50 chars):", token?.substring(0, 50) + "...");

    const client = createClient({
      url: url!,
      authToken: token,
    });

    const result = await client.execute("SELECT 1 as test");
    console.log("✅ Connection successful!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error:", error);
  }
}

testConnection();
