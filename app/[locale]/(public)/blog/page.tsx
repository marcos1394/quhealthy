import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
    const t = useTranslations('Company.Blog');

    const articles = [0, 1, 2];
    const tags = ["health", "tech", "news"];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Header */}
            <div className="py-24 lg:py-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Featured Articles */}
            <div className="py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('featured')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((idx) => (
                            <article key={idx} className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
                                <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-medical-500/20 to-transparent group-hover:scale-105 transition-transform duration-500"></div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-medical-100 dark:bg-medical-900/30 text-medical-700 dark:text-medical-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                                            {t(`categories.${tags[idx]}`)}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                        {t(`placeholder_articles.${idx}.title`)}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 line-clamp-3">
                                        {t(`placeholder_articles.${idx}.excerpt`)}
                                    </p>

                                    <div className="mt-auto">
                                        <Link href="#" className="inline-flex items-center font-semibold text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 transition-colors">
                                            {t('read_more')}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
