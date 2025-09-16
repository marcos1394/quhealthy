"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import axios from 'axios';

import { ProviderHero } from '@/components/tienda/ProviderHero';
import { ServiceList } from '@/components/tienda/ServiceList';
import { StaffSection } from '@/components/tienda/StaffSection';
import { ReviewsSection } from '@/components/tienda/ReviewsSection';
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace';
import { Loader2 } from 'lucide-react';

export default function ProviderPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Estados para manejar la carga de datos en el cliente
  const [profileData, setProfileData] = useState<ProviderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay slug, no hacemos nada.
    if (!slug) return;

    const getProviderProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Usamos la ruta relativa que funcionará con nuestro proxy de Vercel
        const apiUrl = `/api/marketplace/store/${slug}`;
        const { data } = await axios.get<ProviderProfileData>(apiUrl);
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching provider profile:", err);
        setError("No se pudo cargar el perfil del proveedor.");
      } finally {
        setIsLoading(false);
      }
    };

    getProviderProfile();
  }, [slug]); // Se ejecuta cada vez que el slug cambie

  // Estado de Carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Estado de Error o si no se encontraron datos
  if (error || !profileData) {
     notFound(); // Redirige a la página 404 de Next.js
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