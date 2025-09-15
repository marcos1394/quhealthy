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

async function getActiveMarketplaces(): Promise<ProviderData[]> {
  try {
    // --- INICIO DE LA CORRECCIÓN ---
    // Ahora llamamos a nuestra ruta interna. Es una llamada 'same-origin'.
    // Vercel nos da una variable de entorno para la URL base de nuestro propio proyecto.
    const internalApiUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/stores`;
    const res = await fetch(internalApiUrl, {
      next: { revalidate: 60 }
    });
    // --- FIN DE LA CORRECCIÓN ---

    if (!res.ok) {
      throw new Error('La respuesta de la API interna no fue exitosa');
    }

    return res.json();
  } catch (error) {
    console.error("Error al obtener marketplaces desde la Route Handler:", error);
    return [];
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