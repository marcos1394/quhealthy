"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  WalletCards,
  Info,
  CreditCard,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { useConsumerWallet } from "@/hooks/useConsumerWallet";
import { useSessionStore } from "@/stores/SessionStore";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function PatientWalletPage() {
  const t = useTranslations("PatientWallet");
  const locale = useLocale();
  const { user } = useSessionStore();
  const { wallet, isLoading, isToppingUp, fetchWallet, topUpWallet } =
    useConsumerWallet();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWallet(t("toast_load_error"));
  }, [fetchWallet, t]);

  const handleTopUp = (amount: number) => {
    if (amount > 0) {
      topUpWallet(amount);
      setIsModalOpen(false);
      setCustomAmount("");
    }
  };

  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return t("not_available");
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === "en" ? "en-US" : "es-MX", {
        month: "2-digit",
        year: "2-digit",
      });
    } catch {
      return t("not_available");
    }
  };

  if (isLoading && !wallet) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading_calculating")}
        </p>
      </div>
    );
  }

  const displayBalance =
    wallet?.balance.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <WalletCards className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="max-w-2xl">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>{t("badge_ready_balance")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                {wallet && wallet.balance > 0
                  ? t("subtitle_with_balance")
                  : t("subtitle_empty")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => fetchWallet()}
            disabled={isLoading}
            variant="outline"
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 px-5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-2"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 text-emerald-600 dark:text-emerald-400",
                isLoading && "animate-spin"
              )}
              strokeWidth={2}
            />
            <span>{t("btn_update")}</span>
          </Button>
        </div>

        {/* ── GRID PRINCIPAL ────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
          
          {/* Columna Izquierda: Tarjeta Digital y Beneficios */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Tarjeta Digital */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 p-6 sm:p-8 shadow-md border-0 text-white">
              {/* Formas abstractas decorativas */}
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 -left-12 h-32 w-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-100">
                    <CreditCard className="h-4 w-4" strokeWidth={2} />
                    <span>{t("card_digital_label")}</span>
                  </div>
                  <p className="text-xs font-medium text-emerald-50/80">
                    {t("card_available_balance")}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
              </div>

              <div className="relative z-10 py-8 sm:py-10">
                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className="pb-1 text-2xl font-bold text-emerald-100">
                    $
                  </span>
                  <span className="max-w-full break-words text-4xl sm:text-5xl font-bold tracking-tight text-white font-mono">
                    {displayBalance}
                  </span>
                  <span className="pb-1.5 text-sm font-semibold text-emerald-200/90 font-mono">
                    {wallet?.currency || "MXN"}
                  </span>
                </div>
              </div>

              <div className="relative z-10 grid gap-4 border-t border-white/20 pt-5 sm:grid-cols-2">
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                    {t("card_holder")}
                  </p>
                  <p className="truncate text-xs sm:text-sm font-bold text-white">
                    {user
                      ? `${user.firstName} ${user.lastName || ""}`
                      : t("not_available")}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                    {t("card_valid_until")}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white font-mono">
                    {formatExpirationDate(wallet?.expirationDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Informativos */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  {t("feature_agile_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("feature_agile_desc")}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  {t("feature_secure_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("feature_secure_desc")}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  {t("feature_validity_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("feature_validity_desc")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Módulo de Recarga */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
              <div className="border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 block">
                      {t("topup_badge")}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {t("topup_title")}
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Zap className="h-6 w-6" strokeWidth={2} />
                  </div>
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("topup_desc")}
                </p>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                {/* Montos Rápidos */}
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="group h-20 flex-col justify-center gap-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white shadow-sm transition-all hover:border-emerald-500 hover:ring-1 hover:ring-emerald-500/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                      onClick={() => handleTopUp(amount)}
                      disabled={isToppingUp}
                    >
                      <span className="text-lg font-bold font-mono">
                        ${amount.toLocaleString(
                          locale === "en" ? "en-US" : "es-MX"
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {t("btn_topup_now")}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* Modal para Monto Personalizado */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-2xl bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400 shadow-none transition-all hover:bg-gray-50 dark:hover:bg-[#111] hover:border-emerald-500/50 flex items-center justify-center gap-2"
                      disabled={isToppingUp}
                    >
                      {isToppingUp ? (
                        <QhSpinner size="sm" />
                      ) : (
                        <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>
                        {isToppingUp
                          ? t("topup_generating_payment")
                          : t("btn_choose_other_amount")}
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl sm:max-w-md p-6 sm:p-8">
                    <DialogHeader>
                      <DialogTitle className="text-center text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        {t("modal_title")}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center justify-center py-6">
                      <div className="flex w-full max-w-xs items-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] px-6 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
                        <span className="mr-2 text-2xl font-bold text-gray-400 font-mono">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="h-12 border-none bg-transparent p-0 text-center text-3xl font-bold text-gray-900 dark:text-white shadow-none focus-visible:ring-0 font-mono"
                          autoFocus
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm border-0 disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={
                          !customAmount ||
                          Number(customAmount) <= 0 ||
                          isToppingUp
                        }
                        onClick={() => handleTopUp(Number(customAmount))}
                      >
                        {isToppingUp && <QhSpinner size="sm" />}
                        <span>{t("btn_continue")}</span>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Nota Informativa */}
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4">
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                  <p className="text-xs font-medium leading-relaxed text-emerald-950/80 dark:text-emerald-300/80">
                    {t("info_wallet_usage")}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

      </div>
    </div>
  );
}