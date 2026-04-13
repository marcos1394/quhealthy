// Ubicación: src/components/guards/ProviderGuard.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/SessionStore';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function ProviderGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // Extraemos las variables de sesión que arreglamos en Zustand
  const { role, status, isAuthenticated, isLoading } = useSessionStore();

  useEffect(() => {
    if (isLoading) return;

    // 1. Si un paciente (CONSUMER) intenta escribir /provider/dashboard en la URL, lo expulsamos.
    if (!isAuthenticated || role !== 'PROVIDER') {
      console.warn('⛔ Acceso denegado: Área exclusiva para especialistas');
      router.replace('/login');
      return;
    }

    // 2. 🛡️ FIX FS-003: Filtro de Verificación de Correo
    if (status && !status.emailVerified) {
      console.warn('⛔ Acceso denegado: Email no verificado');
      router.replace('/verify-email');
      return;
    }

    // 3. 🛡️ FIX FS-003: Filtro de Onboarding Completo
    if (status && !status.onboardingComplete) {
      console.warn('⛔ Acceso denegado: Onboarding incompleto');
      router.replace('/onboarding');
      return;
    }

  }, [isLoading, isAuthenticated, role, status, router]);

  // Pantalla de carga local (se renderizará en el main content, al lado del Sidebar)
  if (
    isLoading || 
    !isAuthenticated || 
    role !== 'PROVIDER' || 
    !status?.emailVerified || 
    !status?.onboardingComplete
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <QhSpinner size="lg" className="text-medical-600" />
        <p className="text-slate-500 font-medium mt-4">Verificando credenciales del especialista...</p>
      </div>
    );
  }

  // Todo en orden, mostramos las vistas del doctor
  return <>{children}</>;
}