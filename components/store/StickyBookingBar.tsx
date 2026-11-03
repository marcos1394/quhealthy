"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";

interface StickyBookingBarProps {
  providerSlug: string;
  brandColor?: string;
  selectedLocationId?: number | null;
  locationName?: string;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({
  providerSlug,
  brandColor = "#059669",
  selectedLocationId,
  locationName,
}) => {
  const t = useTranslations("StickyBookingBar");
  const router = useRouter();
  const locale = useLocale();
  const { cart, openCart, removeFromCart } = useBookingStore();

  // Filtrar estrictamente solo los ítems pertenecientes a esta tienda/médico
  const storeItems = useMemo(() => {
    return cart.filter(
      (item) => !item.providerSlug || item.providerSlug === providerSlug
    );
  }, [cart, providerSlug]);

  const totalItems = useMemo(() => {
    return storeItems.reduce((acc, item) => acc + (item.cartQuantity || 1), 0);
  }, [storeItems]);

  const totalPrice = useMemo(() => {
    return storeItems.reduce(
      (acc, item) => acc + item.price * (item.cartQuantity || 1),
      0
    );
  }, [storeItems]);

  const hasServices = useMemo(
    () => storeItems.some((item) => item.type === "SERVICE" || item.type === "PACKAGE"),
    [storeItems]
  );

  const buttonText = hasServices
    ? t("btn_book", { defaultValue: "Agendar Cita" })
    : t("btn_checkout", { defaultValue: "Continuar con el pago" });

  const buttonShortText = hasServices
    ? t("btn_book_short", { defaultValue: "Agendar" })
    : t("btn_checkout_short", { defaultValue: "Pagar" });

  const handleAction = () => {
    if (hasServices) {
      const query = selectedLocationId ? `?locationId=${selectedLocationId}` : "";
      router.push(`/${locale}/patient/booking/${providerSlug}${query}`);
    } else {
      router.push(`/${locale}/checkout`);
    }
  };

  const handleClearStoreSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    storeItems.forEach((item) => removeFromCart(item.id));
  };

  // Si no hay ítems agregados específicamente en esta tienda, no mostramos la barra flotante
  if (storeItems.length === 0) return null;

  const safeBrandColor = brandColor && brandColor !== "#ffffff" ? brandColor : "#059669";

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none font-sans select-none animate-in slide-in-from-bottom-6 duration-300">
      <div className="max-w-3xl mx-auto bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl p-3 sm:p-4 flex items-center justify-between pointer-events-auto transition-all gap-2">
        {/* Trigger para ver / editar el carrito lateral */}
        <button
          type="button"
          onClick={openCart}
          title={t("view_selection_tooltip", { defaultValue: "Ver y editar selección" })}
          className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-85 transition-opacity min-w-0"
        >
          <div
            className="hidden sm:flex w-11 h-11 rounded-xl items-center justify-center text-white shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
            style={{ backgroundColor: safeBrandColor }}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[160px] sm:max-w-xs flex items-center gap-1.5">
              <span>{locationName ? `${locationName} • ${t("selection_label")}` : t("selection_label")}</span>
              <span className="text-[10px] text-store-600 dark:text-store-400 font-semibold underline underline-offset-2 shrink-0">
                ({t("edit", { defaultValue: "Editar" })})
              </span>
            </p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-none">
              <span>{t("items_count", { count: totalItems })}</span>
              <span className="text-gray-300 dark:text-gray-700 mx-1.5">•</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                $
                {totalPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        </button>

        {/* Acciones: Vaciar selección y Botón de Agendar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearStoreSelection}
            title={t("clear_selection", { defaultValue: "Vaciar selección de esta tienda" })}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Button
            type="button"
            onClick={handleAction}
            className="rounded-xl h-10 px-4 sm:px-6 text-xs font-bold border-0 text-white transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 sm:gap-2"
            style={{ backgroundColor: safeBrandColor }}
          >
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="inline sm:hidden">{buttonShortText}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};
