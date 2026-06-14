"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, MapPin, ChevronRight, Search, Sparkles, Navigation, Package, MonitorPlay, Clock, ShoppingBag, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hooks
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { useDiscover } from '@/hooks/useDiscover';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { catalogService } from '@/services/catalog.service';
import { CatalogItemDTO } from '@/types/catalog';

type TabType = 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'SERVICE' | 'PRODUCT';

export default function PatientFavoritesDashboard() {
    const t = useTranslations('PatientFavoritesDashboard');
    const router = useRouter();
    
    // Pestañas
    const [activeTab, setActiveTab] = useState<TabType>('PROVIDER');

    // 1. Traemos los IDs que le gustan al paciente (dinámico por tab)
    const { favoriteIds } = useMyFavorites(activeTab);

    // 2. Traemos el catálogo público (para providers)
    const { providers, isLoading: isLoadingProviders } = useDiscover();

    // 3. Filtramos providers
    const savedProviders = useMemo(() => {
        if (activeTab !== 'PROVIDER') return [];
        if (!providers) return [];
        return providers.filter(p => favoriteIds.has(p.id));
    }, [providers, favoriteIds, activeTab]);

    // 4. Catálogo para items
    const [savedItems, setSavedItems] = useState<CatalogItemDTO[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    useEffect(() => {
        if (activeTab === 'PROVIDER') {
            setSavedItems([]);
            return;
        }
        
        const fetchItems = async () => {
            if (favoriteIds.size > 0) {
                setIsLoadingItems(true);
                try {
                    const items = await catalogService.getItemsBatch(Array.from(favoriteIds));
                    setSavedItems(items);
                } catch (error) {
                    console.error("Error fetching favorite items:", error);
                } finally {
                    setIsLoadingItems(false);
                }
            } else {
                setSavedItems([]);
            }
        };
        fetchItems();
    }, [favoriteIds, activeTab]);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'PROVIDER', label: t('tab_providers', { defaultValue: 'Especialistas' }) },
        { id: 'PACKAGE', label: t('tab_packages', { defaultValue: 'Paquetes' }) },
        { id: 'COURSE', label: t('tab_courses', { defaultValue: 'Cursos' }) },
        { id: 'SERVICE', label: t('tab_services', { defaultValue: 'Servicios' }) },
        { id: 'PRODUCT', label: t('tab_products', { defaultValue: 'Productos' }) },
    ];

    const getItemPlaceholder = (type: TabType) => {
        switch (type) {
            case 'PACKAGE': return <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />;
            case 'COURSE': return <MonitorPlay className="w-12 h-12 text-slate-300 dark:text-slate-600" />;
            case 'SERVICE': return <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600" />;
            case 'PRODUCT': return <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />;
            default: return <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600" />;
        }
    };

    const getEmptyStateIcon = (type: TabType) => {
        switch (type) {
            case 'PACKAGE': return <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
            case 'COURSE': return <MonitorPlay className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
            case 'SERVICE': return <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
            case 'PRODUCT': return <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
            case 'PROVIDER': return <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
            default: return <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-slate-500/30 pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-2xl shadow-lg shadow-slate-900/20 text-white">
                        <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('title', { defaultValue: 'Mis Guardados' })}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-lg font-light">
                            {t('subtitle', { defaultValue: 'Gestiona tus favoritos' })}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTabFav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Contenido: Doctores Guardados */}
                {activeTab === 'PROVIDER' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                        {savedProviders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedProviders.map((provider) => (
                                    <div key={provider.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                                        
                                        {/* Portada */}
                                        <div className="h-40 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                                            {provider.imageUrl ? (
                                                <img 
                                                    src={provider.imageUrl} 
                                                    alt={provider.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <User className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            
                                            {/* El mismo Corazón reutilizable */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <FavoriteButton 
                                                    entityType="PROVIDER" 
                                                    entityId={provider.id} 
                                                    initialIsFavorite={true}
                                                />
                                            </div>

                                            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-bold text-white">{provider.rating || '4.9'}</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate">
                                                {provider.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                                {provider.category || 'Especialista'}
                                            </p>

                                            <div className="mt-5 flex items-center justify-between">
                                                <span className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {provider.city || 'Consultorio'}
                                                </span>
                                                <Button 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/store/${provider.slug}`)}
                                                    className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                >
                                                    {t('view_profile', { defaultValue: 'Ver perfil' })} <ChevronRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                {getEmptyStateIcon('PROVIDER')}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('empty_providers_title', { defaultValue: 'Sin especialistas favoritos' })}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                                    {t('empty_providers_desc', { defaultValue: 'Explora y guarda a tus especialistas de confianza.' })}
                                </p>
                                <Button 
                                    onClick={() => router.push('/patient/dashboard/discover')}
                                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    <Navigation className="w-4 h-4 mr-2" /> {t('btn_explore', { defaultValue: 'Explorar' })}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Contenido: Items Guardados (Packages, Courses, Services, Products) */}
                {activeTab !== 'PROVIDER' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                        {isLoadingItems ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : savedItems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedItems.map((item) => (
                                    <div key={item.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col">
                                        <div className="h-40 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                            {item.imageUrl ? (
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                getItemPlaceholder(activeTab)
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            
                                            <div className="absolute top-3 right-3 z-10">
                                                <FavoriteButton 
                                                    entityType={activeTab} 
                                                    entityId={item.id!} 
                                                    initialIsFavorite={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                    {item.description || 'Sin descripción'}
                                                </p>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between">
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                    ${item.price?.toLocaleString()} <span className="text-sm font-normal text-slate-400">MXN</span>
                                                </span>
                                                <Button 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/store/checkout/${item.id}`)}
                                                    className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                                                >
                                                    {t('buy_item', { defaultValue: 'Ver detalle' })} <ChevronRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                {getEmptyStateIcon(activeTab)}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('empty_items_title', { defaultValue: 'No hay elementos guardados' })}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                    {t('empty_items_desc', { defaultValue: 'Explora y guarda lo que más te interese para encontrarlo aquí.' })}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
