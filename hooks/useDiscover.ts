// hooks/useDiscover.ts
import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { discoverService } from '@/services/discover.service';
import { DiscoverProviderWrapperResponse } from '@/types/discover';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { useSearchParams } from 'next/navigation';

export const useDiscover = (q?: string, type?: string) => {
  const searchParams = useSearchParams();
  // Solo buscar proveedores si el tipo es STORE o indefinido
  const shouldFetch = !type || type === 'STORE';
  
  const city = searchParams.get('city') || undefined;
  const hasDiscountStr = searchParams.get('hasDiscount');
  const hasDiscount = hasDiscountStr === 'true';
  const maxPriceStr = searchParams.get('maxPrice');
  const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;


  const { data, error, isLoading, isValidating, mutate } = useSWR<DiscoverProviderWrapperResponse>(
    shouldFetch ? ['/discover/providers', q, type, city, hasDiscount, maxPrice] : null,
    () => discoverService.getAllProviders(q, type, { city, hasDiscount, maxPrice }),
    {
      revalidateOnFocus: false, // Evita recargar si el usuario cambia de pestaña
      dedupingInterval: 60000,  // Mantiene la caché por 1 minuto
      keepPreviousData: true,   // 🚀 FUNDAMENTAL para UX: Mantiene los resultados anteriores mientras trae los nuevos
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
    isLoading: data === undefined && isLoading, // 🔥 CRITICAL FIX: Only true if there's absolutely no data (initial load)
    isValidating,
    isError: !!error,
    refresh: mutate // Por si necesitas forzar una recarga manual desde algún botón
  };
};