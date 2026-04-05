import { getSession } from "@/lib/auth/session";
import { getServiceById, updateService, deleteService } from "@/lib/queries/services";
import { updateServiceSchema } from "@/lib/validations/service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Fetching service with ID:", id);
    const service = await getServiceById(id);

    if (!service) {
      console.log("Service not found with ID:", id);
      return Response.json(
        { error: "Service not found", id },
        { status: 404 }
      );
    }

    return Response.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const validated = updateServiceSchema.parse(body);

    await updateService(id, validated);

    return Response.json({
      id,
      message: "Service updated successfully",
    });
  } catch (error) {
    return Response.json(
      { error: "Invalid input or service not found" },
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

    await deleteService(id);

    return Response.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
