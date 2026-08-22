"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { ShoppingBag, Loader2, ArrowRight, Calendar, PackageCheck, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CatalogItemDTO } from "@/types/catalog";
import { useBookingStore } from "@/hooks/useBookingStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorefrontItem } from "@/types/storefront";
import { toast } from "sonner";

interface AddToCartButtonProps {
  item: CatalogItemDTO;
  providerName?: string;
  providerSlug?: string;
  brandColor?: string;
}

export function AddToCartButton({
  item,
  providerName,
  providerSlug,
  brandColor,
}: AddToCartButtonProps) {
  const t = useTranslations("MarketplaceShowcase");
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useBookingStore((state) => state.addToCart);
  const openCart = useBookingStore((state) => state.openCart);
  const cart = useBookingStore((state) => state.cart);

  const isInCart = cart.some((c) => c.id === item.id && c.type === item.type);

  const handleAddToCart = () => {
    if (isInCart) {
      openCart();
      return;
    }

    setIsAdding(true);

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
      quantity: quantity,
    } as StorefrontItem;

    setTimeout(() => {
      const finalSlug = providerSlug || String(item.providerId);
      const finalName = providerName || "Proveedor";
      const color = brandColor || "#10b981";

      addToCart(storefrontItem, finalSlug, finalName, color);
      openCart();

      setIsAdding(false);
      toast.success(`${item.name} agregado al carrito`);
    }, 300);
  };

  const handleDirectBooking = () => {
    const finalSlug = providerSlug || String(item.providerId);
    router.push(`/patient/booking/${finalSlug}?serviceId=${item.id}`);
  };

  if (item.type === "SERVICE") {
    return (
      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
        <Button
          onClick={handleDirectBooking}
          className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0"
        >
          <Calendar className="w-4 h-4" />
          <span>{t("btn_book")}</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleAddToCart}
          className="h-13 px-5 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isInCart ? t("btn_added") : t("btn_add_to_cart")}</span>
        </Button>
      </div>
    );
  }

  if (item.type === "PRODUCT") {
    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Cantidad:</span>
          <div className="inline-flex items-center border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#141414] p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#202020] text-gray-600 dark:text-gray-300 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono font-bold text-sm text-gray-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#202020] text-gray-600 dark:text-gray-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isAdding && !isInCart}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{isInCart ? "Ver en el Carrito" : `${t("btn_add_to_cart")} (${quantity})`}</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  // Para Paquetes y Cursos
  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding && !isInCart}
      className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0"
    >
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isInCart ? (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>Ver en el Carrito</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </>
      ) : (
        <>
          <PackageCheck className="w-4 h-4" />
          <span>{item.type === "PACKAGE" ? "Adquirir Paquete" : "Inscribirme al Curso"}</span>
        </>
      )}
    </Button>
  );
}
