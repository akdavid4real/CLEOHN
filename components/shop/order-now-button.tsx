"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { CartItem } from "@/hooks/use-cart";

interface OrderNowButtonProps {
  item: Omit<CartItem, "quantity">;
  className?: string;
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  label?: string;
}

export function OrderNowButton({
  item,
  className,
  size = "lg",
  disabled = false,
  label = "Order Now",
}: OrderNowButtonProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  const handleOrder = () => {
    addItem(item);
    router.push("/checkout");
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleOrder}
      disabled={disabled}
    >
      <ShoppingBag className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
