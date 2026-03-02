"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, AlertCircle, Pill, Activity } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProfileMedicalSection({ form, handleInputChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                        <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                        {t('section_medical', { defaultValue: 'Historial Médico' })}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_medical_desc', { defaultValue: 'Esta información es confidencial y ayudará a los especialistas a brindarte un diagnóstico más preciso y seguro.' })}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">

                {/* Medical History */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-medical-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_medical_history', { defaultValue: 'Condiciones Médicas Previas' })}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_medical_history', { defaultValue: 'Enfermedades crónicas, cirugías previas o condiciones relevantes. Si no tienes, escribe "Ninguna".' })}
                    </p>
                    <Textarea
                        name="medicalHistory"
                        value={form.medicalHistory}
                        onChange={handleInputChange}
                        placeholder="Ej. Diabetes tipo 2 controlada, hipertensión, cirugía de rodilla en 2021..."
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[120px] resize-none focus:border-medical-500 focus:ring-medical-500/20 transition-all rounded-xl text-slate-900 dark:text-white"
                    />
                </div>

                {/* Allergies */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_allergies', { defaultValue: 'Alergias Conocidas' })}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_allergies', { defaultValue: 'Medicamentos, alimentos, látex o factores ambientales.' })}
                    </p>
                    <Textarea
                        name="allergies"
                        value={form.allergies}
                        onChange={handleInputChange}
                        placeholder="Ej. Penicilina, nueces, polen, picadura de abeja..."
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[100px] resize-none focus:border-medical-500 focus:ring-medical-500/20 transition-all rounded-xl text-slate-900 dark:text-white"
                    />
                </div>

                {/* Medications */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_medications', { defaultValue: 'Medicamentos Actuales' })}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_medications', { defaultValue: 'Incluye vitaminas, suplementos y tratamientos que tomes regularmente.' })}
                    </p>
                    <Textarea
                        name="currentMedications"
                        value={form.currentMedications}
                        onChange={handleInputChange}
                        placeholder="Ej. Metformina 500mg diaria, Vitamina C, Paracetamol ocasional..."
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[100px] resize-none focus:border-medical-500 focus:ring-medical-500/20 transition-all rounded-xl text-slate-900 dark:text-white"
                    />
                </div>

            </div>
        </div>
    );
}