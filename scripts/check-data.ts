import "dotenv/config";
import { db } from "../lib/db/client";
import {
  products,
  productCategories,
  services,
  servicePackages,
  orders,
} from "../lib/db/schema";

async function checkData() {
  console.log("=== Checking Database Data ===\n");

  // Check products
  const productList = await db.select().from(products);
  console.log(`Products: ${productList.length}`);
  if (productList.length > 0) {
    console.log("Sample product:", productList[0]);
  }

  // Check categories
  const categoryList = await db.select().from(productCategories);
  console.log(`\nProduct Categories: ${categoryList.length}`);
  if (categoryList.length > 0) {
    console.log("Categories:", categoryList.map((c) => c.name).join(", "));
  }

  // Check services
  const serviceList = await db.select().from(services);
  console.log(`\nServices: ${serviceList.length}`);
  if (serviceList.length > 0) {
    console.log("Services:", serviceList.map((s) => s.name).join(", "));
  }

  // Check packages
  const packageList = await db.select().from(servicePackages);
  console.log(`\nService Packages: ${packageList.length}`);

  // Check orders
  const orderList = await db.select().from(orders);
  console.log(`\nOrders: ${orderList.length}`);

  console.log("\n=== Check Complete ===");
}

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
