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

  const PAGE_SIZE = 20;
  const sort = searchParams.get('sort') || 'relevance';

  const getKey = (pageIndex: number, previousPageData: DiscoverProviderWrapperResponse) => {
    if (!shouldFetch) return null;
    if (previousPageData && previousPageData.organic.length + previousPageData.sponsored.length < PAGE_SIZE) return null; // reached the end
    
    return ['/discover/providers', q, type, city, hasDiscount, maxPrice, sort, pageIndex, PAGE_SIZE];
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<DiscoverProviderWrapperResponse>(
    getKey,
    ([url, qParam, typeParam, cityParam, hasDiscountParam, maxPriceParam, sortParam, pageIndex, pageSize]) => 
      discoverService.getAllProviders(qParam, typeParam, { city: cityParam, hasDiscount: hasDiscountParam, maxPrice: maxPriceParam, sort: sortParam, page: pageIndex, size: pageSize }),
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      persistSize: false,
      onError: (err) => {
        console.error("Error al cargar los especialistas:", err);
      }
    }
  );

  const providers = useMemo(() => {
    if (!data) return [];
    const allSponsored = data.flatMap(page => page.sponsored || []);
    const allOrganic = data.flatMap(page => page.organic || []);
    return [...allSponsored, ...allOrganic];
  }, [data]);

  const sponsoredProviders = useMemo(() => data ? data.flatMap(p => p.sponsored || []) : [], [data]);
  const organicProviders = useMemo(() => data ? data.flatMap(p => p.organic || []) : [], [data]);

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.organic.length === 0 && data?.[0]?.sponsored.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.organic.length + data[data.length - 1]?.sponsored.length < PAGE_SIZE);

  return {
    providers,
    sponsoredProviders,
    organicProviders,
    isLoading: data === undefined && isLoading,
    isLoadingMore,
    isValidating,
    isError: !!error,
    size,
    setSize,
    isReachingEnd,
    refresh: mutate
  };
};