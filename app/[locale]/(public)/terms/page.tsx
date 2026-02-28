import { useTranslations } from 'next-intl';

export default function TermsPage() {
    const t = useTranslations('Legal.Terms');

    const sections = [0, 1, 2, 3];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('last_updated')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-10">
                        {t('intro')}
                    </p>

                    <div className="space-y-12">
                        {sections.map((index) => (
                            <section key={index} className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {t(`sections.${index}.title`)}
                                </h2>
                                <div className="h-1 w-12 bg-medical-500 dark:bg-medical-400 rounded-full mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {t(`sections.${index}.content`)}
                                </p>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
