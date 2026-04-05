import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string | null;
  categoryName?: string | null;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  categoryName,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/shop/products/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square bg-muted">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              -{discount}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          {categoryName && (
            <p className="text-xs text-muted-foreground mb-1">{categoryName}</p>
          )}
          <h3 className="font-semibold line-clamp-2 mb-2">{name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">{formatPrice(price)}</p>
            {compareAtPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
