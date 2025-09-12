"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProviderStatusStore } from '@/stores/ProviderStatusStore';
import { TrialBanner } from '@/components/ui/TrialBanner';
import { Sidebar } from '@/components/ui/Sidebar';
import { Loader2,  WifiOff } from 'lucide-react';

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Obtenemos el estado COMPLETO y la función para cargarlo desde nuestro store.
  const { isLoading, status, fetchStatus } = useProviderStatusStore();
  
  const [isOnline, setIsOnline] = useState(true);

  // 2. Este layout es el responsable de iniciar la carga del estado del proveedor.
  useEffect(() => {
    // Solo hacemos la llamada si el estado aún no se ha cargado.
    if (!status) {
      fetchStatus();
    }
  }, [status, fetchStatus]);

  // 3. Tu lógica para monitorear el estado de la conexión (se mantiene intacta).
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (typeof navigator.onLine === 'boolean') {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 4. Muestra tu pantalla de carga profesional hasta que tengamos el estado del proveedor.
  if (isLoading || !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <motion.div
              className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-white">
              Cargando tu espacio de trabajo
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Estamos preparando todo para tu sesión.
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // 5. Una vez cargado, renderizamos el layout principal del dashboard.
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 text-sm font-medium"
          >
            <div className="flex items-center justify-center">
              <WifiOff className="w-4 h-4 mr-2" />
              Sin conexión a internet.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TrialBanner />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}