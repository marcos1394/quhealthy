"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import { SuccessHeader } from "@/components/dashboard/subscription/success/SuccessHeader";
import { NextStepsList } from "@/components/dashboard/subscription/success/NextStepsList";
import { SuccessActions } from "@/components/dashboard/subscription/success/SuccessActions";
import { useSessionStore } from "@/stores/SessionStore";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const forceRefreshSession = useSessionStore(
    (state) => state.forceRefreshSession
  );

  // Efecto de celebración con confetti y refresco de sesión al confirmar pago
  useEffect(() => {
    if (sessionId) {
      // 1. Refrescar la sesión para obtener el nuevo token JWT con las credenciales actualizadas del plan
      forceRefreshSession();

      // 2. Disparo de Confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#10b981", "#059669", "#3b82f6", "#0ea5e9"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#10b981", "#059669", "#3b82f6", "#0ea5e9"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [sessionId, forceRefreshSession]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-3xl mx-auto space-y-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 sm:p-10 rounded-3xl shadow-sm"
      >
        <SuccessHeader />
        <NextStepsList />
        <SuccessActions />
      </motion.div>
    </div>
  );
}