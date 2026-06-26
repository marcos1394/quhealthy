// hooks/useDiscover.ts
import { useMemo } from 'react';
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { DiscoverProviderWrapperResponse } from '@/types/discover';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useDiscover = (q?: string, type?: string) => {
  // SWR maneja el caché, la carga y los errores por nosotros
  const { data, error, isLoading, mutate } = useSWR<DiscoverProviderWrapperResponse>(
    ['/discover/providers', q, type], // Llave de caché dinámica
    () => discoverService.getAllProviders(q, type),
    {
      revalidateOnFocus: false, // Evita recargar si el usuario cambia de pestaña
      dedupingInterval: 60000,  // Mantiene la caché por 1 minuto
      onError: (err) => {
        console.error("Error al cargar los especialistas:", err);
      }
    }
  );

  const providers = useMemo(() => data ? [...data.sponsored, ...data.organic] : [], [data]);
  const sponsoredProviders = useMemo(() => data?.sponsored || [], [data]);
  const organicProviders = useMemo(() => data?.organic || [], [data]);

  return {
    providers,
    sponsoredProviders,
    organicProviders,
    isLoading,
    isError: !!error,
    refresh: mutate // Por si necesitas forzar una recarga manual desde algún botón
  };
};