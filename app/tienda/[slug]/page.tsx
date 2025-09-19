/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ProviderHero } from '@/components/tienda/ProviderHero';
import { ServiceList } from '@/components/tienda/ServiceList';
import { StaffSection } from '@/components/tienda/StaffSection';
import { ReviewsSection } from '@/components/tienda/ReviewsSection';
import { AvailabilityCalendar } from '@/components/tienda/AvailabilityCalendar';
import { ProviderProfileData, Service } from '@/app/quhealthy/types/marketplace';
import { Loader2, Sparkles } from 'lucide-react';
import { CheckoutModal } from '@/components/tienda/CheckoutModal'; // <-- Importa el modal



export default function ProviderPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [profileData, setProfileData] = useState<ProviderProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);


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
  
// Se llama desde ServiceList cuando se hace clic en "Agendar"
  const handleBookingInitiation = (service: Service) => {
    setSelectedService(service);
    console.log(`Servicio seleccionado: ${service.name}. Ahora el usuario debe elegir un horario.`);
    
    // Hacemos scroll suave hasta el calendario
    document.getElementById('availability-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // Se llama desde AvailabilityCalendar cuando se selecciona un horario
  const handleSlotSelection = (slot: Date) => {
    console.log("Horario seleccionado:", slot);
    if (!selectedService) {
      alert("Por favor, primero selecciona un servicio de la lista.");
      return;
    }
    setSelectedSlot(slot);
    // Aquí es donde abriremos el modal de checkout
    setIsCheckoutOpen(true);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin mx-auto" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Cargando perfil profesional
            </h2>
            <p className="text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Preparando una experiencia increíble para ti
              <Sparkles className="w-4 h-4 animate-pulse" />
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !profileData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      {/* Enhanced background with more sophisticated patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl"></div>
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      <div className="relative z-10">
        <ProviderHero profile={profileData} />
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16">
              {/* Columna Principal */}
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-20"
                >
                   <ServiceList services={profileData.services} onBookClick={handleBookingInitiation} />

                  <StaffSection staff={profileData.staff} />
                  <ReviewsSection reviews={profileData.reviews} />
                </motion.div>
              </div>
              
              {/* Enhanced Sidebar */}
              <aside className="lg:col-span-4 mt-20 lg:mt-0">
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    className="sticky top-24"
    // Le damos un ID al contenedor para el scroll
    id="availability-calendar"
  >
    {/* Mensaje inicial si no se ha seleccionado servicio */}
    {!selectedService && (
      <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Selecciona un servicio</h3>
        <p className="text-gray-400">Elige un servicio de la lista para ver los horarios disponibles.</p>
      </div>
    )}

    {/* El calendario solo se muestra si se ha seleccionado un servicio */}
    <AnimatePresence>
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <AvailabilityCalendar 
            providerId={profileData.id} 
            onSlotSelect={handleSlotSelection}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
</aside>
            </div>
          </div>
        </div>
          <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        service={selectedService}
        providerId={profileData.id}
        selectedSlot={selectedSlot}
      />
        {/* Enhanced footer section */}
        <div className="border-t border-slate-800/50">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Experiencia Premium
                  </h3>
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Disfruta de servicios profesionales de la más alta calidad con {profileData.storeName}. 
                  Tu bienestar es nuestra prioridad y cada detalle está pensado para brindarte una experiencia excepcional.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}