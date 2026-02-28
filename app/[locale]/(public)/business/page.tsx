import { useTranslations } from 'next-intl';
import { Globe, LayoutTemplate, HandCoins, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BusinessPage() {
    const t = useTranslations('Platform.Business');

    const benefits = [
        { id: "reach", icon: <Globe className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
        { id: "tools", icon: <LayoutTemplate className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
        { id: "payments", icon: <HandCoins className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
    ];

    const stats = ["patients", "consultations"];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="py-24 lg:py-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-full text-sm uppercase tracking-widest mb-6">
                        Para Proveedores Médicos
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 text-balance">
                        {t('subtitle')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
                        {t('hero_desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register?role=provider"
                            className="w-full sm:w-auto px-8 py-4 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-medical-500/25 flex items-center justify-center group"
                        >
                            {t('cta_button')}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="py-16 bg-medical-900 dark:bg-medical-950 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-medical-700/50">
                        {stats.map((stat) => (
                            <div key={stat} className="py-8 md:py-0 flex flex-col items-center justify-center">
                                <div className="text-5xl lg:text-6xl font-extrabold mb-2">{t(`stats.${stat}`)}</div>
                                <div className="text-medical-200 font-semibold uppercase tracking-wider text-sm">{t(`stats.${stat}_label`)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{t('benefits_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {benefits.map((ben) => (
                            <div key={ben.id} className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300">
                                <div className="h-16 w-16 bg-medical-50 dark:bg-medical-900/20 rounded-2xl flex items-center justify-center mb-8">
                                    {ben.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {t(`benefits.${ben.id}`)}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {t(`benefits.${ben.id}_desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
