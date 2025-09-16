import React from 'react';
import { ProviderCard } from '@/components/ui/ProviderCard';
import { Compass, Search, Filter } from 'lucide-react';

// --- Tipos de Datos ---
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
    const apiUrl = `${process.env.API_URL}/api/marketplace/stores`;
    
    console.log(`🔹 [DiscoverPage Server] Intentando fetch a: ${apiUrl}`);
    
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'QuHealthy-WebApp/1.0',
      },
      next: { revalidate: 60 }
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
    return [];
  }
}

// --- Componente Principal de la Página ---
export default async function DiscoverPage() {
  const providers = await getActiveMarketplaces();
  
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo con gradientes sutiles */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-32 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30 mb-8">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-sm text-purple-300 font-medium">Descubre profesionales</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Conecta con los
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                mejores expertos
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Encuentra profesionales de salud y belleza verificados cerca de ti.
              <br />
              Tu bienestar está a un clic de distancia.
            </p>
            
            {/* Barra de búsqueda placeholder */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 flex items-center gap-4">
                  <Search className="w-6 h-6 text-purple-400" />
                  <div className="flex-1 text-left">
                    <div className="text-gray-400 text-lg">Buscar por especialidad, nombre o ubicación...</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium">
                      Buscar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Proveedores Section */}
        <div className="container mx-auto px-6 pb-20">
          {providers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Profesionales Destacados
                  </h2>
                  <p className="text-gray-400">
                    {providers.length} profesionales disponibles
                  </p>
                </div>
                <div className="text-purple-400 font-medium hover:text-purple-300 cursor-pointer transition-colors">
                  Ver todos →
                </div>
              </div>
              
              {/* Grid responsive mejorado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {providers.map((provider, index) => (
                  <div
                    key={provider.id}
                    className="transform transition-all duration-500"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-32">
              <div className="relative max-w-lg mx-auto">
                {/* Efectos de fondo para el estado vacío */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-xl" />
                
                <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-12">
                  <div className="relative">
                    <Compass className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-spin-slow" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Estamos creciendo
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">
                      Estamos trabajando para traerte los mejores profesionales.
                      <br />
                      ¡Pronto tendrás acceso a expertos increíbles!
                    </p>
                    
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer">
                      <span>Ser el primero</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}