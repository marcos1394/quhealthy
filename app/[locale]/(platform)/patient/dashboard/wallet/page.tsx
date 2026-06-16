"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  WalletCards, 
  Info,
  CreditCard,
  PlusCircle,
  Activity,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

import { useConsumerWallet } from "@/hooks/useConsumerWallet";
import { useSessionStore } from "@/stores/SessionStore";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function PatientWalletPage() {
  const t = useTranslations('PatientWallet');
  const { user } = useSessionStore();
  const { wallet, isLoading, isToppingUp, fetchWallet, topUpWallet } = useConsumerWallet();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWallet(t('toast_load_error', { defaultValue: 'Error al cargar billetera' }));
  }, [fetchWallet, t]);

  const handleTopUp = (amount: number) => {
    if (amount > 0) {
      topUpWallet(amount);
      setIsModalOpen(false);
      setCustomAmount("");
    }
  };

  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' });
    } catch {
      return "No disponible";
    }
  };

  if (isLoading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <QhSpinner size="lg" />
        <p className="text-slate-500 font-medium">Calculando tus fondos...</p>
      </div>
    );
  }

  const displayBalance = wallet?.balance.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || "0.00";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-medical-100 bg-white shadow-sm shadow-medical-500/5 dark:border-medical-500/20 dark:bg-slate-900">
            <WalletCards className="h-7 w-7 text-medical-600 dark:text-medical-400" />
          </div>
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-medical-100 bg-medical-50 px-3 py-1 text-xs font-semibold text-medical-700 dark:border-medical-500/20 dark:bg-medical-500/10 dark:text-medical-300">
              <Sparkles className="h-3.5 w-3.5" />
              Saldo listo para tus servicios
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              QuHealthy Wallet
            </h1>
            <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-lg">
              {wallet && wallet.balance > 0
                ? "Tienes saldo a favor para pagar consultas, paquetes y compras dentro de QuHealthy."
                : "Recarga tu billetera para comprar y reservar más rápido, sin capturar tus datos de pago cada vez."}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchWallet()}
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-medical-500/30 dark:hover:bg-medical-500/10 dark:hover:text-medical-300"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-medical-950 via-medical-800 to-teal-700 p-[1px] shadow-2xl shadow-medical-950/20 dark:shadow-black/30">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(45,212,191,0.35),transparent_26%),linear-gradient(135deg,rgba(16,185,129,0.14),transparent_42%)]" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-32 left-10 h-64 w-64 rounded-full border border-white/10" />
            <Activity className="pointer-events-none absolute right-8 top-8 h-44 w-44 text-white/5" strokeWidth={0.8} />

            <div className="relative flex min-h-[310px] flex-col justify-between rounded-[27px] px-6 py-6 text-white sm:px-8 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur">
                    <CreditCard className="h-3.5 w-3.5" />
                    Tarjeta Digital QuHealthy
                  </div>
                  <p className="text-sm font-medium text-white/65">Saldo disponible</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                  <ShieldCheck className="h-6 w-6 text-teal-100" />
                </div>
              </div>

              <div className="py-8">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="pb-2 text-3xl font-semibold leading-none text-white/90">$</span>
                  <span className="max-w-full break-words text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl">
                    {displayBalance}
                  </span>
                  <span className="pb-2 text-base font-bold text-white/65">{wallet?.currency || "MXN"}</span>
                </div>
              </div>

              <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase text-white/50">Titular</p>
                  <p className="truncate text-sm font-semibold text-white sm:text-base">
                    {user ? `${user.firstName} ${user.lastName}` : "Cargando..."}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="mb-1 text-[11px] font-semibold uppercase text-white/50">Válido hasta</p>
                  <p className="text-sm font-semibold text-white sm:text-base">
                    {formatExpirationDate(wallet?.expirationDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-medical-100 bg-medical-50 p-4 dark:border-medical-500/20 dark:bg-medical-500/10">
              <p className="text-xs font-semibold uppercase text-medical-600 dark:text-medical-300">Pago ágil</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Usa tu saldo al reservar.</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
              <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Recarga segura</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pago protegido y rápido.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">12 meses</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Vigencia desde tu recarga.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="border-b border-slate-100 bg-gradient-to-r from-medical-50 via-white to-teal-50 p-6 dark:border-slate-800 dark:from-medical-500/10 dark:via-slate-900 dark:to-teal-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-medical-600 dark:text-medical-400">Recarga rápida</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                    Agrega saldo
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-medical-600 shadow-sm dark:bg-slate-950 dark:text-medical-400">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Elige un monto frecuente o define una cantidad personalizada.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="group h-20 flex-col gap-1 rounded-2xl border-medical-100 bg-medical-50 text-medical-700 shadow-none transition-all hover:-translate-y-0.5 hover:border-medical-200 hover:bg-medical-100 hover:shadow-lg hover:shadow-medical-500/10 dark:border-medical-500/20 dark:bg-medical-500/10 dark:text-medical-300 dark:hover:bg-medical-500/20"
                    onClick={() => handleTopUp(amount)}
                    disabled={isToppingUp}
                  >
                    <span className="text-xl font-bold">${amount.toLocaleString("es-MX")}</span>
                    <span className="text-xs font-semibold text-medical-500/80 dark:text-medical-300/70">Recargar ahora</span>
                  </Button>
                ))}
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="h-14 w-full rounded-2xl bg-slate-950 text-base font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    disabled={isToppingUp}
                  >
                    {isToppingUp ? (
                      <QhSpinner className="mr-2 h-5 w-5" />
                    ) : (
                      <PlusCircle className="mr-2 h-5 w-5" />
                    )}
                    {isToppingUp ? "Generando pago seguro..." : "Elegir otro monto"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-slate-950 dark:text-white">
                      ¿Cuánto deseas recargar?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center py-8">
                    <div className="flex w-full max-w-xs items-center rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-inner dark:border-slate-800 dark:bg-slate-900">
                      <span className="mr-2 text-3xl font-bold text-slate-400">$</span>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="h-16 border-none bg-transparent p-0 text-center text-4xl font-bold text-slate-950 shadow-none focus-visible:ring-0 dark:text-white"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="h-14 w-full rounded-2xl bg-medical-600 text-lg font-bold text-white shadow-lg shadow-medical-500/20 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600"
                      disabled={!customAmount || Number(customAmount) <= 0 || isToppingUp}
                      onClick={() => handleTopUp(Number(customAmount))}
                    >
                      {isToppingUp ? <QhSpinner className="mr-2 h-5 w-5" /> : null}
                      Continuar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-medical-500" />
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Tu saldo se usa como método de pago al agendar citas o comprar paquetes. La vigencia es de 12 meses a partir de tu última recarga.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
