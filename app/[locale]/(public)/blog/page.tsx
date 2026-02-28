"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Search, Clock, Mail } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useState } from 'react';

export default function BlogPage() {
    const t = useTranslations('Company.Blog');

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const allArticles = [
        { id: 0, tag: "health", readTime: "5" },
        { id: 1, tag: "tech", readTime: "8" },
        { id: 2, tag: "news", readTime: "3" },
    ];

    const categories = ['all', 'health', 'tech', 'news'];

    const filteredArticles = allArticles.filter(article => {
        const matchesCategory = activeCategory === 'all' || article.tag === activeCategory;
        const searchTarget = (t(`placeholder_articles.${article.id}.title`) + " " + t(`placeholder_articles.${article.id}.excerpt`)).toLowerCase();
        const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Header */}
            <div className="py-24 lg:py-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                        {t('subtitle')}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search_placeholder')}
                            className="block w-full pl-12 pr-4 py-4 md:py-5 border-none rounded-2xl text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 shadow-inner focus:ring-2 focus:ring-medical-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                </FadeIn>
            </div>

            {/* Main Content */}
            <div className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Categories Filter */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat
                                        ? 'bg-medical-600 text-white shadow-md shadow-medical-500/20'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-700 hover:text-medical-600 dark:hover:text-medical-400'
                                    }`}
                            >
                                {cat === 'all' ? t('all_categories') : t(`categories.${cat}`)}
                            </button>
                        ))}
                    </div>

                    {/* Articles Grid */}
                    {filteredArticles.length > 0 ? (
                        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                            {filteredArticles.map((article) => (
                                <StaggerItem key={article.id} className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-medical-200 dark:hover:border-medical-800/60 transition-all duration-300 h-full">
                                    <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-medical-500/10 to-transparent group-hover:scale-105 transition-transform duration-500"></div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="inline-block px-3 py-1 bg-medical-50 dark:bg-medical-900/30 text-medical-700 dark:text-medical-300 text-xs font-bold rounded-full uppercase tracking-wider">
                                                {t(`categories.${article.tag}`)}
                                            </span>
                                            <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                <span>{article.readTime} {t('min_read')}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                            {t(`placeholder_articles.${article.id}.title`)}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3">
                                            {t(`placeholder_articles.${article.id}.excerpt`)}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <Link href="#" className="inline-flex items-center font-bold text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 transition-colors">
                                                {t('read_more')}
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400">No se encontraron artículos que coincidan con tu búsqueda.</h3>
                        </div>
                    )}

                    {/* Newsletter Subscription */}
                    <FadeIn className="relative bg-medical-600 dark:bg-medical-900 rounded-3xl p-8 md:p-14 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-teal-400 opacity-20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-2xl mx-auto text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {t('newsletter_title')}
                            </h2>
                            <p className="text-medical-50 dark:text-medical-100/80 text-lg mb-8 leading-relaxed">
                                {t('newsletter_desc')}
                            </p>

                            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={t('newsletter_placeholder')}
                                    className="flex-1 px-6 py-4 rounded-xl border-none focus:ring-4 focus:ring-white/30 text-slate-900 font-medium placeholder-slate-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
                                >
                                    {t('newsletter_button')}
                                </button>
                            </form>
                        </div>
                    </FadeIn>

                </div>
            </div>

        </div>
    );
}
