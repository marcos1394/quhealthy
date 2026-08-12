"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";

interface StickyBookingBarProps {
  providerSlug: string;
  brandColor?: string;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({
  providerSlug,
  brandColor = "#059669",
}) => {
  const t = useTranslations("StickyBookingBar");
  const router = useRouter();
  const locale = useLocale();
  const { cart } = useBookingStore();

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.price * (item.cartQuantity || 1),
      0
    );
  }, [cart]);

  const hasServices = useMemo(() => cart.some((item) => item.type === "SERVICE"), [cart]);

  const buttonText = hasServices
    ? t("btn_book", { defaultValue: "Agendar cita" })
    : t("btn_checkout", { defaultValue: "Continuar con el pago" });

  const buttonShortText = hasServices
    ? t("btn_book_short", { defaultValue: "Agendar" })
    : t("btn_checkout_short", { defaultValue: "Pagar" });

  const handleAction = () => {
    if (hasServices) {
      router.push(`/${locale}/patient/booking/${providerSlug}`);
    } else {
      router.push(`/${locale}/checkout`);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none font-sans select-none animate-in slide-in-from-bottom-6 duration-300">
      <div className="max-w-3xl mx-auto bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl p-3.5 sm:p-4 flex items-center justify-between pointer-events-auto transition-all">
        <div className="flex items-center gap-3.5">
          <div
            className="hidden sm:flex w-11 h-11 rounded-xl items-center justify-center text-white shadow-2xs shrink-0"
            style={{
              backgroundColor:
                brandColor !== "#ffffff" ? brandColor : "#059669",
            }}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t("selection_label")}
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
        </div>

        <Button
          type="button"
          onClick={handleAction}
          className="rounded-xl h-10 px-5 sm:px-7 text-xs font-bold border-0 text-white transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2"
          style={{
            backgroundColor: brandColor !== "#ffffff" ? brandColor : "#059669",
          }}
        >
          <span className="hidden sm:inline">{buttonText}</span>
          <span className="inline sm:hidden">{buttonShortText}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
};