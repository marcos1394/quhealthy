"use client";

import React, { useState } from 'react';
import { Star, MapPin, Globe, Share, Info, CheckCircle2, ShieldCheck, GraduationCap, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StorefrontData } from '@/types/storefront';
import { ProviderScoreResponse } from '@/types/providerScore';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ImageGalleryViewer } from '@/components/ui/gallery/ImageGalleryViewer';
import { QuScoreModal } from '@/components/store/QuScoreModal';
import { useTranslations } from 'next-intl';

interface StorefrontHeroProps {
  store: StorefrontData;
  scoreData?: ProviderScoreResponse | null;
  isFavorited: boolean;
}

export const StorefrontHero: React.FC<StorefrontHeroProps> = ({ store, scoreData, isFavorited }) => {
  const t = useTranslations('StorePublic');
  const [showQuScoreModal, setShowQuScoreModal] = useState(false);
  const safePrimaryColor = store.primaryColor || '#000000';
  const hasValidColor = store.primaryColor && store.primaryColor !== '#000000' && store.primaryColor !== '#ffffff';

  // Extract gallery images or fallback to banner
  const images = store.galleryImages && store.galleryImages.length > 0 
    ? store.galleryImages.map(img => img.imageUrl)
    : store.bannerUrl ? [store.bannerUrl] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      
      {/* 1. Encabezado de Título y Acciones */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
            {store.displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-black dark:text-white">
              <Star className="w-4 h-4 fill-current" strokeWidth={1} />
              {store.rating || '4.9'} <span className="text-gray-500 underline decoration-gray-300 underline-offset-4">({store.reviewsCount || 'Nuevo'}) reseñas</span>
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            
            {scoreData && (
              <>
                <button 
                  onClick={() => setShowQuScoreModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors underline decoration-transparent hover:decoration-black dark:hover:decoration-white underline-offset-4"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  QUSCORE: {scoreData.score}
                </button>
                <span className="text-gray-300 dark:text-gray-700">•</span>
              </>
            )}

            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="underline decoration-gray-300 underline-offset-4">{store.city || store.address || 'Consultorio'}</span>
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="ghost" className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111] rounded-none">
            <Share className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Compartir
          </Button>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-widest gap-2">
            <FavoriteButton 
              entityType="PROVIDER" 
              entityId={store.providerId} 
              initialIsFavorite={isFavorited} 
              brandColor={safePrimaryColor}
            />
            <span className="hidden sm:inline-block">Guardar</span>
          </div>
        </div>
      </div>

      {/* 2. Galería de Imágenes (Airbnb Style / Brutalist) */}
      <div className="w-full mb-10">
        {images.length >= 5 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[450px]">
            <div className="md:col-span-2 md:row-span-2 relative border border-black dark:border-gray-800 bg-gray-100 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[0]} alt="Foto principal" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative border border-black dark:border-gray-800 bg-gray-100 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[1]} alt="Foto 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative border border-black dark:border-gray-800 bg-gray-100 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[2]} alt="Foto 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative border border-black dark:border-gray-800 bg-gray-100 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[3]} alt="Foto 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative border border-black dark:border-gray-800 bg-gray-100 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[4]} alt="Foto 5" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-4 right-4">
                <Button className="rounded-none border border-black bg-white text-black hover:bg-gray-100 text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
                  Ver todas
                </Button>
              </div>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full h-[300px] md:h-[450px] relative border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-gray-100 dark:bg-[#111] overflow-hidden">
            <img src={images[0]} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-[300px] relative border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sin imágenes disponibles</span>
          </div>
        )}
      </div>

      {/* 3. Perfil del Profesional y Quick Facts */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Columna Izquierda: Detalles */}
        <div className="flex-1 space-y-10">
          
          {/* Header del Anfitrión */}
          <div className="flex items-start justify-between gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black dark:text-white mb-2">
                Atendido por {store.displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {store.tags && store.tags.length > 0 ? store.tags[0] : 'Especialista verificado'}
                </span>
                {store.languages && store.languages.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> {store.languages.join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-16 h-16 shrink-0 border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] overflow-hidden flex items-center justify-center relative">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold uppercase">{store.displayName.charAt(0)}</span>
              )}
              <div className="absolute bottom-0 right-0 bg-green-500 p-0.5 border border-black dark:border-white">
                <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-black dark:text-white" strokeWidth={1.5} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">Verificación Médica</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cédula e identidad validadas por QuHealthy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="w-6 h-6 shrink-0 mt-0.5 text-black dark:text-white" strokeWidth={1.5} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">Disponibilidad Inmediata</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Horarios flexibles presenciales y online.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Star className="w-6 h-6 shrink-0 mt-0.5 text-black dark:text-white" strokeWidth={1.5} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">Alta Experiencia</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Calificación perfecta por más de {store.reviewsCount || 10} pacientes.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Navigation className="w-6 h-6 shrink-0 mt-0.5 text-black dark:text-white" strokeWidth={1.5} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">Ubicación Céntrica</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Instalaciones de primer nivel accesibles.</p>
              </div>
            </div>
          </div>

          {/* Bio and Contact */}
          <div className="pb-8">
            <h3 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white mb-4">Sobre el Especialista</h3>
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
              {store.bio || t('default_bio')}
            </p>
            
            {/* Botones de Contacto */}
            <div className="mt-8 flex flex-wrap gap-4">
              {store.whatsappEnabled && (
                <Button className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors px-6">
                  WHATSAPP
                </Button>
              )}
              {store.instagramUrl && (
                <Button
                  onClick={() => window.open(store.instagramUrl || "", '_blank')}
                  className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors px-6"
                >
                  INSTAGRAM
                </Button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal de QuScore */}
      <QuScoreModal 
        isOpen={showQuScoreModal} 
        onClose={() => setShowQuScoreModal(false)}
        providerId={store.providerId}
      />
    </div>
  );
};
