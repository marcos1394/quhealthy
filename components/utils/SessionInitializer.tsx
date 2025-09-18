"use client";

import { useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el store unificado

export function SessionInitializer() {
  // 2. Obtenemos la función para cargar la sesión
  const fetchSession = useSessionStore((state) => state.fetchSession);
  
  // Este efecto se ejecuta una sola vez al cargar la aplicación
  useEffect(() => {
    const state = useSessionStore.getState();
    // 3. Verificamos si no hay 'user' y no estamos cargando, y entonces llamamos a 'fetchSession'
    if (!state.user && !state.isLoading) {
      fetchSession();
    }
  }, [fetchSession]);

  return null; // Este componente no renderiza nada en la UI
}