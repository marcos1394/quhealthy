// Ubicación: src/components/providers/AuthProvider.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeSession, isLoading, _hasHydrated } = useSessionStore();
  
  // Usamos useRef para evitar que React Strict Mode haga doble petición en desarrollo
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 1. Esperamos a que Zustand hidrate los datos básicos (user, role) de localStorage
    if (!_hasHydrated) return;

    // 2. Disparamos la recuperación silenciosa del token vía Cookie HttpOnly
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeSession();
    }
  }, [_hasHydrated, initializeSession]);

  // 🛡️ ENTERPRISE: Idle timeout — auto-logout tras 30min de inactividad
  useSessionTimeout();

  // =========================================================================
  // 🛡️ EL FRENO DE MANO (BLOQUEO CRÍTICO)
  // Mientras se hidrata Zustand o mientras Axios espera la respuesta del backend,
  // devolvemos el Spinner. LOS COMPONENTES HIJOS NO SE MONTARÁN.
  // =========================================================================
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4 animate-pulse">
          Restaurando sesión segura...
        </p>
      </div>
    );
  }

  // =========================================================================
  // ✅ ACCESO PERMITIDO
  // Cuando isLoading pasa a false (ya sea porque el token llegó o porque 
  // falló y mandó al usuario a /login), finalmente soltamos a los hijos.
  // =========================================================================
  return <>{children}</>;
}