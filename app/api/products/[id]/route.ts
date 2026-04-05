import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getProductWithDetails } from "@/lib/queries/products";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slug = id;

    // Get product by slug
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get product with images and variants
    const productDetails = await getProductWithDetails(product.id);

    return NextResponse.json({
      product: {
        ...productDetails,
        images: productDetails?.images.map((img: any) => img.imageUrl) || [],
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
