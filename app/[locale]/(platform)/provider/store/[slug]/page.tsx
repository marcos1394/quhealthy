"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, MessageCircle, Instagram, Star, CheckCircle2, 
  ChevronRight, Sparkles, ArrowRight, Loader2, AlertCircle, 
  Video, Building2, Globe, ShieldCheck, Tag as TagIcon,
  ShoppingBag, GraduationCap, Box, PlayCircle // 🚀 NUEVOS ICONOS
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";
import { useBookingStore } from "@/hooks/useBookingStore";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useMyFavorites } from "@/hooks/useMyFavorites";

// 🚀 Ampliamos los tipos de las pestañas
type TabType = 'servicios' | 'paquetes' | 'productos' | 'cursos';

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const t = useTranslations('StorePublic');

  const [activeTab, setActiveTab] = useState<TabType>('servicios');
  const { cart, addToCart, setProvider, getTotalPrice } = useBookingStore();
  const totalCart = getTotalPrice();

  const { favoriteIds: favoriteProviderIds } = useMyFavorites('PROVIDER');
  const { favoriteIds: favoritePackageIds } = useMyFavorites('PACKAGE');

  const { store, isLoading, isError } = useStorefront(slug);

  useEffect(() => {
    if (store && slug) {
      setProvider(
        store.providerId,
        slug,
        store.displayName,
        store.primaryColor || '#9333ea'
      );
    }
  }, [store, slug, setProvider]);

  const handleAddToCart = (item: StorefrontItem) => {
    addToCart(item, slug);
  };

  const hexToRgb = (hex: string) => {
    if (!hex) return '147, 51, 234';
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) || 147;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 51;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 234;
    return `${r}, ${g}, ${b}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-medical-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-zinc-400 font-medium animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-4 bg-rose-100 dark:bg-red-500/10 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-rose-500 dark:text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('error_title')}</h1>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md">{t('error_desc')}</p>
        <Button variant="outline" onClick={() => window.history.back()} className="mt-8 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5">
          {t('error_back')}
        </Button>
      </div>
    );
  }

  const safePrimaryColor = store.primaryColor || '#9333ea';
  const primaryRgb = hexToRgb(safePrimaryColor);

  const renderModalityBadge = (modality?: string) => {
    if (modality === 'ONLINE') return <Badge className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1"><Video className="w-3 h-3" /> {t('modality_online')}</Badge>;
    if (modality === 'IN_PERSON') return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1"><Building2 className="w-3 h-3" /> {t('modality_in_person')}</Badge>;
    if (modality === 'HYBRID') return <Badge className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider flex items-center gap-1"><Globe className="w-3 h-3" /> {t('modality_hybrid')}</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pb-32 font-sans selection:bg-purple-500/30 text-slate-900 dark:text-white">

      {/* --- HERO SECTION (Idéntico a tu versión original) --- */}
      <div className="relative pb-8">
        <div className="h-64 sm:h-80 w-full relative overflow-hidden">
          {store.bannerUrl ? (
            <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-80 dark:opacity-60" />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#09090b] dark:via-[#09090b]/80 dark:to-transparent" />
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <FavoriteButton entityType="PROVIDER" entityId={store.providerId} initialIsFavorite={favoriteProviderIds.has(store.providerId)} className="w-10 h-10 sm:w-12 sm:h-12 bg-black/20 hover:bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 dark:opacity-50 animate-pulse" style={{ backgroundColor: safePrimaryColor }} />
              <div className="relative w-36 h-36 rounded-full border-4 border-slate-50 dark:border-[#09090b] shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 flex-shrink-0">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300 dark:text-white/50">{store.displayName.charAt(0)}</div>
                )}
              </div>
            </div>

            <div className="flex-1 pb-2 space-y-3">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{store.displayName}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm font-medium">
                <Badge className="bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border-slate-200 dark:border-none backdrop-blur-md px-3 py-1.5 shadow-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                  {store.rating || '4.9'} ({store.reviewsCount || t('new_label')})
                </Badge>
                <Badge className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-white/10 backdrop-blur-md px-3 py-1.5 shadow-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                  <span className="truncate max-w-[200px]">{store.city || store.address || 'Consultorio'}</span>
                </Badge>
              </div>
            </div>
          </div>

          <p className="mt-8 text-slate-600 dark:text-zinc-400 leading-relaxed text-[15px] sm:text-base text-center sm:text-left max-w-2xl">
            {store.bio || t('default_bio')}
          </p>
        </div>
      </div>

      {/* --- MENÚ TIPO PÍLDORA (Scrollable) --- */}
      <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 pt-4 pb-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-full overflow-x-auto scrollbar-hide">
            
            <button onClick={() => setActiveTab('servicios')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap", activeTab === 'servicios' ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200")} style={activeTab === 'servicios' ? { backgroundColor: safePrimaryColor } : {}}>
              {t('tab_services', { defaultValue: 'Servicios' })} <Badge className="bg-black/20 text-white border-none px-1.5 py-0 min-w-0">{store.services?.length || 0}</Badge>
            </button>
            
            <button onClick={() => setActiveTab('paquetes')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap", activeTab === 'paquetes' ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200")} style={activeTab === 'paquetes' ? { backgroundColor: safePrimaryColor } : {}}>
              {t('tab_packages', { defaultValue: 'Paquetes' })} <Sparkles className={cn("w-4 h-4", activeTab === 'paquetes' ? "text-yellow-300" : "")} />
            </button>

            {/* 🚀 NUEVA PESTAÑA: FARMACIA */}
            <button onClick={() => setActiveTab('productos')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap", activeTab === 'productos' ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200")} style={activeTab === 'productos' ? { backgroundColor: safePrimaryColor } : {}}>
              <ShoppingBag className="w-4 h-4" /> Farmacia <Badge className="bg-black/20 text-white border-none px-1.5 py-0 min-w-0">{store.products?.length || 0}</Badge>
            </button>

            {/* 🚀 NUEVA PESTAÑA: CURSOS */}
            <button onClick={() => setActiveTab('cursos')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap", activeTab === 'cursos' ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200")} style={activeTab === 'cursos' ? { backgroundColor: safePrimaryColor } : {}}>
              <GraduationCap className="w-4 h-4" /> Cursos <Badge className="bg-black/20 text-white border-none px-1.5 py-0 min-w-0">{store.courses?.length || 0}</Badge>
            </button>

          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">

          {/* VISTA 1: SERVICIOS */}
          {activeTab === 'servicios' && (
             <motion.div key="servicios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
             {/* Código de Servicios que ya tenías */}
             {store.services && store.services.length > 0 ? (
               store.services.map((service) => (
                 <div key={service.id} className="group relative bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 shadow-sm">
                   <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                     <div className="space-y-3 flex-1">
                       <h3 className="font-bold text-xl text-slate-900 dark:text-white">{service.name}</h3>
                       <p className="text-sm text-slate-500 dark:text-zinc-400">{service.description}</p>
                     </div>
                     <div className="flex sm:flex-col items-center sm:items-end gap-3 min-w-[120px]">
                       <span className="text-2xl font-bold text-slate-900 dark:text-white">${service.price}</span>
                       <Button onClick={() => handleAddToCart(service)} className="w-full text-white font-bold" style={{ backgroundColor: safePrimaryColor }}>
                         Agendar
                       </Button>
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <p className="text-center text-slate-500">No hay servicios disponibles.</p>
             )}
           </motion.div>
          )}

          {/* VISTA 2: PAQUETES */}
          {activeTab === 'paquetes' && (
            <motion.div key="paquetes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Código de Paquetes que ya tenías */}
              {store.packages && store.packages.length > 0 ? (
                store.packages.map((pkg) => (
                  <div key={pkg.id} className="relative bg-gradient-to-br from-white/80 dark:from-white/10 to-slate-50 dark:to-white/5 border border-slate-200 dark:border-white/20 rounded-[2rem] p-6 shadow-lg">
                    <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">{pkg.description}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">${pkg.price}</span>
                      <Button onClick={() => handleAddToCart(pkg)} className="text-white font-bold" style={{ backgroundColor: safePrimaryColor }}>Comprar Promo</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">No hay paquetes disponibles.</p>
              )}
            </motion.div>
          )}

          {/* 🚀 VISTA 3: FARMACIA Y PRODUCTOS */}
          {activeTab === 'productos' && (
            <motion.div key="productos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {store.products && store.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {store.products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                      <div className="h-48 bg-slate-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Box className="w-12 h-12 text-slate-300 dark:text-zinc-600" />
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge className="w-fit bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border-none mb-2 text-[10px] uppercase">{product.category || 'Producto'}</Badge>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 mb-1">{product.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">${product.price}</span>
                          <Button onClick={() => handleAddToCart(product)} className="rounded-xl text-white shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: safePrimaryColor }}>
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-slate-200 dark:border-white/5 rounded-3xl bg-white dark:bg-white/5 shadow-sm">
                  <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Farmacia Vacía</h3>
                  <p className="text-slate-500 dark:text-zinc-400">El especialista aún no ha subido productos físicos.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 🚀 VISTA 4: CURSOS DIGITALES */}
          {activeTab === 'cursos' && (
            <motion.div key="cursos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.courses && store.courses.length > 0 ? (
                store.courses.map((course) => (
                  <div key={course.id} className="group flex flex-col sm:flex-row bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                    {/* Imagen del Curso (Más ancha en desktop) */}
                    <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-slate-100 dark:bg-zinc-800 relative overflow-hidden">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><PlayCircle className="w-12 h-12 text-slate-300 dark:text-zinc-600" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-none mb-2 text-[10px] uppercase tracking-wider">
                          <GraduationCap className="w-3 h-3 mr-1" /> Contenido Digital
                        </Badge>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">{course.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">{course.description}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto border-t border-slate-100 dark:border-white/5 pt-4">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">${course.price}</span>
                        <Button onClick={() => handleAddToCart(course)} className="rounded-xl w-full sm:w-auto font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: safePrimaryColor }}>
                          Comprar Acceso
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-slate-200 dark:border-white/5 rounded-3xl bg-white dark:bg-white/5 shadow-sm">
                  <GraduationCap className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sin Cursos Disponibles</h3>
                  <p className="text-slate-500 dark:text-zinc-400">El especialista aún no ha publicado contenido digital.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM DOCK (Carrito Flotante - Sin cambios) --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-0 w-full z-50 px-4">
            <div className="max-w-2xl mx-auto bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] shadow-2xl p-3 flex items-center justify-between">
              <div className="flex flex-col pl-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cart_summary')}</span>
                <span className="font-bold text-lg">{cart.length} Ítems • ${totalCart}</span>
              </div>
              <Button onClick={() => router.push(`/patient/booking/${slug}`)} className="rounded-full px-8 py-6 font-bold text-base shadow-xl hover:scale-105" style={{ backgroundColor: safePrimaryColor, color: '#fff' }}>
                {t('btn_continue')} <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}