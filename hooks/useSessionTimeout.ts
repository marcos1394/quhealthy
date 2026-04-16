// hooks/useSessionTimeout.ts
// =========================================================================
// 🛡️ ENTERPRISE: Idle Timeout Hook
// Cierra la sesión automáticamente tras un período de inactividad.
// Configurable vía IDLE_TIMEOUT_MS (default: 30 minutos).
// =========================================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { toast } from 'react-toastify';

/** Tiempo de inactividad antes de logout automático (ms) */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

/** Eventos que indican actividad del usuario */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

export function useSessionTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const clearSession = useSessionStore((s) => s.clearSession);

  const handleTimeout = useCallback(() => {
    console.log('⏱️ [Auth] Sesión cerrada por inactividad.');
    clearSession();

    toast.info('Tu sesión se cerró por inactividad. Inicia sesión de nuevo.', {
      autoClose: 5000,
      theme: 'colored',
    });

    // Pequeño delay para que el toast sea visible antes del redirect
    setTimeout(() => {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }, 1500);
  }, [clearSession]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleTimeout, IDLE_TIMEOUT_MS);
  }, [handleTimeout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Arrancar el timer
    resetTimer();

    // Escuchar actividad del usuario
    const handleActivity = () => resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    // Escuchar visibilidad de la pestaña (si el usuario se va y vuelve)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthenticated, resetTimer]);
}
