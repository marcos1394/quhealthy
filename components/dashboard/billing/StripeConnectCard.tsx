"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, handleOnboarding } =
    useStripeConnect();
  const t = useTranslations("DashboardStripeConnect");

  if (isLoadingStatus && !status) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xs transition-colors">
        <div className="flex items-start gap-5 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
          <div className="space-y-3 flex-1 pt-1">
            <div className="h-4 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-full max-w-md rounded-md bg-gray-100 dark:bg-gray-800/60" />
            <div className="h-3 w-3/4 max-w-sm rounded-md bg-gray-100 dark:bg-gray-800/60" />
          </div>
        </div>
      </div>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING" || (status && !status.ready);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="font-sans"
    >
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors">
        {/* ── CUERPO PRINCIPAL ───────────────────────────────────────── */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Icono de Estado */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors border shadow-xs",
                  isReady
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : isPending
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-400"
                )}
              >
                {isReady ? (
                  <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
                ) : isPending ? (
                  <AlertTriangle className="h-7 w-7 animate-pulse" strokeWidth={2} />
                ) : (
                  <AlertCircle className="h-7 w-7" strokeWidth={2} />
                )}
              </div>

              {/* Contenido Informativo */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {t("financial_config")}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                      {t("title")}
                    </h3>
                  </div>

                  {/* Badge de Estado */}
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs border",
                      isReady
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                        : isPending
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {isReady ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{t("badge_active")}</span>
                      </>
                    ) : isPending ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />
                        <span>{t("badge_pending")}</span>
                      </>
                    ) : (
                      <span>{t("badge_inactive")}</span>
                    )}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                  {isReady
                    ? t("active_desc")
                    : isPending
                    ? t("pending_desc")
                    : t("not_configured_desc")}
                </p>

                {/* Sub-estados de la Cuenta de Stripe */}
                {isPending && status && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-2xs font-mono">
                      {t("charges_status", {
                        status: status.charges_enabled
                          ? t("status_enabled")
                          : t("status_pending"),
                      })}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-2xs font-mono">
                      {t("payouts_status", {
                        status: status.payouts_enabled
                          ? t("status_enabled")
                          : t("status_action_required"),
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Acción Principal */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleOnboarding}
                disabled={isRedirecting}
                className={cn(
                  "w-full lg:w-auto h-12 px-6 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0",
                  isReady
                    ? "bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111]"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                {isRedirecting ? (
                  <>
                    <QhSpinner size="sm" className={isReady ? "text-emerald-600" : "text-white"} />
                    <span>{t("processing")}</span>
                  </>
                ) : isReady ? (
                  <>
                    <span>{t("manage")}</span>
                    <ExternalLink className="h-4 w-4" strokeWidth={2} />
                  </>
                ) : isPending ? (
                  <>
                    <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                    <span>{t("complete_setup")}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" strokeWidth={2} />
                    <span>{t("connect_stripe")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── PIE DE SEGURIDAD ───────────────────────────────────────── */}
        {!isReady && (
          <div className="bg-gray-50/60 dark:bg-[#050505] p-5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3.5 shrink-0">
            <div className="w-10 h-10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("security_footer")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}