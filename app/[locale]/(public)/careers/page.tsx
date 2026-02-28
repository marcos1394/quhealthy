"use client";

import { useTranslations } from 'next-intl';
import { Briefcase, Globe, HeartPulse, GraduationCap, MapPin, ArrowRight, Quote } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useState } from 'react';

export default function CareersPage() {
    const t = useTranslations('Company.Careers');

    const benefits = [
        { icon: <Globe className="h-6 w-6" />, idx: 0 },
        { icon: <HeartPulse className="h-6 w-6" />, idx: 1 },
        { icon: <GraduationCap className="h-6 w-6" />, idx: 2 },
        { icon: <Briefcase className="h-6 w-6" />, idx: 3 },
    ];

    const testimonials = [0, 1, 2];
    const departments = ['all', 'engineering', 'product', 'sales'];
    const mockJobs = [
        { id: 0, dept: "engineering" },
        { id: 1, dept: "product" },
        { id: 2, dept: "sales" }
    ];

    const [activeDept, setActiveDept] = useState('all');

    const filteredJobs = mockJobs.filter(job => activeDept === 'all' || job.dept === activeDept);

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

            {/* Benefits (Perks Grid) */}
            <div className="py-20 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('why_join')}</h2>
                        <div className="h-1.5 w-24 bg-medical-500 rounded-full mx-auto"></div>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((b) => (
                            <StaggerItem key={b.idx} className="group flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-800 hover:shadow-xl transition-all duration-300">
                                <div className="h-16 w-16 bg-white dark:bg-slate-900 text-medical-600 dark:text-medical-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-medical-600 group-hover:text-white transition-all duration-300">
                                    {b.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                    {t(`benefits.${b.idx}`)}
                                </h3>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 lg:py-24 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('testimonials_title')}</h2>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((idx) => (
                            <StaggerItem key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                                <Quote className="absolute top-6 right-6 h-8 w-8 text-medical-100 dark:text-medical-900/30" />
                                <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-8 relative z-10 leading-relaxed">
                                    "{t(`testimonials.${idx}.quote`)}"
                                </p>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-medical-600 text-white flex items-center justify-center font-bold text-xl mr-4 shadow-md">
                                        {t(`testimonials.${idx}.author`).charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{t(`testimonials.${idx}.author`)}</h4>
                                        <p className="text-sm text-medical-600 dark:text-medical-400 font-medium">{t(`testimonials.${idx}.role`)}</p>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </div>

            {/* ATS Mockup (Open Positions) */}
            <div className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">{t('open_positions')}</h2>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {departments.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setActiveDept(dept)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeDept === dept
                                            ? 'bg-medical-600 text-white shadow-md shadow-medical-500/20'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-700 hover:text-medical-600 dark:hover:text-medical-400'
                                        }`}
                                >
                                    {dept === 'all' ? t('all_departments') : t(`departments.${dept}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <FadeIn key={job.id} className="group bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:border-medical-300 dark:hover:border-medical-700 hover:shadow-md transition-all">
                                    <div className="mb-6 md:mb-0">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                            {t(`mock_jobs.${job.id}.title`)}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center text-medical-600 dark:text-medical-400">
                                                <Briefcase className="h-4 w-4 mr-1.5" />
                                                {t(`departments.${job.dept}`)}
                                            </span>
                                            <span className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1.5" />
                                                {t(`mock_jobs.${job.id}.location`)}
                                            </span>
                                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                                                {t(`mock_jobs.${job.id}.type`)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="whitespace-nowrap inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500">
                                        {t('view_job')}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </FadeIn>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                    {t('no_openings')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
