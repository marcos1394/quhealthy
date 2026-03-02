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

// Valores que coinciden con el enum del backend (ConsumerProfileDto.preferredModality)
const MODALITY_OPTIONS = [
    { value: 'IN_PERSON', icon: Building2, colorActive: 'bg-medical-600 border-medical-600 dark:bg-medical-500 dark:border-medical-500' },
    { value: 'VIDEO_CALL', icon: Video, colorActive: 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' },
    { value: 'HOME_VISIT', icon: Home, colorActive: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500' },
] as const;

interface Props {
    form: ConsumerProfile;
    toggleArrayItem: (field: keyof ConsumerProfile, value: string) => void;
    handleSelectChange: (name: string, value: string) => void;
}

export function ProfilePreferencesSection({ form, toggleArrayItem, handleSelectChange }: Props) {
    const t = useTranslations('PatientProfile');

    const handleModalityClick = (value: string) => {
        // preferredModality is a single string (not array), so we toggle:
        // if already selected → deselect (empty), otherwise set the value
        const newValue = form.preferredModality === value ? '' : value;
        handleSelectChange('preferredModality', newValue);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cabecera */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('section_preferences')}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_preferences_desc')}
                </p>
            </div>

            <div className="space-y-8">
                {/* Health Goals (multi-select badges) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-medical-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                            {t('label_health_goals')}
                        </Label>
                    </div>

                    <div className="flex flex-wrap gap-2.5 ml-0 md:ml-6">
                        {GOALS_OPTIONS_KEYS.map(goalKey => {
                            const goalValue = t(goalKey);
                            const isSelected = form.healthGoals?.includes(goalValue);
                            return (
                                <Badge
                                    key={goalKey}
                                    variant="outline"
                                    onClick={() => toggleArrayItem('healthGoals', goalValue)}
                                    className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-all rounded-xl select-none hover:scale-[1.03] active:scale-95 border-2 ${isSelected
                                        ? 'bg-medical-600 text-white border-medical-600 dark:bg-medical-500 dark:border-medical-500 shadow-md shadow-medical-500/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-medical-200'
                                        }`}
                                >
                                    {goalValue}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Preferred Modality (single select cards) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-500" />
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                            {t('label_modality')}
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-0 md:ml-6">
                        {MODALITY_OPTIONS.map((modality) => {
                            const isSelected = form.preferredModality === modality.value;
                            const Icon = modality.icon;
                            return (
                                <button
                                    key={modality.value}
                                    type="button"
                                    onClick={() => handleModalityClick(modality.value)}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${isSelected
                                        ? `${modality.colorActive} text-white shadow-xl scale-[1.02] border-transparent`
                                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" strokeWidth={2} />
                                    <span className="text-xs font-bold uppercase tracking-tight">
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