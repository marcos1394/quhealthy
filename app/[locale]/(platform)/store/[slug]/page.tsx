"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, MessageCircle, Instagram, Star, CheckCircle2, 
  ChevronRight, Sparkles, ArrowRight, Loader2, AlertCircle, 
  Video, Building2, Globe, ShieldCheck, Tag as TagIcon,
  ShoppingBag, GraduationCap, Box, PlayCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";
import { useBookingStore } from "@/hooks/useBookingStore";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { QhSpinner } from '@/components/ui/QhSpinner';

type TabType = 'servicios' | 'paquetes' | 'productos' | 'cursos';

export default function PublicStorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const t = useTranslations('StorePublic');

  const [activeTab, setActiveTab] = useState<TabType>('servicios');
  const { cart, addToCart, removeFromCart, clearCart, setProvider, getTotalPrice } = useBookingStore();
  const totalCart = getTotalPrice();

  const { favoriteIds: favoriteProviderIds } = useMyFavorites('PROVIDER');
  const { favoriteIds: favoritePackageIds } = useMyFavorites('PACKAGE');

  const { store, isLoading, isError } = useStorefront(slug);

  // ✅ CORRECCIÓN DEL BUCLE INFINITO: Solo dependemos de valores primitivos
  useEffect(() => {
    if (store && slug) {
      setProvider(
        store.providerId,
        slug,
        store.displayName,
        store.primaryColor || '#9333ea'
      );
    }
  }, [store?.providerId, store?.displayName, store?.primaryColor, slug, setProvider]);

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
        <QhSpinner size="lg" />
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

      {/* --- HERO SECTION COMPLETAMENTE RESTAURADO --- */}
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
                {store.languages && store.languages.length > 0 && (
                  <Badge className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-white/10 backdrop-blur-md px-3 py-1.5 shadow-sm hidden sm:flex">
                    <Globe className="w-4 h-4 mr-1.5 opacity-70" />
                    {store.languages.join(", ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="mt-8 text-slate-600 dark:text-zinc-400 leading-relaxed text-[15px] sm:text-base text-center sm:text-left max-w-2xl">
            {store.bio || t('default_bio')}
          </p>

          {/* 🚀 TAGS RESTAURADOS */}
          {store.tags && store.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2 max-w-2xl">
              {store.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 text-xs px-3 py-1 rounded-full flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1.5 opacity-60" style={{ color: safePrimaryColor }} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 🚀 BOTONES DE CONTACTO RESTAURADOS */}
          <div className="mt-8 flex justify-center sm:justify-start gap-3">
            {store.whatsappEnabled && (
              <Button className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all shadow-sm">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            )}
            {store.instagramUrl && (
              <Button
                onClick={() => window.open(store.instagramUrl || "", '_blank')}
                className="rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/20 border border-pink-200 dark:border-pink-500/20 transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4 mr-2" /> Instagram
              </Button>
            )}
          </div>
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

            <button onClick={() => setActiveTab('productos')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap", activeTab === 'productos' ? "text-white shadow-lg" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200")} style={activeTab === 'productos' ? { backgroundColor: safePrimaryColor } : {}}>
              <ShoppingBag className="w-4 h-4" /> Farmacia <Badge className="bg-black/20 text-white border-none px-1.5 py-0 min-w-0">{store.products?.length || 0}</Badge>
            </button>

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
             {store.services && store.services.length > 0 ? (
               store.services.map((service) => (
                 <div key={service.id} className="group relative bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl p-6 transition-all duration-300 overflow-hidden shadow-sm">
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at right top, ${safePrimaryColor}, transparent 50%)` }} />
                   <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                     <div className="space-y-3 flex-1">
                       <div className="flex flex-wrap items-center gap-2 mb-1">
                         {service.category && <Badge className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">{service.category}</Badge>}
                         {renderModalityBadge(service.modality)}
                         <span className="flex items-center text-xs font-semibold text-slate-400 dark:text-zinc-500 ml-1"><Clock className="w-3.5 h-3.5 mr-1" /> {service.durationMinutes || 0} min</span>
                       </div>
                       <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-zinc-100 transition-colors">{service.name}</h3>
                       <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-md">{service.description}</p>
                       <div className="flex flex-wrap gap-2 pt-2">
                         {service.searchTags && service.searchTags.map((tag, idx) => (
                           <span key={idx} className="flex items-center text-[11px] text-slate-400 dark:text-zinc-500 font-medium"><TagIcon className="w-3 h-3 mr-1 opacity-50" /> {tag}</span>
                         ))}
                         {service.cancellationPolicy === 'flexible' && (
                           <span className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400/80 font-medium ml-2"><ShieldCheck className="w-3 h-3 mr-1" /> {t('cancellation_flexible')}</span>
                         )}
                       </div>
                     </div>
                     <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start mt-4 sm:mt-0 gap-3 border-t border-slate-100 dark:border-white/5 sm:border-t-0 pt-4 sm:pt-0 min-w-[120px]">
                       <div className="flex flex-col items-start sm:items-end">
                         {service.compareAtPrice && service.compareAtPrice > service.price && <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 line-through mb-0.5">${service.compareAtPrice}</span>}
                         <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">${service.price}</span>
                       </div>
                       {(() => {
                         const isInCart = cart.some(c => c.id === service.id && c.type === service.type);
                         return (
                           <Button 
                             onClick={() => isInCart ? removeFromCart(service.id) : handleAddToCart(service)} 
                             variant={isInCart ? "outline" : "default"}
                             className={cn(
                               "rounded-xl px-6 w-full font-bold transition-all transform shadow-sm hover:scale-105",
                               isInCart 
                                 ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" 
                                 : "text-white shadow-lg hover:brightness-110"
                             )} 
                             style={!isInCart ? { backgroundColor: safePrimaryColor, boxShadow: `0 8px 25px -5px rgba(${primaryRgb}, 0.4)` } : {}}
                           >
                             {isInCart ? 'Quitar del carrito' : t('btn_book')} {!isInCart && <ArrowRight className="w-4 h-4 ml-2 opacity-70" />}
                           </Button>
                         );
                       })()}
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-12 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/5 shadow-sm">
                 <p className="text-slate-500 dark:text-zinc-500 font-medium">{t('empty_services')}</p>
               </div>
             )}
           </motion.div>
          )}

          {/* VISTA 2: PAQUETES */}
          {activeTab === 'paquetes' && (
            <motion.div key="paquetes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.packages && store.packages.length > 0 ? (
                store.packages.map((pkg) => (
                  <div key={pkg.id} className="relative bg-gradient-to-br from-white/80 dark:from-white/10 to-slate-50 dark:to-white/5 border border-slate-200 dark:border-white/20 rounded-[2rem] p-1 transition-all shadow-lg overflow-hidden group">
                    <div className="absolute top-5 right-5 z-20">
                      <FavoriteButton entityType="PACKAGE" entityId={pkg.id} initialIsFavorite={favoritePackageIds.has(pkg.id)} className="bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/50 backdrop-blur-md" />
                    </div>
                    <div className="absolute inset-0 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity duration-700 blur-xl" style={{ backgroundColor: safePrimaryColor }} />
                    <div className="relative bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-2xl rounded-[1.8rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-center z-10 border border-slate-100 dark:border-white/5">
                      <div className="space-y-3 w-full sm:w-auto flex-1">
                        <Badge className="bg-amber-50 dark:bg-yellow-500/20 text-amber-700 dark:text-yellow-300 border-amber-200 dark:border-yellow-500/30 font-bold uppercase tracking-widest text-[10px]">{t('badge_special')}</Badge>
                        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">{pkg.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-md">{pkg.description}</p>
                        <ul className="space-y-2 mt-4">
                          <li className="flex items-center text-sm text-slate-600 dark:text-zinc-300 font-medium"><CheckCircle2 className="w-4 h-4 mr-2" style={{ color: safePrimaryColor }} /> {t('includes_services')}</li>
                          <li className="flex items-center text-sm text-slate-600 dark:text-zinc-300 font-medium"><CheckCircle2 className="w-4 h-4 mr-2" style={{ color: safePrimaryColor }} /> {t('preferential_price')}</li>
                        </ul>
                      </div>
                      <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 bg-slate-50 dark:bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-slate-100 dark:border-white/5 sm:border-none">
                        <div className="text-left sm:text-right">
                          {pkg.compareAtPrice && pkg.compareAtPrice > pkg.price && <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 line-through block mb-1">${pkg.compareAtPrice}</span>}
                          <span className="text-3xl font-bold bg-clip-text text-transparent leading-none" style={{ backgroundImage: `linear-gradient(to right, ${safePrimaryColor}, #333)` }}>${pkg.price}</span>
                        </div>
                        {(() => {
                          const isInCart = cart.some(c => c.id === pkg.id && c.type === pkg.type);
                          return (
                            <Button 
                              onClick={() => isInCart ? removeFromCart(pkg.id) : handleAddToCart(pkg)} 
                              variant={isInCart ? "outline" : "default"}
                              className={cn(
                                "rounded-xl px-8 py-6 text-base font-bold transition-transform shadow-xl hover:scale-105 hover:brightness-110",
                                isInCart 
                                  ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-none" 
                                  : "text-white"
                              )} 
                              style={!isInCart ? { backgroundColor: safePrimaryColor, boxShadow: `0 0 30px -5px rgba(${primaryRgb}, 0.5)` } : {}}
                            >
                              {isInCart ? 'Quitar' : t('btn_promo')}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/5 shadow-sm">
                  <p className="text-slate-500 dark:text-zinc-500 font-medium">{t('empty_packages')}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA 3: FARMACIA Y PRODUCTOS */}
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
                          {(() => {
                            const isInCart = cart.some(c => c.id === product.id && c.type === product.type);
                            return (
                              <Button 
                                onClick={() => isInCart ? removeFromCart(product.id) : handleAddToCart(product)} 
                                variant={isInCart ? "outline" : "default"}
                                className={cn(
                                  "rounded-xl shadow-md hover:scale-105 transition-transform",
                                  isInCart 
                                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-none" 
                                    : "text-white"
                                )} 
                                style={!isInCart ? { backgroundColor: safePrimaryColor } : {}}
                              >
                                {isInCart ? 'Quitar' : 'Agregar'}
                              </Button>
                            );
                          })()}
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

          {/* VISTA 4: CURSOS DIGITALES */}
          {activeTab === 'cursos' && (
            <motion.div key="cursos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {store.courses && store.courses.length > 0 ? (
                store.courses.map((course) => (
                  <div key={course.id} className="group flex flex-col sm:flex-row bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
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
                        {(() => {
                          const isInCart = cart.some(c => c.id === course.id && c.type === course.type);
                          return (
                            <Button 
                              onClick={() => isInCart ? removeFromCart(course.id) : handleAddToCart(course)} 
                              variant={isInCart ? "outline" : "default"}
                              className={cn(
                                "rounded-xl w-full sm:w-auto font-bold shadow-lg transition-transform hover:scale-105",
                                isInCart 
                                  ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-none" 
                                  : "text-white"
                              )} 
                              style={!isInCart ? { backgroundColor: safePrimaryColor } : {}}
                            >
                              {isInCart ? 'Quitar' : 'Comprar Acceso'}
                            </Button>
                          );
                        })()}
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

      {/* --- BOTTOM DOCK --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-0 w-full z-50 px-4">
            <div className="max-w-2xl mx-auto bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] shadow-2xl p-3 flex items-center justify-between">
              <div className="flex flex-col pl-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('cart_summary')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{cart.length} Ítems • ${totalCart}</span>
                  <button 
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-rose-500 underline transition-colors ml-2"
                  >
                    Vaciar
                  </button>
                </div>
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