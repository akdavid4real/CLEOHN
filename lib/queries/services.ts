import { db } from "@/lib/db/client";
import { services, servicePackages, packageFeatures } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type {
  CreateServiceInput,
  CreateServicePackageInput,
  CreatePackageFeatureInput,
} from "@/lib/validations/service";

export async function getAllServices() {
  return db
    .select()
    .from(services)
    .orderBy(services.order, services.name);
}

export async function getServiceById(id: string) {
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function getServiceBySlug(slug: string) {
  const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return result[0];
}

export async function getServiceWithPackages(serviceId: string) {
  const service = await getServiceById(serviceId);
  if (!service) return null;

  const packages = await db
    .select()
    .from(servicePackages)
    .where(eq(servicePackages.serviceId, serviceId))
    .orderBy(servicePackages.order);

  const packagesWithFeatures = await Promise.all(
    packages.map(async (pkg) => {
      const features = await db
        .select()
        .from(packageFeatures)
        .where(eq(packageFeatures.packageId, pkg.id))
        .orderBy(packageFeatures.order);

      return {
        ...pkg,
        features,
      };
    })
  );

  return {
    ...service,
    packages: packagesWithFeatures,
  };
}

export async function createService(input: CreateServiceInput) {
  const id = nanoid();
  const now = new Date();

  await db.insert(services).values({
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateService(id: string, input: Partial<CreateServiceInput>) {
  await db
    .update(services)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id));
}

export async function deleteService(id: string) {
  await db.delete(services).where(eq(services.id, id));
}

export async function getAllServicePackages(serviceId: string) {
  return db
    .select()
    .from(servicePackages)
    .where(eq(servicePackages.serviceId, serviceId))
    .orderBy(servicePackages.order);
}

export async function getPackageById(id: string) {
  const result = await db
    .select()
    .from(servicePackages)
    .where(eq(servicePackages.id, id))
    .limit(1);
  return result[0];
}

export async function getPackageWithFeatures(packageId: string) {
  const pkg = await getPackageById(packageId);
  if (!pkg) return null;

  const features = await db
    .select()
    .from(packageFeatures)
    .where(eq(packageFeatures.packageId, packageId))
    .orderBy(packageFeatures.order);

  return {
    ...pkg,
    features,
  };
}

export async function createServicePackage(input: CreateServicePackageInput) {
  const id = nanoid();
  const now = new Date();

  await db.insert(servicePackages).values({
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateServicePackage(
  id: string,
  input: Partial<CreateServicePackageInput>
) {
  await db
    .update(servicePackages)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(servicePackages.id, id));
}

export async function deleteServicePackage(id: string) {
  await db.delete(servicePackages).where(eq(servicePackages.id, id));
}

export async function getPackageFeatures(packageId: string) {
  return db
    .select()
    .from(packageFeatures)
    .where(eq(packageFeatures.packageId, packageId))
    .orderBy(packageFeatures.order);
}

export async function createPackageFeature(input: CreatePackageFeatureInput) {
  const id = nanoid();

  await db.insert(packageFeatures).values({
    id,
    ...input,
  });

  return id;
}

export async function deletePackageFeature(id: string) {
  await db.delete(packageFeatures).where(eq(packageFeatures.id, id));
}
