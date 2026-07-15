"use client";

import React, { useState } from "react";
import { ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CatalogItemDTO } from "@/types/catalog";
import { useBookingStore } from "@/hooks/useBookingStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorefrontItem } from "@/types/storefront";

import { toast } from "react-toastify";

interface AddToCartButtonProps {
  item: CatalogItemDTO;
  providerName?: string;
  providerSlug?: string;
}

export function AddToCartButton({
  item,
  providerName,
  providerSlug,
}: AddToCartButtonProps) {
  const t = useTranslations("Marketplace");
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useBookingStore((state) => state.addToCart);
  const setProvider = useBookingStore((state) => state.setProvider);
  const cart = useBookingStore((state) => state.cart);

  const isInCart = cart.some((c) => c.id === item.id && c.type === item.type);

  const handleAddToCart = () => {
    const finalSlug = providerSlug || String(item.providerId);

    if (isInCart) {
      router.push(`/store/${finalSlug}`);
      return;
    }

    setIsAdding(true);

    // Convert CatalogItemDTO to StorefrontItem for the store
    const storefrontItem = {
      id: item.id || 0,
      name: item.name,
      description: item.description || "",
      price: item.price,
      currency: (item as any).currency || "MXN",
      imageUrl: item.imageUrl,
      type: item.type,
      modality: item.modality,
      category: item.category || "General",
      providerId: (item as any).providerId,
      status: (item as any).status || "ACTIVE",
    } as StorefrontItem;

    // Simulate network delay for UX
    setTimeout(() => {
      const finalSlug = providerSlug || String(item.providerId);
      const finalName = providerName || "Proveedor";
      const color = "#000000";

      setProvider(item.providerId || 0, finalSlug, finalName, color);
      addToCart(storefrontItem, finalSlug);

      setIsAdding(false);
      toast.success(t("addedToCart", { fallback: "Agregado al carrito" }), {
        theme: "colored",
      });
    }, 400);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding && !isInCart}
      className={cn(
        "w-full h-14 md:h-16 text-sm md:text-base font-bold tracking-widest uppercase transition-all duration-300",
        isInCart
          ? "bg-green-600 hover:bg-green-700 text-white rounded-none border border-green-600 dark:border-green-600"
          : "bg-black hover:bg-black/90 text-white rounded-none border border-black dark:bg-white dark:hover:bg-gray-200 dark:text-black dark:border-white",
        "flex items-center justify-center gap-3",
      )}
    >
      {isAdding ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isInCart ? (
        <>
          <ShoppingBag className="w-5 h-5" />
          Ir al Carrito
          <ArrowRight className="w-5 h-5 ml-2" />
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          {t("addToCart", { fallback: "Agregar al Carrito" })}
        </>
      )}
    </Button>
  );
}
