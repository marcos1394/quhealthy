"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { useBookingStore } from "@/hooks/useBookingStore";

export function FloatingCartTrigger() {
  const t = useTranslations("Cart");
  const pathname = usePathname();
  const { cart, isCartOpen, openCart, getTotalItemCount, getTotalPrice } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getTotalItemCount();
  const totalPrice = getTotalPrice();

  // Ocultar en páginas dedicadas de checkout / agendamiento para evitar duplicidad de elementos
  const isCheckoutOrBooking =
    pathname.includes("/checkout") ||
    pathname.includes("/patient/booking") ||
    pathname.includes("/store/");

  const shouldShow = cart.length > 0 && !isCartOpen && !isCheckoutOrBooking;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-6 right-6 z-40 font-sans select-none"
        >
          <button
            type="button"
            onClick={openCart}
            aria-label={t("floating_cart_aria")}
            className="group h-13 px-4 sm:px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl shadow-emerald-600/30 flex items-center gap-3 border border-emerald-500/40 transition-all cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-black text-[10px] flex items-center justify-center border-2 border-emerald-600 animate-pulse">
                {totalItems}
              </span>
            </div>

            <div className="text-left leading-tight hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">
                {t("drawer_title")}
              </span>
              <span className="font-mono font-black text-xs">
                ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform ml-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
