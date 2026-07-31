"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("AuthProvider");
  const { initializeSession, isLoading, _hasHydrated } = useSessionStore();

  // Ref para prevenir doble inicialización en React Strict Mode (Desarrollo)
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 1. Espera a la hidratación de datos básicos en localStorage
    if (!_hasHydrated) return;

    // 2. Dispara la recuperación silenciosa del token
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeSession();
    }
  }, [_hasHydrated, initializeSession]);

  // Auto-logout tras período de inactividad
  useSessionTimeout();

  // 🛡️ BLOQUEO DE SEGURIDAD / ESTADO DE CARGA CRÍTICO
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] font-sans select-none transition-colors">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-4 animate-pulse">
          {t("restoring_session")}
        </p>
      </div>
    );
  }

  // ✅ ACCESO CONCEDIDO
  return <>{children}</>;
}