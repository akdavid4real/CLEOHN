import { getSession } from "@/lib/auth/session";
import { createProduct } from "@/lib/queries/products";
import { createProductSchema } from "@/lib/validations/product";
import { db } from "@/lib/db/client";
import { products, productCategories, productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch products with categories and all primary images in 2 parallel queries
    const [productList, allPrimaryImages] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          sku: products.sku,
          stock: products.stock,
          isActive: products.isActive,
          categoryId: products.categoryId,
          categoryName: productCategories.name,
        })
        .from(products)
        .leftJoin(productCategories, eq(products.categoryId, productCategories.id)),
      db
        .select()
        .from(productImages)
        .where(eq(productImages.isPrimary, true)),
    ]);

    // Index primary images by productId
    const imagesByProduct = new Map<string, string>();
    for (const img of allPrimaryImages) {
      imagesByProduct.set(img.productId, img.imageUrl);
    }

    // Attach images
    const productsWithImages = productList.map((product) => ({
      ...product,
      primaryImage: imagesByProduct.get(product.id) || null,
    }));

    return Response.json({ products: productsWithImages });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log('Received product data:', body); // Debug log
    
    const validated = createProductSchema.parse(body);
    console.log('Validated product data:', validated); // Debug log

    const productId = await createProduct(validated);

    return Response.json(
      { id: productId, message: "Product created" },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { 
          error: "Validation failed", 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
