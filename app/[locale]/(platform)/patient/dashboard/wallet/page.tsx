"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  WalletCards, 
  Info,
  CreditCard,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
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
        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Calculando tus fondos...</p>
      </div>
    );
  }

  const displayBalance = wallet?.balance.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || "0.00";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
            <WalletCards className="h-6 w-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Saldo listo para tus servicios
            </p>
            <h1 className="text-3xl font-semibold uppercase tracking-tight text-black dark:text-white sm:text-4xl">
              QuHealthy Wallet
            </h1>
            <p className="mt-2 text-base leading-7 text-gray-500 dark:text-gray-400 font-light sm:text-lg">
              {wallet && wallet.balance > 0
                ? "Tienes saldo a favor para pagar consultas, paquetes y compras dentro de QuHealthy."
                : "Recarga tu billetera para comprar y reservar más rápido, sin capturar tus datos de pago cada vez."}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchWallet()}
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 border border-black dark:border-white bg-transparent px-4 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="border border-black dark:border-white bg-black dark:bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 dark:text-black/70">
                  <CreditCard className="h-3.5 w-3.5" />
                  Tarjeta Digital QuHealthy
                </div>
                <p className="text-sm font-medium text-white/60 dark:text-black/60">Saldo disponible</p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 dark:border-black/30">
                <ShieldCheck className="h-5 w-5 text-white dark:text-black" strokeWidth={1.5} />
              </div>
            </div>

            <div className="py-8">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="pb-2 text-3xl font-semibold leading-none text-white/80 dark:text-black/80">$</span>
                <span className="max-w-full break-words text-5xl font-bold leading-none tracking-tight text-white dark:text-black sm:text-6xl">
                  {displayBalance}
                </span>
                <span className="pb-2 text-base font-bold text-white/60 dark:text-black/60">{wallet?.currency || "MXN"}</span>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/20 dark:border-black/20 pt-5 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50 dark:text-black/50">Titular</p>
                <p className="truncate text-sm font-semibold text-white dark:text-black sm:text-base">
                  {user ? `${user.firstName} ${user.lastName}` : "Cargando..."}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50 dark:text-black/50">Válido hasta</p>
                <p className="text-sm font-semibold text-white dark:text-black sm:text-base">
                  {formatExpirationDate(wallet?.expirationDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Pago ágil</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Usa tu saldo al reservar.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Recarga segura</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pago protegido y rápido.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">12 meses</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Vigencia desde tu recarga.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-none">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Recarga rápida</p>
                  <h2 className="mt-1 text-2xl font-semibold uppercase tracking-tight text-black dark:text-white">
                    Agrega saldo
                  </h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                  <Zap className="h-6 w-6" strokeWidth={1.5} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400 font-light">
                Elige un monto frecuente o define una cantidad personalizada.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="group h-20 flex-col gap-1 rounded-none border border-gray-300 dark:border-gray-700 bg-transparent text-black dark:text-white shadow-none transition-all hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-[#050505]"
                    onClick={() => handleTopUp(amount)}
                    disabled={isToppingUp}
                  >
                    <span className="text-xl font-bold">${amount.toLocaleString("es-MX")}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Recargar ahora</span>
                  </Button>
                ))}
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="h-14 w-full rounded-none bg-black dark:bg-white text-base font-bold uppercase tracking-widest text-white dark:text-black shadow-none transition-all hover:bg-gray-800 dark:hover:bg-gray-100"
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
                <DialogContent className="rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-semibold uppercase tracking-tight text-black dark:text-white">
                      ¿Cuánto deseas recargar?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center py-8">
                    <div className="flex w-full max-w-xs items-center rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] px-5 py-4">
                      <span className="mr-2 text-3xl font-bold text-gray-400 dark:text-gray-600">$</span>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="h-16 border-none bg-transparent p-0 text-center text-4xl font-bold text-black dark:text-white shadow-none focus-visible:ring-0 rounded-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="h-14 w-full rounded-none bg-black dark:bg-white text-lg font-bold uppercase tracking-widest text-white dark:text-black shadow-none hover:bg-gray-800 dark:hover:bg-gray-100"
                      disabled={!customAmount || Number(customAmount) <= 0 || isToppingUp}
                      onClick={() => handleTopUp(Number(customAmount))}
                    >
                      {isToppingUp ? <QhSpinner className="mr-2 h-5 w-5" /> : null}
                      Continuar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-start gap-3 border border-gray-200 dark:border-gray-800 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
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