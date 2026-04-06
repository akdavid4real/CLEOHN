import { sql } from "drizzle-orm";
import {
  text,
  integer,
  real,
  boolean,
  timestamp,
  pgTable,
  unique,
} from "drizzle-orm/pg-core";

// ============ Users & Authentication ============
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<"admin" | "user">().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

// ============ Services (CAC Registration) ============
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  icon: text("icon"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceItems = pgTable("service_items", {
  id: text("id").primaryKey(),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  cost: text("cost"),
  delivery: text("delivery"),
  infoPoints: text("info_points"),
  types: text("types"),
  phases: text("phases"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const servicePackages = pgTable("service_packages", {
  id: text("id").primaryKey(),
  serviceItemId: text("service_item_id")
    .notNull()
    .references(() => serviceItems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: real("price").notNull(),
  processingTime: text("processing_time"),
  featured: boolean("featured").default(false),
  displayOrder: integer("display_order").default(0),
  isPopular: boolean("is_popular").default(false),
  pricingDescription: text("pricing_description"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const packageFeatures = pgTable("package_features", {
  id: text("id").primaryKey(),
  packageId: text("package_id")
    .notNull()
    .references(() => servicePackages.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  order: integer("order").default(0),
});

// ============ Products (E-commerce) ============
export const productCategories = pgTable("product_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  image: text("image"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  sku: text("sku").unique().notNull(),
  stock: integer("stock").default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").default(false),
  order: integer("order").default(0),
});

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  value: text("value").notNull(),
  priceModifier: real("price_modifier").default(0),
});

// ============ Shopping Cart & Orders ============
export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  productId: text("product_id").references(() => products.id),
  packageId: text("package_id").references(() => servicePackages.id),
  quantity: integer("quantity").notNull().default(1),
  variantSelections: text("variant_selections"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
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
  status: text("status").$type<"pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled">().default("pending"),
  paymentStatus: text("payment_status").$type<"pending" | "paid" | "failed" | "refunded">().default("pending"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  packageId: text("package_id").references(() => servicePackages.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: real("price_per_unit").notNull(),
  variantSelections: text("variant_selections"),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  paystackReference: text("paystack_reference").unique(),
  amount: real("amount").notNull(),
  status: text("status").$type<"pending" | "success" | "failed">().default("pending"),
  channel: text("channel"),
  currency: text("currency").default("NGN"),
  paidAt: timestamp("paid_at"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ Reviews ============
export const productReviews = pgTable("product_reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  approved: boolean("approved").default(false),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
