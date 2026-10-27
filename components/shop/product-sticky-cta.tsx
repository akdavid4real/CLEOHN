"use client";

import type { CartItem } from "@/hooks/use-cart";
import { OrderNowButton } from "./order-now-button";

interface ProductStickyCtaProps {
  item: Omit<CartItem, "quantity">;
  price: number;
  compareAtPrice: number | null;
  disabled?: boolean;
}

export function ProductStickyCta({
  item,
  price,
  compareAtPrice,
  disabled = false,
}: ProductStickyCtaProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3 pr-20 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">
            {formatPrice(price)}
          </p>
          {compareAtPrice && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice)}
            </p>
          )}
        </div>
        <OrderNowButton
          item={item}
          size="default"
          disabled={disabled}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
