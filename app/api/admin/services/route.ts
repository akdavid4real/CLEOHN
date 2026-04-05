import { getSession } from "@/lib/auth/session";
import { createServiceSchema } from "@/lib/validations/service";
import { getAllServices, createService } from "@/lib/queries/services";

export async function GET() {
  try {
    const services = await getAllServices();
    return Response.json(services);
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
    const validated = createServiceSchema.parse(body);

    const serviceId = await createService(validated);

    return Response.json(
      { id: serviceId, message: "Service created" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return Response.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }
    return new Response("Internal server error", { status: 500 });
  }
}
