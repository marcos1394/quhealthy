import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { discoverService } from '@/services/discover.service';
import { DiscoverItemWrapperResponse } from '@/types/discover';

export const useDiscoverItems = (params: any) => {
  const shouldFetch = params?.type && params.type !== 'STORE';
  const PAGE_SIZE = 20;

  const getKey = (pageIndex: number, previousPageData: DiscoverItemWrapperResponse) => {
    if (!shouldFetch) return null;
    if (params?.isGeoLoading) return null; // Esperar a que la geolocalización resuelva (o falle) antes de buscar
    if (previousPageData && previousPageData.organic.length + previousPageData.sponsored.length < PAGE_SIZE) return null; // reached the end
    
    return ['/discover/items', { ...params, page: pageIndex, size: PAGE_SIZE }];
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<DiscoverItemWrapperResponse>(
    getKey,
    ([url, fetchParams]) => discoverService.searchItems(fetchParams),
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      persistSize: false,
      keepPreviousData: true,
      onError: (err) => {
        console.error("Error al cargar los items:", err);
      }
    }
  );

  const items = useMemo(() => {
    if (!data) return [];
    const allSponsored = data.flatMap(page => page.sponsored || []);
    const allOrganic = data.flatMap(page => page.organic || []);
    return [...allSponsored, ...allOrganic];
  }, [data]);

  const sponsoredItems = useMemo(() => data ? data.flatMap(p => p.sponsored || []) : [], [data]);
  const organicItems = useMemo(() => data ? data.flatMap(p => p.organic || []) : [], [data]);

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.organic.length === 0 && data?.[0]?.sponsored.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.organic.length + data[data.length - 1]?.sponsored.length < PAGE_SIZE);

  return {
    items,
    sponsoredItems,
    organicItems,
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
