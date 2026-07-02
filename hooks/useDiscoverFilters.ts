import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface DiscoverFilters {
  modality?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
}

export function useDiscoverFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<DiscoverFilters>(() => {
    return {
      modality: searchParams.get('modality') || undefined,
      city: searchParams.get('city') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      hasDiscount: searchParams.get('hasDiscount') === 'true',
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof DiscoverFilters, value: any) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
      
      // Reset page when filters change
      params.delete('page');

      // Use replace so we don't build a massive browser history
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    // Keep 'type' and 'q' but remove all filter params
    ['modality', 'city', 'minPrice', 'maxPrice', 'hasDiscount', 'page'].forEach(key => params.delete(key));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return { filters, setFilter, clearFilters };
}
