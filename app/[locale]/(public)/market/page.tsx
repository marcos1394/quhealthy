"use client";

import { useTranslations } from 'next-intl';
import { Pill, Activity, Stethoscope, Sparkles, Truck, ShieldCheck, CreditCard, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useState } from 'react';

export default function MarketPage() {
    const t = useTranslations('Platform.Market');

    const categories = [
        { id: "pharmacy", icon: <Pill className="h-5 w-5 md:h-6 md:w-6" /> },
        { id: "wellness", icon: <Activity className="h-5 w-5 md:h-6 md:w-6" /> },
        { id: "equipment", icon: <Stethoscope className="h-5 w-5 md:h-6 md:w-6" /> },
        { id: "skincare", icon: <Sparkles className="h-5 w-5 md:h-6 md:w-6" /> },
    ];

    const features = [
        { id: "delivery", icon: <Truck className="h-6 w-6" /> },
        { id: "verified", icon: <ShieldCheck className="h-6 w-6" /> },
        { id: "secure", icon: <CreditCard className="h-6 w-6" /> },
    ];

    const products = [
        { id: 0, cat: "wellness" },
        { id: 1, cat: "equipment" },
        { id: 2, cat: "skincare" },
        { id: 3, cat: "wellness" },
        { id: 4, cat: "pharmacy" },
        { id: 5, cat: "equipment" },
    ];

    const [activeFilter, setActiveFilter] = useState('all');

    const filteredProducts = products.filter(p => activeFilter === 'all' || p.cat === activeFilter);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="py-24 pt-32 lg:pt-40 lg:py-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-medical-500/10 dark:bg-medical-500/5 rounded-full blur-3xl"></div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto mb-6">
                        {t('subtitle')}
                    </p>
                    <p className="text-lg text-slate-500 dark:text-slate-500 max-w-3xl mx-auto mb-10">
                        {t('hero_desc')}
                    </p>
                    <button className="px-8 py-4 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-medical-500/25">
                        {t('cta_button')}
                    </button>
                </FadeIn>
            </div>

            {/* Main Shop Section */}
            <div className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">

                    {/* Advanced Filtering Sidebar */}
                    <FadeIn className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-32">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 w-full pb-4 border-b border-slate-200 dark:border-slate-800">
                                {t('categories_title')}
                            </h2>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeFilter === 'all'
                                            ? 'bg-medical-600 text-white shadow-md'
                                            : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Star className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                                    <span className="font-semibold text-lg">{t('filter_all')}</span>
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveFilter(cat.id)}
                                        className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeFilter === cat.id
                                                ? 'bg-medical-600 text-white shadow-md'
                                                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <div className="mr-3">{cat.icon}</div>
                                        <span className="font-semibold text-lg">{t(`categories.${cat.id}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="mb-8 flex justify-between items-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {activeFilter === 'all' ? t('products_title') : t(`categories.${activeFilter}`)}
                            </h2>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Producto' : 'Productos'}
                            </span>
                        </div>

                        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {filteredProducts.map((p) => (
                                <StaggerItem key={p.id} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-700 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                                    {/* Optional Badge */}
                                    {t(`products.${p.id}.badge`) && t(`products.${p.id}.badge`) !== `products.${p.id}.badge` && (
                                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-medical-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                            {t(`products.${p.id}.badge`)}
                                        </div>
                                    )}

                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50 transition-colors">
                                        {/* Mock Product Image using original categories icons */}
                                        <div className="transform group-hover:scale-110 transition-transform duration-500 text-medical-200 dark:text-medical-800/80">
                                            {categories.find(c => c.id === p.cat)?.icon && (
                                                <div style={{ transform: 'scale(4)' }}>
                                                    {categories.find(c => c.id === p.cat)?.icon}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="text-xs font-bold text-medical-600 dark:text-medical-400 uppercase tracking-wider mb-2">
                                            {t(`categories.${p.cat}`)}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                            {t(`products.${p.id}.name`)}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                {t(`products.${p.id}.price`)}
                                            </span>
                                            <button className="h-12 w-12 rounded-full bg-medical-50 dark:bg-medical-900/40 text-medical-600 dark:text-medical-400 flex items-center justify-center hover:bg-medical-600 hover:text-white dark:hover:bg-medical-500 dark:hover:text-white transition-colors group-hover:scale-110">
                                                <ShoppingCart className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>

                </div>
            </div>

            {/* Trust Badges */}
            <div className="py-20 bg-medical-900 dark:bg-medical-950 text-white border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feat) => (
                            <StaggerItem key={feat.id} className="flex gap-6 items-start">
                                <div className="h-16 w-16 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center">
                                    {feat.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">{t(`features.${feat.id}`)}</h4>
                                    <p className="text-medical-200/80 leading-relaxed font-medium">{t(`features.${feat.id}_desc`)}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

        </div>
    );
}
