"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, MapPin, ChevronRight, Search, Sparkles, Navigation, Package, MonitorPlay, Clock, ShoppingBag, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Hooks
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { useDiscover } from '@/hooks/useDiscover';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { catalogService } from '@/services/catalog.service';
import { CatalogItemDTO } from '@/types/catalog';

type TabType = 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'SERVICE' | 'PRODUCT';

const SafeImage = ({ src, alt, fallback }: { src: string, alt: string, fallback: React.ReactNode }) => {
 const [error, setError] = useState(false);
 if (!src || error) {
 return <>{fallback}</>;
 }
 return (
 <img 
 src={src} 
 alt={alt} 
 className="w-full h-full object-cover transition-all duration-700"
 onError={() => setError(true)}
 />
 );
};

// --- COMPONENTES AISLADOS PARA TRANSICIONES PERFECTAS ---

function ProviderTabContent({ t, router }: { t: any, router: any }) {
 const { favoriteIds } = useMyFavorites('PROVIDER');
 const { providers, isLoading: isLoadingProviders } = useDiscover();

 const savedProviders = useMemo(() => {
 if (!providers) return [];
 return providers.filter(p => favoriteIds.has(p.id));
 }, [providers, favoriteIds]);

 const getEmptyStateIcon = () => <Search className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
 {savedProviders.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {savedProviders.map((provider) => (
  <div 
  key={provider.id} 
  className="group flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 transition-all rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 p-2"
  >
  <div className="h-48 w-full relative bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden flex items-center justify-center rounded-2xl">
  <SafeImage 
  src={provider.imageUrl || ''} 
  alt={provider.name} 
  fallback={<User className="w-8 h-8 text-gray-400" strokeWidth={1.5} />}
  />
  <div className="absolute top-4 right-4 z-10">
  <FavoriteButton 
  entityType="PROVIDER" 
  entityId={provider.id} 
  initialIsFavorite={true}
  />
  </div>
  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 px-3 py-1.5 flex items-center gap-1.5 rounded-full shadow-sm">
  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
  <span className="text-xs font-bold text-gray-900 dark:text-white">{provider.rating || 'N/A'}</span>
  </div>
  </div>
  <div className="p-6 flex flex-col flex-1">
  <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight mb-1 truncate">
  {provider.name}
  </h3>
  <p className="text-sm font-medium text-gray-500 mb-6 truncate">
  {provider.category || 'Especialista'}
  </p>
  <div className="mt-auto flex items-center justify-between pt-6">
  <span className="flex items-center text-sm font-medium text-gray-500 truncate mr-4">
  <MapPin className="w-4 h-4 mr-1.5 shrink-0" strokeWidth={2} />
  {provider.city || 'Ubicación Remota'}
  </span>
  <Button 
  variant="outline"
  onClick={() => router.push(`/store/${provider.slug}`)}
  className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-quhealthy-green hover:text-quhealthy-green dark:hover:border-quhealthy-green dark:hover:text-quhealthy-green text-xs font-bold h-10 px-4 transition-all shadow-sm shrink-0"
  >
  Ver Perfil <ChevronRight className="w-4 h-4 ml-2" strokeWidth={2} />
  </Button>
  </div>
  </div>
 </div>
 ))}
 </div>
 ) : (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 rounded-3xl">
  <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-6">
  {getEmptyStateIcon()}
  </div>
  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-center">
  {t('empty_providers_title', { defaultValue: 'Aún no tienes especialistas guardados' })}
  </h3>
  <p className="text-sm text-gray-500 font-medium mb-8 max-w-sm text-center leading-relaxed">
  {t('empty_providers_desc', { defaultValue: 'Explora nuestro directorio y guarda a los médicos que más te gusten para encontrarlos rápidamente.' })}
  </p>
  <Button 
  onClick={() => router.push('/discover')}
  className="rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white h-12 px-8 text-sm font-bold transition-all shadow-sm border-0"
  >
  <Navigation className="w-4 h-4 mr-3" strokeWidth={2} /> {t('btn_explore', { defaultValue: 'Explorar Especialistas' })}
  </Button>
 </div>
 )}
 </motion.div>
 );
}

function ItemsTabContent({ activeTab, t, router }: { activeTab: TabType, t: any, router: any }) {
 const { favoriteIds } = useMyFavorites(activeTab);
 const [savedItems, setSavedItems] = useState<CatalogItemDTO[]>([]);
 const [isLoadingItems, setIsLoadingItems] = useState(false);

 useEffect(() => {
 let isMounted = true;
 const fetchItems = async () => {
 if (favoriteIds.size > 0) {
 setIsLoadingItems(true);
 try {
 const items = await catalogService.getItemsBatch(Array.from(favoriteIds));
 if (isMounted) setSavedItems(items);
 } catch (error) {
 console.error("Error fetching favorite items:", error);
 } finally {
 if (isMounted) setIsLoadingItems(false);
 }
 } else {
 if (isMounted) setSavedItems([]);
 }
 };
 fetchItems();
 return () => { isMounted = false; };
 }, [favoriteIds]);

 const getItemPlaceholder = (type: TabType) => {
 switch (type) {
 case 'PACKAGE': return <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
 case 'COURSE': return <MonitorPlay className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
 case 'SERVICE': return <Clock className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
 case 'PRODUCT': return <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
 default: return <Sparkles className="w-8 h-8 text-gray-400" strokeWidth={1.5} />;
 }
 };

 const getEmptyStateIcon = (type: TabType) => {
 switch (type) {
 case 'PACKAGE': return <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;
 case 'COURSE': return <MonitorPlay className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;
 case 'SERVICE': return <Clock className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;
 case 'PRODUCT': return <ShoppingBag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;
 default: return <Search className="w-6 h-6 text-gray-400" strokeWidth={1.5} />;
 }
 };

 return (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
 {isLoadingItems ? (
 <div className="flex justify-center items-center py-32">
 <Loader2 className="w-8 h-8 animate-spin text-gray-400" strokeWidth={1.5} />
 </div>
 ) : savedItems.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {savedItems.map((item) => (
  <div 
  key={item.id} 
  className="group flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-quhealthy-green/30 dark:hover:border-quhealthy-green/30 transition-all rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 p-2"
  >
  <div className="h-48 w-full relative bg-gray-50/50 dark:bg-gray-900/10 overflow-hidden flex items-center justify-center shrink-0 rounded-2xl">
 <SafeImage 
 src={item.imageUrl || ''} 
 alt={item.name} 
 fallback={getItemPlaceholder(activeTab)}
 />
 <div className="absolute top-4 right-4 z-10">
 <FavoriteButton 
 entityType={activeTab} 
 entityId={item.id!} 
 initialIsFavorite={true}
 />
 </div>
 </div>
  <div className="p-6 flex flex-col flex-1">
  <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight mb-2 line-clamp-2">
  {item.name}
  </h3>
  <p className="text-sm text-gray-500 font-medium line-clamp-3 mb-6">
  {item.description || 'Sin descripción detallada.'}
  </p>
  <div className="mt-auto flex items-center justify-between pt-6">
  <div className="flex flex-col">
  <span className="text-xs font-bold text-gray-500 mb-0.5">Precio</span>
  <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
  ${item.price?.toLocaleString()} <span className="text-xs font-medium text-gray-500">MXN</span>
  </span>
  </div>
  <Button 
  variant="outline"
  onClick={() => router.push(`/store/checkout/${item.id}`)}
  className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-quhealthy-green hover:text-quhealthy-green dark:hover:border-quhealthy-green dark:hover:text-quhealthy-green text-xs font-bold h-10 px-4 transition-all shadow-sm shrink-0"
  >
  {t('buy_item', { defaultValue: 'Ver Detalles' })} <ChevronRight className="w-4 h-4 ml-2" strokeWidth={2} />
  </Button>
  </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 rounded-3xl">
  <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-6">
  {getEmptyStateIcon(activeTab)}
  </div>
  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-center">
  {t('empty_items_title', { defaultValue: 'Aún no hay elementos guardados' })}
  </h3>
  <p className="text-sm text-gray-500 font-medium mb-8 max-w-sm text-center leading-relaxed">
  {t('empty_items_desc', { defaultValue: 'Marque como favoritos los elementos del catálogo para almacenarlos en este directorio.' })}
  </p>
 </div>
 )}
 </motion.div>
 );
}

export default function PatientFavoritesDashboard() {
 const t = useTranslations('PatientFavoritesDashboard');
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<TabType>('PROVIDER');

 const tabs: { id: TabType; label: string }[] = [
 { id: 'PROVIDER', label: t('tab_providers', { defaultValue: 'Especialistas' }) },
 { id: 'PACKAGE', label: t('tab_packages', { defaultValue: 'Paquetes' }) },
 { id: 'COURSE', label: t('tab_courses', { defaultValue: 'Cursos' }) },
 { id: 'SERVICE', label: t('tab_services', { defaultValue: 'Servicios' }) },
 { id: 'PRODUCT', label: t('tab_products', { defaultValue: 'Productos' }) },
 ];

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-24">
 <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12">
  <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
  <div className="flex items-center gap-6">
  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-900/20 shadow-sm flex items-center justify-center shrink-0">
  <Heart className="w-8 h-8 fill-rose-500 text-rose-500" strokeWidth={1.5} />
  </div>
  <div>
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
  {t('title', { defaultValue: 'Mis Favoritos' })}
  </h1>
  <p className="text-sm font-medium text-gray-500">
  {t('subtitle', { defaultValue: 'Tus especialistas y servicios médicos preferidos a un clic de distancia.' })}
  </p>
  </div>
  </div>
  </div>

  <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800 gap-4 no-scrollbar">
  {tabs.map(tab => (
  <button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className={cn(
  "px-6 h-12 text-sm font-bold transition-all whitespace-nowrap border-b-2 rounded-t-xl",
  activeTab === tab.id
  ? "text-quhealthy-green border-quhealthy-green bg-quhealthy-green/5 dark:bg-quhealthy-green/10"
  : "text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-50 dark:hover:bg-gray-900"
  )}
  >
 {tab.label}
 </button>
 ))}
 </div>

 <AnimatePresence mode="wait">
 {activeTab === 'PROVIDER' ? (
 <ProviderTabContent key="provider-tab" t={t} router={router} />
 ) : (
 <ItemsTabContent key={`item-tab-${activeTab}`} activeTab={activeTab} t={t} router={router} />
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}