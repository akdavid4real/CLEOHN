import { sql } from "drizzle-orm";
import {
  text,
  integer,
  real,
  primaryKey,
  sqliteTable,
  unique,
  int,
} from "drizzle-orm/sqlite-core";

// ============ Users & Authentication ============
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: int("expires_at").notNull(),
});

// ============ Services (CAC Registration) ============
// Service Categories (e.g., "Business Formation", "Business Protection")
export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  icon: text("icon"), // Lucide icon name
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Service Items (e.g., "Business Name Registration", "LLC", "Trademark")
export const serviceItems = sqliteTable("service_items", {
  id: text("id").primaryKey(),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Lucide icon name
  // Additional fields for services without packages
  cost: text("cost"), // e.g., "₦45,000" (for services with single pricing)
  delivery: text("delivery"), // e.g., "7 working days"
  // JSON fields for complex data
  infoPoints: text("info_points"), // JSON array of bullet points (why it matters)
  types: text("types"), // JSON array of service types
  phases: text("phases"), // JSON array of phases {name, cost, detail}
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Service Packages (e.g., "Standard Package", "VIP Package", "Phase 1")
export const servicePackages = sqliteTable("service_packages", {
  id: text("id").primaryKey(),
  serviceItemId: text("service_item_id")
    .notNull()
    .references(() => serviceItems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  processingTime: text("processing_time"), // e.g., "5-7 business days", "1-5 working days"
  featured: integer("featured", { mode: "boolean" }).default(false),
  displayOrder: integer("display_order").default(0), // Order on pricing page
  isPopular: integer("is_popular", { mode: "boolean" }).default(false), // "BEST VALUE" badge
  pricingDescription: text("pricing_description"), // Short description for pricing page
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Package Features/Deliverables
export const packageFeatures = sqliteTable("package_features", {
  id: text("id").primaryKey(),
  packageId: text("package_id")
    .notNull()
    .references(() => servicePackages.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  order: integer("order").default(0),
});

// ============ Products (E-commerce) ============
export const productCategories = sqliteTable("product_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  image: text("image"), // Cloudinary URL
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"), // Original price for showing discount
  sku: text("sku").unique().notNull(),
  stock: integer("stock").default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  featured: integer("featured", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(), // Cloudinary URL
  altText: text("alt_text"),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
  order: integer("order").default(0),
});

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., "size", "color", "style"
  value: text("value").notNull(), // e.g., "M", "blue", "classic"
  priceModifier: real("price_modifier").default(0), // Extra charge for variant
});

// ============ Shopping Cart & Orders ============
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"), // For guest users
  productId: text("product_id").references(() => products.id),
  packageId: text("package_id").references(() => servicePackages.id),
  quantity: integer("quantity").notNull().default(1),
  variantSelections: text("variant_selections"), // JSON: {variantId: value}
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").unique().notNull(),
  userId: text("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  subtotal: real("subtotal").notNull(),
  tax: real("tax").notNull().default(0),
  shippingCost: real("shipping_cost").notNull().default(0),
  total: real("total").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
  }).default("pending"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "refunded"],
  }).default("pending"),
  paymentMethod: text("payment_method"), // "paystack", "bank_transfer", etc.
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  packageId: text("package_id").references(() => servicePackages.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: real("price_per_unit").notNull(),
  variantSelections: text("variant_selections"), // JSON
});

export const paymentTransactions = sqliteTable("payment_transactions", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  paystackReference: text("paystack_reference").unique(),
  amount: real("amount").notNull(),
  status: text("status", {
    enum: ["pending", "success", "failed"],
  }).default("pending"),
  channel: text("channel"), // card, bank, ussd, etc.
  currency: text("currency").default("NGN"),
  paidAt: text("paid_at"),
  metadata: text("metadata"), // JSON
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============ Reviews ============
export const productReviews = sqliteTable("product_reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"), // Optional title
  content: text("content").notNull(),
  approved: integer("approved", { mode: "boolean" }).default(false),
  helpful: integer("helpful").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
