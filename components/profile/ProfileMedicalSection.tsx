"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, AlertCircle, Pill, Activity } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProfileMedicalSection({ form, handleInputChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera de la sección */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                        <HeartPulse className="w-6 h-6 text-rose-500" />
                    </div>
                    {t('section_medical', { defaultValue: 'Historial Médico' })}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-light text-sm">
                    {t('section_medical_desc', { defaultValue: 'Esta información es confidencial y ayudará a los especialistas a brindarte un diagnóstico más preciso y seguro.' })}
                </p>
            </div>

            <div className="space-y-6">
                
                {/* 1. Historial Médico */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <div className="flex items-start gap-3.5">
                        <Activity className="w-5 h-5 text-medical-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                                {t('label_medical_history', { defaultValue: 'Condiciones Médicas Previas' })}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 mt-1 font-light">
                                {t('help_medical_history', { defaultValue: 'Enfermedades crónicas, cirugías previas o condiciones relevantes. Si no tienes, escribe "Ninguna".' })}
                            </p>
                            <Textarea 
                                name="medicalHistory" 
                                value={form.medicalHistory} 
                                onChange={handleInputChange} 
                                placeholder="Ej. Diabetes tipo 2 controlada, hipertensión, cirugía de rodilla en 2021..." 
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 min-h-[100px] resize-none focus-visible:ring-medical-500 focus-visible:border-medical-500 transition-all shadow-sm rounded-xl" 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Alergias */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <div className="flex items-start gap-3.5">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                                {t('label_allergies', { defaultValue: 'Alergias Conocidas' })}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 mt-1 font-light">
                                {t('help_allergies', { defaultValue: 'Medicamentos, alimentos, látex o factores ambientales.' })}
                            </p>
                            <Textarea 
                                name="allergies" 
                                value={form.allergies} 
                                onChange={handleInputChange} 
                                placeholder="Ej. Penicilina, nueces, polen, picadura de abeja..." 
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 min-h-[80px] resize-none focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all shadow-sm rounded-xl" 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Medicamentos */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <div className="flex items-start gap-3.5">
                        <Pill className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                                {t('label_medications', { defaultValue: 'Medicamentos Actuales' })}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 mt-1 font-light">
                                {t('help_medications', { defaultValue: 'Incluye vitaminas, suplementos y tratamientos que tomes regularmente.' })}
                            </p>
                            <Textarea 
                                name="currentMedications" 
                                value={form.currentMedications} 
                                onChange={handleInputChange} 
                                placeholder="Ej. Metformina 500mg diaria, Vitamina C, Paracetamol ocasional..." 
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 min-h-[80px] resize-none focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm rounded-xl" 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}