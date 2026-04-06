import { db } from "@/lib/db/client";
import {
  productCategories,
  products,
  productImages,
  productVariants,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type {
  CreateProductCategoryInput,
  CreateProductInput,
  CreateProductImageInput,
  CreateProductVariantInput,
} from "@/lib/validations/product";

// ============ Categories ============

export async function getAllCategories() {
  return db
    .select()
    .from(productCategories)
    .orderBy(productCategories.order, productCategories.name);
}

export async function getCategoryById(id: string) {
  const result = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);
  return result[0];
}

export async function getCategoryBySlug(slug: string) {
  const result = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.slug, slug))
    .limit(1);
  return result[0];
}

export async function createCategory(input: CreateProductCategoryInput) {
  const id = nanoid();
  const now = new Date();

  await db.insert(productCategories).values({
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateCategory(
  id: string,
  input: Partial<CreateProductCategoryInput>
) {
  await db
    .update(productCategories)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(productCategories.id, id));
}

export async function deleteCategory(id: string) {
  await db.delete(productCategories).where(eq(productCategories.id, id));
}

// ============ Products ============

export async function getAllProducts() {
  return db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));
}

export async function getProductsByCategory(categoryId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId))
    .orderBy(products.order, products.name);
}

export async function getProductById(id: string) {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductBySlug(slug: string) {
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductWithDetails(id: string) {
  const product = await getProductById(id);
  if (!product) return null;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(productImages.order);

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));

  return {
    ...product,
    images,
    variants,
  };
}

export async function createProduct(input: CreateProductInput) {
  const id = nanoid();
  const now = new Date();

  await db.insert(products).values({
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateProduct(
  id: string,
  input: Partial<CreateProductInput>
) {
  await db
    .update(products)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// ============ Product Images ============

export async function getProductImages(productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.order);
}

export async function getPrimaryImage(productId: string) {
  const result = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .where(eq(productImages.isPrimary, true))
    .limit(1);
  return result[0];
}

export async function createProductImage(input: CreateProductImageInput) {
  const id = nanoid();

  await db.insert(productImages).values({
    id,
    ...input,
  });

  return id;
}

export async function updateProductImage(
  id: string,
  input: Partial<CreateProductImageInput>
) {
  await db.update(productImages).set(input).where(eq(productImages.id, id));
}

export async function deleteProductImage(id: string) {
  await db.delete(productImages).where(eq(productImages.id, id));
}

// ============ Product Variants ============

export async function getProductVariants(productId: string) {
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
}

export async function createProductVariant(input: CreateProductVariantInput) {
  const id = nanoid();

  await db.insert(productVariants).values({
    id,
    ...input,
  });

  return id;
}

export async function deleteProductVariant(id: string) {
  await db.delete(productVariants).where(eq(productVariants.id, id));
}
