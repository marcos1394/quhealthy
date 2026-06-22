"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, MessageCircle, Instagram, Star, CheckCircle2, 
  ChevronRight, Sparkles, ArrowRight, Loader2, AlertCircle, 
  Video, Building2, Globe, ShieldCheck, Tag as TagIcon,
  ShoppingBag, GraduationCap, Box, PlayCircle, Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";
import { useBookingStore } from "@/hooks/useBookingStore";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { CheckoutModal } from "@/components/store/CheckoutModal";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { useSessionStore } from "@/stores/SessionStore";
import { useProviderScore } from "@/hooks/useProviderScore";
import { QuScoreModal } from "@/components/store/QuScoreModal";

type TabType = 'servicios' | 'paquetes' | 'productos' | 'cursos';

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const t = useTranslations('StorePublic');

  const [activeTab, setActiveTab] = useState<TabType>('servicios');
  const { cart, addToCart, removeFromCart, clearCart, setProvider, getTotalPrice } = useBookingStore();
  const totalCart = getTotalPrice();
  const { processCheckout, isProcessing } = useBookingCheckout();
  const { user } = useSessionStore();
  const userId = user?.id;
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQuScoreModal, setShowQuScoreModal] = useState(false);
  
  const { singleScore, fetchSingleScore } = useProviderScore();

  const { favoriteIds: favoriteProviderIds } = useMyFavorites('PROVIDER');
  const { favoriteIds: favoritePackageIds } = useMyFavorites('PACKAGE');
  const { favoriteIds: favoriteServiceIds } = useMyFavorites('SERVICE');
  const { favoriteIds: favoriteProductIds } = useMyFavorites('PRODUCT');
  const { favoriteIds: favoriteCourseIds } = useMyFavorites('COURSE');

  const { store, isLoading, isError } = useStorefront(slug);

  useEffect(() => {
    if (store && slug) {
      setProvider(
        store.providerId,
        slug,
        store.displayName,
        store.primaryColor || '#000000'
      );
      fetchSingleScore(store.providerId);
    }
  }, [store?.providerId, store?.displayName, store?.primaryColor, slug, setProvider, fetchSingleScore]);

  const handleAddToCart = (item: StorefrontItem) => {
    addToCart(item, slug);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          EXTRAYENDO EXPEDIENTE COMERCIAL...
        </p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">Directorio Inaccesible</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto mb-8">
          EL CATÁLOGO SOLICITADO NO EXISTE O SE ENCUENTRA TEMPORALMENTE FUERA DE SERVICIO.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()} 
          className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Retornar a Búsqueda
        </Button>
      </div>
    );
  }

  const safePrimaryColor = store.primaryColor || '#000000';
  const hasValidPrimaryColor = store.primaryColor && store.primaryColor !== '#000000' && store.primaryColor !== '#ffffff';

  const renderModalityBadge = (modality?: string) => {
    if (modality === 'ONLINE') return <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Video className="w-3 h-3" strokeWidth={1.5} /> {t('modality_online')}</span>;
    if (modality === 'IN_PERSON') return <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3 h-3" strokeWidth={1.5} /> {t('modality_in_person')}</span>;
    if (modality === 'HYBRID') return <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" strokeWidth={1.5} /> {t('modality_hybrid')}</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-40 font-sans selection:bg-gray-200 dark:selection:bg-white/20 text-black dark:text-white transition-colors duration-300">

      {/* --- HERO SECTION CORREGIDO --- */}
      <div className="w-full border-b border-gray-200 dark:border-gray-800">
        {/* Banner con color natural */}
        <div className="h-48 sm:h-64 w-full relative bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800">
          {store.bannerUrl && (
            <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <FavoriteButton 
              entityType="PROVIDER" 
              entityId={store.providerId} 
              initialIsFavorite={favoriteProviderIds.has(store.providerId)} 
              className="w-10 h-10 sm:w-12 sm:h-12" 
            />
          </div>
        </div>

        {/* Información Base */}
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="flex flex-col sm:flex-row items-start gap-8 pb-10">
            <div className="w-32 h-32 border border-black dark:border-white bg-white dark:bg-black flex-shrink-0 -mt-16 relative z-10 flex items-center justify-center overflow-hidden">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold uppercase">{store.displayName.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 pt-4">
              <h1 className="text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-4">
                {store.displayName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" strokeWidth={1} />
                  {store.rating || '4.9'} ({store.reviewsCount || t('new_label')})
                </span>
                
                {singleScore && (
                  <button 
                    onClick={() => setShowQuScoreModal(true)}
                    className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white text-gray-600 dark:text-gray-400 px-3 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="w-3 h-3" strokeWidth={2} />
                    QUSCORE: {singleScore.score}
                  </button>
                )}

                {/* Etiqueta de ubicación usando el color del backend en el texto/borde */}
                <span 
                  className={cn(
                    "border px-3 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 bg-transparent",
                    !hasValidPrimaryColor && "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                  style={hasValidPrimaryColor ? { borderColor: safePrimaryColor, color: safePrimaryColor } : {}}
                >
                  <MapPin className="w-3 h-3" strokeWidth={1.5} />
                  <span className="truncate max-w-[200px]">{store.city || store.address || 'CONSULTORIO'}</span>
                </span>

                {store.languages && store.languages.length > 0 && (
                  <span className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-[9px] font-bold uppercase tracking-widest hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Globe className="w-3 h-3" strokeWidth={1.5} />
                    {store.languages.join(", ")}
                  </span>
                )}
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-3xl">
                {store.bio || t('default_bio', { defaultValue: 'PERFIL PROFESIONAL NO DETALLADO.' })}
              </p>

              {/* Tags Técnicos */}
              {store.tags && store.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 max-w-3xl">
                  {store.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 flex items-center gap-1.5 border border-gray-200 dark:border-gray-800">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Botones de Contacto */}
              <div className="mt-8 flex gap-4">
                {store.whatsappEnabled && (
                  <Button className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors px-6">
                    <MessageCircle className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> WHATSAPP
                  </Button>
                )}
                {store.instagramUrl && (
                  <Button
                    onClick={() => window.open(store.instagramUrl || "", '_blank')}
                    className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white h-10 text-[9px] font-bold uppercase tracking-widest transition-colors px-6"
                  >
                    <Instagram className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> INSTAGRAM
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVEGACIÓN TABULAR ARQUITECTÓNICA --- */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex w-full overflow-x-auto custom-scrollbar">
            
            <button 
              onClick={() => setActiveTab('servicios')} 
              className={cn(
                "h-14 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center gap-3 whitespace-nowrap",
                activeTab === 'servicios' 
                  ? (!hasValidPrimaryColor ? "border-black text-black dark:border-white dark:text-white" : "") 
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )} 
              style={activeTab === 'servicios' && hasValidPrimaryColor ? { borderBottomColor: safePrimaryColor, color: safePrimaryColor } : {}}
            >
              {t('tab_services', { defaultValue: 'Servicios' })} 
              <span className="border border-current px-1.5 py-0.5 text-[9px]">{store.services?.length || 0}</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('paquetes')} 
              className={cn(
                "h-14 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center gap-3 whitespace-nowrap",
                activeTab === 'paquetes' 
                  ? (!hasValidPrimaryColor ? "border-black text-black dark:border-white dark:text-white" : "") 
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )} 
              style={activeTab === 'paquetes' && hasValidPrimaryColor ? { borderBottomColor: safePrimaryColor, color: safePrimaryColor } : {}}
            >
              {t('tab_packages', { defaultValue: 'Paquetes' })} 
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            </button>

            <button 
              onClick={() => setActiveTab('productos')} 
              className={cn(
                "h-14 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center gap-3 whitespace-nowrap",
                activeTab === 'productos' 
                  ? (!hasValidPrimaryColor ? "border-black text-black dark:border-white dark:text-white" : "") 
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )} 
              style={activeTab === 'productos' && hasValidPrimaryColor ? { borderBottomColor: safePrimaryColor, color: safePrimaryColor } : {}}
            >
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> FARMACIA 
              <span className="border border-current px-1.5 py-0.5 text-[9px]">{store.products?.length || 0}</span>
            </button>

            <button 
              onClick={() => setActiveTab('cursos')} 
              className={cn(
                "h-14 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center gap-3 whitespace-nowrap",
                activeTab === 'cursos' 
                  ? (!hasValidPrimaryColor ? "border-black text-black dark:border-white dark:text-white" : "") 
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )} 
              style={activeTab === 'cursos' && hasValidPrimaryColor ? { borderBottomColor: safePrimaryColor, color: safePrimaryColor } : {}}
            >
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.5} /> CURSOS 
              <span className="border border-current px-1.5 py-0.5 text-[9px]">{store.courses?.length || 0}</span>
            </button>

          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <AnimatePresence mode="wait">

          {/* VISTA 1: SERVICIOS CORREGIDA */}
          {activeTab === 'servicios' && (
            <motion.div key="servicios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.services && store.services.length > 0 ? (
                store.services.map((service) => (
                  <div key={service.id} className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start group">
                    
                    <div className="flex-1 flex flex-col gap-4">
                      {/* Cabecera Interna: Controla etiquetas y botón favoritos en una sola fila */}
                      <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex flex-wrap items-center gap-3">
                          {service.category && (
                            <span 
                              className={cn(
                                "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest bg-transparent",
                                !hasValidPrimaryColor && "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                              )}
                              style={hasValidPrimaryColor ? { borderColor: safePrimaryColor, color: safePrimaryColor } : {}}
                            >
                              {service.category}
                            </span>
                          )}
                          {renderModalityBadge(service.modality)}
                          <span className="flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            <Clock className="w-3 h-3 mr-1.5" strokeWidth={1.5} /> {service.durationMinutes || 0} MIN
                          </span>
                        </div>

                        {/* El botón favoritos ahora vive aquí de forma segura, aislado de los precios inferiores */}
                        <div className="shrink-0">
                          <FavoriteButton 
                            entityType="SERVICE" 
                            entityId={service.id} 
                            initialIsFavorite={favoriteServiceIds.has(service.id)} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-bold text-lg uppercase tracking-wider text-black dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-2xl">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        {service.searchTags && service.searchTags.map((tag, idx) => (
                          <span key={idx} className="flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            <TagIcon className="w-3 h-3 mr-1.5" strokeWidth={1.5} /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Panel Lateral de Precios y Cierre */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-6 border-t border-gray-200 dark:border-gray-800 md:border-t-0 pt-6 md:pt-0 min-w-[160px] self-stretch justify-end">
                      <div className="flex flex-col items-start md:items-end">
                        {service.compareAtPrice && service.compareAtPrice > service.price && (
                          <span className="text-[10px] font-bold text-gray-400 line-through mb-1">${service.compareAtPrice}</span>
                        )}
                        <span className="text-2xl font-semibold tracking-tight text-black dark:text-white leading-none">${service.price}</span>
                      </div>
                      
                      {(() => {
                        const isInCart = cart.some(c => c.id === service.id && c.type === service.type);
                        return (
                          <Button 
                            onClick={() => isInCart ? removeFromCart(service.id) : handleAddToCart(service)} 
                            className={cn(
                              "rounded-none px-6 h-12 w-full text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                              isInCart ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white" : "text-white"
                            )} 
                            style={!isInCart ? { backgroundColor: safePrimaryColor } : {}}
                          >
                            {isInCart ? 'REMOVER' : t('btn_book', { defaultValue: 'AGREGAR' })} {!isInCart && <ArrowRight className="w-4 h-4 ml-2 opacity-70" />}
                          </Button>
                        );
                      })()}
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('empty_services', { defaultValue: 'CATÁLOGO DE SERVICIOS NO DISPONIBLE.' })}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 2: PAQUETES */}
          {activeTab === 'paquetes' && (
            <motion.div key="paquetes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.packages && store.packages.length > 0 ? (
                store.packages.map((pkg) => (
                  <div key={pkg.id} className="relative border border-black dark:border-white bg-white dark:bg-[#0a0a0a] transition-all group p-6 md:p-10 flex flex-col sm:flex-row gap-8 justify-between">
                    
                    <div className="absolute top-6 right-6 z-20">
                      <FavoriteButton 
                        entityType="PACKAGE" 
                        entityId={pkg.id} 
                        initialIsFavorite={favoritePackageIds.has(pkg.id)} 
                      />
                    </div>

                    <div className="space-y-4 w-full sm:w-auto flex-1 pr-10">
                      <span className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                        <Sparkles className="w-3 h-3" strokeWidth={2} /> {t('badge_special', { defaultValue: 'OFERTA ESTRUCTURAL' })}
                      </span>
                      <h3 className="font-bold text-xl uppercase tracking-wider text-black dark:text-white">{pkg.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-2xl">{pkg.description}</p>
                      
                      <ul className="space-y-3 mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <li className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-3" strokeWidth={2} style={{ color: safePrimaryColor }} /> 
                          {t('includes_services', { defaultValue: 'INCLUYE MÚLTIPLES SESIONES' })}
                        </li>
                        <li className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-3" strokeWidth={2} style={{ color: safePrimaryColor }} /> 
                          {t('preferential_price', { defaultValue: 'VALORACIÓN PREFERENCIAL' })}
                        </li>
                      </ul>
                    </div>

                    <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-6 border-t border-gray-200 dark:border-gray-800 sm:border-none pt-6 sm:pt-0 min-w-[180px]">
                      <div className="text-left sm:text-right">
                        {pkg.compareAtPrice && pkg.compareAtPrice > pkg.price && (
                          <span className="text-[10px] font-bold text-gray-400 line-through block mb-1">${pkg.compareAtPrice}</span>
                        )}
                        <span className="text-3xl font-semibold tracking-tight text-black dark:text-white leading-none">${pkg.price}</span>
                      </div>
                      
                      {(() => {
                        const isInCart = cart.some(c => c.id === pkg.id && c.type === pkg.type);
                        return (
                          <Button 
                            onClick={() => isInCart ? removeFromCart(pkg.id) : handleAddToCart(pkg)} 
                            className={cn(
                              "rounded-none px-8 h-14 w-full text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                              isInCart 
                                ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800" 
                                : "text-white"
                            )} 
                            style={!isInCart ? { backgroundColor: safePrimaryColor } : {}}
                          >
                            {isInCart ? 'REMOVER' : t('btn_promo', { defaultValue: 'ADQUIRIR PAQUETE' })}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('empty_packages', { defaultValue: 'NO HAY PAQUETES CONFIGURADOS.' })}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 3: FARMACIA Y PRODUCTOS CORREGIDA */}
          {activeTab === 'productos' && (
            <motion.div key="productos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {store.products && store.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {store.products.map((product) => {
                    const isOutOfStock = product.stockQuantity === 0 && !product.isDigital;
                    const isLowStock = !product.isDigital && product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 5;

                    return (
                      <div key={product.id} className={cn(
                        "bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-800 transition-colors flex flex-col hover:border-black dark:hover:border-white", 
                        isOutOfStock ? "opacity-60" : ""
                      )}>
                        
                        {/* Box Image */}
                        <div className="h-48 border-b border-gray-200 dark:border-gray-800 relative flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-4" />
                          ) : (
                            <Box className="w-10 h-10 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                          )}

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                              <span className="border border-red-500 bg-red-50 text-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                INVENTARIO AGOTADO
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <span 
                              className={cn(
                                "border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-transparent",
                                !hasValidPrimaryColor && "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                              )}
                              style={hasValidPrimaryColor ? { borderColor: safePrimaryColor, color: safePrimaryColor } : {}}
                            >
                              {product.category || 'BIEN FÍSICO'}
                            </span>
                            
                            {/* Botón integrado de forma segura en la esquina superior del bloque de datos */}
                            <div className="shrink-0">
                              <FavoriteButton 
                                entityType="PRODUCT" 
                                entityId={product.id} 
                                initialIsFavorite={favoriteProductIds.has(product.id)} 
                              />
                            </div>
                          </div>

                          {isLowStock && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" strokeWidth={2} /> STOCK ACTUAL: {product.stockQuantity}
                            </span>
                          )}

                          <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white line-clamp-1 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                            {product.description}
                          </p>

                          <div className="flex items-end justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
                            <div className="flex flex-col">
                              {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="text-[10px] font-bold text-gray-400 line-through mb-0.5">${product.compareAtPrice}</span>
                              )}
                              <span className="text-xl font-semibold tracking-tight text-black dark:text-white leading-none">${product.price}</span>
                            </div>

                            {(() => {
                              const isInCart = cart.some(c => c.id === product.id && c.type === product.type);
                              return (
                                <Button
                                  disabled={isOutOfStock}
                                  onClick={() => isInCart ? removeFromCart(product.id) : handleAddToCart(product)}
                                  className={cn(
                                    "rounded-none h-10 px-6 text-[9px] font-bold uppercase tracking-widest border-0 transition-colors",
                                    isInCart
                                      ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                                      : (isOutOfStock ? "bg-gray-100 text-gray-400 dark:bg-[#111] dark:text-gray-600 cursor-not-allowed" : "text-white")
                                  )}
                                  style={!isInCart && !isOutOfStock ? { backgroundColor: safePrimaryColor } : {}}
                                >
                                  {isOutOfStock ? 'AGOTADO' : (isInCart ? 'REMOVER' : 'AGREGAR')}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">INVENTARIO VACÍO</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">EL ESPECIALISTA NO CUENTA CON PRODUCTOS FÍSICOS LISTADOS.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 4: CURSOS DIGITALES */}
          {activeTab === 'cursos' && (
            <motion.div key="cursos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.courses && store.courses.length > 0 ? (
                store.courses.map((course) => (
                  <div key={course.id} className="flex flex-col sm:flex-row border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors group">
                    <div className="w-full sm:w-1/3 h-48 sm:h-auto border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] relative flex items-center justify-center overflow-hidden">
                      {course.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      ) : (
                        <PlayCircle className="w-10 h-10 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                      )}
                      
                      <div className="absolute top-4 right-4 sm:left-4 sm:right-auto z-20">
                        <FavoriteButton 
                          entityType="COURSE" 
                          entityId={course.id} 
                          initialIsFavorite={favoriteCourseIds.has(course.id)} 
                        />
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <span className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit mb-4 text-black dark:text-white">
                          <GraduationCap className="w-3 h-3" strokeWidth={1.5} /> ACTIVO INTANGIBLE
                        </span>
                        <h3 className="font-bold text-lg uppercase tracking-wider text-black dark:text-white mb-2">
                          {course.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-6 max-w-xl">
                          {course.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                        <span className="text-2xl font-semibold tracking-tight text-black dark:text-white leading-none">
                          ${course.price}
                        </span>
                        {(() => {
                          const isInCart = cart.some(c => c.id === course.id && c.type === course.type);
                          return (
                            <Button 
                              onClick={() => isInCart ? removeFromCart(course.id) : handleAddToCart(course)} 
                              className={cn(
                                "rounded-none w-full sm:w-auto h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                                isInCart 
                                  ? "bg-gray-100 text-black dark:bg-[#111] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800" 
                                  : "text-white"
                              )} 
                              style={!isInCart ? { backgroundColor: safePrimaryColor } : {}}
                            >
                              {isInCart ? 'REMOVER DE SELECCIÓN' : 'ADQUIRIR ACCESO DIGITAL'}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                  <GraduationCap className="w-8 h-8 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">SIN RESULTADOS DIGITALES</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">EL ESPECIALISTA NO HA PUBLICADO CONTENIDO FORMATIVO.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM DOCK (PANEL FIJO) --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }} 
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 w-full z-50 border-t border-black dark:border-white bg-white dark:bg-[#0a0a0a]"
          >
            <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    {t('cart_summary', { defaultValue: 'Auditoría de Orden' })}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="font-bold text-lg tracking-tight text-black dark:text-white leading-none">
                      {cart.length} ÍTEMS • ${totalCart}
                    </span>
                    <button 
                      onClick={clearCart}
                      className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 border-b border-transparent hover:border-red-500 transition-colors"
                    >
                      Anular
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  const requiresScheduling = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
                  const hasPhysical = cart.some(i => i.type === 'PRODUCT' && i.isDigital !== true);
                  const needsPrescription = cart.some(i => i.requiresPrescription === true);
                  
                  if (requiresScheduling) {
                    router.push(`/patient/booking/${slug}`);
                  } else if (!hasPhysical && !needsPrescription) {
                    processCheckout({
                      providerId: store!.providerId,
                      consumerId: userId ?? undefined,
                      dependentId: null,
                      selectedDate: null,
                      selectedTime: null,
                      cart,
                      shippingAddress: undefined,
                      prescriptionUrls: undefined,
                    });
                  } else {
                    setShowCheckout(true);
                  }
                }}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-none h-14 px-10 font-bold text-[10px] uppercase tracking-widest transition-colors border-0"
                style={{ backgroundColor: safePrimaryColor, color: '#fff' }}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-3 animate-spin" strokeWidth={2} /> VERIFICANDO...</>
                ) : (
                  <>{t('btn_continue', { defaultValue: 'PROCESAR TRANSACCIÓN' })} <ChevronRight className="w-4 h-4 ml-3" strokeWidth={2} /></>
                )}
              </Button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHECKOUT MODAL ────────────────────────────────────────────── */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        isProcessing={isProcessing}
        themeColor={safePrimaryColor}
        onConfirm={(shippingAddress, prescriptionUrls, pickupTime, destinationState) => {
          setShowCheckout(false);
          processCheckout({
            providerId: store!.providerId,
            consumerId: userId ?? undefined,
            dependentId: null,
            selectedDate: null,
            selectedTime: null,
            cart,
            shippingAddress,
            prescriptionUrls,
            pickupTime,
            destinationState,
          });
        }}
      />

      <QuScoreModal 
        isOpen={showQuScoreModal}
        onClose={() => setShowQuScoreModal(false)}
        scoreData={singleScore}
      />

    </div>
  );
}