"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Target, Clock, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ConsumerProfile } from '@/types/consumerProfile';

export const GOALS_OPTIONS = ["Bajar de peso", "Mejorar piel", "Reducir estrés", "Aumentar energía", "Rehabilitación física"];

interface Props {
    form: ConsumerProfile;
    toggleArrayItem: (field: 'healthGoals' | 'servicePreferences', value: string) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleInterestChange: (activity: string, value: number[]) => void;
}

export function ProfilePreferencesSection({ form, toggleArrayItem, handleSelectChange, handleInterestChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> {t('section_preferences')}
            </h3>
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Target className="w-4 h-4" /> {t('label_health_goals')}</label>
                <div className="flex flex-wrap gap-2">
                    {GOALS_OPTIONS.map(goal => (
                        <Badge
                            key={goal}
                            variant="outline"
                            className={`cursor-pointer px-3 py-1.5 transition-all ${form.healthGoals.includes(goal)
                                    ? 'bg-medical-50 dark:bg-medical-500/20 text-medical-700 dark:text-medical-300 border-medical-200 dark:border-medical-500/50'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            onClick={() => toggleArrayItem('healthGoals', goal)}
                        >
                            {goal}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4" /> {t('label_schedule')}</label>
                <Select value={form.preferredSchedule} onValueChange={(val) => handleSelectChange('preferredSchedule', val)}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800">
                        <SelectItem value="morning">Mañana (8am - 12pm)</SelectItem>
                        <SelectItem value="afternoon">Tarde (12pm - 5pm)</SelectItem>
                        <SelectItem value="evening">Noche (5pm - 9pm)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Activity className="w-4 h-4" /> {t('label_interest')} (1-10)</label>
                {Object.entries(form.interestInActivities).map(([activity, value]) => (
                    <div key={activity} className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="capitalize">{activity}</span>
                            <span className="text-slate-900 dark:text-white font-bold">{value}</span>
                        </div>
                        <Slider
                            defaultValue={[value]}
                            max={10}
                            step={1}
                            onValueChange={(val) => handleInterestChange(activity, val)}
                            className="py-2"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}