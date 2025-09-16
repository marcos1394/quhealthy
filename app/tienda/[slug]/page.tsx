import React from 'react';
import { notFound } from 'next/navigation';
import { ProviderHero } from '@/components/tienda/ProviderHero';
import { ServiceList } from '@/components/tienda/ServiceList';
import { StaffSection } from '@/components/tienda/StaffSection';
import { ReviewsSection } from '@/components/tienda/ReviewsSection';
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace'; // Usamos el tipo centralizado

// --- INICIO DE LA CORRECCIÓN ---
// 1. Definimos el tipo para las props que Next.js pasa a una página dinámica
type PageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};
// --- FIN DE LA CORRECCIÓN ---

// La función que obtiene los datos se mantiene igual
async function getProviderProfile(slug: string): Promise<ProviderProfileData | null> {
  try {
    const apiUrl = `${process.env.API_URL}/api/marketplace/store/${slug}`;
    const res = await fetch(apiUrl, { next: { revalidate: 300 } });
    
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return null;
  }
}

// 2. Aplicamos el nuevo tipo 'PageProps' a la función de la página
export default async function ProviderPublicPage({ params }: PageProps) {
  const profileData = await getProviderProfile(params.slug);
  
  if (!profileData) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      <div className="relative z-10">
        <ProviderHero profile={profileData} />
        
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8 space-y-16">
                <ServiceList services={profileData.services} />
                <StaffSection staff={profileData.staff} />
                <ReviewsSection reviews={profileData.reviews} />
              </div>
              
              <aside className="lg:col-span-4 mt-16 lg:mt-0">
                <div className="sticky top-24 space-y-8">
                   <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                      <h3 className="text-xl font-bold text-white mb-6">Información Adicional</h3>
                      <div className="space-y-4 text-gray-300">
                        <p>Horarios, mapa y más información próximamente.</p>
                      </div>
                   </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}