"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User, HeartPulse, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSessionStore } from '@/stores/SessionStore';
import { ConsumerProfile } from '@/types/consumerProfile';

export const SECTIONS = [
    { id: 0, value: 'personal', titleKey: 'section_personal', icon: User },
    { id: 1, value: 'medical', titleKey: 'section_medical', icon: HeartPulse },
    { id: 2, value: 'preferences', titleKey: 'section_preferences', icon: Sparkles },
];

/**
 * Calcula el porcentaje de completitud basándose en los campos
 * realmente llenos del perfil, no en el tab actual.
 */
function calculateProgress(form?: ConsumerProfile): number {
    if (!form) return 0;

    const checks = [
        // Sección 1: Identidad y Contacto (5 campos)
        !!form.fullName?.trim(),
        !!form.birthDate?.trim(),
        !!form.gender?.trim(),
        !!form.phoneNumber?.trim(),
        !!form.location?.trim(),
        // Sección 2: Expediente Clínico (3 campos)
        (form.medicalConditions?.length ?? 0) > 0,
        (form.allergies?.length ?? 0) > 0,
        (form.currentMedications?.length ?? 0) > 0,
        // Sección 3: Preferencias (2 campos)
        (form.healthGoals?.length ?? 0) > 0,
        !!form.preferredModality?.trim(),
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
}

interface ProfileHeaderProps {
    currentSection: number;
    setCurrentSection: (id: number) => void;
    form: ConsumerProfile;
}

export function ProfileSidebar({ currentSection, setCurrentSection, form }: ProfileHeaderProps) {
    const t = useTranslations('PatientProfile');
    const { user } = useSessionStore();

    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const email = user?.email || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
    const fullName = `${firstName} ${lastName}`.trim() || t('title', { defaultValue: 'Perfil de Salud' });

    const progressPercentage = calculateProgress(form);

    return (
        <div className="space-y-8">
            {/* User Avatar Card */}
            <div className="flex items-center gap-5">
                {user?.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.profileImageUrl}
                        alt={fullName}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-700 dark:from-medical-400 dark:to-medical-600 flex items-center justify-center shadow-lg shadow-medical-500/20">
                        <span className="text-xl font-bold text-white tracking-tight">{initials}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {fullName}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-light truncate mt-0.5">
                        {email || t('subtitle', { defaultValue: 'Completa tu información' })}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div>
                <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {t('progress', { defaultValue: 'Progreso general' })}
                    </span>
                    <span className="text-sm font-bold text-medical-600 dark:text-medical-400">
                        {progressPercentage}%
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-medical-500 to-medical-600 dark:from-medical-400 dark:to-medical-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Horizontal Tabs */}
            <Tabs
                value={SECTIONS[currentSection].value}
                onValueChange={(value) => {
                    const section = SECTIONS.find(s => s.value === value);
                    if (section) setCurrentSection(section.id);
                }}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-900 h-14 p-1 rounded-xl">
                    {SECTIONS.map((section) => (
                        <TabsTrigger
                            key={section.value}
                            value={section.value}
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 h-full rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                            <section.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t(section.titleKey)}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}