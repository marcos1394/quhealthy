"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, AlertCircle, Pill } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProfileMedicalSection({ form, handleInputChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-5">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" /> {t('section_medical')}
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_medical_history')}</label>
                    <Textarea name="medicalHistory" value={form.medicalHistory} onChange={handleInputChange} placeholder="Diabetes, Hipertensión..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px]" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> {t('label_allergies')}</label>
                    <Textarea name="allergies" value={form.allergies} onChange={handleInputChange} placeholder="Penicilina, Nueces..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-500" /> {t('label_medications')}</label>
                    <Textarea name="currentMedications" value={form.currentMedications} onChange={handleInputChange} placeholder="Nombre, dosis..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                </div>
            </div>
        </div>
    );
}