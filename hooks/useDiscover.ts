// hooks/useDiscover.ts
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { DiscoverProvider } from '@/types/discover';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useDiscover = () => {
  // SWR maneja el caché, la carga y los errores por nosotros
  const { data, error, isLoading, mutate } = useSWR<DiscoverProvider[]>(
    '/discover/providers', // Llave de caché única
    discoverService.getAllProviders,
    {
      revalidateOnFocus: false, // Evita recargar si el usuario cambia de pestaña
      dedupingInterval: 60000,  // Mantiene la caché por 1 minuto
      onError: (err) => {
        console.error("Error al cargar los especialistas:", err);
        return;
      }
    }
  );

  return {
    providers: data || [],
    isLoading,
    isError: !!error,
    refresh: mutate // Por si necesitas forzar una recarga manual desde algún botón
  };
};