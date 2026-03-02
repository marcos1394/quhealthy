"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, AlertCircle, Pill, Activity } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { ConsumerProfile } from '@/types/consumerProfile';
import { TagInput } from '@/components/profile/TagInput';

interface Props {
    form: ConsumerProfile;
    handleTagChange: (field: keyof ConsumerProfile, value: string) => void;
}

export function ProfileMedicalSection({ form, handleTagChange }: Props) {
    const t = useTranslations('PatientProfile');

    // TagInput works with comma-separated strings internally,
    // but handleTagChange in the parent converts them to string[] for the backend.
    // We need to convert the form's string[] back to comma-separated for display.
    const arrayToString = (arr: string[] | undefined): string => {
        return Array.isArray(arr) ? arr.join(', ') : (typeof arr === 'string' ? arr : '');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                        <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('section_medical')}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_medical_desc')}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-8">

                {/* Medical Conditions (was medicalHistory) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-medical-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                            {t('label_medical_history')}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_medical_history')}
                    </p>
                    <div className="ml-0 md:ml-6">
                        <TagInput
                            value={arrayToString(form.medicalConditions)}
                            onChange={(val) => handleTagChange('medicalConditions', val)}
                            placeholder={t('placeholder_medical', { defaultValue: 'Ej. Diabetes tipo 2, Hipertensión' })}
                            icon={<Activity className="w-5 h-5" />}
                        />
                    </div>
                </div>

                {/* Allergies */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                            {t('label_allergies')}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_allergies')}
                    </p>
                    <div className="ml-0 md:ml-6">
                        <TagInput
                            value={arrayToString(form.allergies)}
                            onChange={(val) => handleTagChange('allergies', val)}
                            placeholder={t('placeholder_allergies', { defaultValue: 'Ej. Penicilina, Nueces, Polen' })}
                            icon={<AlertCircle className="w-5 h-5" />}
                        />
                    </div>
                </div>

                {/* Current Medications */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                            {t('label_medications')}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_medications')}
                    </p>
                    <div className="ml-0 md:ml-6">
                        <TagInput
                            value={arrayToString(form.currentMedications)}
                            onChange={(val) => handleTagChange('currentMedications', val)}
                            placeholder={t('placeholder_medications', { defaultValue: 'Ej. Metformina 500mg, Vitamina C' })}
                            icon={<Pill className="w-5 h-5" />}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}