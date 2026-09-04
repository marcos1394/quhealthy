"use client";

/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/no-chain-state-updates */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { onboardingService } from "@/services/onboarding.service";

export function ProviderGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Guards.ProviderGuard");
  const router = useRouter();

  const { role, status, isAuthenticated, isLoading } = useSessionStore();
  const updateToken = useSessionStore((s) => s.updateToken);

  // Estado local para la re-evaluación de onboarding
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [hasReEvaluated, setHasReEvaluated] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // 1. Si no es provider ni staff autenticado, expulsar
    if (
      !isAuthenticated ||
      (role !== "ROLE_PROVIDER" && role !== "ROLE_STAFF")
    ) {
      console.warn("⛔ Acceso denegado: Área exclusiva para especialistas");
      router.replace("/provider/login");
      return;
    }

    // 2. Verificación de correo
    if (status && !status.emailVerified) {
      console.warn("⛔ Acceso denegado: Email no verificado");
      router.replace("/verify-email");
      return;
    }

    // 3. Re-evaluación de onboarding desde backend si el JWT tiene valor stale
    if (
      role !== "ROLE_STAFF" &&
      status &&
      !status.onboardingComplete &&
      !hasReEvaluated
    ) {
      setIsReEvaluating(true);

      (async () => {
        try {
          await onboardingService.finalizeOnboarding();
          const freshStatus = await onboardingService.getOnboardingStatus();

          if (freshStatus.globalStatus === "APPROVED") {
            console.log(
              "✅ [ProviderGuard] Onboarding re-evaluado como COMPLETO"
            );
            updateToken({
              status: {
                ...status,
                onboardingComplete: true,
              },
            });
          } else {
            console.warn(
              "⛔ Acceso denegado: Onboarding incompleto (confirmado por backend)"
            );
            router.replace("/onboarding");
          }
        } catch (error) {
          console.error("❌ Error al re-evaluar onboarding:", error);
          router.replace("/onboarding");
        } finally {
          setIsReEvaluating(false);
          setHasReEvaluated(true);
        }
      })();
      return;
    }

    // 4. Si ya re-evaluamos y sigue incompleto, redirigir
    if (
      role !== "ROLE_STAFF" &&
      status &&
      !status.onboardingComplete &&
      hasReEvaluated
    ) {
      router.replace("/onboarding");
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    role,
    status,
    router,
    hasReEvaluated,
    updateToken,
  ]);

  // Pantalla de carga con diseño Soft Health Tech
  if (
    isLoading ||
    isReEvaluating ||
    !isAuthenticated ||
    (role !== "ROLE_PROVIDER" && role !== "ROLE_STAFF") ||
    !status?.emailVerified ||
    (role !== "ROLE_STAFF" && !status?.onboardingComplete)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] font-sans transition-colors">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-4 tracking-tight">
          {t("verifying")}
        </p>
      </div>
    );
  }

  // Todo en orden
  return <>{children}</>;
}