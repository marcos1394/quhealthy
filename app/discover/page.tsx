import React from 'react';
import { ProviderCard } from '@/components/ui/ProviderCard'; // Componente que crearemos a continuación

// Interfaz para definir la forma de los datos del proveedor
interface Tag {
  name: string;
}
interface Marketplace {
  storeName: string;
  storeSlug: string;
  storeBannerUrl: string | null;
  customDescription: string | null;
}
interface ProviderData {
  id: number;
  name: string;
  marketplace: Marketplace;
  tags: Tag[];
}

// Función para obtener los datos desde nuestro backend
async function getActiveMarketplaces(): Promise<ProviderData[]> {
  try {
    // Usamos 'fetch' porque este es un Server Component. 
    // Next.js automáticamente maneja el cacheo y la optimización.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/stores`, {
      next: { revalidate: 60 } // Revalidar los datos cada 60 segundos
    });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching marketplaces:", error);
    return []; // Devolver un array vacío en caso de error
  }
}


export default async function DiscoverPage() {
  const providers = await getActiveMarketplaces();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explora Profesionales</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Encuentra y conecta con los mejores expertos en salud y belleza cerca de ti.
          </p>
          {/* (Aquí irá tu barra de búsqueda en el futuro) */}
        </div>

        {/* Grid de Proveedores */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <p>No hay proveedores disponibles en este momento. Vuelve a intentarlo más tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
}