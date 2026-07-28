"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, Wallet, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WalletSuccessPage() {
  const t = useTranslations("PatientWalletSuccess");
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Resplandores de fondo sutiles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* ── ÍCONO DE CONFIRMACIÓN ─────────────────────────────────── */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
          </div>

          {/* ── MENSAJE DE ÉXITO ───────────────────────────────────────── */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed mb-8">
            {t("description")}
          </p>

          {/* ── REFERENCIA DE LA TRANSACCIÓN ───────────────────────────── */}
          {sessionId && (
            <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("operation_id")}
              </span>
              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 px-3 py-1 rounded-xl truncate max-w-[200px] sm:max-w-xs shadow-sm">
                {sessionId.replace("cs_test_", "***")}
              </span>
            </div>
          )}

          {/* ── BOTONES DE ACCIÓN ──────────────────────────────────────── */}
          <div className="w-full space-y-3">
            <Button
              onClick={() => router.push("/patient/dashboard/wallet")}
              className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-between px-5 group"
            >
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_wallet")}</span>
              </span>
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/patient/dashboard")}
              className="w-full rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all h-11 shadow-sm"
            >
              {t("btn_dashboard")}
            </Button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}