"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User, HeartPulse, Sparkles } from 'lucide-react';

export const SECTIONS = [
    { id: 0, titleKey: 'section_personal', descKey: 'section_personal_desc', icon: User },
    { id: 1, titleKey: 'section_medical', descKey: 'section_medical_desc', icon: HeartPulse },
    { id: 2, titleKey: 'section_preferences', descKey: 'section_preferences_desc', icon: Sparkles },
];

interface ProfileSidebarProps {
    currentSection: number;
    setCurrentSection: (id: number) => void;
}

export function ProfileSidebar({ currentSection, setCurrentSection }: ProfileSidebarProps) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20">
                        <User className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('title', { defaultValue: 'Perfil de Salud' })}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('subtitle', { defaultValue: 'Completa tu información' })}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setCurrentSection(section.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${currentSection === section.id
                                ? "bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${currentSection === section.id 
                                ? "bg-medical-500 text-white" 
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                                }`}>
                                <section.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-medium transition-colors ${currentSection === section.id ? "text-medical-600 dark:text-medical-400" : "text-slate-700 dark:text-slate-300"}`}>
                                    {t(section.titleKey)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">{t(section.descKey)}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Progreso */}
            <div className="mt-8 hidden md:block">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>{t('progress', { defaultValue: 'Progreso' })}</span>
                    <span>{Math.round(((currentSection + 1) / SECTIONS.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-medical-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}