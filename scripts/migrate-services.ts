import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { services, servicePackages, packageFeatures } from "@/lib/db/schema";
import { nanoid } from "nanoid";

// Create database connection
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

const servicesData = [
  {
    id: "service-formation",
    name: "Business Formation",
    slug: "business-formation",
    description: "Register and establish your business with full legal compliance",
    icon: "Building2",
    order: 1,
    packages: [
      {
        name: "Business Name Registration",
        description: "Register your business name quickly and get official recognition",
        packages: [
          {
            name: "Standard Package",
            price: 45000,
            processingTime: "1-5 working days",
            features: [
              "Certificate of Registration",
              "Status Report",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
            ],
          },
          {
            name: "VIP Package",
            price: 60000,
            processingTime: "3-7 working days",
            features: [
              "Certificate of Registration",
              "Status Report",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
              "Framed CAC Certificate",
              "LETTERHEAD (5pcs)",
              "ID CARD",
              "FREE OFFER LETTER",
              "FREE STAFF BIO DATA FORM",
              "FREE GUARANTORS FORM",
              "FREE NON COMPETE AGREEMENT",
              "FREE NON DISCLOSURE AGREEMENT",
              "FREE HARDCOPY OF ALL CAC DOCUMENTS",
              "FREE NATIONWIDE DELIVERY",
            ],
          },
        ],
      },
      {
        name: "Limited Liability Company (LLC)",
        description: "Incorporate with 1 Million Shares",
        packages: [
          {
            name: "Standard Package",
            price: 100000,
            processingTime: "10-21 working days",
            features: [
              "Certificate of Incorporation",
              "Status Report",
              "MEMART",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
              "Framed CAC Certificate",
              "LETTER HEAD (5pcs)",
              "FREE OFFER LETTER",
              "FREE STAFF BIO DATA FORM",
              "FREE GUARANTORS FORM",
              "FREE NON COMPETE AGREEMENT",
              "FREE NON DISCLOSURE AGREEMENT",
              "FREE HARDCOPY OF ALL CAC DOCUMENTS",
              "FREE NATIONWIDE DELIVERY",
            ],
          },
          {
            name: "VIP Package",
            price: 190000,
            processingTime: "10-21 working days",
            features: [
              "Certificate of Incorporation",
              "Status Report",
              "MEMART",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
              "SCUML OR TRADEMARK",
              "Framed CAC Certificate",
              "LETTER HEAD (5pcs)",
              "ID Card",
              "Iron Seal",
              "Complimentary card (50pcs)",
              "FREE OFFER LETTER",
              "FREE STAFF BIO DATA FORM",
              "FREE GUARANTORS FORM",
              "FREE NON COMPETE AGREEMENT",
              "FREE HARDCOPY OF ALL CAC DOCUMENTS",
              "FREE NATIONWIDE DELIVERY",
            ],
          },
        ],
      },
      {
        name: "Incorporated Trustee (NGO/CHURCH)",
        description: "Register non-profit organizations and associations",
        packages: [
          {
            name: "Standard Package",
            price: 150000,
            processingTime: "6-9 weeks",
            features: [
              "Certificate of Incorporation",
              "Status Report",
              "Constitution",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
              "Framed CAC Certificate",
              "LETTER HEAD (5pcs)",
              "FREE HARDCOPY OF ALL CAC DOCUMENTS",
              "FREE NATIONWIDE DELIVERY",
            ],
          },
          {
            name: "VIP Package",
            price: 200000,
            processingTime: "6-9 weeks",
            features: [
              "Certificate of Incorporation",
              "Status Report",
              "Constitution",
              "FIRS TIN",
              "JTB TIN",
              "TIN Validation",
              "SCUML Certificate",
              "Framed CAC Certificate",
              "LETTER HEAD (5pcs)",
              "FREE HARDCOPY OF ALL CAC DOCUMENTS",
              "FREE NATIONWIDE DELIVERY",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "service-protection",
    name: "Business Protection",
    slug: "business-protection",
    description: "Protect your brand with legal registrations",
    icon: "Lock",
    order: 2,
    packages: [
      {
        name: "Trademark Registration",
        description:
          "Protect your brand identity - name, logo, slogan, symbol",
        packages: [
          {
            name: "Phase 1: Search",
            price: 10000,
            processingTime: "2-5 working days",
            features: [
              "Ascertain if name will be accepted",
              "Search report provided",
            ],
          },
          {
            name: "Phase 2: Acceptance",
            price: 60000,
            processingTime: "2-4 weeks",
            features: [
              "Approval letter",
              "Acknowledgement letter",
              "Acceptance letter",
            ],
          },
          {
            name: "Phase 3: Certificate",
            price: 80000,
            processingTime: "1-2 years",
            features: ["Official Trademark Certificate"],
          },
        ],
      },
      {
        name: "Copyright Registration",
        description: "Protect creative works - books, music, videos, software",
        packages: [
          {
            name: "Standard Package",
            price: 55000,
            processingTime: "12 weeks",
            features: [
              "Copyright Registration",
              "Legal protection for creative works",
              "Certificate of Registration",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "service-compliance",
    name: "Business Compliance",
    slug: "business-compliance",
    description: "Ensure your business meets all regulatory requirements",
    icon: "FileCheck",
    order: 3,
    packages: [
      {
        name: "Post-Incorporation Changes",
        description: "Update company information with CAC",
        packages: [
          {
            name: "Standard",
            price: 0,
            processingTime: "Varies",
            features: [
              "Change of Company Name",
              "Change of Registered Office Address",
              "Change in Directors / Shareholders",
              "Increase or Reduction of Share Capital",
              "Change in Company Secretary",
              "Change in Nature of Business",
              "Allotment of Shares",
            ],
          },
        ],
      },
      {
        name: "SCUML Registration",
        description:
          "Mandatory compliance for high-risk businesses (Real Estate, Hotels, NGOs)",
        packages: [
          {
            name: "Standard Package",
            price: 0,
            processingTime: "Varies",
            features: [
              "SCUML Registration",
              "Required for corporate bank accounts",
              "Prevents EFCC sanctions",
              "Builds credibility with banks",
            ],
          },
        ],
      },
      {
        name: "Export License (NEPC)",
        description: "Legal authorization to export goods",
        packages: [
          {
            name: "Standard Package",
            price: 45000,
            processingTime: "7 working days",
            features: [
              "NEPC Export License",
              "Legal export authorization",
              "Access to ports and customs",
              "Ability to repatriate proceeds",
            ],
          },
        ],
      },
      {
        name: "Tax Compliance & Consultancy",
        description: "Tax filing and compliance management",
        packages: [
          {
            name: "Standard Package",
            price: 0,
            processingTime: "Ongoing",
            features: [
              "Tax return preparation",
              "Expert tax management advice",
              "Retainer services available",
              "FIRS and JTB TIN assistance",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "service-creative",
    name: "Creative & Digital",
    slug: "creative-digital",
    description: "Branding and digital solutions",
    icon: "Monitor",
    order: 4,
    packages: [
      {
        name: "Printing Services",
        description:
          "High-quality printing for business branding and marketing",
        packages: [
          {
            name: "Standard Package",
            price: 0,
            processingTime: "Varies",
            features: [
              "Business cards and letterheads",
              "Brochures, flyers, and posters",
              "Customized corporate gift items",
              "Large format banners and signage",
            ],
          },
        ],
      },
      {
        name: "Website Design & Development",
        description: "Professional websites to establish your online presence",
        packages: [
          {
            name: "Standard Package",
            price: 0,
            processingTime: "Varies",
            features: [
              "Responsive and mobile-friendly designs",
              "E-commerce and portfolio websites",
              "SEO optimization",
              "Website maintenance support",
            ],
          },
        ],
      },
    ],
  },
];

async function migrateServices() {
  try {
    console.log("Starting service migration...");

    for (const serviceCategory of servicesData) {
      const serviceId = nanoid();

      // Insert main service
      await db.insert(services).values({
        id: serviceId,
        name: serviceCategory.name,
        slug: serviceCategory.slug,
        description: serviceCategory.description,
        icon: serviceCategory.icon,
        order: serviceCategory.order,
      });

      console.log(`✅ Created service: ${serviceCategory.name}`);

      // Insert packages and features
      const flattenedPackages = serviceCategory.packages.flatMap((pkg) => {
        return pkg.packages.map((subPkg, idx) => ({
          serviceName: serviceCategory.name,
          packageName: subPkg.name,
          description: pkg.description,
          price: subPkg.price,
          processingTime: subPkg.processingTime,
          features: subPkg.features,
          order: idx,
        }));
      });

      for (const pkg of flattenedPackages) {
        const packageId = nanoid();

        await db.insert(servicePackages).values({
          id: packageId,
          serviceId: serviceId,
          name: pkg.packageName,
          description: pkg.description,
          price: pkg.price,
          processingTime: pkg.processingTime,
          order: pkg.order,
        });

        // Insert features
        for (const feature of pkg.features) {
          await db.insert(packageFeatures).values({
            id: nanoid(),
            packageId: packageId,
            feature: feature,
            order: pkg.features.indexOf(feature),
          });
        }

        console.log(`  📦 Created package: ${pkg.packageName} (₦${pkg.price})`);
      }
    }

    console.log("\n✅ Service migration completed successfully!");
  } catch (error) {
    console.error("Error migrating services:", error);
    process.exit(1);
  }
}

migrateServices();
