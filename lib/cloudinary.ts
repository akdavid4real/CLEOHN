import { CldUploadWidget, CldImage } from "next-cloudinary";

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "placeholder",
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cleohn_products",
};

export const imageOptimizationConfig = {
  quality: "auto",
  fetch_format: "auto",
  width: 500,
  crop: "fill",
  gravity: "auto",
};

export const thumbnailConfig = {
  quality: "auto",
  fetch_format: "auto",
  width: 200,
  height: 200,
  crop: "fill",
  gravity: "face",
};

export function getCloudinaryUrl(publicId: string, options?: Record<string, any>) {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const defaultOptions = {
    ...imageOptimizationConfig,
    ...options,
  };

  const optionsString = Object.entries(defaultOptions)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  return `${baseUrl}/${optionsString}/${publicId}`;
}

export function getThumbnailUrl(publicId: string) {
  return getCloudinaryUrl(publicId, thumbnailConfig);
}
