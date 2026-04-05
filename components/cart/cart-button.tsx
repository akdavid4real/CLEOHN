"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./cart-drawer";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
