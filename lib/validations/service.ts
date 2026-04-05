import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createServicePackageSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  processingTime: z.string().optional(),
});

export const updateServicePackageSchema = createServicePackageSchema.partial();

export const createPackageFeatureSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
  feature: z.string().min(1, "Feature is required"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateServicePackageInput = z.infer<typeof createServicePackageSchema>;
export type UpdateServicePackageInput = z.infer<typeof updateServicePackageSchema>;
export type CreatePackageFeatureInput = z.infer<typeof createPackageFeatureSchema>;
