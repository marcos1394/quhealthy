"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { useSessionStore } from "@/stores/SessionStore";
import { CheckoutModal } from "@/components/store/CheckoutModal";

export function GlobalCartBar() {
  const t = useTranslations("StorePublic.GlobalCartBar");
  const router = useRouter();
  const { user } = useSessionStore();
  const userId = user?.id;

  const {
    cart,
    clearCart,
    getTotalPrice,
  } = useBookingStore();
  const totalCart = getTotalPrice();

  const providerSlug = cart[0]?.providerSlug;
  const providerId = cart[0]?.providerId;
  const providerColor = cart[0]?.providerColor;

  const { processCheckout, isProcessing } = useBookingCheckout();
  const [showCheckout, setShowCheckout] = useState(false);

  const safePrimaryColor = providerColor || "#059669";

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 w-full z-[100] border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl font-sans select-none"
          >
            <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                  <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                </div>

                <div className="flex flex-col space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("cart_summary")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-none tracking-tight">
                      {t("items_count", { count: cart.length })} • ${totalCart.toLocaleString()} MXN
                    </span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-bold text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{t("clear_cart")}</span>
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const requiresScheduling = cart.some(
                    (item) =>
                      item.type === "SERVICE" || item.type === "PACKAGE"
                  );

                  if (requiresScheduling) {
                    router.push(`/patient/booking/${providerSlug}`);
                  } else {
                    setShowCheckout(true);
                  }
                }}
                disabled={isProcessing || !providerId}
                className="w-full sm:w-auto rounded-xl h-11 px-7 font-bold text-xs transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: safePrimaryColor, color: "#fff" }}
              >
                {isProcessing ? (
                  <>
                    <QhSpinner size="sm" className="text-white mr-1" />
                    <span>{t("verifying")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("btn_continue")}</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        isProcessing={isProcessing}
        themeColor={safePrimaryColor}
        onConfirm={(
          shippingAddress,
          prescriptionUrls,
          pickupTime,
          destinationState,
          paymentMethod
        ) => {
          setShowCheckout(false);
          processCheckout({
            providerId: providerId!,
            consumerId: userId ?? undefined,
            dependentId: null,
            selectedDate: null,
            selectedTime: null,
            cart,
            shippingAddress,
            prescriptionUrls,
            pickupTime,
            destinationState,
            paymentMethod,
          });
        }}
      />
    </>
  );
}