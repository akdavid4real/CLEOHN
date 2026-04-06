import { getSession } from "@/lib/auth/session";
import { getProductWithDetails, updateProduct, deleteProduct } from "@/lib/queries/products";
import { updateProductSchema } from "@/lib/validations/product";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const product = await getProductWithDetails(id);

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    await updateProduct(id, validated);

    return Response.json(
      {
        id,
        message: "Product updated successfully",
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    return Response.json(
      { error: "Invalid input or product not found" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteProduct(id);

    return Response.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
