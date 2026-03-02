"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Target, Video, Building2, Home } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ConsumerProfile } from '@/types/consumerProfile';

export const GOALS_OPTIONS_KEYS = [
    'goal_weight_loss',
    'goal_skin',
    'goal_stress',
    'goal_energy',
    'goal_rehab',
] as const;

const MODALITY_OPTIONS = [
    { value: 'in_person', icon: Building2, colorActive: 'bg-medical-600 border-medical-600 dark:bg-medical-500 dark:border-medical-500' },
    { value: 'video_call', icon: Video, colorActive: 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' },
    { value: 'home_visit', icon: Home, colorActive: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500' },
] as const;

interface Props {
    form: ConsumerProfile;
    toggleArrayItem: (field: 'healthGoals' | 'servicePreferences', value: string) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleInterestChange: (activity: string, value: number[]) => void;
}

export function ProfilePreferencesSection({ form, toggleArrayItem, handleSelectChange }: Props) {
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
                        {t('section_preferences')}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_preferences_desc')}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-8">

                {/* Health Goals */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-medical-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_health_goals')}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_health_goals')}
                    </p>

                    <div className="flex flex-wrap gap-2.5 ml-6">
                        {GOALS_OPTIONS_KEYS.map(goalKey => {
                            const goalValue = t(goalKey);
                            const isSelected = form.healthGoals.includes(goalValue);
                            return (
                                <Badge
                                    key={goalKey}
                                    variant="outline"
                                    onClick={() => toggleArrayItem('healthGoals', goalValue)}
                                    className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-all rounded-xl select-none hover:scale-[1.03] active:scale-95 ${isSelected
                                            ? 'bg-medical-600 text-white border-medical-600 dark:bg-medical-500 dark:border-medical-500 shadow-md shadow-medical-500/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {goalValue}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Consultation Modality */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_modality')}
                        </Label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light ml-6">
                        {t('help_modality')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-6">
                        {MODALITY_OPTIONS.map((modality) => {
                            const isSelected = form.servicePreferences.includes(modality.value);
                            const Icon = modality.icon;
                            return (
                                <button
                                    key={modality.value}
                                    type="button"
                                    onClick={() => toggleArrayItem('servicePreferences', modality.value)}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isSelected
                                            ? `${modality.colorActive} text-white shadow-lg`
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : ''}`} strokeWidth={1.5} />
                                    <span className="text-sm font-semibold">
                                        {t(`modality_${modality.value}`)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}