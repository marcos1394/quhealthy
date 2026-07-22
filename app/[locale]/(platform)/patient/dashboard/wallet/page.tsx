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
  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Calculando tus fondos...</p>
  </div>
 );
 }

 const displayBalance = wallet?.balance.toLocaleString("es-MX", {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 }) || "0.00";

 return (
 <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between pb-8">
  <div className="flex items-start gap-4">
  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-quhealthy-green">
  <WalletCards className="h-6 w-6" strokeWidth={2} />
  </div>
  <div className="max-w-2xl">
  <p className="mb-1 text-xs font-semibold text-quhealthy-green">
  Saldo listo para tus servicios
  </p>
  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
  QuHealthy Wallet
  </h1>
  <p className="mt-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">
  {wallet && wallet.balance > 0
  ? "Tienes saldo a favor para pagar consultas, paquetes y compras dentro de QuHealthy."
  : "Recarga tu billetera para comprar y reservar más rápido, sin capturar tus datos de pago cada vez."}
  </p>
  </div>
  </div>

  <button
  onClick={() => fetchWallet()}
  disabled={isLoading}
  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
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
  className="space-y-6"
  >
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-quhealthy-green to-teal-800 p-6 sm:p-8 shadow-xl border-0">
  {/* Abstract subtle shapes */}
  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
  <div className="absolute bottom-0 -left-12 h-32 w-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

  <div className="relative z-10 flex items-start justify-between gap-4">
  <div>
  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-100">
  <CreditCard className="h-4 w-4" />
  Tarjeta Digital QuHealthy
  </div>
  <p className="text-sm font-medium text-emerald-50">Saldo disponible</p>
  </div>

  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
  <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2} />
  </div>
  </div>

  <div className="relative z-10 py-10">
  <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
  <span className="pb-1 text-3xl font-bold text-emerald-100">$</span>
  <span className="max-w-full break-words text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
  {displayBalance}
  </span>
  <span className="pb-2 text-lg font-semibold text-emerald-200">{wallet?.currency || "MXN"}</span>
  </div>
  </div>

  <div className="relative z-10 grid gap-4 border-t border-white/20 pt-5 sm:grid-cols-2">
  <div>
  <p className="mb-1 text-xs font-semibold text-emerald-200/80">Titular</p>
  <p className="truncate text-sm font-semibold text-white sm:text-base">
  {user ? `${user.firstName} ${user.lastName}` : "Cargando..."}
  </p>
  </div>
  <div className="sm:text-right">
  <p className="mb-1 text-xs font-semibold text-emerald-200/80">Válido hasta</p>
  <p className="text-sm font-semibold text-white sm:text-base">
  {formatExpirationDate(wallet?.expirationDate)}
  </p>
  </div>
  </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-3">
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Pago ágil</p>
  <p className="text-xs text-gray-500 dark:text-gray-400">Usa tu saldo al reservar.</p>
  </div>
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recarga segura</p>
  <p className="text-xs text-gray-500 dark:text-gray-400">Pago protegido y rápido.</p>
  </div>
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all hover:shadow-md">
  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">12 meses</p>
  <p className="text-xs text-gray-500 dark:text-gray-400">Vigencia desde tu recarga.</p>
  </div>
  </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 18 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 >
  <Card className="overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-md">
  <div className="border-b border-gray-50 dark:border-gray-800/50 p-6 sm:p-8">
  <div className="flex items-center justify-between gap-4">
  <div>
  <p className="text-xs font-semibold text-quhealthy-green mb-1">Recarga rápida</p>
  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
  Agrega saldo
  </h2>
  </div>
  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-quhealthy-green">
  <Zap className="h-6 w-6" strokeWidth={2} />
  </div>
  </div>
  <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
  Elige un monto frecuente o define una cantidad personalizada.
  </p>
  </div>

 <div className="space-y-5 p-5 sm:p-6">
 <div className="grid grid-cols-2 gap-3">
  {QUICK_AMOUNTS.map((amount) => (
  <Button
  key={amount}
  variant="outline"
  className="group h-24 flex-col gap-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm transition-all hover:border-quhealthy-green hover:ring-1 hover:ring-quhealthy-green hover:bg-teal-50 dark:hover:bg-teal-900/10"
  onClick={() => handleTopUp(amount)}
  disabled={isToppingUp}
  >
  <span className="text-xl font-bold">${amount.toLocaleString("es-MX")}</span>
  <span className="text-xs font-semibold text-gray-500 group-hover:text-quhealthy-green transition-colors">Recargar ahora</span>
  </Button>
  ))}
 </div>

 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogTrigger asChild>
  <Button 
  variant="outline"
  className="h-14 w-full rounded-xl bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 shadow-none transition-all hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 hover:text-gray-900"
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
  <DialogContent className="rounded-3xl border-0 bg-white dark:bg-[#0a0a0a] shadow-2xl sm:max-w-md p-6 sm:p-8">
  <DialogHeader>
  <DialogTitle className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
  ¿Cuánto deseas recargar?
  </DialogTitle>
  </DialogHeader>
  <div className="flex items-center justify-center py-8">
  <div className="flex w-full max-w-xs items-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 focus-within:border-quhealthy-green focus-within:ring-2 focus-within:ring-quhealthy-green/20 transition-all shadow-inner">
  <span className="mr-2 text-3xl font-bold text-gray-400">$</span>
  <Input 
  type="number"
  placeholder="0.00"
  value={customAmount}
  onChange={(e) => setCustomAmount(e.target.value)}
  className="h-16 border-none bg-transparent p-0 text-center text-4xl font-bold text-black dark:text-white shadow-none focus-visible:ring-0"
  autoFocus
  />
  </div>
  </div>
  <DialogFooter>
  <Button 
  className="h-14 w-full rounded-xl bg-quhealthy-green text-lg font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
  disabled={!customAmount || Number(customAmount) <= 0 || isToppingUp}
  onClick={() => handleTopUp(Number(customAmount))}
  >
  {isToppingUp ? <QhSpinner className="mr-2 h-5 w-5" /> : null}
  Continuar
  </Button>
  </DialogFooter>
 </DialogContent>
 </Dialog>

  <div className="flex items-start gap-3 rounded-2xl bg-teal-50/50 p-5 mt-2">
  <Info className="mt-0.5 h-5 w-5 shrink-0 text-quhealthy-green" strokeWidth={2} />
  <p className="text-sm leading-relaxed text-teal-900/80">
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