import { useTranslations } from 'next-intl';
import { Target, Eye, Shield, Heart } from 'lucide-react';

export default function AboutPage() {
    const t = useTranslations('Company.About');

    const values = [
        {
            id: "innovation",
            icon: <Target className="h-6 w-6 text-medical-500" />,
            title: t('values.innovation'),
            desc: t('values.innovation_desc')
        },
        {
            id: "empathy",
            icon: <Heart className="h-6 w-6 text-medical-500" />,
            title: t('values.empathy'),
            desc: t('values.empathy_desc')
        },
        {
            id: "security",
            icon: <Shield className="h-6 w-6 text-medical-500" />,
            title: t('values.security'),
            desc: t('values.security_desc')
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-medical-500/10 to-teal-500/10 dark:from-medical-500/5 dark:to-teal-500/5" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="bg-slate-50 dark:bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <div className="h-14 w-14 bg-medical-100 dark:bg-medical-900/30 rounded-2xl flex items-center justify-center mb-8">
                                <Target className="h-7 w-7 text-medical-600 dark:text-medical-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('mission_title')}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('mission_desc')}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <div className="h-14 w-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-8">
                                <Eye className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('vision_title')}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('vision_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('values_title')}</h2>
                        <div className="h-1.5 w-24 bg-medical-500 rounded-full mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {values.map((val) => (
                            <div key={val.id} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-medical-50 dark:bg-medical-900/20 rounded-xl flex items-center justify-center mb-6">
                                    {val.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{val.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {val.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
