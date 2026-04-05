import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST
config({ path: path.join(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { services, serviceItems, servicePackages, packageFeatures } from "@/lib/db/schema";
import { nanoid } from "nanoid";

// Create database connection
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

// Exact data from frontend services page
const frontendServicesData = [
  {
    id: "formation",
    label: "Business Formation",
    icon: "Building2",
    description: "Register and establish your business with full legal compliance",
    order: 1,
    services: [
      {
        icon: "FileText",
        title: "Business Name Registration",
        description: "Register your business name quickly and get official recognition for your enterprise.",
        packages: [
          {
            name: "Standard Package",
            price: 45000,
            deliverables: [
              "Certificate of Registration",
              "Status Report",
              "NRS TIN",
              "Free Letterhead",
            ],
            delivery: "1 - 5 working days (Soft copies)",
          },
          {
            name: "VIP Package",
            price: 60000,
            deliverables: [
              "Certificate of Registration",
              "Status Report",
              "NRS TIN",
              "Framed CAC Certificate",
              "ID Card",
              "Letterhead (5 pcs)",
              "Free Offer Letter",
              "Free Staff Bio Data Form",
              "Free Guarantor's Form",
              "Free Non Compete Agreement",
              "Free Non Disclosure Agreement",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "3 - 7 working days",
          },
        ],
      },
      {
        icon: "Briefcase",
        title: "Limited Liability Company (LLC)",
        description: "Incorporate your limited liability company (1 Million Shares) with complete legal compliance.",
        packages: [
          {
            name: "Standard Package",
            price: 100000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Memart",
              "NRS TIN",
              "Framed CAC Certificate",
              "Letterhead (5 pcs)",
              "Free Offer Letter",
              "Free Guarantor's Form",
              "Free Non Compete Agreement",
              "Free Non Disclosure Agreement",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "10 - 21 working days",
          },
          {
            name: "Complete Ownership Package",
            price: 165000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Memart",
              "NRS TIN",
              "Trademark Acknowledgement and Acceptance letters",
              "Framed CAC Certificate",
              "Letterhead (5 pcs)",
              "Free Offer Letter",
              "Free Staff Bio Data Form",
              "Free Guarantor's Form",
              "Free Non Compete Agreement",
              "Free Non Disclosure Agreement",
              "Free Bank Resolution Letter",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "10 - 21 working days",
          },
          {
            name: "VIP Package",
            price: 270000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Memart",
              "NRS TIN",
              "Trademark Acknowledgement and Acceptance letters",
              "Scuml",
              "Framed CAC Certificate",
              "Letterhead (5 pcs)",
              "Business Card (50 pcs)",
              "Company Iron Seal",
              "Company ID Card",
              "Sales Record Book",
              "Receipt Booklets (5 pcs)",
              "Free Offer Letter",
              "Free Staff Bio Data Form",
              "Free Guarantor's Form",
              "Free Non Compete Agreement",
              "Free Non Disclosure Agreement",
              "Free Bank Resolution Letter",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "10 - 21 working days",
          },
          {
            name: "Premium Exclusive Package",
            price: 650000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Memart",
              "NRS TIN",
              "Trademark Acknowledgement and Acceptance letters",
              "Scuml",
              "Framed CAC Certificate",
              "Letterhead (10 pcs)",
              "Business Card (100 pcs)",
              "Company Iron Seal",
              "Company ID Card (3)",
              "Sales Record Book",
              "Receipt Booklets (5 pcs)",
              "Roll Up Banner",
              "CEO Desk Name Plate",
              "Professional Logo",
              "Basic Website (3 to 5 pages)",
              "Corporate Email Setup (3)",
              "Google Business Registration",
              "Framed CEO Portrait",
              "Free Offer Letter",
              "Free Staff Bio Data Form",
              "Free Guarantor's Form",
              "Free Non Compete Agreement",
              "Free Non Disclosure Agreement",
              "Free Bank Resolution Letter",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "6 - 8 weeks",
          },
        ],
      },
      {
        icon: "Users",
        title: "Incorporated Trustee (NGO/CHURCH)",
        description: "Register your non-profit organization, church, mosque, or association seamlessly.",
        packages: [
          {
            name: "Standard Package",
            price: 150000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Constitution",
              "NRS TIN",
              "Framed CAC Certificate",
              "Letterhead (5 pcs)",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "6 - 9 weeks",
          },
          {
            name: "VIP Package",
            price: 200000,
            deliverables: [
              "Certificate of Incorporation",
              "Status Report",
              "Constitution",
              "NRS TIN",
              "Scuml",
              "Framed CAC Certificate",
              "Letterhead (5 pcs)",
              "Free Hardcopy of all CAC Documents",
              "Free Nationwide Delivery",
            ],
            delivery: "6 - 9 weeks",
          },
        ],
      },
      {
        icon: "Award",
        title: "Trademark Registration",
        description: "Register your trademark and protect your brand identity.",
        packages: [
          {
            name: "Trademark",
            price: 70000,
            deliverables: ["Acknowledgement Letter", "Acceptance Letter"],
            delivery: "21 - 28 working days (Soft copies)",
          },
        ],
      },
    ],
  },
  {
    id: "protection",
    label: "Business Protection",
    icon: "Lock",
    description: "Protect your brand with legal registrations",
    order: 2,
    services: [
      {
        icon: "Award",
        title: "Trademark Registration",
        description: "A trademark is a legal protection for your brand identity - the name, logo, slogan, symbol that customers use to recognize your business.",
        info: [
          "Protects your brand from being copied or used by others.",
          "Gives you exclusive rights to use that name or logo in your line of business.",
          "Helps customers distinguish your goods or services from competitors.",
          "Adds value and credibility to your business.",
        ],
        phases: [
          {
            name: "Phase 1: Search",
            cost: "₦10,000",
            detail: "Search to ascertain if the name will be accepted. (2-5 working days)",
          },
          {
            name: "Phase 2: Acceptance",
            cost: "₦60,000",
            detail: "Approval, acknowledgement and acceptance letters. (2-4 weeks)",
          },
          {
            name: "Phase 3: Certificate",
            cost: "₦80,000",
            detail: "Official Trademark Certificate (1-2 years, optional)",
          },
        ],
      },
      {
        icon: "Shield",
        title: "Copyright Registration",
        description: "Legal protection for creative works - books, music, videos, photos, software, and training materials.",
        info: [
          "Exclusive right to copy, distribute, perform, or sell your work.",
          "Allows you to license or monetize your content.",
          "Proof of ownership in legal disputes.",
          "Protects your income and creative effort.",
        ],
        cost: "₦55,000",
        delivery: "12 weeks",
      },
    ],
  },
  {
    id: "compliance",
    label: "Business Compliance",
    icon: "FileCheck",
    description: "Ensure your business meets all regulatory requirements",
    order: 3,
    services: [
      {
        icon: "Landmark",
        title: "Post-Incorporation Changes",
        description: "Ensure your company's information with CAC remains accurate, compliant, and legally valid as your business grows.",
        types: [
          "Change of Company Name",
          "Change of Registered Office Address",
          "Change in Directors / Shareholders",
          "Increase or Reduction of Share Capital",
          "Change in Company Secretary",
          "Change in Nature of Business",
          "Allotment of Shares",
        ],
      },
      {
        icon: "Receipt",
        title: "SCUML Registration",
        description: "Mandatory compliance for businesses considered high-risk for money laundering (Real Estate, Hotels, NGOs, etc.).",
        info: [
          "Required for opening/upgrading corporate bank accounts.",
          "Prevents EFCC sanctions and heavy fines.",
          "Builds credibility with banks and investors.",
          "Demonstrates transparency and legal operation.",
        ],
      },
      {
        icon: "Globe",
        title: "Export License (NEPC)",
        description: "Official authorization that allows a business to legally export goods from Nigeria to other countries.",
        cost: "₦45,000",
        delivery: "7 working days",
        info: [
          "Legal authorization to export agricultural or manufactured goods.",
          "Access to ports and customs clearance.",
          "Ability to repatriate export proceeds legally.",
          "Eligibility for government export incentives.",
        ],
      },
      {
        icon: "Calculator",
        title: "Tax Compliance & Consultancy",
        description: "Obtaining Tax Clearance Certificates (TCC) and maintaining full compliance with Nigerian tax laws.",
        info: [
          "End-to-end tax support (preparing and filing returns).",
          "Expert advice on effective tax management.",
          "Retainer services for continuous proactive support.",
          "Assistance with FIRS and JTB TIN validation.",
        ],
      },
    ],
  },
  {
    id: "digital",
    label: "Creative & Digital",
    icon: "Monitor",
    description: "Branding and digital solutions",
    order: 4,
    services: [
      {
        icon: "Printer",
        title: "Printing Services",
        description: "High-quality printing solutions for your business branding and marketing materials.",
        info: [
          "Business cards and letterheads.",
          "Brochures, flyers, and posters.",
          "Customized corporate gift items.",
          "Large format banners and signage.",
        ],
      },
      {
        icon: "Monitor",
        title: "Website Design & Development",
        description: "Professional website solutions to establish your online presence and grow your business.",
        info: [
          "Responsive and mobile-friendly designs.",
          "E-commerce and business portfolio websites.",
          "SEO optimization and digital marketing integration.",
          "Website maintenance and technical support.",
        ],
      },
    ],
  },
];

async function seedServicesFromFrontend() {
  try {
    console.log("🚀 Starting service migration from frontend data...\n");

    // STEP 1: Clear existing data (try/catch in case tables don't exist)
    console.log("🗑️  Clearing existing service data...");
    try {
      await db.delete(packageFeatures);
      await db.delete(servicePackages);
      await db.delete(serviceItems);
      await db.delete(services);
      console.log("✅ Existing data cleared\n");
    } catch (error) {
      console.log("⚠️  No existing data to clear (tables may not exist yet)\n");
    }

    // STEP 2: Seed new data
    for (const category of frontendServicesData) {
      const serviceId = nanoid();

      // Insert service category
      await db.insert(services).values({
        id: serviceId,
        name: category.label,
        slug: category.id,
        description: category.description,
        icon: category.icon,
        order: category.order,
      });

      console.log(`📁 Created category: ${category.label}`);

      // Insert service items and packages
      for (let serviceIndex = 0; serviceIndex < category.services.length; serviceIndex++) {
        const service = category.services[serviceIndex];
        const serviceItemId = nanoid();

        // Insert service item
        await db.insert(serviceItems).values({
          id: serviceItemId,
          serviceId: serviceId,
          title: service.title,
          description: service.description,
          icon: service.icon,
          cost: service.cost || null,
          delivery: service.delivery || null,
          infoPoints: service.info ? JSON.stringify(service.info) : null,
          types: service.types ? JSON.stringify(service.types) : null,
          phases: service.phases ? JSON.stringify(service.phases) : null,
          order: serviceIndex,
        });

        console.log(`  📄 Created service: ${service.title}`);

        // Insert packages (if any)
        if (service.packages) {
          for (let pkgIndex = 0; pkgIndex < service.packages.length; pkgIndex++) {
            const pkg = service.packages[pkgIndex];
            const packageId = nanoid();

            await db.insert(servicePackages).values({
              id: packageId,
              serviceItemId: serviceItemId,
              name: pkg.name,
              price: pkg.price,
              processingTime: pkg.delivery,
              order: pkgIndex,
            });

            // Insert package features/deliverables
            for (let featIndex = 0; featIndex < pkg.deliverables.length; featIndex++) {
              await db.insert(packageFeatures).values({
                id: nanoid(),
                packageId: packageId,
                feature: pkg.deliverables[featIndex],
                order: featIndex,
              });
            }

            console.log(`    💼 Created package: ${pkg.name} (₦${pkg.price.toLocaleString()})`);
          }
        }
      }

      console.log("");
    }

    console.log("✅ Service migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Categories: ${frontendServicesData.length}`);
    console.log(`   - Total Services: ${frontendServicesData.reduce((acc, cat) => acc + cat.services.length, 0)}`);
    console.log(`   - Total Packages: ${frontendServicesData.reduce((acc, cat) => acc + cat.services.reduce((sum, svc) => sum + (svc.packages?.length || 0), 0), 0)}`);
  } catch (error) {
    console.error("❌ Error migrating services:", error);
    process.exit(1);
  }
}

seedServicesFromFrontend();
