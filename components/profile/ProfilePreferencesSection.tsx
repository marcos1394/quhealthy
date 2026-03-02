"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Target, Clock, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ConsumerProfile } from '@/types/consumerProfile';

export const GOALS_OPTIONS = [
    "Bajar de peso", 
    "Mejorar piel", 
    "Reducir estrés", 
    "Aumentar energía", 
    "Rehabilitación física"
];

interface Props {
    form: ConsumerProfile;
    toggleArrayItem: (field: 'healthGoals' | 'servicePreferences', value: string) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleInterestChange: (activity: string, value: number[]) => void;
}

export function ProfilePreferencesSection({ form, toggleArrayItem, handleSelectChange, handleInterestChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera de la sección */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                    {t('section_preferences', { defaultValue: 'Objetivos y Preferencias' })}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-light text-sm">
                    {t('section_preferences_desc', { defaultValue: 'Conocer tus metas nos ayuda a recomendarte los mejores especialistas y servicios.' })}
                </p>
            </div>

            <div className="space-y-6">

                {/* 1. Objetivos de Salud (Badges) */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors">
                    <div className="flex items-start gap-3.5">
                        <Target className="w-5 h-5 text-medical-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                                {t('label_health_goals', { defaultValue: 'Objetivos Principales' })}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 mt-1 font-light">
                                {t('help_health_goals', { defaultValue: 'Selecciona las metas en las que te gustaría enfocarte (puedes elegir varias).' })}
                            </p>
                            
                            <div className="flex flex-wrap gap-2.5">
                                {GOALS_OPTIONS.map(goal => {
                                    const isSelected = form.healthGoals.includes(goal);
                                    return (
                                        <Badge
                                            key={goal}
                                            variant="outline"
                                            onClick={() => toggleArrayItem('healthGoals', goal)}
                                            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all rounded-xl select-none hover:scale-105 active:scale-95 ${
                                                isSelected
                                                    ? 'bg-medical-500 text-white border-medical-500 dark:bg-medical-600 dark:border-medical-600 shadow-md shadow-medical-500/20'
                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {goal}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Horario Preferido (Select) */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <div className="flex items-start gap-3.5">
                        <Clock className="w-5 h-5 text-indigo-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                {t('label_schedule', { defaultValue: 'Horario de Preferencia' })}
                            </label>
                            <Select value={form.preferredSchedule} onValueChange={(val) => handleSelectChange('preferredSchedule', val)}>
                                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 h-11 rounded-xl shadow-sm transition-all">
                                    <SelectValue placeholder={t('placeholder_schedule', { defaultValue: 'Selecciona un bloque de horario' })} />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 rounded-xl">
                                    <SelectItem value="morning">Mañana (8:00 AM - 12:00 PM)</SelectItem>
                                    <SelectItem value="afternoon">Tarde (12:00 PM - 5:00 PM)</SelectItem>
                                    <SelectItem value="evening">Noche (5:00 PM - 9:00 PM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 3. Niveles de Interés (Sliders) */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors">
                    <div className="flex items-start gap-3.5">
                        <Activity className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                                {t('label_interest', { defaultValue: 'Nivel de Interés' })}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 mt-1 font-light">
                                {t('help_interest', { defaultValue: 'Del 1 al 10, ¿qué tanta importancia le das a estas áreas actualmente?' })}
                            </p>
                            
                            <div className="space-y-7">
                                {Object.entries(form.interestInActivities).map(([activity, value]) => (
                                    <div key={activity} className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                                                {activity}
                                            </span>
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-500/20">
                                                {value}
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[value]}
                                            max={10}
                                            min={1}
                                            step={1}
                                            onValueChange={(val) => handleInterestChange(activity, val)}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}