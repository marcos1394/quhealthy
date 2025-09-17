/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import axios from 'axios';

import { ProviderHero } from '@/components/tienda/ProviderHero';
import { ServiceList } from '@/components/tienda/ServiceList';
import { StaffSection } from '@/components/tienda/StaffSection';
import { ReviewsSection } from '@/components/tienda/ReviewsSection';
import { AvailabilityCalendar } from '@/components/tienda/AvailabilityCalendar';
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace';
import { Loader2 } from 'lucide-react';

export default function ProviderPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [profileData, setProfileData] = useState<ProviderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  useEffect(() => {
    if (!slug) return;

    const getProviderProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
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
  }, [slug]);

  // Esta función se ejecutará cuando un cliente seleccione un horario
  const handleSlotSelection = (slot: Date) => {
    console.log("Horario seleccionado:", slot);
    setSelectedSlot(slot);
    // En el futuro, aquí abriremos el modal de checkout
    alert(`Has seleccionado el horario: ${slot.toLocaleString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !profileData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 -z-10" />
      
      <div className="relative z-10">
        <ProviderHero profile={profileData} />
        
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              {/* Columna Principal */}
              <div className="lg:col-span-8 space-y-16">
                <ServiceList services={profileData.services} />
                <StaffSection staff={profileData.staff} />
                <ReviewsSection reviews={profileData.reviews} />
              </div>
              
              {/* Sidebar */}
              <aside className="lg:col-span-4 mt-16 lg:mt-0">
                <div className="sticky top-24 space-y-8">
                  {/* --- INICIO DE LA INTEGRACIÓN --- */}
                  <AvailabilityCalendar 
                    providerId={profileData.id} 
                    onSlotSelect={handleSlotSelection}
                  />
                  {/* --- FIN DE LA INTEGRACIÓN --- */}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}