import { db } from "@/lib/db/client";
import { products, productImages, productCategories } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // SECURITY: Only show active products to customers
    // Fetch products and all images in 2 parallel queries
    const productSelection = {
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        rating: products.rating,
        reviewCount: products.reviewCount,
        featured: products.featured,
        categoryId: products.categoryId,
        categoryName: productCategories.name,
      };

    const [productList, allImages] = await Promise.all([
      categoryId
        ? db.select(productSelection).from(products)
            .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
            .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
        : db.select(productSelection).from(products)
            .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
            .where(eq(products.isActive, true)),
      db.select().from(productImages).where(eq(productImages.isPrimary, true)),
    ]);

    // Filter to only active products
    // Index primary images by productId
    const imagesByProduct = new Map<string, string>();
    for (const img of allImages) {
      imagesByProduct.set(img.productId, img.imageUrl);
    }

    // Attach images to active products only
    const productsWithImages = productList.map((product) => ({
      ...product,
      image: imagesByProduct.get(product.id) || null,
    }));

    return Response.json({ products: productsWithImages });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
