"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el store unificado
import { TrialBanner } from '@/components/ui/TrialBanner';
import { Sidebar } from '@/components/ui/Sidebar';
import { Loader2, WifiOff } from 'lucide-react';

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // 2. Usamos el nuevo store de sesión
  const { user, isLoading, fetchSession } = useSessionStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Si no hay información de usuario, intenta obtener la sesión
    if (!user) {
      fetchSession();
    }
  }, [user, fetchSession]);

  // Lógica para monitorear el estado de la conexión (sin cambios)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Muestra una pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Verificando sesión...</p>
      </div>
    );
  }

  // 3. Lógica de Protección de Ruta
  // Si después de cargar no hay usuario, o el rol no es 'provider', redirige al login
  if (!user || user.role !== 'provider') {
    router.replace('/quhealthy/authentication/providers/login');
    return ( // Muestra un loader mientras redirige para evitar parpadeos
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Si la sesión es válida y el rol es correcto, renderiza el layout
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2"
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