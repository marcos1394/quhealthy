"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ShoppingBag, Trash2, X, Calendar, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";

export function GlobalCartBar() {
  const t = useTranslations("Cart");
  const router = useRouter();

  const {
    cart,
    clearCart,
    getTotalPrice,
    getTotalItemCount,
    removeFromCart,
    openCart,
    hasServices,
  } = useBookingStore();

  const totalCart = getTotalPrice();
  const totalItems = getTotalItemCount();
  const containsServices = hasServices();

  const firstService = useMemo(
    () => cart.find((item) => item.type === "SERVICE" || item.type === "PACKAGE"),
    [cart]
  );

  const providerColor = cart[0]?.providerColor;
  const safePrimaryColor = providerColor || "#059669";

  const { isProcessing } = useBookingCheckout();

  if (!cart || cart.length === 0) {
    return null;
  }

  const handleAction = () => {
    if (containsServices && firstService?.providerSlug) {
      router.push(`/patient/booking/${firstService.providerSlug}`);
    } else {
      router.push("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 w-full z-[90] border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl font-sans select-none"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={openCart}
                className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                title={t("drawer_title")}
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={2} />
              </button>

              <div className="flex flex-col space-y-1 justify-center min-w-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openCart}
                    className="font-mono font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-none tracking-tight hover:underline cursor-pointer text-left"
                  >
                    {t("items_count", { count: totalItems })} • ${totalCart.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] font-bold text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={2} />
                    <span className="hidden sm:inline">{t("clear_cart")}</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                  {cart.slice(0, 3).map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-300 shadow-2xs max-w-[160px]"
                    >
                      <span className="truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <button
                      type="button"
                      onClick={openCart}
                      className="text-[10px] text-gray-400 font-bold hover:underline cursor-pointer"
                    >
                      +{cart.length - 3} más
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAction}
              disabled={isProcessing}
              className="w-full sm:w-auto rounded-xl h-11 px-6 font-bold text-xs transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: safePrimaryColor, color: "#fff" }}
            >
              {isProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-white mr-1" />
                  <span>Procesando...</span>
                </>
              ) : containsServices ? (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>{t("btn_book_appointment")}</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t("btn_checkout_products")}</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}