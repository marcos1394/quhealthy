"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { useSessionStore } from "@/stores/SessionStore";
import { CheckoutModal } from "@/components/store/CheckoutModal";

export function GlobalCartBar() {
  const t = useTranslations('StorePublic');
  const router = useRouter();
  const { user } = useSessionStore();
  const userId = user?.id;

  const { cart, clearCart, getTotalPrice, providerSlug, providerId, providerColor } = useBookingStore();
  const totalCart = getTotalPrice();
  
  const { processCheckout, isProcessing } = useBookingCheckout();
  const [showCheckout, setShowCheckout] = useState(false);

  const safePrimaryColor = providerColor || '#000000';

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }} 
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 w-full z-[100] border-t border-black dark:border-white bg-white dark:bg-[#0a0a0a]"
          >
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    {t('cart_summary', { defaultValue: 'Auditoría de Orden' })}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="font-bold text-lg tracking-tight text-black dark:text-white leading-none">
                      {cart.length} ÍTEMS • ${totalCart}
                    </span>
                    <button 
                      onClick={clearCart}
                      className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 border-b border-transparent hover:border-red-500 transition-colors"
                    >
                      Anular
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  const requiresScheduling = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
                  const hasPhysical = cart.some(i => i.type === 'PRODUCT' && i.isDigital !== true);
                  const needsPrescription = cart.some(i => i.requiresPrescription === true);
                  
                  if (requiresScheduling) {
                    router.push(`/patient/booking/${providerSlug}`);
                  } else if (!hasPhysical && !needsPrescription) {
                    processCheckout({
                      providerId: providerId!,
                      consumerId: userId ?? undefined,
                      dependentId: null,
                      selectedDate: null,
                      selectedTime: null,
                      cart,
                      shippingAddress: undefined,
                      prescriptionUrls: undefined,
                    });
                  } else {
                    setShowCheckout(true);
                  }
                }}
                disabled={isProcessing || !providerId}
                className="w-full sm:w-auto rounded-none h-14 px-10 font-bold text-[10px] uppercase tracking-widest transition-colors border-0"
                style={{ backgroundColor: safePrimaryColor, color: '#fff' }}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-3 animate-spin" strokeWidth={2} /> VERIFICANDO...</>
                ) : (
                  <>{t('btn_continue', { defaultValue: 'PROCESAR TRANSACCIÓN' })} <ChevronRight className="w-4 h-4 ml-3" strokeWidth={2} /></>
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
        onConfirm={(shippingAddress, prescriptionUrls, pickupTime, destinationState) => {
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
          });
        }}
      />
    </>
  );
}
