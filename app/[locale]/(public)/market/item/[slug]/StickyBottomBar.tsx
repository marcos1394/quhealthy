"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Zap, Calendar, PackageCheck, Loader2 } from "lucide-react";
import { CatalogItemDTO } from "@/types/catalog";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StorefrontItem } from "@/types/storefront";

interface StickyBottomBarProps {
  item: CatalogItemDTO;
  providerName?: string;
  providerSlug?: string;
  brandColor?: string;
}

export function StickyBottomBar({
  item,
  providerName,
  providerSlug,
  brandColor,
}: StickyBottomBarProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToCart = useBookingStore((state) => state.addToCart);
  const openCart = useBookingStore((state) => state.openCart);
  const cart = useBookingStore((state) => state.cart);

  const isInCart = cart.some((c) => c.id === item.id && c.type === item.type);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar la barra inferior cuando el usuario hace scroll hacia abajo más de 300px
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleQuickAction = () => {
    if (item.type === "SERVICE") {
      const finalSlug = providerSlug || String(item.providerId);
      router.push(`/patient/booking/${finalSlug}?serviceId=${item.id}`);
      return;
    }

    if (isInCart) {
      openCart();
      return;
    }

    setIsProcessing(true);

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
      quantity: 1,
    } as StorefrontItem;

    setTimeout(() => {
      const finalSlug = providerSlug || String(item.providerId);
      const finalName = providerName || "Proveedor";
      const color = brandColor || "#10b981";

      addToCart(storefrontItem, finalSlug, finalName, color);
      setIsProcessing(false);
      router.push("/checkout");
    }, 250);
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c0c0c]/95 border-t border-gray-200/90 dark:border-gray-800 backdrop-blur-md px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
          {item.name}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
            ${item.price?.toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-gray-400 font-mono">
            {(item as any).currency || "MXN"}
          </span>
        </div>
      </div>

      <Button
        onClick={handleQuickAction}
        disabled={isProcessing}
        className="h-11 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer border-0 shrink-0"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : item.type === "SERVICE" ? (
          <>
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar</span>
          </>
        ) : item.type === "COURSE" ? (
          <>
            <Zap className="w-3.5 h-3.5" />
            <span>Inscribirme</span>
          </>
        ) : item.type === "PACKAGE" ? (
          <>
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Adquirir</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Comprar</span>
          </>
        )}
      </Button>
    </div>
  );
}
