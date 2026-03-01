"use client";

import React, { useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { Loader2 } from 'lucide-react'; // Ajusta si usas otro ícono

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeSession, isLoading } = useSessionStore();
  const hasInitialized = useRef(false); // Previene doble ejecución en React Strict Mode

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeSession(); // 🚀 ¡Aquí ocurre la magia silenciosa al recargar la página!
    }
  }, [initializeSession]);

  // Mientras verifica la cookie en el backend, mostramos una pantalla de carga sutil
  // Esto evita que el usuario vea la página parpadear o que lo redirija al login accidentalmente
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-medical-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Autenticando de forma segura...
        </p>
      </div>
    );
  }

  // Si ya terminó (sea exitoso o fallido), renderizamos la aplicación normal
  return <>{children}</>;
}