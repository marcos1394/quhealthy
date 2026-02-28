import { useTranslations } from 'next-intl';
import { BookOpen, Video, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';

export default function AcademyPage() {
    const t = useTranslations('Platform.Academy');

    const tracks = [
        { id: "patients", icon: <BookOpen className="h-8 w-8 text-teal-600 dark:text-teal-400" />, color: "teal" },
        { id: "professionals", icon: <Video className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />, color: "indigo" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="pt-24 pb-20 lg:pt-32 lg:pb-24 bg-medical-900 dark:bg-medical-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-medical-800/50 border border-medical-700/50 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-medical-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-medical-100">Now Live</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-medical-200 font-medium max-w-3xl mx-auto">
                        {t('subtitle')}
                    </p>
                </FadeIn>
            </div>

            {/* About */}
            <div className="py-20 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about_title')}</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t('about_desc')}
                    </p>
                </FadeIn>
            </div>

            {/* Tracks */}
            <div className="py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('tracks_title')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        {tracks.map((track) => (
                            <StaggerItem key={track.id} className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-start">
                                <div className={`h-16 w-16 bg-${track.color}-50 dark:bg-${track.color}-900/20 rounded-2xl flex items-center justify-center mb-8`}>
                                    {track.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    {t(`tracks.${track.id}`)}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed flex-grow">
                                    {t(`tracks.${track.id}_desc`)}
                                </p>
                                <Link href="#" className={`inline-flex items-center font-bold text-${track.color}-600 dark:text-${track.color}-400 hover:text-${track.color}-700 dark:hover:text-${track.color}-300 transition-colors group`}>
                                    {t('cta_button')}
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

        </div>
    );
}
