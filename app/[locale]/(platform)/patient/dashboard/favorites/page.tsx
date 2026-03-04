"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, MapPin, ChevronRight, Search, Sparkles, Navigation } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hooks
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { useDiscover } from '@/hooks/useDiscover';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

export default function PatientFavoritesDashboard() {
    const t = useTranslations('PatientFavoritesDashboard');
    const router = useRouter();
    
    // Pestañas
    const [activeTab, setActiveTab] = useState<'PROVIDERS' | 'PACKAGES'>('PROVIDERS');

    // 1. Traemos los IDs que le gustan al paciente
    const { favoriteIds: favoriteProviderIds } = useMyFavorites('PROVIDER');
    const { favoriteIds: favoritePackageIds } = useMyFavorites('PACKAGE');

    // 2. Traemos el catálogo público (que usualmente ya está en caché)
    const { providers, isLoading } = useDiscover();

    // 3. Filtramos mágicamente (Intersección en memoria)
    const savedProviders = useMemo(() => {
        if (!providers) return [];
        return providers.filter(p => favoriteProviderIds.has(p.id));
    }, [providers, favoriteProviderIds]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-rose-500/30 pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-gradient-to-br from-rose-500 to-rose-400 rounded-2xl shadow-lg shadow-rose-500/20 text-white">
                        <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('title', { defaultValue: 'Mis Guardados' })}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-lg font-light">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button
                        onClick={() => setActiveTab('PROVIDERS')}
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'PROVIDERS' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        {t('tab_providers')}
                        {activeTab === 'PROVIDERS' && (
                            <motion.div layoutId="activeTabFav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('PACKAGES')}
                        className={`pb-4 text-sm font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'PACKAGES' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                        {t('tab_packages')}
                        {activeTab === 'PACKAGES' && (
                            <motion.div layoutId="activeTabFav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400" />
                        )}
                    </button>
                </div>

                {/* Contenido: Doctores Guardados */}
                {activeTab === 'PROVIDERS' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                        {savedProviders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedProviders.map((provider) => (
                                    <div key={provider.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                                        
                                        {/* Portada */}
                                        <div className="h-40 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <img 
                                                src={provider.imageUrl || '/placeholder-banner.jpg'} 
                                                alt={provider.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
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
                                                    onClick={() => router.push(`/provider/store/${provider.slug}`)}
                                                    className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                >
                                                    {t('view_profile')} <ChevronRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('empty_providers_title')}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                                    {t('empty_providers_desc')}
                                </p>
                                <Button 
                                    onClick={() => router.push('/patient/dashboard/discover')}
                                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    <Navigation className="w-4 h-4 mr-2" /> {t('btn_explore')}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Contenido: Paquetes Guardados (Estructura para el futuro próximo) */}
                {activeTab === 'PACKAGES' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                            <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                {t('empty_packages_title')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                {t('empty_packages_desc')}
                            </p>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}