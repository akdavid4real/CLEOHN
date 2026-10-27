"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  imageUrl: string;
  altText: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  name: string;
  discount?: number;
}

export function ProductGallery({
  images,
  name,
  discount = 0,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
        <Image
          src={selected.imageUrl}
          alt={selected.altText || name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-semibold px-2.5 py-1 rounded-full">
            -{discount}% OFF
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1} of ${name}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/40"
              )}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || `${name} ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
