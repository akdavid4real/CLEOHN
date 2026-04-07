import { z } from "zod";

// Service validation
export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

// Service Item validation
export const createServiceItemSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  icon: z.string().max(50).optional(),
  cost: z.string().max(100).optional().nullable(),
  delivery: z.string().max(100).optional().nullable(),
  infoPoints: z.string().max(2000).optional().nullable(),
  types: z.string().max(2000).optional().nullable(),
  phases: z.string().max(2000).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export const updateServiceItemSchema = z.object({
  cost: z.string().max(100).optional().nullable(),
  delivery: z.string().max(100).optional().nullable(),
  infoPoints: z.string().max(2000).optional().nullable(),
  types: z.string().max(2000).optional().nullable(),
  phases: z.string().max(2000).optional().nullable(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
});

// Service Package validation
export const createServicePackageSchema = z.object({
  serviceItemId: z.string().min(1, "Service item ID is required"),
  name: z.string().min(1, "Package name is required").max(200),
  price: z.number().min(0, "Price must be positive"),
  processingTime: z.string().max(100).optional().nullable(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  isPopular: z.boolean().default(false),
  pricingDescription: z.string().max(500).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export const updateServicePackageSchema = z.object({
  featured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  pricingDescription: z.string().max(500).optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  processingTime: z.string().max(100).optional().nullable(),
  features: z.array(z.string().max(200)).optional(),
});

export const createPackageFeatureSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
  feature: z.string().min(1, "Feature is required").max(200),
});

// Product image validation
export const productImageSchema = z.object({
  imageUrl: z.string().url("Invalid URL format"),
  isPrimary: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  altText: z.string().max(200).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateServiceItemInput = z.infer<typeof createServiceItemSchema>;
export type UpdateServiceItemInput = z.infer<typeof updateServiceItemSchema>;
export type CreateServicePackageInput = z.infer<typeof createServicePackageSchema>;
export type UpdateServicePackageInput = z.infer<typeof updateServicePackageSchema>;
export type CreatePackageFeatureInput = z.infer<typeof createPackageFeatureSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
