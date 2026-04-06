import { z } from "zod";

export const createProductCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export const createProductSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0).optional().nullable(),
  sku: z.string().min(1, "SKU is required"), // Keep required but generate if empty
  stock: z.number().int().min(0, "Stock must be non-negative"),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductImageSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  imageUrl: z.string().url("Invalid image URL"),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const createProductVariantSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.string().min(1, "Variant type is required"),
  value: z.string().min(1, "Variant value is required"),
  priceModifier: z.number().default(0),
});

export type CreateProductCategoryInput = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryInput = z.infer<typeof updateProductCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
