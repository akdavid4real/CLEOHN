import { db } from "@/lib/db/client";
import { products, productImages, productCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // SECURITY: Only show active products to customers
    // Fetch products and all images in 2 parallel queries
    const [productList, allImages] = await Promise.all([
      categoryId
        ? db.select().from(products).where(eq(products.categoryId, categoryId))
        : db.select().from(products),
      db.select().from(productImages).where(eq(productImages.isPrimary, true)),
    ]);

    // Filter to only active products
    const activeProducts = productList.filter(product => product.isActive);

    // Index primary images by productId
    const imagesByProduct = new Map<string, string>();
    for (const img of allImages) {
      imagesByProduct.set(img.productId, img.imageUrl);
    }

    // Attach images to active products only
    const productsWithImages = activeProducts.map((product) => ({
      ...product,
      image: imagesByProduct.get(product.id) || null,
    }));

    return Response.json({ products: productsWithImages });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
