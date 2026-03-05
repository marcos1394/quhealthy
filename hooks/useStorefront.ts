import useSWR from 'swr';
import { useMemo } from 'react'; // 🚀 IMPORTAMOS useMemo
import { storefrontService } from '@/services/storefront.service';
import { StorefrontData } from '@/types/storefront';

export function useStorefront(slug: string) {
  const { data, error, isLoading } = useSWR<StorefrontData>(
    slug ? `/storefront/${slug}` : null, 
    () => storefrontService.getStoreBySlug(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, 
    }
  );

  // 🚀 SOLUCIÓN AL BUCLE INFINITO: Memorizamos el objeto
  const safeData = useMemo(() => {
    if (!data) return undefined;
    
    return {
      ...data,
      services: data.services || [],
      packages: data.packages || [],
      products: data.products || [], 
      courses: data.courses || [],   
    };
  }, [data]); // <-- Solo se recalcula si 'data' del backend cambia

  return {
    store: safeData,
    isLoading,
    isError: error,
  };
}