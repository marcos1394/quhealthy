"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Loader2,
  Calendar,
  Plus,
  Minus,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { CatalogItemDTO } from "@/types/catalog";
import { useBookingStore } from "@/hooks/useBookingStore";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useBookingStore((state) => state.addToCart);
  const openCart = useBookingStore((state) => state.openCart);
  const cart = useBookingStore((state) => state.cart);

  const isInCart = cart.some((c) => c.id === item.id && c.type === item.type);

  const safeBrandColor = brandColor && brandColor !== "#000000" && brandColor !== "#ffffff"
    ? brandColor
    : "#059669";

  const getStorefrontItem = (qty: number = 1): StorefrontItem => ({
    id: item.id || 0,
    name: item.name,
    description: item.description || "",
    price: item.price,
    currency: (item as any).currency || "MXN",
    imageUrl: item.imageUrl,
    type: (item.type === "SUPPLY" ? "PRODUCT" : item.type) as "SERVICE" | "PACKAGE" | "PRODUCT" | "COURSE",
    modality: item.modality,
    category: item.category || "General",
    providerId: (item as any).providerId,
    status: (item as any).status || "ACTIVE",
    quantity: qty,
  });

  const handleAddToCart = () => {
    if (isInCart) {
      openCart();
      return;
    }

    setIsAdding(true);
    const storefrontItem = getStorefrontItem(quantity);

    setTimeout(() => {
      const finalSlug = providerSlug || String(item.providerId);
      const finalName = providerName || "Proveedor";

      addToCart(storefrontItem, finalSlug, finalName, safeBrandColor);
      openCart();
      setIsAdding(false);
      toast.success(`${item.name} agregado a tu carrito`);
    }, 200);
  };

  const handleBuyNow = () => {
    setIsBuyingNow(true);
    const storefrontItem = getStorefrontItem(quantity);

    setTimeout(() => {
      const finalSlug = providerSlug || String(item.providerId);
      const finalName = providerName || "Proveedor";

      addToCart(storefrontItem, finalSlug, finalName, safeBrandColor);
      setIsBuyingNow(false);
      router.push("/checkout");
    }, 200);
  };

  const handleDirectBooking = () => {
    const finalSlug = providerSlug || String(item.providerId);
    router.push(`/patient/booking/${finalSlug}?serviceId=${item.id}`);
  };

  /* ── 🩺 SERVICIOS / CONSULTAS CLÍNICAS ──────────────────────────────── */
  if (item.type === "SERVICE") {
    return (
      <div className="space-y-3 w-full">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <Button
            onClick={handleDirectBooking}
            style={{ backgroundColor: safeBrandColor }}
            className="flex-1 h-13 rounded-2xl text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0 hover:opacity-90"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita en Calendario</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleAddToCart}
            className="h-13 px-5 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isInCart ? "Ver en Carrito" : "Apartar Consulta"}</span>
          </Button>
        </div>
      </div>
    );
  }

  /* ── 💊 PRODUCTOS FÍSICOS & FARMACIA ───────────────────────────────── */
  if (item.type === "PRODUCT" || item.type === "SUPPLY") {
    return (
      <div className="space-y-4 w-full">
        {/* Selector de Unidades */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-100 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            Cantidad a Comprar:
          </span>
          <div className="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e1e1e] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#282828] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono font-black text-sm text-gray-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#282828] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Acciones Duales: Comprar Ahora + Agregar al Carrito */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleBuyNow}
            disabled={isBuyingNow}
            style={{ backgroundColor: safeBrandColor }}
            className="h-13 rounded-2xl text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0 hover:opacity-90"
          >
            {isBuyingNow ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Comprar Ahora ({quantity})</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="h-13 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{isInCart ? "Ver en el Carrito" : "Al Carrito"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  /* ── 🎓 CURSOS & 📦 PAQUETES ────────────────────────────────────────── */
  return (
    <div className="space-y-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          style={{ backgroundColor: safeBrandColor }}
          className="h-13 rounded-2xl text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0 hover:opacity-90"
        >
          {isBuyingNow ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : item.type === "COURSE" ? (
            <>
              <Zap className="w-4 h-4" />
              <span>Inscribirme Ahora</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Adquirir Paquete</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="h-13 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{isInCart ? "Ver en el Carrito" : "Agregar al Carrito"}</span>
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Garantía de Satisfacción QuHealthy • Pago 100% Seguro con Cifrado SSL</span>
      </div>
    </div>
  );
}
