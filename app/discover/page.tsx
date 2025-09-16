import React from 'react';
import { ProviderCard } from '@/components/ui/ProviderCard'; // Asegúrate que la ruta sea correcta
import { Compass } from 'lucide-react'; // Un ícono para el estado vacío

// --- Tipos de Datos ---
// Definen la estructura de los datos que esperamos del backend.
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

// --- Lógica de Obtención de Datos (se ejecuta en el servidor) ---
async function getActiveMarketplaces(): Promise<ProviderData[]> {
  try {
    // Usamos la variable de entorno del backend directamente.
    // Esta variable debe ser secreta y estar configurada en Vercel como 'API_URL'.
    const apiUrl = `${process.env.API_URL}/api/marketplace/stores`;
    
    // Log detallado para depuración en el servidor de Vercel
    console.log(`🔹 [DiscoverPage Server] Intentando fetch a: ${apiUrl}`);

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'QuHealthy-WebApp/1.0', // Buena práctica para llamadas S2S
      },
      next: { revalidate: 60 } // Estrategia de caché: revalidar cada 60 segundos
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [DiscoverPage Server] La respuesta del backend no fue exitosa: ${res.status} - ${errorText}`);
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ [DiscoverPage Server] Se obtuvieron ${data.length} proveedores.`);
    return data;
    
  } catch (error) {
    console.error("❌ [DiscoverPage Server] Error crítico al obtener marketplaces:", error);
    return []; // Devolvemos un array vacío en caso de cualquier error
  }
}


// --- Componente Principal de la Página ---
export default async function DiscoverPage() {
  // Esta llamada se hace en el servidor antes de que la página se envíe al navegador.
  const providers = await getActiveMarketplaces();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-20 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            Explora Nuestros Profesionales
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Encuentra y conecta con los mejores expertos en salud y belleza.
          </p>
          {/* (Aquí irá tu barra de búsqueda en el futuro) */}
        </div>

        {/* Grid de Proveedores */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16 flex flex-col items-center">
            <Compass className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400">Aún no hay proveedores disponibles</h3>
            <p className="max-w-md mt-2">Estamos trabajando para expandir nuestra red. Vuelve a intentarlo más tarde o sé el primero en unirte a nuestra plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}