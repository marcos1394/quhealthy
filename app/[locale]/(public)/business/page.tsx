"use client";

import { useTranslations } from 'next-intl';
import { Globe, LayoutTemplate, HandCoins, ArrowRight, TrendingUp, Users, Calendar, Video, CheckCircle, Star, Quote } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useState } from 'react';

export default function BusinessPage() {
    const t = useTranslations('Platform.Business');

    const benefits = [
        { id: "reach", icon: <Globe className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
        { id: "tools", icon: <LayoutTemplate className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
        { id: "payments", icon: <HandCoins className="h-8 w-8 text-medical-600 dark:text-medical-400" /> },
    ];

    const stats = ["patients", "consultations"];
    const testimonials = [0, 1];

    // ROI Calculator State
    const [consultations, setConsultations] = useState(20);
    const [fee, setFee] = useState(500);

    // Monthly is approx 4 weeks
    const monthlyRevenue = consultations * fee * 4;
    const yearlyRevenue = monthlyRevenue * 12;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero */}
            <div className="py-24 pt-32 lg:pt-40 lg:py-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-medical-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-full text-sm uppercase tracking-widest mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {t('title')}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 text-balance leading-tight">
                        {t('subtitle')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
                        {t('hero_desc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register?role=provider"
                            className="w-full sm:w-auto px-8 py-4 bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-medical-500/25 flex items-center justify-center group"
                        >
                            {t('cta_button')}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </FadeIn>
            </div>

            {/* Stats */}
            <div className="py-16 bg-medical-900 dark:bg-medical-950 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-medical-700/50">
                        {stats.map((stat) => (
                            <StaggerItem key={stat} className="py-8 md:py-0 flex flex-col items-center justify-center">
                                <div className="text-5xl lg:text-6xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-medical-200 to-white">{t(`stats.${stat}`)}</div>
                                <div className="text-medical-200 font-semibold uppercase tracking-wider text-sm">{t(`stats.${stat}_label`)}</div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Interactive ROI Calculator */}
            <div className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
                                    {t('roi_title')}
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                                    {t('roi_subtitle')}
                                </p>

                                <div className="space-y-8">
                                    {/* Slider 1 */}
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{t('roi_consultations')}</span>
                                            <span className="font-extrabold text-medical-600 dark:text-medical-400">{consultations}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={consultations}
                                            onChange={(e) => setConsultations(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-medical-600 dark:accent-medical-500"
                                        />
                                    </div>

                                    {/* Slider 2 */}
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{t('roi_fee')}</span>
                                            <span className="font-extrabold text-medical-600 dark:text-medical-400">{formatCurrency(fee)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="50"
                                            max="2000"
                                            step="50"
                                            value={fee}
                                            onChange={(e) => setFee(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-medical-600 dark:accent-medical-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Result Display */}
                            <div className="bg-medical-900 dark:bg-medical-950 rounded-3xl p-10 text-center relative overflow-hidden h-full flex flex-col justify-center">
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-medical-500/30 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-medical-500/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10 space-y-10">
                                    <div>
                                        <p className="text-medical-200 font-bold uppercase tracking-wider text-sm mb-3">{t('roi_monthly')}</p>
                                        <div className="text-5xl font-extrabold text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-medical-100">{formatCurrency(monthlyRevenue)}</div>
                                    </div>
                                    <div className="h-px w-full bg-medical-700/50"></div>
                                    <div>
                                        <p className="text-medical-200 font-bold uppercase tracking-wider text-sm mb-3">{t('roi_yearly')}</p>
                                        <div className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-medical-300 to-white">{formatCurrency(yearlyRevenue)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Dashboard Walkthrough Mockup */}
            <div className="py-20 lg:py-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">{t('dashboard_mockup_title')}</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t('dashboard_mockup_desc')}</p>
                    </div>

                    <FadeIn className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-100/50 dark:bg-slate-800/50 p-2 sm:p-4 backdrop-blur-3xl shadow-2xl">
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col md:flex-row h-[600px]">
                            {/* Mock Sidebar */}
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
                                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 1 ? 'bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        <div className="h-5 w-5 bg-current rounded-sm opacity-50"></div>
                                        <div className="h-4 w-24 bg-current rounded-sm opacity-50"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Mock Main Content */}
                            <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded mb-4"></div>
                                            <div className="h-8 w-32 bg-medical-500/20 dark:bg-medical-500/40 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 mt-4">
                                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                </div>
                                                <div className="h-8 w-24 bg-medical-100 dark:bg-medical-900/30 rounded-full"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Testimonials Slider */}
            <div className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('testimonials_title')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {testimonials.map((idx) => (
                            <StaggerItem key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-medical-300 transition-colors">
                                <Quote className="absolute top-8 right-8 h-10 w-10 text-medical-100 dark:text-medical-900/40 group-hover:text-medical-200 transition-colors" />
                                <div className="flex mb-6 text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                                </div>
                                <p className="text-xl text-slate-700 dark:text-slate-300 italic mb-10 relative z-10 leading-relaxed font-medium text-balance">
                                    "{t(`testimonials.${idx}.quote`)}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-14 w-14 rounded-full bg-medical-600 text-white flex items-center justify-center font-bold text-2xl mr-4 shadow-md">
                                        {t(`testimonials.${idx}.author`).charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{t(`testimonials.${idx}.author`)}</h4>
                                        <p className="text-sm text-medical-600 dark:text-medical-400 font-bold uppercase tracking-wider">{t(`testimonials.${idx}.specialty`)}</p>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Benefits Overview */}
            <div className="py-20 lg:py-32 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{t('benefits_title')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-200 dark:border-slate-800 pt-16">
                        {benefits.map((ben) => (
                            <StaggerItem key={ben.id} className="text-center group">
                                <div className="h-20 w-20 mx-auto bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 group-hover:bg-medical-50 dark:group-hover:bg-medical-900/20 group-hover:border-medical-200 dark:group-hover:border-medical-800 transition-all duration-300">
                                    {ben.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-medical-600 transition-colors">
                                    {t(`benefits.${ben.id}`)}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-balance">
                                    {t(`benefits.${ben.id}_desc`)}
                                </p>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

        </div>
    );
}
