"use client";

import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    const t = useTranslations('Company.Contact');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Header */}
            <div className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-balance">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <div className="py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Contact Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.name')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.email')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.subject')}
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('form.message')}
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 px-8 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    {t('form.submit')}
                                </button>
                            </form>
                        </div>

                        {/* Support Info */}
                        <div className="flex flex-col space-y-12">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400">
                                        <MapPin className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.headquarters')}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">{t('info.address')}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                        <Mail className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.support')}</h3>
                                    <p className="text-lg text-teal-600 dark:text-teal-400 font-medium">{t('info.email')}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        <Phone className="h-7 w-7" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('info.phone_title')}</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">{t('info.phone')}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
