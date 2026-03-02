"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';

// 🚀 Añadimos colores semánticos a cada sección para que coincidan con sus formularios
export const SECTIONS = [
    { 
        id: 0, 
        titleKey: 'section_personal', 
        descKey: 'section_personal_desc', 
        icon: User,
        colorText: 'text-blue-600 dark:text-blue-400',
        colorBg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    { 
        id: 1, 
        titleKey: 'section_medical', 
        descKey: 'section_medical_desc', 
        icon: HeartPulse,
        colorText: 'text-rose-600 dark:text-rose-400',
        colorBg: 'bg-rose-50 dark:bg-rose-500/10'
    },
    { 
        id: 2, 
        titleKey: 'section_preferences', 
        descKey: 'section_preferences_desc', 
        icon: Sparkles,
        colorText: 'text-amber-600 dark:text-amber-400',
        colorBg: 'bg-amber-50 dark:bg-amber-500/10'
    },
];

interface ProfileSidebarProps {
    currentSection: number;
    setCurrentSection: (id: number) => void;
}

export function ProfileSidebar({ currentSection, setCurrentSection }: ProfileSidebarProps) {
    const t = useTranslations('PatientProfile');
    const progressPercentage = Math.round(((currentSection + 1) / SECTIONS.length) * 100);

    return (
        <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-slate-900/30 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors">
            <div>
                {/* Cabecera del Sidebar */}
                <div className="flex items-center gap-3.5 mb-8">
                    <div className="p-2.5 bg-medical-600 text-white rounded-xl shadow-md shadow-medical-500/20">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('title', { defaultValue: 'Perfil de Salud' })}
                        </h2>
                        <p className="text-sm font-light text-slate-500 dark:text-slate-400">
                            {t('subtitle', { defaultValue: 'Completa tu información' })}
                        </p>
                    </div>
                </div>

                {/* Navegación por Pasos (Adaptable a scroll horizontal en móviles) */}
                <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
                    {SECTIONS.map((section) => {
                        const isActive = currentSection === section.id;
                        const isPast = currentSection > section.id;

                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setCurrentSection(section.id)}
                                className={`flex-shrink-0 md:w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group
                                    ${isActive
                                        ? "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/50 scale-[1.02]"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <div className={`p-2.5 rounded-xl transition-colors duration-300 
                                    ${isActive 
                                        ? section.colorBg + " " + section.colorText 
                                        : isPast
                                            ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                    }`}
                                >
                                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <section.icon className="w-5 h-5" />}
                                </div>
                                <div className="hidden md:block">
                                    <p className={`font-semibold transition-colors duration-300 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                        {t(section.titleKey)}
                                    </p>
                                    <p className={`text-xs mt-0.5 font-light transition-colors duration-300 ${isActive ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                                        {t(section.descKey)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Progreso Premium */}
            <div className="mt-8 hidden md:block">
                <div className="flex justify-between items-end mb-2.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('progress', { defaultValue: 'Progreso general' })}
                    </span>
                    <span className="text-sm font-bold text-medical-600 dark:text-medical-400">
                        {progressPercentage}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5">
                    <div
                        className="h-full bg-gradient-to-r from-medical-400 to-medical-600 dark:from-medical-500 dark:to-medical-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}