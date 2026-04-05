"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/hooks/use-cart";
import { toast } from "sonner";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AddToCartButton({
  item,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(item);
    setAdded(true);
    toast.success(`${item.name} added to cart!`);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
    >
      {added ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
