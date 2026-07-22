"use client"

import React, { useState, Suspense } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { DiscoverProvider } from '@/components/discover/context/DiscoverContext';
import { MarketplaceHeader } from '@/components/discover/MarketplaceHeader';
import { MarketplaceMap } from '@/components/discover/MarketplaceMap';
import { MarketplaceList } from '@/components/discover/MarketplaceList';
import { AuthGateModal } from '@/components/shared/AuthGateModal';
import { Heart } from 'lucide-react';
import { QhSpinner } from '@/components/ui/QhSpinner';

const libraries: ("places" | "geometry")[] = ["places"];

const DiscoverMapContent = () => {
  const [locationDeclined, setLocationDeclined] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateContext, setAuthGateContext] = useState<'favorite' | 'booking'>('favorite');

  const requestLocation = () => {
    // Aquí podemos invocar la lógica manual si es necesario
    // Para simplificar, location ya lo maneja useGeolocation en el contexto
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DiscoverProvider>
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-[#111]">
        
        <MarketplaceHeader 
          locationDeclined={locationDeclined}
          setLocationDeclined={setLocationDeclined}
          showSuccess={showSuccess}
          requestLocation={requestLocation}
        />

        <MarketplaceMap />

        <MarketplaceList 
          setAuthGateContext={setAuthGateContext}
          setAuthGateOpen={setAuthGateOpen}
        />

      </div>

      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        icon={<Heart className="w-6 h-6" strokeWidth={1.5} />}
        title={authGateContext === 'favorite' ? 'GUARDA TUS FAVORITOS' : 'AGENDA TU CITA'}
        description={
          authGateContext === 'favorite'
            ? 'Crea una cuenta para guardar tus doctores favoritos y acceder a ellos cuando quieras.'
            : 'Regístrate para agendar citas con los mejores especialistas de la red.'
        }
      />
    </DiscoverProvider>
  );
};

export default function PublicDiscoverPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    language: 'es'
  });

  if (loadError) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-red-500 font-bold uppercase tracking-widest text-xs p-6 text-center">
        FALLO DE INTEGRACIÓN: API CARTOGRÁFICA INACCESIBLE.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          INICIALIZANDO MOTOR GEOGRÁFICO...
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
          <QhSpinner size="lg" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
            INICIALIZANDO MOTOR GEOGRÁFICO...
          </p>
        </div>
      }
    >
      <DiscoverMapContent />
    </Suspense>
  );
}
