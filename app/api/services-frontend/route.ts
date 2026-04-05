import { NextResponse } from "next/server";
import { getAllServicesForFrontend } from "@/lib/queries/services-frontend";

export async function GET() {
  try {
    const services = await getAllServicesForFrontend();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
