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
import { QuickAvailability } from '@/components/store/QuickAvailability';
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {store.displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" strokeWidth={2} />
              {store.rating || '4.9'} <span className="text-gray-500 font-medium ml-1">({store.reviewsCount || 'Nuevo'}) reseñas</span>
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            
            {scoreData && (
              <>
                <button 
                  onClick={() => setShowQuScoreModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 px-3 py-1 rounded-full hover:bg-teal-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  QuScore: {scoreData.score}
                </button>
                <span className="text-gray-300 dark:text-gray-700">•</span>
              </>
            )}

            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <MapPin className="w-4 h-4" strokeWidth={2} />
              <span>{store.city || store.address || 'Consultorio'}</span>
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
          <Button variant="outline" className="h-10 px-4 text-sm font-semibold rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Share className="w-4 h-4 mr-2" strokeWidth={2} /> Compartir
          </Button>
          <div className="flex items-center text-sm font-semibold text-gray-700 gap-2 h-10 px-4 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
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

      {/* 2. Galería de Imágenes (Soft Health Style) */}
      <div className="w-full mb-12">
        {images.length >= 5 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-sm">
            <div className="md:col-span-2 md:row-span-2 relative bg-gray-50 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[0]} alt="Foto principal" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative bg-gray-50 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[1]} alt="Foto 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative bg-gray-50 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[2]} alt="Foto 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative bg-gray-50 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[3]} alt="Foto 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="hidden md:block relative bg-gray-50 dark:bg-[#111] overflow-hidden group cursor-pointer">
              <img src={images[4]} alt="Foto 5" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-4 right-4">
                <Button className="rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white text-sm font-semibold shadow-sm border-0 px-4 h-10">
                  Ver todas
                </Button>
              </div>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="w-full h-[300px] md:h-[450px] relative rounded-3xl shadow-sm bg-gray-50 dark:bg-[#111] overflow-hidden">
            <img src={images[0]} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-[300px] relative rounded-3xl shadow-sm bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
            <span className="text-gray-400 font-medium text-sm">Sin imágenes disponibles</span>
          </div>
        )}
      </div>

      {/* 3. Perfil del Profesional y Quick Facts */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Columna Izquierda: Detalles */}
        <div className="flex-1 space-y-10">
          
          {/* Header del Anfitrión */}
          <div className="flex items-start justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Atendido por {store.displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  {store.tags && store.tags.length > 0 ? store.tags[0] : 'Especialista verificado'}
                </span>
                {store.languages && store.languages.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                      <Globe className="w-4 h-4" strokeWidth={2} /> {store.languages.join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-16 h-16 shrink-0 rounded-full border border-gray-100 bg-white dark:bg-black shadow-sm overflow-hidden flex items-center justify-center relative">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">{store.displayName.charAt(0)}</span>
              )}
              <div className="absolute bottom-0 right-0 bg-teal-500 p-0.5 rounded-full border-2 border-white">
                <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8 border-b border-gray-100 dark:border-gray-800 mt-8">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Verificación Médica</h4>
                <p className="text-sm font-medium text-gray-500">Cédula e identidad validadas por QuHealthy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="w-6 h-6 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Disponibilidad Inmediata</h4>
                <p className="text-sm font-medium text-gray-500">Horarios flexibles presenciales y online.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Star className="w-6 h-6 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Alta Experiencia</h4>
                <p className="text-sm font-medium text-gray-500">Calificación perfecta por más de {store.reviewsCount || 10} pacientes.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="w-6 h-6 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Ubicación Céntrica</h4>
                <p className="text-sm font-medium text-gray-500">Ubicado en {store.city || "Ciudad Principal"}</p>
              </div>
            </div>
          </div>

          <QuickAvailability providerId={store.providerId} />

          {/* Bio and Contact */}
          <div className="pb-8 pt-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sobre el Especialista</h3>
            <p className="text-[15px] font-normal text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
              {store.bio || t('default_bio')}
            </p>
            
            {/* Botones de Contacto */}
            <div className="mt-8 flex flex-wrap gap-4">
              {store.whatsappEnabled && (
                <Button variant="outline" className="rounded-xl h-11 text-sm font-semibold border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors px-6">
                  Contactar por WhatsApp
                </Button>
              )}
              {store.instagramUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(store.instagramUrl || "", '_blank')}
                  className="rounded-xl h-11 text-sm font-semibold border-gray-200 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 transition-colors px-6"
                >
                  Seguir en Instagram
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
        scoreData={scoreData || null}
      />
    </div>
  );
};
