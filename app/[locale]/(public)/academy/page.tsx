"use client";

import { useTranslations } from 'next-intl';
import { BookOpen, Video, FileText, ArrowRight, Play, CheckCircle2, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/FadeIn';
import { useState } from 'react';

export default function AcademyPage() {
    const t = useTranslations('Platform.Academy');

    const [activeTab, setActiveTab] = useState<'patients' | 'professionals'>('patients');

    const mockCourses = [
        { id: 0, track: "patients", icon: <BookOpen className="h-6 w-6" />, color: "teal" },
        { id: 1, track: "patients", icon: <Award className="h-6 w-6" />, color: "teal" },
        { id: 2, track: "professionals", icon: <Video className="h-6 w-6" />, color: "indigo" },
        { id: 3, track: "professionals", icon: <FileText className="h-6 w-6" />, color: "indigo" }
    ];

    const currentCourses = mockCourses.filter(c => c.track === activeTab);

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
                    <div className="pt-32 pb-20 bg-gradient-to-bl from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-30 pointer-events-none hidden lg:block w-[600px] h-full">
                            <img src="/assets/3d/academy-hero.png" alt="3D Academy Books" className="w-full h-full object-contain" />
                        </div>
                        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about_title')}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('about_desc')}
                            </p>
                        </FadeIn>
                    </div>

                    {/* Interactive Learning Tracks */}
                    <div className="py-20 lg:py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                            {/* Tabbed Interface */}
                            <div className="flex flex-col items-center justify-center mb-16">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('tracks_title')}</h2>
                                <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => setActiveTab('patients')}
                                        className={`flex items-center px-6 md:px-10 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'patients'
                                            ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md transform scale-105'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <BookOpen className={`w-5 h-5 mr-2 ${activeTab === 'patients' ? 'animate-pulse' : ''}`} />
                                        {t('tab_patients')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('professionals')}
                                        className={`flex items-center px-6 md:px-10 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'professionals'
                                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-105'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <Video className={`w-5 h-5 mr-2 ${activeTab === 'professionals' ? 'animate-pulse' : ''}`} />
                                        {t('tab_professionals')}
                                    </button>
                                </div>
                            </div>

                            {/* Course Progress UI Grid */}
                            <StaggerContainer key={activeTab} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                                {currentCourses.map((course) => {
                                    const progressVal = Number(t(`mock_courses.${course.id}.progress`));
                                    const isCompleted = progressVal === 100;

                                    return (
                                        <StaggerItem key={course.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-700 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`h-14 w-14 bg-${course.color}-50 dark:bg-${course.color}-900/20 text-${course.color}-600 dark:text-${course.color}-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    {course.icon}
                                                </div>
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                        {t('progress')}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                                                        <Clock className="w-4 h-4 mr-1.5" />
                                                        {t(`mock_courses.${course.id}.lessons`)}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                                {t(`mock_courses.${course.id}.title`)}
                                            </h3>

                                            {/* Progress Bar Mockup */}
                                            <div className="mt-auto mb-6">
                                                <div className="flex justify-between text-sm font-semibold mb-2">
                                                    <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}>
                                                        {progressVal}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : `bg-${course.color}-500`}`}
                                                        style={{ width: `${progressVal}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className={`mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-${course.color}-600 dark:text-${course.color}-400 font-bold`}>
                                                {isCompleted ? 'Volver a ver' : t('continue_learning')}
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                            </div>
                                        </StaggerItem>
                                    );
                                })}
                            </StaggerContainer>

                            {/* Video Player Mockup */}
                            <FadeIn className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 relative group cursor-pointer">
                                <div className="aspect-video relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 to-slate-900 mix-blend-multiply transition-opacity group-hover:opacity-75"></div>

                                    {/* Abstract Mock Background for Video */}
                                    <div className="absolute inset-0 overflow-hidden opacity-30">
                                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-medical-500 rounded-full blur-3xl mix-blend-screen"></div>
                                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl mix-blend-screen"></div>
                                    </div>

                                    <div className="relative z-10 h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                        <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                                    </div>

                                    {/* Video overlay controls mock */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-white text-xl md:text-2xl font-bold mb-1">{t('video_mockup_title')}</h3>
                                        <p className="text-slate-300 text-sm font-medium">{t('video_mockup_instructor')}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
