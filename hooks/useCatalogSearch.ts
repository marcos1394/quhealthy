// hooks/useCatalogSearch.ts
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { CatalogSearchRequestParams, ProviderSearchResponseDto } from '@/types/discover';

export const useCatalogSearch = (params: CatalogSearchRequestParams | null) => {
  // Construimos una key de caché única basada en los parámetros
  // Si params es null, no se realiza la llamada automáticamente
  const cacheKey = params 
    ? ['/api/catalog/search', params.category, params.lat, params.lng, params.date, params.page] 
    : null;

  const { data, error, isLoading, mutate } = useSWR<ProviderSearchResponseDto[]>(
    cacheKey,
    () => discoverService.searchProviders(params!),
    {
      revalidateOnFocus: false, // Evita llamadas innecesarias al cambiar de pestaña
      dedupingInterval: 30000, // 30 segundos
      onError: (err) => {
        console.error("Error al buscar especialistas:", err);
      }
    }
  );

  return {
    results: data || [],
    isLoading,
    isError: !!error,
    refresh: mutate
  };
};
