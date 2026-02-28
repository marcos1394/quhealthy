import { useTranslations } from 'next-intl';
import { Briefcase, Globe, HeartPulse, GraduationCap } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';

export default function CareersPage() {
    const t = useTranslations('Company.Careers');

    const benefits = [
        { icon: <Globe className="h-6 w-6" />, idx: 0 },
        { icon: <HeartPulse className="h-6 w-6" />, idx: 1 },
        { icon: <GraduationCap className="h-6 w-6" />, idx: 2 },
        { icon: <Briefcase className="h-6 w-6" />, idx: 3 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="py-24 lg:py-32 bg-medical-900 dark:bg-medical-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-medical-200 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </FadeIn>
            </div>

            {/* Benefits */}
            <div className="py-20 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('why_join')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((b) => (
                            <StaggerItem key={b.idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <div className="h-14 w-14 bg-medical-100 dark:bg-medical-900 text-medical-600 dark:text-medical-400 rounded-full flex items-center justify-center mb-6">
                                    {b.icon}
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                                    {t(`benefits.${b.idx}`)}
                                </h3>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Open Positions Placeholder */}
            <div className="py-24">
                <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">{t('open_positions')}</h2>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                            {t('no_openings')}
                        </p>
                        <a
                            href="mailto:careers@quhealthy.com"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 transition-colors"
                        >
                            {t('apply')}
                        </a>
                    </div>
                </FadeIn>
            </div>

        </div>
    );
}
