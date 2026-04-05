import { getAllCategories } from "@/lib/queries/products";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return Response.json(categories);
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
