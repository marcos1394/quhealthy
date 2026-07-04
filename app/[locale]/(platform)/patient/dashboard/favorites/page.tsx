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
 className="group flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:[border-color:var(--provider-color)] transition-colors"
 style={{ '--provider-color': provider.color || '#000000' } as React.CSSProperties}
 >
 <div className="h-48 w-full relative bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center group-hover:[border-color:var(--provider-color)] transition-colors">
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
 <div className="absolute bottom-4 left-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-2 py-1 flex items-center gap-1.5 group-hover:[border-color:var(--provider-color)] transition-colors">
 <Star className="w-2.5 h-2.5 text-black dark:text-white fill-black dark:fill-white" />
 <span className="text-[9px] font-bold text-black dark:text-white">{provider.rating || 'N/A'}</span>
 </div>
 </div>
 <div className="p-6 flex flex-col flex-1">
 <h3 className="font-semibold text-lg text-black dark:text-white tracking-tight uppercase mb-1 truncate">
 {provider.name}
 </h3>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-6 truncate">
 {provider.category || 'Especialista'}
 </p>
 <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 group-hover:[border-color:var(--provider-color)] transition-colors">
 <span className="flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 truncate mr-4">
 <MapPin className="w-3 h-3 mr-1.5 shrink-0" strokeWidth={1.5} />
 {provider.city || 'Ubicación Remota'}
 </span>
 <Button 
 variant="outline"
 onClick={() => router.push(`/store/${provider.slug}`)}
 className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-[var(--provider-color)] hover:text-white hover:border-[var(--provider-color)] dark:hover:bg-[var(--provider-color)] dark:hover:text-white dark:hover:border-[var(--provider-color)] text-[9px] font-bold uppercase tracking-widest h-10 px-4 transition-colors shrink-0"
 >
 Ver Perfil <ChevronRight className="w-3 h-3 ml-2" strokeWidth={1.5} />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505]">
 <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center mb-6">
 {getEmptyStateIcon()}
 </div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2 text-center">
 {t('empty_providers_title', { defaultValue: 'Aún no tienes especialistas guardados' })}
 </h3>
 <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
 {t('empty_providers_desc', { defaultValue: 'Explora nuestro directorio y guarda a los médicos que más te gusten para encontrarlos rápidamente.' })}
 </p>
 <Button 
 onClick={() => router.push('/discover')}
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
 >
 <Navigation className="w-4 h-4 mr-3" strokeWidth={1.5} /> {t('btn_explore', { defaultValue: 'Explorar Especialistas' })}
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
 className="group flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:[border-color:var(--provider-color)] transition-colors"
 style={{ '--provider-color': (item as any).providerColor || '#000000' } as React.CSSProperties}
 >
 <div className="h-48 w-full relative bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center shrink-0 group-hover:[border-color:var(--provider-color)] transition-colors">
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
 <h3 className="font-semibold text-lg text-black dark:text-white tracking-tight uppercase mb-2 line-clamp-2">
 {item.name}
 </h3>
 <p className="text-xs text-gray-500 font-light line-clamp-3 mb-6">
 {item.description || 'Sin descripción detallada.'}
 </p>
 <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 group-hover:[border-color:var(--provider-color)] transition-colors">
 <div className="flex flex-col">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Precio</span>
 <span className="text-sm font-semibold text-black dark:text-white tracking-tight">
 ${item.price?.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">MXN</span>
 </span>
 </div>
 <Button 
 variant="outline"
 onClick={() => router.push(`/store/checkout/${item.id}`)}
 className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-[var(--provider-color)] hover:text-white hover:border-[var(--provider-color)] dark:hover:bg-[var(--provider-color)] dark:hover:text-white dark:hover:border-[var(--provider-color)] text-[9px] font-bold uppercase tracking-widest h-10 px-4 transition-colors shrink-0"
 >
 {t('buy_item', { defaultValue: 'Ver Detalles' })} <ChevronRight className="w-3 h-3 ml-2" strokeWidth={1.5} />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505]">
 <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center mb-6">
 {getEmptyStateIcon(activeTab)}
 </div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2 text-center">
 {t('empty_items_title', { defaultValue: 'Aún no hay elementos guardados' })}
 </h3>
 <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
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
 <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
 <Heart className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight uppercase mb-2">
 {t('title', { defaultValue: 'Mis Favoritos' })}
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t('subtitle', { defaultValue: 'Tus especialistas y servicios médicos preferidos a un clic de distancia.' })}
 </p>
 </div>
 </div>
 </div>

 <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 no-scrollbar">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "px-6 h-14 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-r border-gray-200 dark:border-gray-800",
 activeTab === tab.id
 ? "bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-t-2 border-t-black dark:border-t-white"
 : "bg-gray-50 dark:bg-[#050505] text-gray-500 hover:text-black dark:hover:text-white border-t-2 border-t-transparent hover:bg-white dark:hover:bg-[#0a0a0a]"
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