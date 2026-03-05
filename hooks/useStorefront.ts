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

  // 🚀 FALLBACK DE SEGURIDAD: 
  // Garantizamos que si el backend aún no envía 'products' o 'courses', 
  // el componente no haga crash al intentar hacer un .map() o .length
  const safeData: StorefrontData | undefined = data ? {
    ...data,
    services: data.services || [],
    packages: data.packages || [],
    products: data.products || [], // Si viene undefined, asigna []
    courses: data.courses || [],   // Si viene undefined, asigna []
  } : undefined;

  return {
    store: safeData,
    isLoading,
    isError: error,
  };
}