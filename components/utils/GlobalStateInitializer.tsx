"use client"; // Marcamos este componente como de cliente

import { useEffect } from 'react';
import { useProviderStatusStore } from '@/stores/ProviderStatusStore'; // Asumiendo que tu store está en /stores

export function GlobalStateInitializer() {
  const fetchStatus = useProviderStatusStore((state) => state.fetchStatus);
  
  // Este efecto se ejecuta una sola vez al cargar la aplicación
  useEffect(() => {
    const state = useProviderStatusStore.getState();
    if (!state.status && !state.isLoading) {
      fetchStatus();
    }
  }, [fetchStatus]);

  return null; // Este componente no renderiza nada en la UI, solo ejecuta lógica
}