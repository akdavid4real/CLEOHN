import { getAllServices } from "@/lib/queries/services";

export async function GET() {
  try {
    const services = await getAllServices();
    return Response.json(services);
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
