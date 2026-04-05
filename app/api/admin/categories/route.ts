import { getSession } from "@/lib/auth/session";
import { getAllCategories, createCategory } from "@/lib/queries/products";
import { createProductCategorySchema } from "@/lib/validations/product";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return Response.json(categories);
  } catch (error) {
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
    const validated = createProductCategorySchema.parse(body);

    const categoryId = await createCategory(validated);

    return Response.json(
      { id: categoryId, message: "Category created" },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }
}
