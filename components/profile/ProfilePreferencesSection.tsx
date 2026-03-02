"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Target, Clock, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
        <div className="space-y-8">
            {/* Section Header */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                        {t('section_preferences', { defaultValue: 'Objetivos y Preferencias' })}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_preferences_desc', { defaultValue: 'Conocer tus metas nos ayuda a recomendarte los mejores especialistas y servicios.' })}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-8">

                {/* Health Goals (Badges) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-medical-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_health_goals', { defaultValue: 'Objetivos Principales' })}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_health_goals', { defaultValue: 'Selecciona las metas en las que te gustaría enfocarte (puedes elegir varias).' })}
                    </p>

                    <div className="flex flex-wrap gap-2.5 ml-6">
                        {GOALS_OPTIONS.map(goal => {
                            const isSelected = form.healthGoals.includes(goal);
                            return (
                                <Badge
                                    key={goal}
                                    variant="outline"
                                    onClick={() => toggleArrayItem('healthGoals', goal)}
                                    className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-all rounded-xl select-none hover:scale-[1.03] active:scale-95 ${isSelected
                                            ? 'bg-medical-600 text-white border-medical-600 dark:bg-medical-500 dark:border-medical-500 shadow-md shadow-medical-500/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {goal}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Preferred Schedule */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_schedule', { defaultValue: 'Horario de Preferencia' })}
                        </Label>
                    </div>
                    <div className="relative ml-6">
                        <Select value={form.preferredSchedule} onValueChange={(val) => handleSelectChange('preferredSchedule', val)}>
                            <SelectTrigger className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-medical-500/20 focus:border-medical-500 rounded-xl transition-all">
                                <SelectValue placeholder={t('placeholder_schedule', { defaultValue: 'Selecciona un bloque de horario' })} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                                <SelectItem value="morning">Mañana (8:00 AM - 12:00 PM)</SelectItem>
                                <SelectItem value="afternoon">Tarde (12:00 PM - 5:00 PM)</SelectItem>
                                <SelectItem value="evening">Noche (5:00 PM - 9:00 PM)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Interest Levels (Sliders) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_interest', { defaultValue: 'Nivel de Interés' })}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_interest', { defaultValue: 'Del 1 al 10, ¿qué tanta importancia le das a estas áreas actualmente?' })}
                    </p>

                    <div className="space-y-6 ml-6 mt-4">
                        {Object.entries(form.interestInActivities).map(([activity, value]) => (
                            <div key={activity} className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                                        {activity}
                                    </span>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-400 font-bold text-sm border border-medical-100 dark:border-medical-500/20">
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
    );
}