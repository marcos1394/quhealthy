"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { ShieldCheck, Printer, Search } from 'lucide-react';

export default function PrivacyPage() {
    const t = useTranslations('Legal.Privacy');
    const [searchQuery, setSearchQuery] = useState("");

    const allSections = [0, 1, 2];

    const sections = allSections.filter(idx => {
        const title = t(`sections.${idx}.title`).toLowerCase();
        const content = t(`sections.${idx}.content`).toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || content.includes(query);
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('last_updated')}
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                    {/* Sticky Sidebar */}
                    <div className="hidden lg:block sticky top-32 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tabla de Contenidos</h3>

                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en el documento..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:text-white placeholder:text-slate-500"
                                />
                            </div>

                            <nav className="space-y-3">
                                {sections.map(idx => (
                                    <a key={idx} href={`#section-${idx}`} className="block text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                        {t(`sections.${idx}.title`)}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        <button onClick={() => window.print()} className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Printer className="h-4 w-4" />
                            <span>Imprimir / Guardar PDF</span>
                        </button>
                    </div>

                    {/* Main Content */}
                    <StaggerContainer className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">

                        {/* In Plain English Banner */}
                        <div className="mb-10 p-6 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-2xl flex items-start space-x-4">
                            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">En pocas palabras (In Plain English)</h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    Protegemos celosamente tus datos. Recopilamos solo la información necesaria para brindarte el mejor servicio (citas, historial). No vendemos tus datos a terceros y usamos encriptación avanzada según las leyes mexicanas (ARCO).
                                </p>
                            </div>
                        </div>

                        <StaggerItem className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-12">
                            <p>{t('intro')}</p>
                        </StaggerItem>

                        <div className="space-y-16">
                            {sections.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 dark:text-slate-400">No se encontraron resultados para "{searchQuery}"</p>
                                </div>
                            ) : (
                                sections.map((index) => (
                                    <StaggerItem key={index} id={`section-${index}`} className="space-y-6 scroll-mt-32">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {t(`sections.${index}.title`)}
                                        </h2>
                                        <div className="h-1 w-12 bg-teal-500 dark:bg-teal-400 rounded-full"></div>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {t(`sections.${index}.content`)}
                                        </p>
                                    </StaggerItem>
                                ))
                            )}
                        </div>
                    </StaggerContainer>
                </div>
            </div>
        </div>
    );
}
