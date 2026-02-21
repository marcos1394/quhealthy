// hooks/useStorefront.ts
import useSWR from 'swr';
import { storefrontService } from '@/services/storefront.service';
import { StorefrontData } from '@/types/storefront';

export function useStorefront(slug: string) {
  const { data, error, isLoading } = useSWR<StorefrontData>(
    // Solo dispara la petición si tenemos un slug válido
    slug ? `/storefront/${slug}` : null, 
    // Llamamos a nuestro servicio tipado
    () => storefrontService.getStoreBySlug(slug),
    {
      revalidateOnFocus: false, // No recargar la BD al cambiar de pestaña
      dedupingInterval: 60000,  // Mantiene la caché por 1 minuto
    }
  );

  return {
    store: data,
    isLoading,
    isError: error,
  };
}