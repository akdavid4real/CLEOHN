import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth/session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting upload process');
    
    // Check authentication
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      console.log('[Upload] Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[Upload] Parsing form data');
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log('[Upload] No file provided');
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('[Upload] File received:', file.name, file.type, file.size);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('[Upload] Uploading to Cloudinary...');
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "cleohn_products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error('[Upload] Cloudinary error:', error);
              reject(error);
            } else {
              console.log('[Upload] Cloudinary success:', result?.secure_url);
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Upload] Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
