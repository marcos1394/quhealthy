"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/booking/success/SuccessEffects';

export default function WalletSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Detener el confetti después de 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 🎊 EFECTOS DE FONDO Y CONFETTI */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      {showConfetti && <Confetti show={showConfetti} />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl z-10"
      >
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center">
            
            {/* 🟢 ÍCONO DE ÉXITO ANIMADO */}
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }} 
              className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-500/30 mb-8 relative shadow-inner"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-amber-400 animate-pulse" />
            </motion.div>

            {/* 📝 MENSAJES */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                ¡Recarga Exitosa!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Tu pago se ha procesado de manera segura. El saldo se ha añadido a tu Billetera QuHealthy y está listo para usarse en tus próximas consultas o paquetes.
              </p>
            </motion.div>

            {/* 🔗 REFERENCIA DEL PAGO (Opcional) */}
            {sessionId && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.6 }}
                className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-full border border-slate-100 dark:border-slate-800"
              >
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-semibold">Ref. de Transacción</p>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-300 truncate px-2">
                  {sessionId.replace('cs_test_', '...')}
                </p>
              </motion.div>
            )}

            {/* 🚀 BOTONES DE ACCIÓN */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.8 }}
              className="w-full space-y-4"
            >
              <Button 
                onClick={() => router.push('/patient/dashboard/wallet')}
                className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-2xl shadow-lg transition-all group"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Ir a mi Billetera
                <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => router.push('/patient/dashboard')}
                className="w-full h-12 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                Volver al Inicio
              </Button>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
