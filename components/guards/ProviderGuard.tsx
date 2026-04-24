// Ubicación: src/components/guards/ProviderGuard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/SessionStore';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { onboardingService } from '@/services/onboarding.service';

export function ProviderGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const { role, status, isAuthenticated, isLoading } = useSessionStore();
  const updateToken = useSessionStore((s) => s.updateToken);

  // Estado local para la re-evaluación de onboarding
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [hasReEvaluated, setHasReEvaluated] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // 1. Si no es provider autenticado, expulsar
    if (!isAuthenticated || role !== 'PROVIDER') {
      console.warn('⛔ Acceso denegado: Área exclusiva para especialistas');
      router.replace('/login');
      return;
    }

    // 2. Verificación de correo
    if (status && !status.emailVerified) {
      console.warn('⛔ Acceso denegado: Email no verificado');
      router.replace('/verify-email');
      return;
    }

    // 3. 🚀 FIX: Si onboarding parece incompleto, re-evaluar desde el backend
    //    antes de redirigir. Esto resuelve el caso donde el paso fiscal era
    //    obligatorio y ahora es opcional — el JWT puede tener el valor stale.
    if (status && !status.onboardingComplete && !hasReEvaluated) {
      setIsReEvaluating(true);

      (async () => {
        try {
          // A. Pedirle al backend que re-evalúe el onboarding
          await onboardingService.finalizeOnboarding();

          // B. Obtener el estado fresco
          const freshStatus = await onboardingService.getOnboardingStatus();

          if (freshStatus.globalStatus === 'APPROVED') {
            // ✅ El onboarding ya está completo — actualizar la sesión local
            console.log('✅ [ProviderGuard] Onboarding re-evaluado como COMPLETO');
            updateToken({
              status: {
                ...status,
                onboardingComplete: true,
              }
            });
          } else {
            // ❌ Realmente está incompleto — redirigir
            console.warn('⛔ Acceso denegado: Onboarding incompleto (confirmado por backend)');
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error('❌ Error al re-evaluar onboarding:', error);
          // En caso de error, redirigir al onboarding por seguridad
          router.replace('/onboarding');
        } finally {
          setIsReEvaluating(false);
          setHasReEvaluated(true);
        }
      })();
      return;
    }

    // 4. Si ya re-evaluamos y sigue incompleto, redirigir
    if (status && !status.onboardingComplete && hasReEvaluated) {
      router.replace('/onboarding');
      return;
    }

  }, [isLoading, isAuthenticated, role, status, router, hasReEvaluated, updateToken]);

  // Pantalla de carga
  if (
    isLoading || 
    isReEvaluating ||
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

  // Todo en orden
  return <>{children}</>;
}