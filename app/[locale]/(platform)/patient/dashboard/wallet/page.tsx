"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  WalletCards, 
  Info,
  CreditCard,
  PlusCircle,
  Activity
} from "lucide-react";

import { useConsumerWallet } from "@/hooks/useConsumerWallet";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function PatientWalletPage() {
  const t = useTranslations('PatientWallet');
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      {/* 🟦 HEADER */}
      <div className="flex items-start gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <WalletCards className="w-10 h-10 text-medical-600 dark:text-medical-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            QuHealthy Wallet
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">
            {wallet && wallet.balance > 0 
              ? "¡Tienes saldo a favor! Puedes usarlo para pagar consultas y paquetes." 
              : "Tu billetera está en ceros. Recarga saldo para comprar más fácil."}
          </p>
        </div>
      </div>

      {/* 💳 VIRTUAL CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-[24px] shadow-2xl" style={{
          background: 'linear-gradient(135deg, #1F1C2C 0%, #928DAB 100%)'
        }}>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <Activity className="w-96 h-96 text-white" strokeWidth={0.5} />
          </div>

          <div className="relative p-8 h-56 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-white/90">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">Tarjeta Digital QuHealthy</span>
              </div>
            </div>

            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Saldo Actual</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-semibold">$</span>
                <span className="text-white text-5xl font-bold tracking-tight">
                  {wallet?.balance.toFixed(2) || "0.00"}
                </span>
                <span className="text-white/70 text-lg font-semibold">{wallet?.currency || "MXN"}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Titular</p>
                <p className="text-white font-medium">Paciente QuHealthy</p>
              </div>
              
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Válido hasta</p>
                <p className="text-white font-medium">{formatExpirationDate(wallet?.expirationDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ⚡ ACTIONS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-[24px] space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recarga Rápida</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {QUICK_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="h-16 text-lg font-bold text-medical-700 bg-medical-50 hover:bg-medical-100 border-transparent dark:bg-medical-500/10 dark:text-medical-400 dark:hover:bg-medical-500/20 rounded-2xl"
                onClick={() => handleTopUp(amount)}
                disabled={isToppingUp}
              >
                ${amount}
              </Button>
            ))}
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl shadow-lg transition-all"
                disabled={isToppingUp}
              >
                {isToppingUp ? (
                  <QhSpinner className="mr-2 w-5 h-5" />
                ) : (
                  <PlusCircle className="mr-2 w-5 h-5" />
                )}
                {isToppingUp ? "Generando pago seguro..." : "Otro Monto"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">¿Cuánto deseas recargar?</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-6 py-4 rounded-2xl w-full max-w-xs">
                  <span className="text-3xl font-bold text-slate-400 mr-2">$</span>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="text-4xl font-bold border-none bg-transparent shadow-none text-center h-16 focus-visible:ring-0 p-0"
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-full"
                  disabled={!customAmount || Number(customAmount) <= 0 || isToppingUp}
                  onClick={() => handleTopUp(Number(customAmount))}
                >
                  {isToppingUp ? <QhSpinner className="mr-2 w-5 h-5" /> : null}
                  Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </Card>
      </motion.div>

      {/* ℹ️ INFO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800"
      >
        <Info className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Tu saldo se utiliza como método de pago al agendar citas o comprar paquetes de servicios. 
          La vigencia del saldo es de 12 meses a partir de tu última recarga.
        </p>
      </motion.div>
    </div>
  );
}