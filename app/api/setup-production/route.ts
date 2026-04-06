import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, services, serviceItems, servicePackages, packageFeatures, productCategories } from "@/lib/db/schema";
import { hash } from "@node-rs/argon2";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

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
    ],
  },
];

export async function POST(request: Request) {
  try {
    const { action, secret } = await request.json();

    if (secret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "seed-admin") {
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, "admin@cleohn.com"))
        .limit(1);

      if (existingAdmin.length > 0) {
        return NextResponse.json({ message: "Admin already exists" });
      }

      const hashedPassword = await hash("Admin123!");
      await db.insert(users).values({
        id: nanoid(),
        email: "admin@cleohn.com",
        passwordHash: hashedPassword,
        role: "admin",
      });

      return NextResponse.json({ message: "Admin user created successfully" });
    }

    if (action === "seed-services") {
      const existingServices = await db.select().from(services).limit(1);
      
      if (existingServices.length > 0) {
        return NextResponse.json({ message: "Services already exist" });
      }

      // Seed one service as example
      const category = frontendServicesData[0];
      const serviceId = nanoid();

      await db.insert(services).values({
        id: serviceId,
        name: category.label,
        slug: category.id,
        description: category.description,
        icon: category.icon,
        order: category.order,
      });

      const service = category.services[0];
      const serviceItemId = nanoid();

      await db.insert(serviceItems).values({
        id: serviceItemId,
        serviceId: serviceId,
        title: service.title,
        description: service.description,
        icon: service.icon,
        order: 0,
      });

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

        for (let featIndex = 0; featIndex < pkg.deliverables.length; featIndex++) {
          await db.insert(packageFeatures).values({
            id: nanoid(),
            packageId: packageId,
            feature: pkg.deliverables[featIndex],
            order: featIndex,
          });
        }
      }

      return NextResponse.json({ message: "Services seeded successfully" });
    }

    if (action === "seed-categories") {
      const existingCategories = await db.select().from(productCategories).limit(1);
      
      if (existingCategories.length > 0) {
        return NextResponse.json({ message: "Categories already exist" });
      }

      const categories = [
        { name: "Printing Services", slug: "printing-services", description: "Professional printing solutions", order: 1 },
        { name: "Books & Publications", slug: "books-publications", description: "Educational and business books", order: 2 },
        { name: "Clothing & Apparel", slug: "clothing-apparel", description: "Branded clothing", order: 3 },
        { name: "Office Supplies", slug: "office-supplies", description: "Essential office supplies", order: 4 },
      ];

      for (const category of categories) {
        await db.insert(productCategories).values({ id: nanoid(), ...category });
      }

      return NextResponse.json({ message: "Categories seeded", count: categories.length });
    }

    if (action === "check") {
      const userCount = await db.select().from(users).limit(1);
      const serviceCount = await db.select().from(services).limit(1);
      const categoryCount = await db.select().from(productCategories).limit(1);
      
      return NextResponse.json({
        hasUsers: userCount.length > 0,
        hasServices: serviceCount.length > 0,
        hasCategories: categoryCount.length > 0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
