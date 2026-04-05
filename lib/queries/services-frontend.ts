import { db } from "@/lib/db/client";
import { services, serviceItems, servicePackages, packageFeatures } from "@/lib/db/schema";

export interface PackageFeature {
  id: string;
  feature: string;
  order: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  deliverables: string[];
  delivery: string;
}

export interface ServicePhase {
  name: string;
  cost: string;
  detail: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  packages?: ServicePackage[];
  phases?: ServicePhase[];
  info?: string[];
  types?: string[];
  cost?: string;
  delivery?: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  services: ServiceItem[];
}

// Get all services for the frontend services page
// Optimized: 4 queries instead of 240+
export async function getAllServicesForFrontend(): Promise<ServiceCategory[]> {
  // Batch fetch everything in 4 parallel queries
  const [allCategories, allItems, allPackages, allFeatures] = await Promise.all([
    db.select().from(services).orderBy(services.order),
    db.select().from(serviceItems).orderBy(serviceItems.order),
    db.select().from(servicePackages).orderBy(servicePackages.order),
    db.select().from(packageFeatures).orderBy(packageFeatures.order),
  ]);

  // Index features by packageId
  const featuresByPackage = new Map<string, string[]>();
  for (const f of allFeatures) {
    const list = featuresByPackage.get(f.packageId) || [];
    list.push(f.feature);
    featuresByPackage.set(f.packageId, list);
  }

  // Index packages by serviceItemId
  const packagesByItem = new Map<string, ServicePackage[]>();
  for (const pkg of allPackages) {
    const list = packagesByItem.get(pkg.serviceItemId) || [];
    list.push({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      deliverables: featuresByPackage.get(pkg.id) || [],
      delivery: pkg.processingTime || "",
    });
    packagesByItem.set(pkg.serviceItemId, list);
  }

  // Index items by serviceId
  const itemsByCategory = new Map<string, ServiceItem[]>();
  for (const item of allItems) {
    const list = itemsByCategory.get(item.serviceId) || [];
    const serviceItem: ServiceItem = {
      icon: item.icon || "",
      title: item.title,
      description: item.description,
    };

    const pkgs = packagesByItem.get(item.id);
    if (pkgs && pkgs.length > 0) serviceItem.packages = pkgs;
    if (item.cost) serviceItem.cost = item.cost;
    if (item.delivery) serviceItem.delivery = item.delivery;
    if (item.infoPoints) serviceItem.info = JSON.parse(item.infoPoints);
    if (item.types) serviceItem.types = JSON.parse(item.types);
    if (item.phases) serviceItem.phases = JSON.parse(item.phases);

    list.push(serviceItem);
    itemsByCategory.set(item.serviceId, list);
  }

  // Assemble final result
  return allCategories.map((category) => ({
    id: category.slug,
    label: category.name,
    icon: category.icon || "",
    services: itemsByCategory.get(category.id) || [],
  }));
}
