import { useMemo } from 'react';
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { DiscoverItemWrapperResponse } from '@/types/discover';

export const useDiscoverItems = (params: any) => {
  const shouldFetch = params?.type && params.type !== 'STORE';

  const { data, error, isLoading, isValidating, mutate } = useSWR<DiscoverItemWrapperResponse>(
    shouldFetch ? ['/discover/items', params] : null,
    () => discoverService.searchItems(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
      onError: (err) => {
        console.error("Error al cargar los items:", err);
      }
    }
  );

  const items = useMemo(() => data ? [...data.sponsored, ...data.organic] : [], [data]);
  const sponsoredItems = useMemo(() => data?.sponsored || [], [data]);
  const organicItems = useMemo(() => data?.organic || [], [data]);

  return {
    items,
    sponsoredItems,
    organicItems,
    isLoading: data === undefined && isLoading,
    isValidating,
    isError: !!error,
    refresh: mutate
  };
};
