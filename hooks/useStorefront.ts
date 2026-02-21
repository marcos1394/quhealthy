// hooks/useStorefront.ts
import useSWR from 'swr';
import axios from 'axios';
import { StorefrontData } from '@/types/storefront';

// Fetcher simple para Axios
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useStorefront(slug: string) {
  // Solo hacemos la petición si existe un slug
  const { data, error, isLoading } = useSWR<StorefrontData>(
    slug ? `https://api.quhealthy.org/api/catalog/storefront/${slug}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // No recargar si cambian de pestaña (ahorra llamadas a tu DB)
      dedupingInterval: 60000, // Caché de 1 minuto para carga instantánea
    }
  );

  return {
    store: data,
    isLoading,
    isError: error,
  };
}