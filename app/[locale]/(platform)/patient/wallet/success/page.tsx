"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WalletSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
      {/* Fondo Arquitectónico Sutil */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl z-10"
      >
        <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col">
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            
            {/* 🟢 ÍCONO DE AUDITORÍA */}
            <div className="w-20 h-20 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-8">
              <CheckCircle2 className="w-10 h-10" strokeWidth={3} />
            </div>

            {/* 📝 MENSAJES TÉCNICOS */}
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-4">
              Liquidación de Fondos Aprobada
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
              LA TRANSACCIÓN HA SIDO VERIFICADA EN LA RED. EL CAPITAL SE ENCUENTRA DISPONIBLE EN SU BÓVEDA FINANCIERA PARA FUTURAS OPERACIONES.
            </p>

            {/* 🔗 REFERENCIA DEL PAGO */}
            {sessionId && (
              <div className="w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  Identificador de Operación
                </p>
                <p className="text-xs font-mono font-bold text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 px-3 py-1.5 truncate max-w-[200px] sm:max-w-xs">
                  {sessionId.replace('cs_test_', '***')}
                </p>
              </div>
            )}

            {/* 🚀 BOTONES DE COMANDO */}
            <div className="w-full space-y-4">
              <Button 
                onClick={() => router.push('/patient/dashboard/wallet')}
                className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 border-0 group"
              >
                <span className="flex items-center">
                  <Wallet className="w-4 h-4 mr-3" strokeWidth={1.5} />
                  Acceder a la Bóveda Financiera
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => router.push('/patient/dashboard')}
                className="w-full rounded-none border border-transparent hover:border-black dark:hover:border-white h-12 text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Retornar al Panel Principal
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}