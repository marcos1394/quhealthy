"use client";

import React, { useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function ConsumerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, fetchSession } = useSessionStore();
  const router = useRouter();

  useEffect(() => {
    // Inicia la carga de la sesión si aún no se ha hecho
    if (!user) {
      fetchSession();
    }
  }, [user, fetchSession]);

  // Mientras se verifica la sesión, muestra una pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Lógica de Protección de Ruta:
  // Si después de cargar no hay usuario, o el rol no es 'consumer', redirige.
  if (!user || user.role !== 'consumer') {
    router.replace('/authentication/consumer/login');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Redirigiendo...</p>
      </div>
    );
  }

  // Si la sesión es válida y el rol es correcto, renderiza el layout y la página
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-28">
        {children}
      </main>
    </div>
  );
}