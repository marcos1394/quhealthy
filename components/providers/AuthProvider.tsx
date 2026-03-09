"use client";

import React, { useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeSession, isLoading, isAuthenticated, _hasHydrated } = useSessionStore();
  const hasInitialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // Esperamos a que Zustand termine de hidratar desde localStorage
    if (!_hasHydrated) return;

    if (!hasInitialized.current) {
      hasInitialized.current = true;

      const publicRoutes = ['/', '/about', '/contact', '/pricing', '/features', '/academy', '/blog', '/business', '/careers', '/market'];

      const isPublicPath = publicRoutes.some(route =>
        pathname === route || pathname?.startsWith(`/${route}/`) || pathname?.startsWith(`/en${route === '/' ? '' : route}`) || pathname?.startsWith(`/es${route === '/' ? '' : route}`)
      );

      const isRoot = pathname === '/es' || pathname === '/en';

      // Verificamos el estado YA HIDRATADO desde localStorage
      const currentState = useSessionStore.getState();

      if ((isPublicPath || isRoot) && !currentState.isAuthenticated) {
        useSessionStore.getState().setLoading(false);
      } else {
        // initializeSession ahora verifica primero si el token persistido sigue vigente
        initializeSession();
      }
    }
  }, [initializeSession, pathname, isAuthenticated, _hasHydrated]);

  // Mientras Zustand se hidrata del localStorage o verifica la sesión, mostramos loading
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Autenticando de forma segura...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}