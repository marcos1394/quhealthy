import React from 'react';
import { ProviderCard } from '@/components/ui/ProviderCard'; // Componente que crearemos a continuación
import { cookies } from 'next/headers'; // 1. Importamos la función 'cookies' de Next.js


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
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const internalApiUrl = `${baseUrl}/api/stores`;
    
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    // --- LOG DE DEPURACIÓN ---
    console.log(`[DiscoverPage] Intentando fetch a: ${internalApiUrl}`);
    console.log(`[DiscoverPage] Enviando cookies al Route Handler: ${cookieHeader || 'Ninguna'}`);
    // --- FIN DEL LOG ---

    const res = await fetch(internalApiUrl, {
      headers: {
        'Cookie': cookieHeader,
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
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