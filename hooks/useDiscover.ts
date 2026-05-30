// hooks/useDiscover.ts
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { DiscoverProviderWrapperResponse } from '@/types/discover';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useDiscover = () => {
  // SWR maneja el caché, la carga y los errores por nosotros
  const { data, error, isLoading, mutate } = useSWR<DiscoverProviderWrapperResponse>(
    '/discover/providers', // Llave de caché única
    discoverService.getAllProviders,
    {
      revalidateOnFocus: false, // Evita recargar si el usuario cambia de pestaña
      dedupingInterval: 60000,  // Mantiene la caché por 1 minuto
      onError: (err) => {
        console.error("Error al cargar los especialistas:", err);
      }
    }
  );

  return {
    providers: data ? [...data.sponsored, ...data.organic] : [],
    sponsoredProviders: data?.sponsored || [],
    organicProviders: data?.organic || [],
    isLoading,
    isError: !!error,
    refresh: mutate // Por si necesitas forzar una recarga manual desde algún botón
  };
};