import { config } from "dotenv";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { nanoid } from "nanoid";
import {
  packageFeatures,
  serviceItems,
  servicePackages,
  services,
} from "@/lib/db/schema";

type RegistrationPackage = {
  name: string;
  price: number;
  delivery: string;
  description: string;
  featured?: boolean;
  popular?: boolean;
  deliverables: string[];
};

type RegistrationService = {
  title: string;
  legacyTitle?: string;
  description: string;
  icon: string;
  packages: RegistrationPackage[];
};

const registrationServices: RegistrationService[] = [
  {
    title: "Business Name (Enterprise)",
    legacyTitle: "Business Name Registration",
    description: "Register your enterprise business name and receive your CAC documents.",
    icon: "FileText",
    packages: [
      {
        name: "Standard Package",
        price: 45_000,
        delivery: "1 - 3 working days (soft copies)",
        description: "CAC registration essentials delivered as soft copies within 1 - 3 working days.",
        featured: true,
        deliverables: ["Certificate of Registration", "Status Report", "NRS TIN", "Free Letterhead"],
      },
      {
        name: "VIP Package",
        price: 70_000,
        delivery: "3 - 7 working days",
        description: "Enterprise registration with a complete branding kit, hard copies, and nationwide delivery.",
        featured: true,
        popular: true,
        deliverables: [
          "Certificate of Registration", "Status Report", "NRS TIN", "Framed CAC Certificate", "Letterhead (5 pcs)", "CEO ID Card", "Business Card (50 pcs)",
          "Free Staff Bio Data Form (PDF)", "Free Non-compete Agreement (PDF)", "Free Non-disclosure Agreement (PDF)", "Free Guarantor's Form (PDF)", "Free Offer Letter (PDF)", "Free Board Resolution (PDF)", "Hard Copy of CAC Documents", "Free Nationwide Delivery",
        ],
      },
    ],
  },
  {
    title: "Upgrade from BN to LTD",
    description: "Upgrade an existing business name to a limited liability company.",
    icon: "Briefcase",
    packages: [{
      name: "Upgrade Package",
      price: 100_000,
      delivery: "10 - 21 working days (soft copies)",
      description: "Convert your business name to a limited liability company and receive the new incorporation documents.",
      featured: true,
      deliverables: ["Certificate of Incorporation", "Status Report", "MEMART", "NRS TIN", "Corporate Closure of Existing Business Name"],
    }],
  },
  {
    title: "Limited Liability Company",
    legacyTitle: "Limited Liability Company (LLC)",
    description: "Incorporate your limited liability company with the package that fits your needs.",
    icon: "Building2",
    packages: [
      {
        name: "Standard Package — Soft Copies",
        price: 85_000,
        delivery: "5 - 15 working days (soft copies)",
        description: "Essential company incorporation documents and employment templates, delivered digitally.",
        featured: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "MEMART", "NRS TIN", "Free Letterhead (PDF)", "Free Staff Bio Data Form (PDF)", "Free Non-compete Agreement (PDF)", "Free Non-disclosure Agreement (PDF)", "Free Guarantor's Form (PDF)", "Free Offer Letter (PDF)", "Free Board Resolution (PDF)"],
      },
      {
        name: "VIP Package",
        price: 130_000,
        delivery: "7 - 21 working days",
        description: "Company incorporation with branded materials, hard-copy CAC documents, and nationwide delivery.",
        featured: true,
        popular: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "MEMART", "NRS TIN", "Framed CAC Certificate", "Letterhead (5 pcs)", "CEO ID Card", "Sales Record Book", "Business Card (50 pcs)", "Iron Company Seal", "Free Staff Bio Data Form (PDF)", "Free Non-compete Agreement (PDF)", "Free Non-disclosure Agreement (PDF)", "Free Guarantor's Form (PDF)", "Free Offer Letter (PDF)", "Free Board Resolution (PDF)", "Hard Copy of CAC Documents", "Free Nationwide Delivery"],
      },
      {
        name: "Limited Liability + Trademark",
        price: 150_000,
        delivery: "10 - 21 working days (soft copies)",
        description: "Company incorporation and trademark application together, with essential templates included.",
        featured: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "MEMART", "NRS TIN", "Trademark Acceptance & Acknowledgement Letter", "Free Letterhead", "Free Staff Bio Data Form (PDF)", "Free Non-compete Agreement (PDF)", "Free Non-disclosure Agreement (PDF)", "Free Guarantor's Form (PDF)", "Free Offer Letter (PDF)", "Free Board Resolution (PDF)", "Note: if the name is rejected for trademark, an additional ₦5,000 is required to search another name."],
      },
      {
        name: "Exclusive Package",
        price: 200_000,
        delivery: "7 - 21 working days",
        description: "All-inclusive incorporation, trademark application, branded materials, and document delivery.",
        featured: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "MEMART", "Trademark Acknowledgement & Acceptance Letters", "NRS TIN", "Framed CAC Certificate", "Letterhead (5 pcs)", "CEO ID Card", "Sales Record Book", "Business Card (50 pcs)", "Iron Company Seal", "Free Staff Bio Data Form (PDF)", "Free Non-compete Agreement (PDF)", "Free Non-disclosure Agreement (PDF)", "Free Guarantor's Form (PDF)", "Free Offer Letter (PDF)", "Free Board Resolution (PDF)", "Hard Copy of CAC Documents", "Free Nationwide Delivery", "Note: if the name is rejected for trademark, an additional ₦5,000 is required to search another name."],
      },
    ],
  },
  {
    title: "Incorporated Trustee",
    legacyTitle: "Incorporated Trustee (NGO/CHURCH)",
    description: "Register your incorporated trustee organisation, association, church, mosque, or NGO.",
    icon: "Users",
    packages: [
      {
        name: "Standard Package",
        price: 160_000,
        delivery: "6 - 9 weeks",
        description: "Incorporated trustee registration for up to four trustees, including CAC hard copies and delivery.",
        featured: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "Partnership Agreement", "NRS TIN", "Framed CAC Certificate", "Letterhead (5 pcs)", "Free Hard Copy of All CAC Documents", "Free Nationwide Delivery", "Note: if your name is rejected, an extra ₦5,000 is required to submit another name.", "Price is limited to 4 trustees."],
      },
      {
        name: "VIP Package",
        price: 200_000,
        delivery: "6 - 9 weeks",
        description: "Incorporated trustee registration with SCUML, CAC hard copies, and nationwide delivery for up to four trustees.",
        featured: true,
        popular: true,
        deliverables: ["Certificate of Incorporation", "Status Report", "Partnership Agreement", "NRS TIN", "SCUML Certificate", "Framed CAC Certificate", "Letterhead (5 pcs)", "Free Hard Copy of All CAC Documents", "Free Nationwide Delivery", "Note: if your name is rejected, an extra ₦5,000 is required to submit another name.", "Price is limited to 4 trustees."],
      },
    ],
  },
];

async function syncRegistrationPackages() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  const db = drizzle(neon(process.env.DATABASE_URL));
  const [formation] = await db.select().from(services).where(eq(services.slug, "formation")).limit(1);
  if (!formation) throw new Error('The "Business Formation" service category was not found. Run the main service seed first.');

  // The public pricing page should show this current registration catalogue only.
  await db.update(servicePackages).set({ featured: false, isPopular: false });

  for (const [serviceOrder, service] of registrationServices.entries()) {
    const [existingItem] = await db.select().from(serviceItems).where(and(eq(serviceItems.serviceId, formation.id), eq(serviceItems.title, service.title))).limit(1);
    const [legacyItem] = !existingItem && service.legacyTitle
      ? await db.select().from(serviceItems).where(and(eq(serviceItems.serviceId, formation.id), eq(serviceItems.title, service.legacyTitle))).limit(1)
      : [];
    const itemToUpdate = existingItem ?? legacyItem;
    const serviceItemId = itemToUpdate?.id ?? nanoid();

    if (itemToUpdate) {
      await db.update(serviceItems).set({ title: service.title, description: service.description, icon: service.icon, order: serviceOrder, updatedAt: new Date() }).where(eq(serviceItems.id, serviceItemId));
    } else {
      await db.insert(serviceItems).values({ id: serviceItemId, serviceId: formation.id, title: service.title, description: service.description, icon: service.icon, order: serviceOrder });
    }

    const currentPackages = await db.select().from(servicePackages).where(eq(servicePackages.serviceItemId, serviceItemId)).orderBy(servicePackages.order);
    const matchedPackageIds = new Set<string>();

    for (const [packageOrder, pkg] of service.packages.entries()) {
      const matchingPackage = currentPackages.find((current) => current.name === pkg.name && !matchedPackageIds.has(current.id))
        ?? currentPackages.find((current) => !matchedPackageIds.has(current.id));
      const packageId = matchingPackage?.id ?? nanoid();
      if (matchingPackage) matchedPackageIds.add(matchingPackage.id);
      const packageValues = {
        name: pkg.name, price: pkg.price, processingTime: pkg.delivery,
        pricingDescription: pkg.description, featured: pkg.featured ?? true, isPopular: pkg.popular ?? false,
        displayOrder: serviceOrder * 10 + packageOrder, order: packageOrder, updatedAt: new Date(),
      };
      if (matchingPackage) {
        await db.update(servicePackages).set(packageValues).where(eq(servicePackages.id, packageId));
      } else {
        await db.insert(servicePackages).values({ id: packageId, serviceItemId, ...packageValues });
      }
      await db.delete(packageFeatures).where(eq(packageFeatures.packageId, packageId));
      await db.insert(packageFeatures).values(pkg.deliverables.map((feature, order) => ({ id: nanoid(), packageId, feature, order })));
    }
    console.log(`Synced ${service.title}`);
  }

  console.log("Registration package catalogue synced successfully.");
}

syncRegistrationPackages().catch((error) => {
  console.error(error);
  process.exit(1);
});
