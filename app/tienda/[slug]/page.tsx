import React from 'react';
import { notFound } from 'next/navigation';
import { ProviderHero } from '@/components/tienda/ProviderHero';
import { ServiceList } from '@/components/tienda/ServiceList';
import { StaffSection } from '@/components/tienda/StaffSection';
import { ReviewsSection } from '@/components/tienda/ReviewsSection';
// Importamos el tipo de dato DETALLADO
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace';

interface ProviderPublicPageProps {
  params: { slug: string };
}

// La función ahora devuelve el tipo de dato DETALLADO
async function getProviderProfile(slug: string): Promise<ProviderProfileData | null> {
  try {
    const apiUrl = `${process.env.API_URL}/api/marketplace/store/${slug}`;
    const res = await fetch(apiUrl, { next: { revalidate: 300 } });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return null;
  }
}

export default async function ProviderPublicPage({ params }: ProviderPublicPageProps) {
  const profileData = await getProviderProfile(params.slug);
  
  if (!profileData) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-black">
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