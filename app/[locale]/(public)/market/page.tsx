import { useTranslations } from 'next-intl';
import { Pill, Activity, Stethoscope, Sparkles, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';

export default function MarketPage() {
    const t = useTranslations('Platform.Market');

    const categories = [
        { id: "pharmacy", icon: <Pill className="h-8 w-8 text-medical-500" /> },
        { id: "wellness", icon: <Activity className="h-8 w-8 text-medical-500" /> },
        { id: "equipment", icon: <Stethoscope className="h-8 w-8 text-medical-500" /> },
        { id: "skincare", icon: <Sparkles className="h-8 w-8 text-medical-500" /> },
    ];

    const features = [
        { id: "delivery", icon: <Truck className="h-6 w-6" /> },
        { id: "verified", icon: <ShieldCheck className="h-6 w-6" /> },
        { id: "secure", icon: <CreditCard className="h-6 w-6" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="py-24 lg:py-32 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-medical-500/10 dark:bg-medical-500/5 rounded-full blur-3xl"></div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto mb-10">
                        {t('subtitle')}
                    </p>
                    <p className="text-lg text-slate-500 dark:text-slate-500 max-w-3xl mx-auto mb-12">
                        {t('hero_desc')}
                    </p>
                    <button className="px-8 py-4 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-medical-500/25">
                        {t('cta_button')}
                    </button>
                </FadeIn>
            </div>

            {/* Categories */}
            <div className="py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('categories_title')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat) => (
                            <StaggerItem key={cat.id} className="group cursor-pointer bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-medical-500 dark:hover:border-medical-500 transition-all duration-300 hover:-translate-y-1">
                                <div className="h-16 w-16 bg-medical-50 dark:bg-medical-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                    {t(`categories.${cat.id}`)}
                                </h3>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Features */}
            <div className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feat) => (
                            <StaggerItem key={feat.id} className="flex flex-col items-center text-center">
                                <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center mb-6">
                                    {feat.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t(`features.${feat.id}`)}</h4>
                                <p className="text-slate-600 dark:text-slate-400">{t(`features.${feat.id}_desc`)}</p>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

        </div>
    );
}
