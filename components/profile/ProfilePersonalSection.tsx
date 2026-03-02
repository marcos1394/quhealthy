"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
}

export function ProfilePersonalSection({ form, handleInputChange, handleSelectChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-5">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-medical-500" /> {t('section_personal')}
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_name')}</label>
                    <Input name="fullName" value={form.fullName} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_birth')}</label>
                        <Input type="date" name="birthDate" value={form.birthDate} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 block w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_gender')}</label>
                        <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800">
                                <SelectItem value="male">{t('gender_male')}</SelectItem>
                                <SelectItem value="female">{t('gender_female')}</SelectItem>
                                <SelectItem value="other">{t('gender_other')}</SelectItem>
                                <SelectItem value="none">{t('gender_none')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_phone')}</label>
                        <Input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} placeholder="+52..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_address')}</label>
                        <Input name="address" value={form.address} onChange={handleInputChange} placeholder="Ciudad, Estado" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}